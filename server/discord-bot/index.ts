/**
 * CX Linux Discord Bot
 *
 * Main entry point for the Discord bot with:
 * - Claude AI-powered responses
 * - RAG (knowledge base) integration
 * - Slash commands
 * - Referral system integration
 * - Member verification
 * - Daily limits
 */

import {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  REST,
  Routes,
  Events,
  ChannelType,
  Message,
  GuildMember,
} from "discord.js";
import { generateResponse, initializeRAG } from "./llm/claude.js";
import { refreshKnowledgeBase } from "./rag/retriever.js";
import {
  commands,
  handleSlashCommand,
  handleButtonInteraction,
  handleApplicationModal,
  storeQAForFeedback,
} from "./commands/slashCommands.js";
import {
  getFollowUpSuggestions,
  formatFollowUps,
  shouldShowFollowUps,
} from "./utils/followUpSuggestions.js";
import { shouldRespond, extractQuestion } from "./utils/shouldRespond.js";
import {
  canAskQuestion,
  incrementUsage,
  getRemainingQuestions,
  getLimitExceededMessage,
  isPrivileged,
} from "./utils/dailyLimit.js";
import {
  addMessage,
  clearHistory,
  getStats as getMemoryStats,
} from "./memory/conversationMemory.js";
import {
  createResponseEmbed,
  createErrorEmbed,
  createFeedbackButtons,
  createReferralTiersEmbed,
  createInstallEmbed,
  createStatsEmbed,
  shouldUseEmbed,
  COLORS,
} from "./utils/embeds.js";
import { getAnalyticsSummary } from "./utils/analytics.js";
import { db } from "../db.js";
import { eq, and } from "drizzle-orm";
import { waitlistEntries } from "@shared/schema";

// New feature imports
import {
  startWelcomeFlow,
  handleWelcomeButton,
  handleWelcomeSelect,
  isWelcomeInteraction,
} from "./utils/welcomeFlow.js";
// Gamification disabled - imports removed
import {
  initReminders,
  parseTime,
  createReminder,
  getUserReminders,
  cancelReminder,
  formatReminderList,
} from "./utils/reminders.js";
import {
  initDigests,
  generateDigest,
  scheduleDigest,
} from "./utils/digests.js";
// Thread feature removed
import {
  isCodeExecutionRequest,
  parseCodeBlock,
  detectLanguage,
  executeCode,
  createExecutionEmbed,
  isCodeSafe,
} from "./utils/codeSandbox.js";
import {
  createAddModal,
  createEditModal,
  handleAddSubmission,
  handleEditSubmission,
  handleApproval,
  isKBInteraction,
  createPendingListEmbed,
  createApprovalButtons,
  createEntryDetailEmbed,
  searchCustomEntries,
  getKBStats,
} from "./utils/knowledgeBaseEditor.js";
import { initExperiments } from "./utils/abTesting.js";

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN || "";
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || "";
const GUILD_ID = process.env.GUILD_ID || DISCORD_SERVER_ID;

// Track message -> response for edit detection
const messageResponseMap = new Map<string, string>();

// Track messages being processed to prevent duplicate responses
const processingMessages = new Set<string>();

// Cleanup old entries periodically
function cleanupMaps(): void {
  if (messageResponseMap.size > 100) {
    const entries = Array.from(messageResponseMap.entries());
    const toDelete = entries.slice(0, entries.length - 100);
    toDelete.forEach(([key]) => messageResponseMap.delete(key));
  }
  // Clean up processing set (shouldn't have stale entries, but just in case)
  if (processingMessages.size > 50) {
    processingMessages.clear();
  }
}
setInterval(cleanupMaps, 60000);

// Validate token - don't exit process, just skip bot initialization
const BOT_ENABLED = !!DISCORD_TOKEN;
if (!BOT_ENABLED) {
  console.log("[Bot] DISCORD_BOT_TOKEN is not set - bot will not start");
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

/**
 * Register slash commands with Discord
 */
async function registerSlashCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    console.log("[Bot] Registering slash commands...");
    const commandData = commands.map((cmd) => cmd.toJSON());

    // Use configured GUILD_ID or auto-detect from first guild
    const guildId = GUILD_ID || client.guilds.cache.first()?.id;

    if (guildId) {
      // Guild-specific (instant)
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, guildId),
        { body: commandData }
      );
      console.log(`[Bot] Registered ${commandData.length} commands to guild ${guildId}`);
    } else {
      // Global (takes up to 1 hour)
      await rest.put(Routes.applicationCommands(client.user!.id), {
        body: commandData,
      });
      console.log(`[Bot] Registered ${commandData.length} global commands`);
    }
  } catch (error) {
    console.error("[Bot] Failed to register commands:", error);
  }
}

