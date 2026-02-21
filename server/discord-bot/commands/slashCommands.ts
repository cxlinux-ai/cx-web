/**
 * Slash Commands
 *
 * Discord slash command definitions and handlers.
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  TextChannel,
  VoiceChannel,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  GuildMember,
  CategoryChannel,
} from "discord.js";
import { generateResponse } from "../llm/claude.js";
import { refreshKnowledgeBase, getStats as getRagStats } from "../rag/retriever.js";
import { clearHistory, getStats as getMemoryStats } from "../memory/conversationMemory.js";
import { getRemainingQuestions, canAskQuestion, incrementUsage } from "../utils/dailyLimit.js";
import { getCacheStats } from "../utils/responseCache.js";
import { db } from "../../db.js";
import { botFeedback } from "@shared/schema";

// Store recent Q&A for feedback (shared with index.ts)
const recentQA = new Map<string, { question: string; answer: string }>();

export function storeQAForFeedback(messageId: string, question: string, answer: string): void {
  recentQA.set(messageId, { question, answer });
  // Clean up old entries
  if (recentQA.size > 500) {
    const oldest = recentQA.keys().next().value;
    if (oldest) recentQA.delete(oldest);
  }
}
import { createResponseEmbed, createErrorEmbed, COLORS } from "../utils/embeds.js";

/**
 * Check if user has admin permissions (using Discord's built-in permission system)
 */
function hasAdminPermission(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  const member = interaction.member;
  if ('permissions' in member) {
    const permissions = member.permissions;
    if (typeof permissions === 'string') {
      return BigInt(permissions) & PermissionFlagsBits.Administrator ? true : false;
    }
    return permissions.has(PermissionFlagsBits.Administrator) || permissions.has(PermissionFlagsBits.ManageGuild);
  }
  return false;
}

// Define slash commands
export const commands = [
  new SlashCommandBuilder()
    .setName("cx")
    .setDescription("Ask CX AI a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question about CX Linux")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show help and available commands"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics (Admin only)"),

  new SlashCommandBuilder()

  new SlashCommandBuilder()
    .setName("hackathon")
    .setDescription("Get information about the CX Hackathon"),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear your conversation history with the bot"),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages from this channel (Admin only)")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("links")
    .setDescription("Get important CX Linux links"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is online"),

  new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the knowledge base (Admin only)"),

  new SlashCommandBuilder()
    .setName("setup-server")
    .setDescription("Set up server roles, channels, and permissions (Admin only)"),

  new SlashCommandBuilder()
    .setName("apply")
    .setDescription("Apply to become a contributor/participant"),

  new SlashCommandBuilder()
    .setName("approve")
    .setDescription("Approve a user's application (Admin only)")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to approve")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("reject")
    .setDescription("Reject a user's application (Admin only)")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to reject")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for rejection (optional)")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("bounties")
    .setDescription("View open bounties and PRs with rewards"),
];

/**
 * Handle slash command interactions
 */
export async function handleSlashCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const { commandName } = interaction;

  try {
    switch (commandName) {
      case "cx":
        await handleCXCommand(interaction);
        break;
      case "help":
        await handleHelpCommand(interaction);
        break;
      case "stats":
        await handleStatsCommand(interaction);
        break;
      case "hackathon":
        await handleHackathonCommand(interaction);
        break;
      case "clear":
        await handleClearCommand(interaction);
        break;
      case "purge":
        await handlePurgeCommand(interaction);
        break;
      case "links":
        await handleLinksCommand(interaction);
        break;
      case "ping":
        await handlePingCommand(interaction);
        break;
      case "refresh":
        await handleRefreshCommand(interaction);
        break;
      case "setup-server":
        await handleSetupServerCommand(interaction);
        break;
      case "apply":
        await handleApplyCommand(interaction);
        break;
      case "approve":
        await handleApproveCommand(interaction);
        break;
      case "reject":
        await handleRejectCommand(interaction);
        break;
      case "bounties":
        await handleBountiesCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: "Unknown command",
          ephemeral: true,
        });
    }
  } catch (error: any) {
    console.error(`[Command Error] ${commandName}:`, error.message);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        embeds: [createErrorEmbed("Command failed", error.message)],
        ephemeral: true,
      });
    }
  }
}

/**
 * Handle /cx command
 */
async function handleCXCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const question = interaction.options.getString("question", true);
  const userId = interaction.user.id;
  const member = interaction.member;

  // Check daily limit
  if (!canAskQuestion(userId, member)) {
    await interaction.reply({
      content:
        "You've reached your daily question limit (5 questions). Come back tomorrow, or join our Discord for unlimited access!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const response = await generateResponse(question, interaction);
    incrementUsage(userId, member);
    const remaining = getRemainingQuestions(userId, member);

    // Create response with remaining questions
    let content = response;
    if (remaining !== "unlimited") {
      content += `\n\n-# ${remaining} question${remaining !== 1 ? "s" : ""} remaining today`;
    }

    // Split if too long
    if (content.length > 2000) {
      content = content.slice(0, 1997) + "...";
    }

    await interaction.editReply({ content });
  } catch (error: any) {
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to generate response", error.message)],
    });
  }
}

/**
 * Handle /help command
 */
