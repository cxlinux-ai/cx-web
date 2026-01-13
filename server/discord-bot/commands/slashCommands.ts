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
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  GuildMember,
  Role,
  CategoryChannel,
  OverwriteResolvable,
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

// Admin role ID for restricted commands
const ADMIN_ROLE_ID = "1450564628911489156";

/**
 * Check if user has admin role
 */
function hasAdminRole(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  const member = interaction.member;
  if ('roles' in member && member.roles) {
    const roles = member.roles;
    if ('cache' in roles) {
      return roles.cache.has(ADMIN_ROLE_ID);
    }
  }
  return false;
}

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
    .setDescription("Show bot statistics (Admin only)"),

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
    .setDescription("Get important Cortex Linux links"),

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
          "`/apply` - Apply to become a contributor",
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
 * Handle /stats command (admin only)
 */
async function handleStatsCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminRole(interaction)) {
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
  if (!hasAdminRole(interaction)) {
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
  if (!hasAdminRole(interaction)) {
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
      { name: "Bounties", value: "[/bounties](https://cortexlinux.com/bounties)", inline: true },
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
 * Handle /bounties command - fetches open bounties from GitHub
 */
async function handleBountiesCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();

  try {
    // Fetch bounties from our API
    const response = await fetch("http://localhost:5000/api/bounties");
    
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
        `View all bounties at [cortexlinux.com/bounties](https://cortexlinux.com/bounties)`
      )
      .setTimestamp();

    // Add top bounties (max 10)
    const topBounties = open.slice(0, 10);
    
    if (topBounties.length > 0) {
      const bountiesList = topBounties.map((bounty: any) => {
        const amount = bounty.bountyAmount ? `$${bounty.bountyAmount}` : "TBD";
        const difficulty = bounty.difficulty ? ` (${bounty.difficulty})` : "";
        const repo = bounty.repositoryName || "cortex";
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

    embed.setFooter({ text: "Contribute to Cortex and earn rewards!" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    console.error("[Bot] Bounties command error:", error.message);
    
    // Fallback response
    const fallbackEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle("Bounties Board")
      .setDescription(
        "Check out open bounties and contribute to Cortex Linux!\n\n" +
        "**Browse all bounties:**\n" +
        "[cortexlinux.com/bounties](https://cortexlinux.com/bounties)\n\n" +
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
 * Server setup configuration
 */
const SERVER_SETUP = {
  roles: [
    { name: "Participant", color: 0xf59e0b, reason: "Approved hackathon participants" },
    { name: "Applicant", color: 0x6b7280, reason: "Pending application review" },
    { name: "Dev Team", color: 0x8b5cf6, reason: "Internal development team" },
  ],
  categories: [
    {
      name: "PUBLIC",
      emoji: "📢",
      channels: [
        { name: "welcome", type: "text", readOnly: true },
        { name: "rules", type: "text", readOnly: true },
        { name: "apply-here", type: "text", readOnly: false },
        { name: "announcements", type: "text", readOnly: true },
      ],
      visibility: "everyone",
    },
    {
      name: "HACKATHON",
      emoji: "🏆",
      channels: [
        { name: "hackathon-general", type: "text", readOnly: false },
        { name: "team-formation", type: "text", readOnly: false },
        { name: "hackathon-questions", type: "text", readOnly: false },
        { name: "submissions", type: "text", readOnly: false },
      ],
      visibility: "participant",
    },
    {
      name: "COMMUNITY",
      emoji: "💬",
      channels: [
        { name: "general", type: "text", readOnly: false },
        { name: "help", type: "text", readOnly: false },
        { name: "showcase", type: "text", readOnly: false },
        { name: "off-topic", type: "text", readOnly: false },
      ],
      visibility: "participant",
    },
    {
      name: "DEV TEAM",
      emoji: "🔧",
      channels: [
        { name: "pr-reviews", type: "text", readOnly: false },
        { name: "internal", type: "text", readOnly: false },
        { name: "bot-testing", type: "text", readOnly: false },
      ],
      visibility: "devteam",
    },
    {
      name: "STAFF",
      emoji: "📋",
      channels: [
        { name: "candidature-review", type: "text", readOnly: false },
        { name: "mod-logs", type: "text", readOnly: false },
        { name: "staff-chat", type: "text", readOnly: false },
      ],
      visibility: "staff",
    },
  ],
};

/**
 * Handle /setup-server command (Admin only)
 */
async function handleSetupServerCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!hasAdminRole(interaction)) {
    await interaction.reply({
      content: "You need the Admin role to use this command.",
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

  await interaction.deferReply({ ephemeral: true });

  const results: string[] = [];
  const createdRoles: Map<string, Role> = new Map();

  try {
    // Step 1: Create roles
    results.push("**Creating roles...**");
    for (const roleConfig of SERVER_SETUP.roles) {
      const existingRole = guild.roles.cache.find((r) => r.name === roleConfig.name);
      if (existingRole) {
        createdRoles.set(roleConfig.name, existingRole);
        results.push(`• ${roleConfig.name}: Already exists`);
      } else {
        const newRole = await guild.roles.create({
          name: roleConfig.name,
          color: roleConfig.color,
          reason: roleConfig.reason,
        });
        createdRoles.set(roleConfig.name, newRole);
        results.push(`• ${roleConfig.name}: Created`);
      }
    }

    // Get moderator role (users with ManageMessages permission)
    const modRole = guild.roles.cache.find((r) => r.permissions.has(PermissionFlagsBits.ManageMessages) && !r.managed && r.name !== "@everyone");

    // Step 2: Create categories and channels
    results.push("\n**Creating categories & channels...**");

    for (const categoryConfig of SERVER_SETUP.categories) {
      const categoryName = `${categoryConfig.emoji} ${categoryConfig.name}`;

      // Check if category exists
      let category = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
      ) as CategoryChannel | undefined;

      if (!category) {
        // Build permission overwrites based on visibility
        const permissionOverwrites: OverwriteResolvable[] = [];

        if (categoryConfig.visibility === "everyone") {
          // Everyone can view, but can't send by default
          permissionOverwrites.push({
            id: guild.roles.everyone.id,
            allow: [],
            deny: [PermissionFlagsBits.SendMessages],
          });
        } else if (categoryConfig.visibility === "participant") {
          // Hide from everyone, show to Participant role
          permissionOverwrites.push({
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          });
          const participantRole = createdRoles.get("Participant");
          if (participantRole) {
            permissionOverwrites.push({
              id: participantRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
            });
          }
        } else if (categoryConfig.visibility === "devteam") {
          // Hide from everyone, show to Dev Team role
          permissionOverwrites.push({
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          });
          const devTeamRole = createdRoles.get("Dev Team");
          if (devTeamRole) {
            permissionOverwrites.push({
              id: devTeamRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
            });
          }
        } else if (categoryConfig.visibility === "staff") {
          // Hide from everyone, show to mods/admins
          permissionOverwrites.push({
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          });
          if (modRole) {
            permissionOverwrites.push({
              id: modRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
            });
          }
        }

        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          permissionOverwrites,
        }) as CategoryChannel;
        results.push(`• Category "${categoryName}": Created`);
      } else {
        results.push(`• Category "${categoryName}": Already exists`);
      }

      // Create channels in category
      for (const channelConfig of categoryConfig.channels) {
        const existingChannel = guild.channels.cache.find(
          (c) => c.name === channelConfig.name && c.parentId === category!.id
        );

        if (!existingChannel) {
          const channelOverwrites: OverwriteResolvable[] = [];

          // For PUBLIC category channels
          if (categoryConfig.visibility === "everyone") {
            if (channelConfig.readOnly) {
              // Read-only: everyone can view, no one can send
              channelOverwrites.push({
                id: guild.roles.everyone.id,
                allow: [PermissionFlagsBits.ViewChannel],
                deny: [PermissionFlagsBits.SendMessages],
              });
            } else {
              // Apply-here: everyone can view AND send
              channelOverwrites.push({
                id: guild.roles.everyone.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
              });
            }
          }

          await guild.channels.create({
            name: channelConfig.name,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: channelOverwrites.length > 0 ? channelOverwrites : undefined,
          });
          results.push(`  - #${channelConfig.name}: Created`);
        } else {
          results.push(`  - #${channelConfig.name}: Already exists`);
        }
      }
    }

    // Summary
    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle("Server Setup Complete")
      .setDescription(results.join("\n"))
      .addFields(
        {
          name: "Next Steps",
          value: [
            "1. Users can apply with `/apply`",
            "2. Review applications in #candidature-review",
            "3. Use `/approve @user` or `/reject @user` to process",
          ].join("\n"),
        }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
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

  // Check if user already has Applicant or Participant role
  const member = interaction.member as GuildMember;
  const applicantRole = guild.roles.cache.find((r) => r.name === "Applicant");
  const participantRole = guild.roles.cache.find((r) => r.name === "Participant");

  if (participantRole && member.roles.cache.has(participantRole.id)) {
    await interaction.reply({
      content: "You're already an approved participant!",
      ephemeral: true,
    });
    return;
  }

  if (applicantRole && member.roles.cache.has(applicantRole.id)) {
    await interaction.reply({
      content: "You already have a pending application. Please wait for review.",
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
    .setPlaceholder("Area: LLM routing / CLI / infra / security / docs\nTime: e.g., 10-15 hours/week\nWill you follow contributing guidelines? Yes/No")
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

    // Assign Applicant role
    const member = interaction.member as GuildMember;
    const applicantRole = guild.roles.cache.find((r) => r.name === "Applicant");
    if (applicantRole) {
      await member.roles.add(applicantRole);
    }

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
  if (!hasAdminRole(interaction)) {
    await interaction.reply({
      content: "You need moderator permissions to use this command.",
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
    const applicantRole = guild.roles.cache.find((r) => r.name === "Applicant");
    const participantRole = guild.roles.cache.find((r) => r.name === "Participant");

    if (!participantRole) {
      await interaction.editReply({
        content: "Participant role not found. Please run `/setup-server` first.",
      });
      return;
    }

    // Remove Applicant role if they have it
    if (applicantRole && targetMember.roles.cache.has(applicantRole.id)) {
      await targetMember.roles.remove(applicantRole);
    }

    // Add Participant role
    await targetMember.roles.add(participantRole);

    // DM the user
    try {
      await targetUser.send(
        `🎉 **Congratulations!** Your application to Cortex Linux has been approved!\n\n` +
        `You now have access to:\n` +
        `• Hackathon channels\n` +
        `• Community discussions\n` +
        `• Team formation\n\n` +
        `Welcome to the team! Check out the hackathon channels to get started.`
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
          `${targetUser} has been approved and given the Participant role.`,
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
  if (!hasAdminRole(interaction)) {
    await interaction.reply({
      content: "You need moderator permissions to use this command.",
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
    const applicantRole = guild.roles.cache.find((r) => r.name === "Applicant");

    // Remove Applicant role if they have it
    if (applicantRole && targetMember.roles.cache.has(applicantRole.id)) {
      await targetMember.roles.remove(applicantRole);
    }

    // DM the user
    try {
      await targetUser.send(
        `Thank you for your interest in contributing to Cortex Linux.\n\n` +
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

  // Check if user has permission
  const member = interaction.member as GuildMember;
  if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
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
    const applicantRole = guild.roles.cache.find((r) => r.name === "Applicant");
    const participantRole = guild.roles.cache.find((r) => r.name === "Participant");

    if (action === "approve") {
      if (!participantRole) {
        await interaction.editReply({
          content: "Participant role not found. Please run `/setup-server` first.",
        });
        return;
      }

      // Remove Applicant, add Participant
      if (applicantRole && targetMember.roles.cache.has(applicantRole.id)) {
        await targetMember.roles.remove(applicantRole);
      }
      await targetMember.roles.add(participantRole);

      // DM user
      try {
        await targetMember.send(
          `🎉 **Congratulations!** Your application to Cortex Linux has been approved!\n\n` +
          `You now have access to:\n` +
          `• Hackathon channels\n` +
          `• Community discussions\n` +
          `• Team formation\n\n` +
          `Welcome to the team! Check out the hackathon channels to get started.`
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
        content: `✅ ${targetMember.user.tag} has been approved!`,
      });

      console.log(`[Bot] ${targetMember.user.tag} approved via button by ${interaction.user.tag}`);
    } else if (action === "reject") {
      // Remove Applicant role
      if (applicantRole && targetMember.roles.cache.has(applicantRole.id)) {
        await targetMember.roles.remove(applicantRole);
      }

      // DM user
      try {
        await targetMember.send(
          `Thank you for your interest in contributing to Cortex Linux.\n\n` +
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
        content: `❌ ${targetMember.user.tag} has been rejected.`,
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
