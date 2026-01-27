import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  REST,
  Routes,
  Events,
  ChannelType,
} from "discord.js";
import { generateResponse, initializeRAG } from "./llm/claude.js";
import { refreshKnowledgeBase } from "./rag/retriever.js";
import { commands, handleSlashCommand, handleButtonInteraction } from "./commands/slashCommands.js";
import { shouldRespond, extractQuestion } from "./utils/shouldRespond.js";
import {
  canAskQuestion,
  incrementUsage,
  getRemainingQuestions,
  getLimitExceededMessage,
  isPrivileged,
} from "./utils/dailyLimit.js";
import { splitMessage } from "./utils/splitMessage.js";
import { addMessage, clearHistory, getStats as getMemoryStats } from "./memory/conversationMemory.js";
import { recordFeedback, getStats as getFeedbackStats, loadFeedback } from "./memory/feedbackStore.js";
import { checkFAQ } from "./utils/faqCache.js";
import { trackQuestion, trackFeedback, getAnalyticsSummary } from "./utils/analytics.js";
import { getChannelContext, detectLanguage, getLanguageInstruction } from "./utils/context.js";
import {
  createResponseEmbed,
  createErrorEmbed,
  createFeedbackButtons,
  COLORS,
} from "./utils/embeds.js";

// Track message -> response for edit detection
const messageResponseMap = new Map();

// Cleanup old entries periodically (keep last 100)
function cleanupMessageMap() {
  if (messageResponseMap.size > 100) {
    const entries = [...messageResponseMap.entries()];
    const toDelete = entries.slice(0, entries.length - 100);
    toDelete.forEach(([key]) => messageResponseMap.delete(key));
  }
}
setInterval(cleanupMessageMap, 60000); // Every minute

// Store recent Q&A for feedback (messageId -> {question, answer})
const recentResponses = new Map();

function storeResponseForFeedback(messageId, question, answer) {
  recentResponses.set(messageId, { question, answer, timestamp: Date.now() });
  // Keep only last 200 entries
  if (recentResponses.size > 200) {
    const oldest = [...recentResponses.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    recentResponses.delete(oldest[0]);
  }
}

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error("[Error] DISCORD_TOKEN is not set in environment variables");
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("[Error] ANTHROPIC_API_KEY is not set in environment variables");
  process.exit(1);
}

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.GuildMembers, // Enable in Discord Portal for welcome DMs
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

/**
 * Register slash commands with Discord
 */
async function registerSlashCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("[Slash Commands] Registering commands...");

    const commandData = commands.map(cmd => cmd.toJSON());

    // Register globally (takes up to 1 hour to propagate)
    // For testing, you can register to a specific guild which is instant
    if (process.env.GUILD_ID) {
      // Guild-specific registration (instant, for development)
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commandData }
      );
      console.log(`[Slash Commands] Registered ${commandData.length} commands to guild ${process.env.GUILD_ID}`);
    } else {
      // Global registration
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commandData,
      });
      console.log(`[Slash Commands] Registered ${commandData.length} global commands`);
    }
  } catch (error) {
    console.error("[Slash Commands] Registration failed:", error);
  }
}

// Bot ready event
client.once(Events.ClientReady, async () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`[Bot Online] Logged in as ${client.user.tag}`);
  console.log(`[Bot ID] ${client.user.id}`);
  console.log(`[Servers] Connected to ${client.guilds.cache.size} server(s)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Initialize RAG system
  console.log("[RAG] Initializing knowledge base...");
  await initializeRAG();

  // Register slash commands
  await registerSlashCommands();

  // Set bot activity
  client.user.setActivity("/cortex help", { type: ActivityType.Listening });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[Ready] Bot is fully operational!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// Welcome DM for new members
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await member.send(
      `Hey! Welcome to the Cortex Linux server.\n\n` +
      `I'm the AI support bot here. You can:\n` +
      `• Mention me anywhere: \`@CortexLinuxAI how do I install?\`\n` +
      `• Use slash commands: \`/cortex help\`\n` +
      `• Reply to my messages to continue a conversation\n\n` +
      `I know the docs inside out, so ask away. You get 5 questions per day.\n\n` +
      `Quick links:\n` +
      `• GitHub: https://github.com/cxlinux-ai/cortex\n` +
      `• Website: https://cxlinux-ai.com`
    );
    console.log(`[Welcome] Sent DM to new member: ${member.user.username}`);
  } catch (error) {
    // User might have DMs disabled
    console.log(`[Welcome] Couldn't DM ${member.user.username}: ${error.message}`);
  }
});