async function handleHelpCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("CX Linux AI - Help")
    .setDescription("I'm the official AI assistant for CX Linux!")
    .addFields(
      {
        name: "Everyone",
        value: [
          "`/cx <question>` - Ask me anything about CX Linux",
          "`/help` - Show this help message",
          "`/apply` - Apply to become a contributor",
          "`/hackathon` - Get hackathon information",
          "`/clear` - Clear your conversation history",
          "`/links` - Get important links",
          "`/ping` - Check bot status",
        ].join("\n"),
      },
      {
        name: "Moderator Only",
        value: [
          "`/approve @user` - Approve a user's application",
          "`/reject @user [reason]` - Reject a user's application",
          "`/stats` - View bot statistics",
          "`/purge <amount>` - Delete 1-100 messages",
        ].join("\n"),
      },
      {
        name: "Admin Only",
        value: [
          "`/setup-server` - Set up server roles & channels",
          "`/refresh` - Refresh knowledge base",
        ].join("\n"),
      },
      {
        name: "Other Ways to Ask",
        value: [
          "**@mention me:** @CXLinuxAI how do I install?",
          "**Reply to my messages:** Continue conversations naturally",
        ].join("\n"),
      },
      {
        name: "Daily Limits",
        value: "Free users: 5 questions/day\nDiscord members: Unlimited",
      },
      {
        name: "Links",
        value: [
          "[Website](https://cxlinux.com)",
          "[GitHub](https://github.com/cxlinux/cx)",
          "[Hackathon](https://cxlinux.com/hackathon)",
        ].join(" | "),
      }
    )
    .setFooter({ text: "Powered by Claude AI" });

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /stats command (admin only)
 */
async function handleStatsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      content: "You need the Admin role to use this command.",
      ephemeral: true,
    });
    return;
  }

  const memStats = getMemoryStats();
  const ragStats = getRagStats();

  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle("Bot Statistics")
    .addFields(
      {
        name: "Knowledge Base",
        value: `${ragStats.totalDocuments} documents loaded`,
        inline: true,
      },
      {
        name: "Active Conversations",
        value: `${memStats.activeConversations}`,
        inline: true,
      },
      {
        name: "Your Remaining Questions",
        value: `${getRemainingQuestions(interaction.user.id, interaction.member)}`,
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 */
async function handleHackathonCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle("The First AI Linux Hackathon Worldwide")
    .setDescription("$13,800 cash + $4,900 worth of prizes - Build the future of AI-powered Linux!")
    .addFields(
      {
        name: "Phase 1: Ideathon",
        value: "Weeks 1-4 | $3,800 prizes\nSubmit monetizable feature ideas",
        inline: true,
      },
      {
        name: "Phase 2: Hackathon",
        value: "Weeks 5-13 | $10K cash + prizes\nBuild production-ready code",
        inline: true,
      },
      {
        name: "Who Can Join",
        value: "Anyone 18+, any skill level. Solo or teams of 2-5.",
      },
      {
        name: "Top Prizes",
        value: "1st: $5K | 2nd: $3K | 3rd: $2K | 4th-10th: $700 worth of goodies + 2mo managed service",
      }
    )
    .setURL("https://cxlinux.com/hackathon");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Register Now")
      .setStyle(ButtonStyle.Link)
      .setURL("https://cxlinux.com/hackathon"),
    new ButtonBuilder()
      .setLabel("View Rules")
      .setStyle(ButtonStyle.Link)
      .setURL("https://cxlinux.com/downloads/cx-hackathon-rules-2026.pdf")
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

/**
 * Handle /clear command
 */
async function handleClearCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  clearHistory(interaction);

  await interaction.reply({
    embeds: [
      createResponseEmbed("Conversation history cleared! Starting fresh.", {
        title: "Memory Cleared",
        color: COLORS.info,
      }),
    ],
    ephemeral: true,
  });
}

/**
 * Handle /refresh command (admin only)
 */
async function handleRefreshCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      content: "You need the Admin role to use this command.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await refreshKnowledgeBase();
    await interaction.editReply({
      embeds: [
        createResponseEmbed("Knowledge base has been refreshed successfully!", {
          title: "Refresh Complete",
          color: COLORS.success,
        }),
      ],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to refresh knowledge base.")],
    });
  }
}

/**
 * Handle /purge command (admin only)
 */
