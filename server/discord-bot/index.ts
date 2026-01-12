/**
 * Cortex Linux Discord Bot
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
} from "discord.js";
import { generateResponse, initializeRAG } from "./llm/claude.js";
import { refreshKnowledgeBase } from "./rag/retriever.js";
import {
  commands,
  handleSlashCommand,
  handleButtonInteraction,
} from "./commands/slashCommands.js";
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
  COLORS,
} from "./utils/embeds.js";
import { db } from "../db.js";
import { eq, and } from "drizzle-orm";
import { waitlistEntries } from "@shared/schema";

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN || "";
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || "";
const GUILD_ID = process.env.GUILD_ID || DISCORD_SERVER_ID;

// Role IDs for tiers
const TIER_ROLES: Record<string, string> = {
  bronze: process.env.DISCORD_ROLE_BRONZE || "",
  silver: process.env.DISCORD_ROLE_SILVER || "",
  gold: process.env.DISCORD_ROLE_GOLD || "",
  platinum: process.env.DISCORD_ROLE_PLATINUM || "",
  diamond: process.env.DISCORD_ROLE_DIAMOND || "",
  legendary: process.env.DISCORD_ROLE_LEGENDARY || "",
  verified: process.env.DISCORD_ROLE_VERIFIED || "",
};

// Track message -> response for edit detection
const messageResponseMap = new Map<string, string>();

// Store recent Q&A for feedback
const recentResponses = new Map<
  string,
  { question: string; answer: string; timestamp: number }
>();

// Cleanup old entries periodically
function cleanupMaps(): void {
  if (messageResponseMap.size > 100) {
    const entries = [...messageResponseMap.entries()];
    const toDelete = entries.slice(0, entries.length - 100);
    toDelete.forEach(([key]) => messageResponseMap.delete(key));
  }

  if (recentResponses.size > 200) {
    const oldest = [...recentResponses.entries()].sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )[0];
    recentResponses.delete(oldest[0]);
  }
}
setInterval(cleanupMaps, 60000);

function storeResponseForFeedback(
  messageId: string,
  question: string,
  answer: string
): void {
  recentResponses.set(messageId, { question, answer, timestamp: Date.now() });
}

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

    if (GUILD_ID) {
      // Guild-specific (instant)
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, GUILD_ID),
        { body: commandData }
      );
      console.log(`[Bot] Registered ${commandData.length} commands to guild`);
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
 * Assign tier role to Discord member
 */
async function assignTierRole(
  discordId: string,
  tier: string
): Promise<boolean> {
  if (!DISCORD_SERVER_ID) return false;

  try {
    const guild = client.guilds.cache.get(DISCORD_SERVER_ID);
    if (!guild) return false;

    const member = await guild.members.fetch(discordId).catch(() => null);
    if (!member) return false;

    // Remove existing tier roles
    for (const [tierName, roleId] of Object.entries(TIER_ROLES)) {
      if (roleId && tierName !== tier && member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId).catch(() => {});
      }
    }

    // Add new tier role
    const roleId = TIER_ROLES[tier];
    if (roleId) {
      await member.roles.add(roleId).catch(() => {});
      console.log(`[Bot] Assigned ${tier} role to ${member.user.tag}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`[Bot] Failed to assign role:`, error);
    return false;
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

    // Assign verified role
    if (TIER_ROLES.verified) {
      const guild = client.guilds.cache.get(DISCORD_SERVER_ID);
      if (guild) {
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (member) {
          await member.roles.add(TIER_ROLES.verified).catch(() => {});
        }
      }
    }

    // Assign tier role if applicable
    if (user.currentTier && user.currentTier !== "none") {
      await assignTierRole(discordId, user.currentTier);
    }

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

  // Register slash commands
  await registerSlashCommands();

  // Set activity
  client.user!.setActivity("/cortex help", { type: ActivityType.Listening });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[Bot] Ready and operational!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// New member event - verify and send welcome DM
client.on(Events.GuildMemberAdd, async (member) => {
  console.log(`[Bot] New member: ${member.user.tag}`);

  // Verify member for referral system
  await verifyMember(member.user.id);

  // Send welcome DM
  try {
    await member.send(
      `Hey! Welcome to the Cortex Linux server.\n\n` +
        `I'm the AI support bot. You can:\n` +
        `• Mention me: \`@${client.user!.username} how do I install?\`\n` +
        `• Use slash commands: \`/cortex help\`\n` +
        `• Reply to my messages to continue a conversation\n\n` +
        `You get 5 free questions per day (unlimited for verified members).\n\n` +
        `**Quick Links:**\n` +
        `• Website: https://cortexlinux.com\n` +
        `• GitHub: https://github.com/cortexlinux/cortex\n` +
        `• Hackathon: https://cortexlinux.com/hackathon\n` +
        `• Referrals: https://cortexlinux.com/referrals`
    );
    console.log(`[Bot] Sent welcome DM to ${member.user.tag}`);
  } catch {
    console.log(`[Bot] Couldn't DM ${member.user.tag} (DMs disabled)`);
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

// Slash command and button handler
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      const [action, type, value] = interaction.customId.split(":");

      if (action === "feedback" && recentResponses.has(value)) {
        const isHelpful = type === "helpful";
        await interaction.reply({
          content: isHelpful
            ? "Thanks for the feedback!"
            : "Got it, I'll try to do better.",
          ephemeral: true,
        });
        return;
      }

      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error("[Bot] Interaction error:", error);
  }
});

// Message handler
client.on(Events.MessageCreate, async (message) => {
  const shouldReply = await shouldRespond(message, client.user!.id);
  if (!shouldReply) return;

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
        "**Tip:** Try `/cortex help` for available commands!"
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
              `• Sources: ${Object.entries(stats.sources)
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
    await message.reply({
      embeds: [
        createResponseEmbed(
          `**Memory:**\n` +
            `• Active conversations: ${memStats.activeConversations}\n` +
            `• Total messages: ${memStats.totalMessages}\n\n` +
            `**Your Status:**\n` +
            `• Remaining questions: ${getRemainingQuestions(userId, member)}`,
          { title: "Bot Stats", color: COLORS.info }
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

    // Build reply
    let content = response;
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
        components: [createFeedbackButtons(message.id)],
      });
      messageResponseMap.set(message.id, reply.id);
    }

    storeResponseForFeedback(message.id, question, response);
    console.log(`[Bot] Responded to ${username}. Remaining: ${remaining}`);
  } catch (error: any) {
    console.error(`[Bot] Error responding to ${username}:`, error.message);
    await message.reply({
      embeds: [createErrorEmbed("Sorry, I encountered an error", error.message)],
    });
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

/**
 * Start the Discord bot
 */
export async function startBot(): Promise<void> {
  if (!BOT_ENABLED) {
    console.log("[Bot] Bot is disabled - skipping startup");
    return;
  }
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
  assignTierRole,
  verifyMember,
};