/**
 * Verify a Discord user and update referral status
 */
async function verifyMember(discordId: string): Promise<void> {
  try {
    // Find user by Discord ID in waitlist
    const users = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.discordId, discordId))
      .limit(1);

    if (users.length === 0) return;

    const user = users[0];

    // Check if already verified
    if (user.discordJoinedServer) return;

    // Update as joined server
    await db
      .update(waitlistEntries)
      .set({
        discordJoinedServer: true,
        discordVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, user.id));

    console.log(`[Bot] Verified member: ${discordId}`);
  } catch (error) {
    console.error(`[Bot] Failed to verify member:`, error);
  }
}

// Bot ready event
client.once(Events.ClientReady, async () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`[Bot] Logged in as ${client.user!.tag}`);
  console.log(`[Bot] ID: ${client.user!.id}`);
  console.log(`[Bot] Servers: ${client.guilds.cache.size}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Initialize RAG
  console.log("[Bot] Initializing knowledge base...");
  await initializeRAG();

  // Initialize A/B testing experiments
  console.log("[Bot] Initializing A/B testing...");
  initExperiments();

  // Initialize reminder system
  console.log("[Bot] Initializing reminders...");
  initReminders(client);

  // Initialize digest system
  console.log("[Bot] Initializing digests...");
  initDigests(client);

  // Register slash commands
  await registerSlashCommands();

  // Set activity
  client.user!.setActivity("/cx help", { type: ActivityType.Listening });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[Bot] Ready and operational!");
  console.log("[Bot] Features: RAG, A/B Testing, Reminders, Digests");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// New member event - verify and start interactive welcome flow
client.on(Events.GuildMemberAdd, async (member) => {
  console.log(`[Bot] New member: ${member.user.tag}`);

  // Verify member for referral system
  await verifyMember(member.user.id);

  // Start interactive welcome flow (with buttons and personalization)
  try {
    await startWelcomeFlow(member);
    console.log(`[Bot] Started welcome flow for ${member.user.tag}`);
  } catch {
    // Fallback to simple welcome if interactive flow fails (DMs disabled)
    console.log(`[Bot] Couldn't start welcome flow for ${member.user.tag} (DMs disabled)`);
    try {
      await member.send(
        `Hey! Welcome to the CX Linux server.\n\n` +
          `I'm the AI support bot. You can:\n` +
          `• Mention me: \`@${client.user!.username} how do I install?\`\n` +
          `• Use slash commands: \`/cx help\`\n` +
          `• Reply to my messages to continue a conversation\n\n` +
          `**Quick Links:**\n` +
          `• Website: https://cxlinux.com\n` +
          `• GitHub: https://github.com/cxlinux-ai/cx-core`
      );
    } catch {
      // Can't DM user at all
    }
  }
});

// Message edit detection
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!messageResponseMap.has(oldMessage.id)) return;
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const responseId = messageResponseMap.get(oldMessage.id);

  try {
    const question = extractQuestion(newMessage as Message, client.user!.id);
    if (!question) return;

    console.log(`[Bot] User edited question, regenerating...`);

    const response = await generateResponse(question, newMessage);
    const channel = newMessage.channel;
    const ourMessage = await channel.messages.fetch(responseId!).catch(() => null);

    if (ourMessage && ourMessage.editable) {
      let content = response;
      if (content.length > 1997) {
        content = content.slice(0, 1994) + "...";
      }
      await ourMessage.edit({ content: content + "\n\n-# *(updated)*" });
      console.log(`[Bot] Updated response for edited question`);
    }
  } catch (error: any) {
    console.error(`[Bot] Error updating response:`, error.message);
  }
});