async function handlePurgeCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      content: "You need the Admin role to use this command.",
      ephemeral: true,
    });
    return;
  }

  const amount = interaction.options.getInteger("amount", true);

  if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: "This command can only be used in text channels.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel as TextChannel;
  const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

  try {
    // Fetch messages first
    const messages = await channel.messages.fetch({ limit: amount });
    
    if (messages.size === 0) {
      await interaction.editReply({ content: "No messages found to delete." });
      return;
    }

    // Separate messages by age
    const recentMessages = messages.filter(msg => msg.createdTimestamp > fourteenDaysAgo);
    const oldMessages = messages.filter(msg => msg.createdTimestamp <= fourteenDaysAgo);

    let bulkDeleted = 0;
    let individuallyDeleted = 0;
    let failed = 0;

    // Bulk delete recent messages (< 14 days old)
    if (recentMessages.size > 0) {
      try {
        const deleted = await channel.bulkDelete(recentMessages, true);
        bulkDeleted = deleted.size;
      } catch (err) {
        // If bulk delete fails, try individually
        for (const msg of Array.from(recentMessages.values())) {
          try {
            await msg.delete();
            individuallyDeleted++;
          } catch {
            failed++;
          }
        }
      }
    }

    // Individually delete old messages (> 14 days old)
    let lastError = "";
    for (const msg of Array.from(oldMessages.values())) {
      try {
        await msg.delete();
        individuallyDeleted++;
      } catch (err: any) {
        failed++;
        lastError = err?.message || String(err);
        console.error("[Purge] Failed to delete message:", err?.message || err);
      }
    }

    // Also try to delete recent messages individually if bulk failed
    if (bulkDeleted === 0 && recentMessages.size > 0) {
      for (const msg of Array.from(recentMessages.values())) {
        try {
          await msg.delete();
          individuallyDeleted++;
        } catch (err: any) {
          failed++;
          lastError = err?.message || String(err);
          console.error("[Purge] Failed to delete message:", err?.message || err);
        }
      }
    }

    const total = bulkDeleted + individuallyDeleted;
    let response = `Successfully deleted ${total} message(s).`;
    
    if (failed > 0) {
      response += ` Failed to delete ${failed} message(s).`;
      if (lastError) {
        response += ` Error: ${lastError}`;
      }
    }
    
    if (oldMessages.size > 0 && individuallyDeleted > 0) {
      response += ` (${Math.min(oldMessages.size, individuallyDeleted)} older messages deleted individually)`;
    }

    await interaction.editReply({ content: response });
  } catch (error: any) {
    console.error("[Purge] Error:", error);
    await interaction.editReply({
      content: `Failed to delete messages: ${error?.message || "Unknown error"}. Make sure the bot has 'Manage Messages' permission.`,
    });
  }
}

/**
 * Handle /links command
 */
async function handleLinksCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("CX Linux Links")
    .addFields(
      { name: "Website", value: "[cxlinux.com](https://cxlinux.com)", inline: true },
      { name: "GitHub", value: "[github.com/cxlinux](https://github.com/cxlinux)", inline: true },
      { name: "Bounties", value: "[/bounties](https://cxlinux.com/bounties)", inline: true },
      { name: "Hackathon", value: "[/hackathon](https://cxlinux.com/hackathon)", inline: true },
      { name: "Blog", value: "[/blog](https://cxlinux.com/blog)", inline: true }
    )
    .setFooter({ text: "The AI Layer for Linux" });

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /ping command
 */
