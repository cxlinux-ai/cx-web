/**
 * Discord Embed Utilities
 *
 * Helper functions for creating consistent embeds and components.
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
} from "discord.js";

// Color constants
export const COLORS = {
  primary: 0x3b82f6 as ColorResolvable, // Blue
  success: 0x22c55e as ColorResolvable, // Green
  error: 0xef4444 as ColorResolvable, // Red
  warning: 0xf59e0b as ColorResolvable, // Orange
  info: 0x6366f1 as ColorResolvable, // Indigo
};

interface EmbedOptions {
  title?: string;
  color?: ColorResolvable;
  footer?: string;
}

/**
 * Create a response embed
 */
export function createResponseEmbed(
  content: string,
  options: EmbedOptions = {}
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(options.color || COLORS.primary)
    .setDescription(content);

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.footer) {
    embed.setFooter({ text: options.footer });
  }

  return embed;
}

/**
 * Create an error embed
 */
export function createErrorEmbed(title: string, details?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(title);

  if (details) {
    embed.setDescription(`\`\`\`${details}\`\`\``);
  }

  return embed;
}

/**
 * Create feedback buttons for a message
 */
export function createFeedbackButtons(
  messageId: string
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`feedback:helpful:${messageId}`)
      .setLabel("Helpful")
      .setStyle(ButtonStyle.Success)
      .setEmoji("👍"),
    new ButtonBuilder()
      .setCustomId(`feedback:not_helpful:${messageId}`)
      .setLabel("Not Helpful")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👎")
  );
}

/**
 * Create a link button
 */
export function createLinkButton(
  label: string,
  url: string
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(label)
      .setStyle(ButtonStyle.Link)
      .setURL(url)
  );
}

/**
 * Create a hackathon info embed
 */
export function createHackathonEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("The First AI Linux Hackathon Worldwide")
    .setDescription("Build the future of AI-powered Linux! All participants receive a $5 Cortex Linux credit.")
    .addFields(
      {
        name: "Total Prizes",
        value: "$13.8K cash + $4.9K prizes",
        inline: true,
      },
      {
        name: "Phases",
        value: "Ideathon + Build",
        inline: true,
      },
      {
        name: "Team Size",
        value: "1-4 people",
        inline: true,
      },
      {
        name: "Phase 1: Ideathon",
        value: "Submit feature ideas - $3,800 in prizes",
        inline: false,
      },
      {
        name: "Phase 2: Build",
        value: "1st-3rd: $10K cash | 4th-10th: $700 worth of goodies + 2mo managed service (not cash)",
        inline: false,
      },
      {
        name: "Category Awards",
        value: "Best Plugin, Best Automation, Best Enterprise, Community Choice: Premium subscriptions",
        inline: false,
      }
    )
    .setFooter({ text: "cortexlinux.com/hackathon" });
}

/**
 * Create a referral tiers embed
 */
export function createReferralTiersEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle("Referral Rewards Program")
    .setDescription("Invite hackathon participants and earn rewards! Referrals must register for BOTH phases and submit work to count.")
    .addFields(
      {
        name: "Starter Tier (5 referrals)",
        value: "$20 worth of Cortex Linux credit",
        inline: true,
      },
      {
        name: "Community Tier (20 referrals)",
        value: "Goodies package: shirt, water bottle, notebook",
        inline: true,
      },
      {
        name: "Ambassador Tier (50 referrals)",
        value: "Cortex Linux Premium (3 months) + full goodies bundle",
        inline: true,
      },
      {
        name: "Multi-University Recruiter",
        value: "Recruit from 3+ universities for special recognition",
        inline: false,
      },
      {
        name: "Community Ambassador",
        value: "Bring large groups for ambassador status + direct team access",
        inline: false,
      }
    )
    .setFooter({ text: "cortexlinux.com/referrals • Referrals must complete both hackathon phases" });
}

/**
 * Create an installation guide embed
 */
export function createInstallEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle("Installing Cortex Linux")
    .addFields(
      {
        name: "Requirements",
        value: "64-bit CPU, 4GB+ RAM, 20GB disk",
        inline: false,
      },
      {
        name: "Step 1",
        value: "Download ISO from cortexlinux.com/download",
        inline: false,
      },
      {
        name: "Step 2",
        value: "Flash to USB with Rufus/Etcher/dd",
        inline: false,
      },
      {
        name: "Step 3",
        value: "Boot from USB and follow installer",
        inline: false,
      }
    )
    .setFooter({ text: "AI assists with disk partitioning!" });
}

/**
 * Create a bot stats embed
 */
export function createStatsEmbed(stats: {
  activeConversations: number;
  totalMessages: number;
  cacheHitRate?: number;
  avgResponseTime?: number;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle("Bot Statistics")
    .addFields(
      {
        name: "Active Conversations",
        value: stats.activeConversations.toString(),
        inline: true,
      },
      {
        name: "Total Messages",
        value: stats.totalMessages.toString(),
        inline: true,
      }
    );

  if (stats.cacheHitRate !== undefined) {
    embed.addFields({
      name: "Cache Hit Rate",
      value: `${stats.cacheHitRate}%`,
      inline: true,
    });
  }

  if (stats.avgResponseTime !== undefined) {
    embed.addFields({
      name: "Avg Response Time",
      value: `${stats.avgResponseTime}ms`,
      inline: true,
    });
  }

  return embed;
}

/**
 * Detect if response should use rich embed
 */
export function shouldUseEmbed(question: string): "hackathon" | "referral" | "install" | null {
  const lower = question.toLowerCase();

  if (/\b(hackathon|prize|competition|contest)\b/.test(lower) && /\b(info|detail|about|tell)\b/.test(lower)) {
    return "hackathon";
  }

  if (/\b(referral|tier|invite|reward)\b/.test(lower) && /\b(what|how|info|all)\b/.test(lower)) {
    return "referral";
  }

  if (/\b(install|setup)\b/.test(lower) && /\b(how|guide|step|start)\b/.test(lower)) {
    return "install";
  }

  return null;
}

export default {
  COLORS,
  createResponseEmbed,
  createErrorEmbed,
  createFeedbackButtons,
  createLinkButton,
  createHackathonEmbed,
  createReferralTiersEmbed,
  createInstallEmbed,
  createStatsEmbed,
  shouldUseEmbed,
};