// Slash command, button, select, and modal handler
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      // Handle different button types
      const customId = interaction.customId;

      // Welcome flow buttons
      if (isWelcomeInteraction(customId)) {
        await handleWelcomeButton(interaction);
        return;
      }

      // KB approval/preview buttons
      if (isKBInteraction(customId)) {
        if (customId.startsWith("kb_approve:")) {
          const entryId = customId.split(":")[1];
          await handleApproval(interaction, entryId, true);
        } else if (customId.startsWith("kb_reject:")) {
          const entryId = customId.split(":")[1];
          await handleApproval(interaction, entryId, false);
        } else if (customId.startsWith("kb_preview:")) {
          const entryId = customId.split(":")[1];
          const entries = searchCustomEntries("");
          const entry = entries.find((e) => e.id === entryId);
          if (entry) {
            await interaction.reply({
              embeds: [createEntryDetailEmbed(entry)],
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "Entry not found.",
              ephemeral: true,
            });
          }
        }
        return;
      }

      // Standard feedback/other buttons
      await handleButtonInteraction(interaction);
    } else if (interaction.isStringSelectMenu()) {
      // Handle select menus (welcome flow)
      if (isWelcomeInteraction(interaction.customId)) {
        await handleWelcomeSelect(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      const customId = interaction.customId;

      // Handle KB modals
      if (customId === "kb_add_modal") {
        await handleAddSubmission(interaction);
        return;
      }
      if (customId.startsWith("kb_edit_modal:")) {
        const entryId = customId.split(":")[1];
        await handleEditSubmission(interaction, entryId);
        return;
      }

      // Handle application modal
      if (customId === "application_modal") {
        await handleApplicationModal(interaction);
      }
    }
  } catch (error) {
    console.error("[Bot] Interaction error:", error);
  }
});