async function handlePingCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const latency = Date.now() - interaction.createdTimestamp;

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle("Pong!")
    .addFields(
      { name: "Bot Latency", value: `${latency}ms`, inline: true },
      { name: "Status", value: "Online", inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /bounties command - fetches open bounties from GitHub
 */
async function handleBountiesCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();

  try {
    // Fetch bounties from our API - use public domain if available
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${baseUrl}/api/bounties`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch bounties");
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error("Invalid bounty data");
    }

    const { open, stats } = data.data;
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle("Open Bounties & PRs")
      .setDescription(
        `Found **${stats.totalOpen}** open bounties worth **$${stats.totalOpenAmount.toLocaleString()}** total!\n\n` +
        `View all bounties at [cxlinux.com/bounties](https://cxlinux.com/bounties)`
      )
      .setTimestamp();

    // Add top bounties (max 10)
    const topBounties = open.slice(0, 10);
    
    if (topBounties.length > 0) {
      const bountiesList = topBounties.map((bounty: any) => {
        const amount = bounty.bountyAmount ? `$${bounty.bountyAmount}` : "Bounty to be discussed";
        const difficulty = bounty.difficulty ? ` (${bounty.difficulty})` : "";
        const repo = bounty.repositoryName || "cx";
        return `**[#${bounty.number}](${bounty.url})** - ${amount}${difficulty}\n${bounty.title.slice(0, 60)}${bounty.title.length > 60 ? "..." : ""} *(${repo})*`;
      }).join("\n\n");
      
      embed.addFields({
        name: "Top Bounties",
        value: bountiesList || "No open bounties at this time",
        inline: false
      });
    } else {
      embed.addFields({
        name: "Status",
        value: "No open bounties at this time. Check back later!",
        inline: false
      });
    }

    // Add stats
    embed.addFields(
      { name: "Total Paid Out", value: `$${stats.totalClosedAmount.toLocaleString()}`, inline: true },
      { name: "Completed", value: `${stats.totalClosed} bounties`, inline: true }
    );

    embed.setFooter({ text: "Contribute to CX Linux and earn rewards!" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    console.error("[Bot] Bounties command error:", error.message);
    
    // Fallback response
    const fallbackEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle("Bounties Board")
      .setDescription(
        "Check out open bounties and contribute to CX Linux!\n\n" +
        "**Browse all bounties:**\n" +
        "[cxlinux.com/bounties](https://cxlinux.com/bounties)\n\n" +
        "**How it works:**\n" +
        "1. Find a bounty you want to work on\n" +
        "2. Comment on the GitHub issue to claim it\n" +
        "3. Submit a PR and get paid when merged!\n\n" +
        "Bounties range from $50 to $500+ depending on complexity."
      )
      .setFooter({ text: "Contribute and earn!" });

    await interaction.editReply({ embeds: [fallbackEmbed] });
  }
}

/**
 * Server setup configuration for CX Linux Discord
 * Organizes existing channels into logical categories
 * Adds topics and welcome messages to each channel
 */
const SERVER_SETUP = {
  categories: [
    {
      name: "START HERE",
      emoji: "👋",
      channels: [
        {
          name: "welcome",
          topic: "Welcome to CX Linux! Read this channel to get started.",
          welcome: {
            title: "Welcome to CX Linux!",
            description: "The AI Layer for Linux. We're building the future of intelligent computing.",
            color: 0x6366f1,
            fields: [
              { name: "Get Started", value: "1. Check out #announcements for news\n2. Ask questions in #help or #questions\n3. Chat with our AI in #cxlinux-ai" },
              { name: "Links", value: "[Website](https://cxlinux.com) • [GitHub](https://github.com/cxlinux) • [Hackathon](https://cxlinux.com/hackathon)" },
            ]
          }
        },
        {
          name: "announcements",
          topic: "Official announcements, updates, and news from the CX Linux team.",
          skipIfNoAccess: true,
        },
        {
          name: "rules",
          topic: "Community guidelines and rules.",
          welcome: {
            title: "Community Rules",
            description: "Keep it friendly and productive!",
            color: 0xf59e0b,
            fields: [
              { name: "1. Be Respectful", value: "Treat everyone with respect. No harassment, hate speech, or personal attacks." },
              { name: "2. Stay On Topic", value: "Use the right channels for your discussions. Keep it relevant." },
              { name: "3. No Spam", value: "No excessive self-promotion, repeated messages, or irrelevant links." },
              { name: "4. Help Each Other", value: "Share knowledge, answer questions, and contribute positively." },
              { name: "5. Have Fun", value: "This is a community - enjoy it!" },
            ]
          }
        },
        {
          name: "verification",
          topic: "Verify your account to access all channels.",
        },
      ],
    },
    {
      name: "CORTEX AI",
      emoji: "🤖",
      channels: [
        {
          name: "cxlinux-ai",
          topic: "Chat with the CX Linux AI assistant! Mention @CXLinuxAI or use /cx",
          welcome: {
            title: "CX Linux AI Assistant",
            description: "I'm here to help with anything CX Linux related!",
            color: 0x10b981,
            fields: [
              { name: "How to Use", value: "• **Mention me:** @CXLinuxAI how do I install?\n• **Slash command:** `/cx your question`\n• **Reply:** Just reply to my messages to continue" },
              { name: "What I Can Help With", value: "Installation, configuration, troubleshooting, features, hackathon info, and more!" },
            ]
          }
        },
        {
          name: "prompts",
          topic: "Share and discover great prompts for the CX Linux AI.",
        },
        {
          name: "help",
          topic: "Need help? Ask here and the community or AI will assist you.",
          welcome: {
            title: "Need Help?",
            description: "Ask your questions here! The community and AI are ready to help.",
            color: 0x3b82f6,
            fields: [
              { name: "Tips for Getting Help", value: "• Be specific about your problem\n• Share error messages if any\n• Mention what you've already tried" },
            ]
          }
        },
      ],
    },
    {
      name: "COMMUNITY",
      emoji: "💬",
      channels: [
        {
          name: "general",
          topic: "General chat about anything! Meet the community.",
        },
        {
          name: "questions",
          topic: "Technical questions about Linux, AI, development, and more.",
        },
        {
          name: "your-roles",
          topic: "Pick your roles and interests.",
        },
      ],
    },
    {
      name: "CONTRIBUTE",
      emoji: "🚀",
      channels: [
        {
          name: "hackathon",
          topic: "$18,700 in prizes! Build the future of AI-powered Linux.",
          welcome: {
            title: "The First AI Linux Hackathon Worldwide",
            description: "$13,800 cash + $4,900 worth of prizes - Build the future of AI-powered Linux!",
            color: 0xf59e0b,
            fields: [
              { name: "Cash Prizes", value: "1st: $5,000 • 2nd: $3,000 • 3rd: $2,000" },
              { name: "4th-10th Place", value: "$700 worth of goodies + 2 months CX Linux managed service each" },
              { name: "How to Join", value: "Register at [cxlinux.com/hackathon](https://cxlinux.com/hackathon)" },
            ]
          }
        },
        {
          name: "bounties",
          topic: "Earn money by contributing! Use /bounties to see open tasks.",
          welcome: {
            title: "Bounty Board",
            description: "Get paid to contribute to CX Linux!",
            color: 0x22c55e,
            fields: [
              { name: "How It Works", value: "1. Use `/bounties` to see open tasks\n2. Comment on the GitHub issue to claim\n3. Submit a PR and get paid when merged!" },
              { name: "Bounty Range", value: "$50 - $500+ depending on complexity" },
            ]
          }
        },
        {
          name: "git-updates",
          topic: "Live feed of GitHub activity - commits, PRs, and issues.",
        },
      ],
    },
    {
      name: "DEVELOPMENT",
      emoji: "💻",
      channels: [
        {
          name: "dev-chat",
          topic: "Technical discussion for contributors and developers.",
        },
        {
          name: "internal",
          topic: "Internal team discussions and coordination.",
        },
      ],
    },
    {
      name: "TEAM",
      emoji: "👥",
      channels: [
        {
          name: "moderator-only",
          topic: "Moderator discussions and coordination.",
        },
        {
          name: "marketing",
          topic: "Marketing strategy and content planning.",
        },
        {
          name: "role-updates",
          topic: "Role change notifications and logs.",
        },
        {
          name: "candidature-review",
          topic: "Review contributor applications. Use /approve or /reject.",
        },
      ],
    },
    {
      name: "VOICE",
      emoji: "🎙️",
      channels: [],
      isVoice: true,
    },
  ],
  voiceChannels: [
    { name: "Voice Meetings", newName: "General Voice", status: "Jump in and chat!" },
    { name: "Dev", newName: "Dev Talk", status: "Technical discussions" },
  ],
  preserveCategories: ["Claimed Tickets", "Closed Tickets"],
};

/**
 * Handle /setup-server command (Admin only)
 * Reorganizes channels, sets topics, and sends welcome messages
 */
async function handleSetupServerCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  // Try to acknowledge the interaction first
  try {
    await interaction.deferReply({ ephemeral: true });
  } catch (err: any) {
    console.error("[Setup] Failed to defer reply:", err.message);
    // Try a regular reply as fallback
    try {
      await interaction.reply({
        content: `Error: ${err.message}\n\nMake sure the bot has permission to send messages in this channel.`,
        ephemeral: true,
      });
    } catch {
      // Can't respond at all
    }
    return;
  }

  if (!hasAdminPermission(interaction)) {
    await interaction.editReply({
      content: "You need Administrator permission to use this command.",
    });
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply({
      content: "This command can only be used in a server.",
    });
    return;
  }

  // Check bot permissions
  const botMember = guild.members.me;
  if (!botMember) {
    await interaction.editReply({
      content: "Could not find bot member in server.",
    });
    return;
  }

  // Log bot permissions for debugging
  console.log("[Setup] Bot permissions:", botMember.permissions.toArray());

  const requiredPerms = [
    { flag: PermissionFlagsBits.ManageChannels, name: "Manage Channels" },
    { flag: PermissionFlagsBits.SendMessages, name: "Send Messages" },
    { flag: PermissionFlagsBits.EmbedLinks, name: "Embed Links" },
    { flag: PermissionFlagsBits.ViewChannel, name: "View Channels" },
  ];

  const missingPerms = requiredPerms.filter(p => !botMember.permissions.has(p.flag));

  if (missingPerms.length > 0) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle("Missing Bot Permissions")
          .setDescription(
            "The bot needs these permissions to set up the server:\n\n" +
            missingPerms.map(p => `❌ **${p.name}**`).join("\n") +
            "\n\nPlease update the bot's role permissions and try again."
          )
      ],
    });
    return;
  }

  const stats = {
    categoriesCreated: 0,
    channelsMoved: 0,
    topicsSet: 0,
    welcomesSent: 0,
    voiceRenamed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    await guild.channels.fetch();

    // Step 1: Organize text channels into categories
    let categoryPosition = 0;
    for (const categoryConfig of SERVER_SETUP.categories) {
      const categoryName = `${categoryConfig.emoji} ${categoryConfig.name}`;

      // Find or create category
      let category = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory &&
               (c.name === categoryName ||
                c.name === categoryConfig.name ||
                c.name.endsWith(categoryConfig.name))
      ) as CategoryChannel | undefined;

      try {
        if (!category) {
          category = await guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
            position: categoryPosition,
          }) as CategoryChannel;
          stats.categoriesCreated++;
        } else if (category.name !== categoryName) {
          await category.setName(categoryName);
        }
        await category.setPosition(categoryPosition);
      } catch (err: any) {
        stats.errors.push(`Category "${categoryConfig.name}": ${err.message}`);
        continue;
      }

      categoryPosition++;

      // Handle voice category
      if (categoryConfig.isVoice) {
        for (const vcConfig of SERVER_SETUP.voiceChannels) {
          try {
            const vc = guild.channels.cache.find(
              (c) => c.type === ChannelType.GuildVoice &&
                     (c.name.toLowerCase() === vcConfig.name.toLowerCase() ||
                      c.name.toLowerCase() === vcConfig.newName.toLowerCase())
            ) as VoiceChannel | undefined;

            if (vc) {
              // Check if bot can access this voice channel
              const vcPerms = vc.permissionsFor(botMember);
              if (!vcPerms?.has(PermissionFlagsBits.ViewChannel) || !vcPerms?.has(PermissionFlagsBits.ManageChannels)) {
                stats.skipped++;
                continue;
              }

              if (vc.parentId !== category.id) {
                await vc.setParent(category.id, { lockPermissions: false });
              }
              if (vc.name !== vcConfig.newName) {
                await vc.setName(vcConfig.newName);
                stats.voiceRenamed++;
              }
            }
          } catch (err: any) {
            if (!err.message.includes("Missing") && !err.message.includes("Access")) {
              stats.errors.push(`Voice "${vcConfig.name}": ${err.message}`);
            } else {
              stats.skipped++;
            }
          }
        }
        continue;
      }

      // Process each channel in the category
      for (const channelConfig of categoryConfig.channels) {
        try {
          const channel = guild.channels.cache.find(
            (c) => c.type === ChannelType.GuildText &&
                   c.name.toLowerCase() === channelConfig.name.toLowerCase()
          ) as TextChannel | undefined;

          if (!channel) continue;

          // Check if bot can access this channel
          const botPerms = channel.permissionsFor(botMember);
          if (!botPerms?.has(PermissionFlagsBits.ViewChannel)) {
            stats.skipped++;
            continue; // Silently skip - bot can't see this channel
          }

          // Move to category if needed (requires ManageChannels)
          if (channel.parentId !== category.id) {
            if (botPerms.has(PermissionFlagsBits.ManageChannels)) {
              await channel.setParent(category.id, { lockPermissions: false });
              stats.channelsMoved++;
            } else {
              stats.skipped++;
            }
          }

          // Set topic if different (requires ManageChannels)
          if (channelConfig.topic && channel.topic !== channelConfig.topic) {
            if (botPerms.has(PermissionFlagsBits.ManageChannels)) {
              await channel.setTopic(channelConfig.topic);
              stats.topicsSet++;
            }
          }

          // Send welcome message if configured (requires SendMessages)
          if (channelConfig.welcome && botPerms.has(PermissionFlagsBits.SendMessages)) {
            const messages = await channel.messages.fetch({ limit: 5 });
            const hasBotWelcome = messages.some(
              (m) => m.author.id === interaction.client.user?.id &&
                     m.embeds.length > 0 &&
                     m.embeds[0].title === channelConfig.welcome?.title
            );

            if (!hasBotWelcome) {
              const welcomeEmbed = new EmbedBuilder()
                .setColor(channelConfig.welcome.color)
                .setTitle(channelConfig.welcome.title)
                .setDescription(channelConfig.welcome.description);

              if (channelConfig.welcome.fields) {
                welcomeEmbed.addFields(channelConfig.welcome.fields);
              }

              await channel.send({ embeds: [welcomeEmbed] });
              stats.welcomesSent++;
            }
          }
        } catch (err: any) {
          // Only log unexpected errors, not permission issues
          if (!err.message.includes("Missing") && !err.message.includes("Access")) {
            stats.errors.push(`#${channelConfig.name}: ${err.message}`);
          } else {
            stats.skipped++;
          }
        }
      }
    }

    // Step 2: Clean up empty default categories
    const oldCategories = ["Text Channels", "Voice Channels"];
    for (const oldName of oldCategories) {
      try {
        const oldCat = guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildCategory && c.name === oldName
        );
        if (oldCat) {
          const children = guild.channels.cache.filter((c) => c.parentId === oldCat.id);
          if (children.size === 0) {
            await oldCat.delete("Server setup - removing empty category");
          }
        }
      } catch (err: any) {
        stats.errors.push(`Cleanup "${oldName}": ${err.message}`);
      }
    }

    // Build summary
    const embed = new EmbedBuilder()
      .setColor(stats.errors.length > 0 ? COLORS.warning : COLORS.success)
      .setTitle("Server Setup Complete!")
      .setDescription("Your Discord server has been organized and configured.")
      .addFields(
        {
          name: "Changes Made",
          value: [
            `📁 Categories: **${stats.categoriesCreated}** created`,
            `↪️ Channels moved: **${stats.channelsMoved}**`,
            `📝 Topics set: **${stats.topicsSet}**`,
            `👋 Welcome messages: **${stats.welcomesSent}**`,
            `🎙️ Voice renamed: **${stats.voiceRenamed}**`,
            stats.skipped > 0 ? `⏭️ Skipped (no access): **${stats.skipped}**` : "",
          ].filter(Boolean).join("\n"),
          inline: false,
        },
        {
          name: "Server Structure",
          value: SERVER_SETUP.categories
            .map(c => `${c.emoji} **${c.name}**`)
            .join("\n"),
          inline: true,
        },
        {
          name: "Preserved",
          value: SERVER_SETUP.preserveCategories.join("\n") || "None",
          inline: true,
        }
      );

    if (stats.errors.length > 0) {
      embed.addFields({
        name: `⚠️ Issues (${stats.errors.length})`,
        value: stats.errors.slice(0, 5).join("\n") +
               (stats.errors.length > 5 ? `\n...and ${stats.errors.length - 5} more` : ""),
        inline: false,
      });
    }

    embed.setFooter({ text: "Run /setup-server again anytime to refresh" })
         .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    console.log(`[Setup] Server setup completed:`, stats);
  } catch (error: any) {
    console.error("[Setup] Error:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Setup failed", error.message)],
    });
  }
}

