/**
 * Proactive Welcome Flow
 *
 * Interactive onboarding when new users join.
 * Asks about experience level and interests.
 */

import {
  GuildMember,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonInteraction,
  StringSelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { db } from "../../db.js";
import { waitlistEntries } from "@shared/schema";
import { eq } from "drizzle-orm";

// Welcome flow state tracking
const welcomeFlowState = new Map<string, {
  step: number;
  data: Record<string, any>;
  startedAt: number;
}>();

/**
 * Create welcome embed for new members
 */
export function createWelcomeEmbed(member: GuildMember): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(`Welcome to Cortex Linux, ${member.displayName}! 🎉`)
    .setDescription(
      `Great to have you here! I'm the Cortex AI assistant.\n\n` +
      `Before we get started, I'd love to know a bit about you so I can help you better.\n\n` +
      `**What brings you to Cortex Linux?**`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "Click a button below to continue" });
}

/**
 * Create reason selection buttons
 */
export function createReasonButtons(userId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`welcome:reason:curious:${userId}`)
      .setLabel("Just Curious")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔍"),
    new ButtonBuilder()
      .setCustomId(`welcome:reason:install:${userId}`)
      .setLabel("Want to Install")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("💻"),
    new ButtonBuilder()
      .setCustomId(`welcome:reason:hackathon:${userId}`)
      .setLabel("Hackathon")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🏆"),
    new ButtonBuilder()
      .setCustomId(`welcome:reason:contribute:${userId}`)
      .setLabel("Contribute")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🛠️")
  );
}

/**
 * Create experience level selection
 */
export function createExperienceSelect(userId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`welcome:experience:${userId}`)
      .setPlaceholder("Select your Linux experience level")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Complete Beginner")
          .setDescription("Never used Linux before")
          .setValue("beginner")
          .setEmoji("🌱"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Some Experience")
          .setDescription("Used Linux casually or for specific tasks")
          .setValue("intermediate")
          .setEmoji("🌿"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Experienced User")
          .setDescription("Comfortable with terminal and system administration")
          .setValue("advanced")
          .setEmoji("🌳"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Linux Expert")
          .setDescription("Deep knowledge of Linux internals")
          .setValue("expert")
          .setEmoji("🏔️")
      )
  );
}

/**
 * Create interests selection
 */