// Message handler
client.on(Events.MessageCreate, async (message) => {
  // Prevent duplicate processing of the same message
  if (processingMessages.has(message.id)) {
    console.log(`[Bot] Skipping duplicate message: ${message.id}`);
    return;
  }

  const shouldReply = await shouldRespond(message, client.user!.id);
  if (!shouldReply) return;

  // Mark message as being processed
  processingMessages.add(message.id);

  const userId = message.author.id;
  const username = message.author.username;
  const member = message.member;

  // Check daily limit
  if (!canAskQuestion(userId, member)) {
    await message.reply(getLimitExceededMessage());
    return;
  }

  // Extract question
  const question = extractQuestion(message, client.user!.id);

  if (!question || question.length === 0) {
    await message.reply(
      "Hi! How can I help you? Please include a question when mentioning me.\n\n" +
        "**Tip:** Try `/cx help` for available commands!"
    );
    return;
  }

  // Admin commands
  const lowerQuestion = question.toLowerCase().trim();

  // Refresh RAG
  if (lowerQuestion === "!refresh" || lowerQuestion === "!refresh-rag") {
    console.log(`[Bot] ${username} requested RAG refresh`);
    await message.channel.sendTyping();
    try {
      const stats = await refreshKnowledgeBase();
      await message.reply({
        embeds: [
          createResponseEmbed(
            `**Knowledge base refreshed!**\n\n` +
              `• Total chunks: **${stats.totalDocuments}**\n` +
              `• Categories: ${Object.entries(stats.categories)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}`,
            { title: "RAG Refresh Complete", color: COLORS.success }
          ),
        ],
      });
    } catch (error: any) {
      await message.reply({
        embeds: [createErrorEmbed("Failed to refresh", error.message)],
      });
    }
    return;
  }

  // Clear memory
  if (lowerQuestion === "!clear" || lowerQuestion === "!forget") {
    clearHistory(message);
    await message.reply({
      embeds: [
        createResponseEmbed("Conversation history cleared!", {
          title: "Memory Cleared",
          color: COLORS.info,
        }),
      ],
    });
    return;
  }

  // Stats
  if (lowerQuestion === "!stats") {
    const memStats = getMemoryStats();
    const analyticsStats = await getAnalyticsSummary(24);

    await message.reply({
      embeds: [
        createStatsEmbed({
          activeConversations: memStats.activeConversations,
          totalMessages: memStats.totalMessages,
          cacheHitRate: analyticsStats.cacheHitRate,
          avgResponseTime: analyticsStats.avgResponseTime,
        }),
        createResponseEmbed(
          `**Your Status:**\n` +
            `• Remaining questions: ${getRemainingQuestions(userId, member)}\n\n` +
            `**24h Analytics:**\n` +
            `• Total interactions: ${analyticsStats.totalInteractions}\n` +
            `• Error rate: ${analyticsStats.errorRate}%`,
          { color: COLORS.info }
        ),
      ],
    });
    return;
  }

  console.log(`[Bot] Question from ${username}: ${question.slice(0, 80)}...`);

  try {
    // Show typing
    await message.channel.sendTyping();
    const typingInterval = setInterval(() => {
      message.channel.sendTyping().catch(() => {});
    }, 5000);

    // Check for code execution request
    if (isCodeExecutionRequest(question)) {
      const codeBlock = parseCodeBlock(question);
      if (codeBlock) {
        const language = codeBlock.language || detectLanguage(codeBlock.code) || "javascript";
        const safetyCheck = isCodeSafe(codeBlock.code);

        if (safetyCheck.safe) {
          console.log(`[Bot] Executing ${language} code for ${username}`);
          const result = await executeCode(codeBlock.code, language);
          clearInterval(typingInterval);

          await message.reply({
            embeds: [createExecutionEmbed(result)],
          });
          processingMessages.delete(message.id);
          return;
        } else {
          clearInterval(typingInterval);
          await message.reply({
            embeds: [
              createErrorEmbed(
                "Code Blocked",
                `Can't run this code: ${safetyCheck.reason}`
              ),
            ],
          });
          processingMessages.delete(message.id);
          return;
        }
      }
    }

    // Store user message
    addMessage(message, "user", question);

    // Generate response
    const response = await generateResponse(question, message);

    clearInterval(typingInterval);

    // Store assistant message
    addMessage(message, "assistant", response);

    // Increment usage
    incrementUsage(userId, member);
    const remaining = getRemainingQuestions(userId, member);

    // Check if we should include a rich embed
    const embedType = shouldUseEmbed(question);
    let richEmbed = null;
    if (embedType === "install") {
      richEmbed = createInstallEmbed();
    }

    // Build reply with optional follow-up suggestions
    let content = response;

    // Add follow-up suggestions (occasionally, for substantive responses)
    if (shouldShowFollowUps(question, response)) {
      const suggestions = getFollowUpSuggestions(question);
      content += formatFollowUps(suggestions);
    }

    // Add remaining questions indicator
    if (remaining !== "unlimited") {
      content += `\n\n-# ${remaining} question${remaining !== 1 ? "s" : ""} remaining today`;
    }

    // Split if too long
    if (content.length > 2000) {
      const chunks = [];
      let current = content;
      while (current.length > 2000) {
        let splitAt = current.lastIndexOf("\n", 1990);
        if (splitAt === -1) splitAt = 1990;
        chunks.push(current.slice(0, splitAt));
        current = current.slice(splitAt);
      }
      chunks.push(current);

      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          const reply = await message.reply({
            content: chunks[i],
            components: chunks.length === 1 ? [createFeedbackButtons(message.id)] : [],
          });
          messageResponseMap.set(message.id, reply.id);
        } else {
          await message.channel.send({
            content: chunks[i],
            components: i === chunks.length - 1 ? [createFeedbackButtons(message.id)] : [],
          });
        }
      }
    } else {
      const reply = await message.reply({
        content,
        embeds: richEmbed ? [richEmbed] : [],
        components: [createFeedbackButtons(message.id)],
      });
      messageResponseMap.set(message.id, reply.id);
    }

    // Store Q&A for feedback tracking
    storeQAForFeedback(message.id, question, response);
    console.log(`[Bot] Responded to ${username}. Remaining: ${remaining}`);
  } catch (error: any) {
    console.error(`[Bot] Error responding to ${username}:`, error.message);
    await message.reply({
      embeds: [createErrorEmbed("Sorry, I encountered an error", error.message)],
    });
  } finally {
    // Clean up processing tracker
    processingMessages.delete(message.id);
  }
});

// Error handling
client.on(Events.Error, (error) => {
  console.error("[Bot] Client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("[Bot] Unhandled rejection:", error);
});

process.on("SIGINT", () => {
  console.log("\n[Bot] Shutting down...");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Bot] Shutting down...");
  client.destroy();
  process.exit(0);
});

// Track if bot is already starting/started
let botStarting = false;

/**
 * Start the Discord bot
 */
export async function startBot(): Promise<void> {
  if (!BOT_ENABLED) {
    console.log("[Bot] Bot is disabled - skipping startup");
    return;
  }

  // Prevent multiple startups
  if (botStarting) {
    console.log("[Bot] Bot is already starting/started - skipping duplicate startup");
    return;
  }

  if (client.isReady()) {
    console.log("[Bot] Bot is already connected - skipping startup");
    return;
  }

  botStarting = true;
  console.log("[Bot] Connecting to Discord...");
  await client.login(DISCORD_TOKEN);
}

/**
 * Get bot client (for external use)
 */
export function getBotClient(): Client {
  return client;
}

/**
 * Check if bot is ready
 */
export function isBotReady(): boolean {
  return client.isReady();
}

export default {
  startBot,
  getBotClient,
  isBotReady,
  verifyMember,
};