/**
 * Handle /apply command - Show application modal
 */
async function handleApplyCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  // Create the application modal
  const modal = new ModalBuilder()
    .setCustomId("application_modal")
    .setTitle("Contributor Application");

  // Row 1: GitHub URL
  const githubInput = new TextInputBuilder()
    .setCustomId("github_url")
    .setLabel("GitHub Profile URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://github.com/yourusername")
    .setRequired(true);

  // Row 2: Tech Stack
  const techStackInput = new TextInputBuilder()
    .setCustomId("tech_stack")
    .setLabel("Primary Tech Stack")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("e.g., TypeScript, React, Node.js, Python")
    .setRequired(true);

  // Row 3: LLM Experience
  const llmExperienceInput = new TextInputBuilder()
    .setCustomId("llm_experience")
    .setLabel("LLM/Infrastructure Experience")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Have you worked with LLMs or related infrastructure? Describe your experience...")
    .setRequired(true)
    .setMaxLength(500);

  // Row 4: Open Source Contributions
  const opensourceInput = new TextInputBuilder()
    .setCustomId("opensource")
    .setLabel("Open Source Contributions")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Share 1-2 relevant PRs or repos you've contributed to...")
    .setRequired(true)
    .setMaxLength(500);

  // Row 5: Area of Interest + Time Commitment (combined due to modal limit of 5)
  const areaTimeInput = new TextInputBuilder()
    .setCustomId("area_time")
    .setLabel("Area of Interest & Weekly Time Commitment")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Area: LLM/CLI/infra/security/docs, Time: 10-15 hrs/week")
    .setRequired(true)
    .setMaxLength(300);

  // Add inputs to action rows (Discord requires each input in its own row)
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(githubInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(techStackInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(llmExperienceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(opensourceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(areaTimeInput)
  );

  await interaction.showModal(modal);
}

/**
 * Handle application modal submission
 */
export async function handleApplicationModal(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "This can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Get form values
    const githubUrl = interaction.fields.getTextInputValue("github_url");
    const techStack = interaction.fields.getTextInputValue("tech_stack");
    const llmExperience = interaction.fields.getTextInputValue("llm_experience");
    const opensource = interaction.fields.getTextInputValue("opensource");
    const areaTime = interaction.fields.getTextInputValue("area_time");

    // Note: No "Applicant" role assigned - application tracked via review channel embed
    const member = interaction.member as GuildMember;

    // Find the candidature-review channel
    const reviewChannel = guild.channels.cache.find(
      (c) => c.name === "candidature-review" && c.type === ChannelType.GuildText
    ) as TextChannel | undefined;

    if (!reviewChannel) {
      await interaction.editReply({
        content: "Application submitted but review channel not found. Please contact an admin.",
      });
      return;
    }

    // Create application embed
    const applicationEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle("New Contributor Application")
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        {
          name: "Applicant",
          value: `${interaction.user} (${interaction.user.tag})\nID: \`${interaction.user.id}\``,
          inline: false,
        },
        {
          name: "GitHub",
          value: githubUrl,
          inline: true,
        },
        {
          name: "Tech Stack",
          value: techStack,
          inline: true,
        },
        {
          name: "LLM/Infrastructure Experience",
          value: llmExperience.length > 1024 ? llmExperience.slice(0, 1021) + "..." : llmExperience,
          inline: false,
        },
        {
          name: "Open Source Contributions",
          value: opensource.length > 1024 ? opensource.slice(0, 1021) + "..." : opensource,
          inline: false,
        },
        {
          name: "Area of Interest & Availability",
          value: areaTime.length > 1024 ? areaTime.slice(0, 1021) + "..." : areaTime,
          inline: false,
        }
      )
      .setFooter({ text: `Application submitted` })
      .setTimestamp();

    // Create approve/reject buttons
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`app:approve:${interaction.user.id}`)
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setCustomId(`app:reject:${interaction.user.id}`)
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌")
    );

    // Post to review channel
    await reviewChannel.send({
      embeds: [applicationEmbed],
      components: [buttons],
    });

    // Confirm to user
    await interaction.editReply({
      embeds: [
        createResponseEmbed(
          "Your application has been submitted successfully!\n\n" +
          "Our team will review it and get back to you soon. " +
          "You'll receive a DM when a decision is made.",
          { title: "Application Submitted", color: COLORS.success }
        ),
      ],
    });

    console.log(`[Bot] Application submitted by ${interaction.user.tag}`);
  } catch (error: any) {
    console.error("[Bot] Application submission error:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to submit application", error.message)],
    });
  }
}

