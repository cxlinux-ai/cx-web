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

export default {
  COLORS,
  createResponseEmbed,
  createErrorEmbed,
  createFeedbackButtons,
  createLinkButton,
};