// Edit detection - update answer when user edits their question
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  // Check if we responded to this message
  if (!messageResponseMap.has(oldMessage.id)) return;
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const responseId = messageResponseMap.get(oldMessage.id);

  try {
    const question = extractQuestion(newMessage, client.user.id);
    if (!question) return;

    console.log(`[Edit] User edited question, regenerating response...`);

    // Generate new response
    const response = await generateResponse(question, newMessage);

    // Try to edit our response
    const channel = newMessage.channel;
    const ourMessage = await channel.messages.fetch(responseId).catch(() => null);

    if (ourMessage && ourMessage.editable) {
      const chunks = splitMessage(response);
      await ourMessage.edit({
        content: chunks[0] + "\n\n-# *(updated)*",
      });
      console.log(`[Edit] Updated response for edited question`);
    }
  } catch (error) {
    console.error(`[Edit] Error updating response:`, error.message);
  }
});

// Slash command and button handler
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      // Check if it's feedback for a @mention response
      const [action, type, value] = interaction.customId.split(":");
      if (action === "feedback" && recentResponses.has(value)) {
        const stored = recentResponses.get(value);
        const isHelpful = type === "helpful";
        recordFeedback(stored.question, stored.answer, isHelpful, interaction.user.id);
        trackFeedback(isHelpful); // Analytics
        await interaction.reply({
          content: isHelpful ? "Thanks for the feedback." : "Got it, I'll try to do better.",
          ephemeral: true,
        });
        return;
      }
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error("[Interaction Error]", error);
  }
});