/**
 * Handle /approve command
 */
async function handleApproveCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      content: "You need Administrator permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser("user", true);
  const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // DM the user
    try {
      await targetUser.send(
        `**Congratulations!** Your application to CX Linux has been approved!\n\n` +
        `You now have access to:\n` +
        `- Community channels\n` +
        `- Hackathon discussions\n` +
        `- Bounties & contributions\n\n` +
        `Welcome to the team! Check out the community channels to get started.`
      );
    } catch {
      // User has DMs disabled
    }

    // Log in review channel
    const reviewChannel = guild.channels.cache.find(
      (c) => c.name === "candidature-review" && c.type === ChannelType.GuildText
    ) as TextChannel | undefined;

    if (reviewChannel) {
      await reviewChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.success)
            .setTitle("Application Approved")
            .setDescription(`${targetUser} has been approved by ${interaction.user}`)
            .setTimestamp(),
        ],
      });
    }

    await interaction.editReply({
      embeds: [
        createResponseEmbed(
          `${targetUser} has been approved!`,
          { title: "User Approved", color: COLORS.success }
        ),
      ],
    });

    console.log(`[Bot] ${targetUser.tag} approved by ${interaction.user.tag}`);
  } catch (error: any) {
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to approve user", error.message)],
    });
  }
}

