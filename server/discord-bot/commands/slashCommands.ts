/**
 * Slash Commands
 *
 * Discord slash command definitions and handlers.
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  TextChannel,
  ChannelType,
} from "discord.js";
import { generateResponse } from "../llm/claude.js";
import { refreshKnowledgeBase, getStats as getRagStats } from "../rag/retriever.js";
import { clearHistory, getStats as getMemoryStats } from "../memory/conversationMemory.js";
import { getRemainingQuestions, canAskQuestion, incrementUsage } from "../utils/dailyLimit.js";
import { createResponseEmbed, createErrorEmbed, COLORS } from "../utils/embeds.js";

// Define slash commands
export const commands = [
  new SlashCommandBuilder()
    .setName("cortex")
    .setDescription("Ask Cortex AI a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question about Cortex Linux")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show help and available commands"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics (Moderator only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("referral")
    .setDescription("Get information about the referral program"),

  new SlashCommandBuilder()
    .setName("hackathon")
    .setDescription("Get information about the Cortex Hackathon"),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear your conversation history with the bot"),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages from this channel (Moderator only)")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("links")
    .setDescription("Get important Cortex Linux links"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is online"),

  new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the knowledge base (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
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
      case "cortex":
        await handleCortexCommand(interaction);
        break;
      case "help":
        await handleHelpCommand(interaction);
        break;
      case "stats":
        await handleStatsCommand(interaction);
        break;
      case "referral":
        await handleReferralCommand(interaction);
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
 * Handle /cortex command
 */
async function handleCortexCommand(
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
    .setTitle("Cortex Linux AI - Help")
    .setDescription("I'm the official AI assistant for Cortex Linux!")
    .addFields(
      {
        name: "Everyone",
        value: [
          "`/cortex <question>` - Ask me anything about Cortex Linux",
          "`/help` - Show this help message",
          "`/referral` - Learn about our referral program",
          "`/hackathon` - Get hackathon information",
          "`/clear` - Clear your conversation history",
          "`/links` - Get important links",
          "`/ping` - Check bot status",
        ].join("\n"),
      },
      {
        name: "Moderator Only",
        value: [
          "`/stats` - View bot statistics",
          "`/purge <amount>` - Delete 1-100 messages",
          "`/refresh` - Refresh knowledge base (Admin)",
        ].join("\n"),
      },
      {
        name: "Other Ways to Ask",
        value: [
          "**@mention me:** @CortexLinuxAI how do I install?",
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
          "[Website](https://cortexlinux.com)",
          "[GitHub](https://github.com/cortexlinux/cortex)",
          "[Hackathon](https://cortexlinux.com/hackathon)",
        ].join(" | "),
      }
    )
    .setFooter({ text: "Powered by Claude AI" });

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /stats command
 */
async function handleStatsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
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
 * Handle /referral command
 */
async function handleReferralCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle("Cortex Linux Referral Program")
    .setDescription("Invite friends and earn exclusive rewards!")
    .addFields(
      {
        name: "Reward Tiers",
        value: [
          "**1 referral:** Bronze badge + 100 spots up",
          "**3 referrals:** Silver + Discord access",
          "**5 referrals:** Gold + Swag pack",
          "**10 referrals:** Platinum + 1 month Pro",
          "**20 referrals:** Diamond + Ambassador status",
          "**50 referrals:** Legendary + Lifetime VIP",
        ].join("\n"),
      },
      {
        name: "How to Participate",
        value:
          "1. Sign up at https://cortexlinux.com/referrals\n2. Get your unique referral link\n3. Share with friends\n4. Earn rewards when they join Discord AND contribute!",
      }
    )
    .setURL("https://cortexlinux.com/referrals");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Get Your Referral Link")
      .setStyle(ButtonStyle.Link)
      .setURL("https://cortexlinux.com/referrals")
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

/**
 * Handle /hackathon command
 */
async function handleHackathonCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle("Cortex Linux Hackathon 2026")
    .setDescription("$15,000 in prizes - Build the future of AI-powered Linux!")
    .addFields(
      {
        name: "Phase 1: Ideathon",
        value: "Weeks 1-4 | $3,000 prizes\nSubmit monetizable feature ideas",
        inline: true,
      },
      {
        name: "Phase 2: Hackathon",
        value: "Weeks 5-13 | $12,000 prizes\nBuild production-ready code",
        inline: true,
      },
      {
        name: "Who Can Join",
        value: "Anyone 18+, any skill level. Solo or teams of 2-5.",
      },
      {
        name: "Top Prizes",
        value: "1st: $5,000 | 2nd: $3,000 | 3rd: $2,000",
      }
    )
    .setURL("https://cortexlinux.com/hackathon");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Register Now")
      .setStyle(ButtonStyle.Link)
      .setURL("https://cortexlinux.com/hackathon"),
    new ButtonBuilder()
      .setLabel("View Rules")
      .setStyle(ButtonStyle.Link)
      .setURL("https://cortexlinux.com/downloads/cortex-hackathon-rules-2026.pdf")
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
 * Handle /purge command (moderator only)
 */
async function handlePurgeCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const amount = interaction.options.getInteger("amount", true);

  if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: "This command can only be used in text channels.",
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.channel as TextChannel;

  try {
    const deleted = await channel.bulkDelete(amount, true);
    await interaction.reply({
      content: `Successfully deleted ${deleted.size} message(s).`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: "Failed to delete messages. Messages older than 14 days cannot be bulk deleted.",
      ephemeral: true,
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
    .setTitle("Cortex Linux Links")
    .addFields(
      { name: "Website", value: "[cortexlinux.com](https://cortexlinux.com)", inline: true },
      { name: "GitHub", value: "[github.com/cortexlinux](https://github.com/cortexlinux)", inline: true },
      { name: "Discord", value: "[discord.gg/ASvzWcuTfk](https://discord.gg/ASvzWcuTfk)", inline: true },
      { name: "Hackathon", value: "[/hackathon](https://cortexlinux.com/hackathon)", inline: true },
      { name: "Referrals", value: "[/referrals](https://cortexlinux.com/referrals)", inline: true },
      { name: "Blog", value: "[/blog](https://cortexlinux.com/blog)", inline: true }
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
 * Handle button interactions
 */
export async function handleButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const [action, type, value] = interaction.customId.split(":");

  if (action === "feedback") {
    const isHelpful = type === "helpful";
    await interaction.reply({
      content: isHelpful
        ? "Thanks for the feedback!"
        : "Sorry to hear that. I'll try to do better.",
      ephemeral: true,
    });
  }
}

export default {
  commands,
  handleSlashCommand,
  handleButtonInteraction,
};