// Message handler (for @mentions and replies)
client.on(Events.MessageCreate, async (message) => {
  // Check if bot should respond to this message
  const shouldReply = await shouldRespond(message, client.user.id);
  if (!shouldReply) {
    return;
  }

  const userId = message.author.id;
  const username = message.author.username;
  const member = message.member;

  // Check daily limit (admins bypass)
  if (!canAskQuestion(userId, member)) {
    await message.reply(getLimitExceededMessage());
    return;
  }

  // Extract the question (remove bot mentions)
  const question = extractQuestion(message, client.user.id);

  if (!question || question.length === 0) {
    await message.reply(
      "Hi! How can I help you? Please include a question when mentioning me.\n\n" +
        "**Tip:** Try `/cortex help` for available commands!"
    );
    return;
  }

  // Admin commands
  const lowerQuestion = question.toLowerCase().trim();

  // Refresh RAG command
  if (lowerQuestion === "!refresh" || lowerQuestion === "!refresh-rag") {
    console.log(`[Admin] ${username} requested RAG refresh`);
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
    } catch (error) {
      await message.reply({
        embeds: [createErrorEmbed("Failed to refresh knowledge base", error.message)],
      });
    }
    return;
  }

  // Clear memory command
  if (lowerQuestion === "!clear" || lowerQuestion === "!forget") {
    clearHistory(message);
    await message.reply({
      embeds: [
        createResponseEmbed("Conversation history cleared! Starting fresh.", {
          title: "Memory Cleared",
          color: COLORS.info,
        }),
      ],
    });
    return;
  }

  // Stats command
  if (lowerQuestion === "!stats") {
    const memStats = getMemoryStats();
    const fbStats = getFeedbackStats();
    const analyticsStats = getAnalyticsSummary();
    await message.reply({
      embeds: [
        createResponseEmbed(
          `**Today:**\n` +
            `• Questions: ${analyticsStats.todayQuestions}\n` +
            `• FAQ hits: ${analyticsStats.faqHitRate}%\n\n` +
            `**Overall:**\n` +
            `• Total questions: ${analyticsStats.totalQuestions}\n` +
            `• Satisfaction: ${analyticsStats.satisfactionRate}%\n` +
            `• Peak hour: ${analyticsStats.peakHour}\n` +
            `• Top topics: ${analyticsStats.topKeywords.slice(0, 3).join(", ") || "N/A"}\n\n` +
            `**Memory:**\n` +
            `• Active conversations: ${memStats.activeConversations}\n` +
            `• Learning examples: ${fbStats.storedExamples}`,
          { title: "Bot Stats", color: COLORS.info }
        ),
      ],
    });
    return;
  }

  // Admin-only: Clear messages command
  const clearMsgMatch = lowerQuestion.match(/^!clear\s+msg\s+(\d+)$/);
  if (clearMsgMatch) {
    const OWNER_ROLE = "1450564628911489156";
    const hasPermission = member?.roles?.cache?.has(OWNER_ROLE);

    if (!hasPermission) {
      await message.reply("You don't have permission to use this command.");
      return;
    }

    const count = Math.min(parseInt(clearMsgMatch[1], 10), 100); // Discord max is 100
    if (count < 1) {
      await message.reply("Please specify a number between 1 and 100.");
      return;
    }

    try {
      // Delete the command message first
      await message.delete().catch(() => {});

      // Fetch and delete messages (bulkDelete only works on messages < 14 days old)
      const deleted = await message.channel.bulkDelete(count, true);

      // Send confirmation (auto-delete after 3 seconds)
      const confirmation = await message.channel.send(
        `Deleted ${deleted.size} message${deleted.size !== 1 ? "s" : ""}.`
      );
      setTimeout(() => confirmation.delete().catch(() => {}), 3000);

      console.log(`[Admin] ${username} cleared ${deleted.size} messages in #${message.channel.name}`);
    } catch (error) {
      console.error(`[Admin] Clear messages failed:`, error.message);
      await message.reply("Failed to delete messages. I may need Manage Messages permission.");
    }
    return;
  }

  // Detect language
  const detectedLang = detectLanguage(question);
  const channelContext = getChannelContext(message.channel.name);

  console.log(`[Question] ${username} (${userId}): ${question.slice(0, 100)}...`);
  if (detectedLang.code !== "en") {
    console.log(`[Language] Detected: ${detectedLang.name}`);
  }

  try {
    // Check FAQ cache first (instant, no API call)
    const faqResult = checkFAQ(question);
    let response;
    let faqHit = false;
    const startTime = Date.now();

    if (faqResult && faqResult.confidence >= 0.7) {
      // FAQ hit - instant response
      response = faqResult.answer;
      faqHit = true;
      console.log(`[FAQ] Cache hit (confidence: ${faqResult.confidence})`);
    } else {
      // Show typing indicator for API call
      await message.channel.sendTyping();

      // Keep typing indicator active during long responses
      var typingInterval = setInterval(() => {
        message.channel.sendTyping().catch(() => {});
      }, 5000);

      // Store user message in memory
      addMessage(message, "user", question);

      // Build context-aware prompt
      let contextPrompt = question;
      if (channelContext?.hint) {
        contextPrompt = `[Context: ${channelContext.hint}]\n\n${question}`;
      }
      if (detectedLang.code !== "en") {
        contextPrompt += `\n\n[${getLanguageInstruction(detectedLang.code)}]`;
      }

      // Generate response from Claude
      response = await generateResponse(contextPrompt, message);

      clearInterval(typingInterval);
    }

    // Track analytics
    trackQuestion(question, {
      userId,
      channel: message.channel.name,
      responseTime: Date.now() - startTime,
      faqHit,
      language: detectedLang.code,
    });

    // Store assistant response in memory
    addMessage(message, "assistant", response);

    // Stop typing indicator
    clearInterval(typingInterval);

    // Increment usage after successful response
    incrementUsage(userId, member);
    const remaining = getRemainingQuestions(userId, member);

    // Split response if needed
    const chunks = splitMessage(response);

    // Check if we should create a thread for long conversations
    const shouldCreateThread =
      message.channel.type === ChannelType.GuildText &&
      !message.channel.isThread() &&
      (chunks.length > 2 || response.length > 1500);

    if (shouldCreateThread) {
      // Create a thread for the conversation
      const thread = await message.startThread({
        name: `${username}'s question: ${question.slice(0, 30)}...`,
        autoArchiveDuration: 60,
      });

      // Send all chunks in thread
      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (i === chunks.length - 1 && remaining !== "unlimited") {
          chunk += `\n\n-# ${remaining} question${remaining !== 1 ? "s" : ""} remaining today`;
        }
        await thread.send(chunk);
      }

      // Reply in original channel pointing to thread
      await message.reply(`I've created a thread for this conversation! ${thread}`);

      console.log(`[Response] Created thread for ${username}. Remaining: ${remaining}`);
    } else {
      // Send all message chunks normally
      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];

        // Add remaining questions info to the last chunk (skip for admins)
        if (i === chunks.length - 1 && remaining !== "unlimited") {
          chunk += `\n\n-# ${remaining} question${remaining !== 1 ? "s" : ""} remaining today`;
        }

        if (i === 0) {
          const reply = await message.reply({
            content: chunk,
            components: chunks.length === 1 ? [createFeedbackButtons(message.id)] : [],
          });
          // Store for edit detection
          messageResponseMap.set(message.id, reply.id);
        } else {
          const isLast = i === chunks.length - 1;
          await message.channel.send({
            content: chunk,
            components: isLast ? [createFeedbackButtons(message.id)] : [],
          });
        }
      }

      // Store Q&A for feedback learning
      storeResponseForFeedback(message.id, question, response);

      console.log(
        `[Response] Sent ${chunks.length} message(s) to ${username}. Remaining: ${remaining}`
      );
    }
  } catch (error) {
    console.error(`[Error] Failed to respond to ${username}:`, error.message);

    await message.reply({
      embeds: [createErrorEmbed(`Sorry, I encountered an error`, error.message)],
    });
  }
});

// Error handling
client.on(Events.Error, (error) => {
  console.error("[Discord Client Error]", error);
});

process.on("unhandledRejection", (error) => {
  console.error("[Unhandled Rejection]", error);
});

process.on("SIGINT", () => {
  console.log("\n[Shutdown] Received SIGINT, shutting down gracefully...");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Shutdown] Received SIGTERM, shutting down gracefully...");
  client.destroy();
  process.exit(0);
});

// Login to Discord
console.log("[Starting] Connecting to Discord...");
client.login(process.env.DISCORD_TOKEN);