/**
 * Handle /reject command
 */
async function handleRejectCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      content: "You need Administrator permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // DM the user
    try {
      await targetUser.send(
        `Thank you for your interest in contributing to CX Linux.\n\n` +
        `Unfortunately, your application was not approved at this time.\n\n` +
        `**Reason:** ${reason}\n\n` +
        `You're welcome to reapply in the future if circumstances change. ` +
        `Feel free to continue participating in our public channels!`
      );
    } catch {
      // User has DMs disabled
    }

    // Log in review channel
    const reviewChannel = guild.channels.cache.find(
      (c) => c.name === "candidature-review" && c.type === ChannelType.GuildText
    ) as TextChannel | undefined;

    if (reviewChannel) {
      await reviewChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.error)
            .setTitle("Application Rejected")
            .setDescription(`${targetUser} was rejected by ${interaction.user}`)
            .addFields({ name: "Reason", value: reason })
            .setTimestamp(),
        ],
      });
    }

    await interaction.editReply({
      embeds: [
        createResponseEmbed(
          `${targetUser}'s application has been rejected.\nReason: ${reason}`,
          { title: "Application Rejected", color: COLORS.error }
        ),
      ],
    });

    console.log(`[Bot] ${targetUser.tag} rejected by ${interaction.user.tag}: ${reason}`);
  } catch (error: any) {
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to reject user", error.message)],
    });
  }
}