export function createInterestsSelect(userId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`welcome:interests:${userId}`)
      .setPlaceholder("What interests you? (Select multiple)")
      .setMinValues(1)
      .setMaxValues(4)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("AI Features")
          .setDescription("Natural language commands and AI assistance")
          .setValue("ai")
          .setEmoji("🤖"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Privacy & Security")
          .setDescription("Data privacy and system security")
          .setValue("privacy")
          .setEmoji("🔒"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Customization")
          .setDescription("Theming and personalization")
          .setValue("customization")
          .setEmoji("🎨"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Development")
          .setDescription("Contributing to Cortex development")
          .setValue("development")
          .setEmoji("💻"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Gaming")
          .setDescription("Gaming on Linux")
          .setValue("gaming")
          .setEmoji("🎮")
      )
  );
}

/**
 * Start welcome flow for a new member
 */
export async function startWelcomeFlow(member: GuildMember): Promise<void> {
  try {
    // Initialize state
    welcomeFlowState.set(member.id, {
      step: 1,
      data: {},
      startedAt: Date.now(),
    });

    // Send welcome DM
    const embed = createWelcomeEmbed(member);
    const buttons = createReasonButtons(member.id);

    await member.send({
      embeds: [embed],
      components: [buttons],
    });

    console.log(`[Welcome] Started flow for ${member.user.tag}`);
  } catch (error: any) {
    console.log(`[Welcome] Couldn't DM ${member.user.tag} - DMs may be disabled`);
  }
}

/**
 * Handle welcome flow button interaction
 */
export async function handleWelcomeButton(
  interaction: ButtonInteraction
): Promise<void> {
  const [, action, value, targetUserId] = interaction.customId.split(":");

  // Verify it's the right user
  if (interaction.user.id !== targetUserId) {
    await interaction.reply({
      content: "This button isn't for you!",
      ephemeral: true,
    });
    return;
  }

  const state = welcomeFlowState.get(targetUserId);
  if (!state) {
    await interaction.reply({
      content: "This welcome flow has expired. Feel free to ask me questions anytime!",
      ephemeral: true,
    });
    return;
  }

  if (action === "reason") {
    state.data.reason = value;
    state.step = 2;

    // Show experience selection
    const experienceEmbed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("Great! What's your Linux experience level?")
      .setDescription("This helps me tailor my responses to your skill level.");

    const experienceSelect = createExperienceSelect(targetUserId);

    await interaction.update({
      embeds: [experienceEmbed],
      components: [experienceSelect],
    });
  }
}

/**
 * Handle welcome flow select menu interaction
 */
export async function handleWelcomeSelect(
  interaction: StringSelectMenuInteraction
): Promise<void> {
  const [, action, targetUserId] = interaction.customId.split(":");

  if (interaction.user.id !== targetUserId) {
    await interaction.reply({
      content: "This menu isn't for you!",
      ephemeral: true,
    });
    return;
  }

  const state = welcomeFlowState.get(targetUserId);
  if (!state) {
    await interaction.reply({
      content: "This welcome flow has expired.",
      ephemeral: true,
    });
    return;
  }

  if (action === "experience") {
    state.data.experience = interaction.values[0];
    state.step = 3;

    // Show interests selection
    const interestsEmbed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("Almost done! What interests you most?")
      .setDescription("Select one or more topics you're interested in.");

    const interestsSelect = createInterestsSelect(targetUserId);

    await interaction.update({
      embeds: [interestsEmbed],
      components: [interestsSelect],
    });
  } else if (action === "interests") {
    state.data.interests = interaction.values;
    state.step = 4;

    // Complete the flow
    await completeWelcomeFlow(interaction, state.data);
    welcomeFlowState.delete(targetUserId);
  }
}

/**
 * Complete welcome flow and show personalized response
 */
async function completeWelcomeFlow(
  interaction: StringSelectMenuInteraction,
  data: Record<string, any>
): Promise<void> {
  const { reason, experience, interests } = data;

  // Build personalized message
  let message = "**You're all set!** 🎉\n\n";

  // Personalize based on reason
  switch (reason) {
    case "curious":
      message += "Feel free to explore and ask me anything about Cortex Linux!\n\n";
      break;
    case "install":
      message += "Ready to install? Check out `/cortex how do I install?` or visit **cortexlinux.com/download**\n\n";
      break;
    case "hackathon":
      message += "Awesome! Check out **cortexlinux.com/hackathon** for all the details. We have $17,000 in prizes! 🏆\n\n";
      break;
    case "contribute":
      message += "We love contributors! Check out our GitHub at **github.com/cortexlinux/cortex** and join the #dev channel.\n\n";
      break;
  }

  // Add experience-specific tips
  if (experience === "beginner") {
    message += "💡 **Tip:** As a beginner, you'll love Cortex's natural language commands. Just tell it what you want to do in plain English!\n\n";
  } else if (experience === "expert") {
    message += "💡 **Tip:** As an expert, you might enjoy diving into our Arch base. All your terminal skills still apply, plus AI superpowers!\n\n";
  }

  // Add interest-specific channels
  const channelSuggestions: string[] = [];
  if (interests.includes("development")) channelSuggestions.push("#dev");
  if (interests.includes("ai")) channelSuggestions.push("#ai-discussion");
  if (interests.includes("gaming")) channelSuggestions.push("#gaming");

  if (channelSuggestions.length > 0) {
    message += `📢 **Channels for you:** ${channelSuggestions.join(", ")}\n\n`;
  }

  message += "Feel free to ask me anything anytime! Just mention me or DM me directly.";

  const completeEmbed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("Welcome Setup Complete!")
    .setDescription(message);

  await interaction.update({
    embeds: [completeEmbed],
    components: [],
  });

  console.log(`[Welcome] Completed flow - Reason: ${reason}, Experience: ${experience}, Interests: ${interests.join(",")}`);
}

/**
 * Check if interaction is a welcome flow interaction
 */
export function isWelcomeInteraction(customId: string): boolean {
  return customId.startsWith("welcome:");
}

export default {
  createWelcomeEmbed,
  startWelcomeFlow,
  handleWelcomeButton,
  handleWelcomeSelect,
  isWelcomeInteraction,
};