/**
 * Handle application button interactions (approve/reject from embed buttons)
 */
export async function handleApplicationButton(
  interaction: ButtonInteraction
): Promise<void> {
  const [, action, userId] = interaction.customId.split(":");

  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "This can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  // Check if user has permission (Administrator or Manage Guild)
  const member = interaction.member as GuildMember;
  if (!member.permissions.has(PermissionFlagsBits.Administrator) &&
      !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: "You don't have permission to process applications.",
      ephemeral: true,
    });
    return;
  }

  const targetMember = await guild.members.fetch(userId).catch(() => null);
  if (!targetMember) {
    await interaction.reply({
      content: "User not found in this server. They may have left.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    if (action === "approve") {
      // DM user
      try {
        await targetMember.send(
          `**Congratulations!** Your application to CX Linux has been approved!\n\n` +
          `You now have access to:\n` +
          `- Community channels\n` +
          `- Hackathon discussions\n` +
          `- Bounties & contributions\n\n` +
          `Welcome to the team! Check out the community channels to get started.`
        );
      } catch {
        // DMs disabled
      }

      // Update the original message
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setColor(COLORS.success)
        .setFooter({ text: `Approved by ${interaction.user.tag}` });

      await interaction.message.edit({
        embeds: [updatedEmbed],
        components: [], // Remove buttons
      });

      await interaction.editReply({
        content: `${targetMember.user.tag} has been approved!`,
      });

      console.log(`[Bot] ${targetMember.user.tag} approved via button by ${interaction.user.tag}`);
    } else if (action === "reject") {
      // DM user
      try {
        await targetMember.send(
          `Thank you for your interest in contributing to CX Linux.\n\n` +
          `Unfortunately, your application was not approved at this time.\n\n` +
          `You're welcome to reapply in the future if circumstances change. ` +
          `Feel free to continue participating in our public channels!`
        );
      } catch {
        // DMs disabled
      }

      // Update the original message
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setColor(COLORS.error)
        .setFooter({ text: `Rejected by ${interaction.user.tag}` });

      await interaction.message.edit({
        embeds: [updatedEmbed],
        components: [], // Remove buttons
      });

      await interaction.editReply({
        content: `${targetMember.user.tag} has been rejected.`,
      });

      console.log(`[Bot] ${targetMember.user.tag} rejected via button by ${interaction.user.tag}`);
    }
  } catch (error: any) {
    console.error("[Bot] Application button error:", error);
    await interaction.editReply({
      content: `Failed to process: ${error.message}`,
    });
  }
}

/**
 * Handle button interactions
 */
export async function handleButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const [action, type, value] = interaction.customId.split(":");

  if (action === "feedback") {
    const isHelpful = type === "helpful";
    const messageId = value;

    // Store feedback in database
    try {
      const qa = recentQA.get(messageId);
      if (qa) {
        await db.insert(botFeedback).values({
          discordUserId: interaction.user.id,
          discordMessageId: messageId,
          question: qa.question,
          answer: qa.answer,
          rating: isHelpful ? "positive" : "negative",
        });
        console.log(`[Feedback] ${isHelpful ? "Positive" : "Negative"} feedback stored`);
      }
    } catch (error) {
      console.error("[Feedback] Failed to store:", error);
    }

    await interaction.reply({
      content: isHelpful
        ? "Thanks for the feedback! Glad I could help."
        : "Thanks for letting me know. I'll keep improving!",
      ephemeral: true,
    });
  } else if (action === "app") {
    await handleApplicationButton(interaction);
  }
}

export default {
  commands,
  handleSlashCommand,
  handleButtonInteraction,
  handleApplicationModal,
  storeQAForFeedback,
};
