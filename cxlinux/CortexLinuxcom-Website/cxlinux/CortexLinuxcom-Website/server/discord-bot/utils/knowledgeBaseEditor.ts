/**
 * Knowledge Base Editor
 *
 * Add/edit KB entries directly from Discord with /kb commands.
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
} from "discord.js";

// In-memory knowledge base additions (would persist to DB in production)
interface KBEntry {
  id: string;
  keywords: string[];
  content: string;
  category: string;
  addedBy: string;
  addedAt: Date;
  approved: boolean;
}

const customEntries: Map<string, KBEntry> = new Map();
const pendingEntries: Map<string, KBEntry> = new Map();

// Admin role for approval
const ADMIN_ROLE = process.env.DISCORD_ROLE_ADMIN || "";

/**
 * Generate unique entry ID
 */
function generateId(): string {
  return `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create KB add modal
 */
export function createAddModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("kb_add_modal")
    .setTitle("Add Knowledge Base Entry")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_keywords")
          .setLabel("Keywords (comma-separated)")
          .setPlaceholder("install, setup, download")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(200)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_category")
          .setLabel("Category")
          .setPlaceholder("installation, features, hackathon, etc.")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(50)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_content")
          .setLabel("Content (the answer)")
          .setPlaceholder("Write the response content here...")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000)
      )
    );
}

/**
 * Create KB edit modal
 */
export function createEditModal(entry: KBEntry): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(`kb_edit_modal:${entry.id}`)
    .setTitle("Edit Knowledge Base Entry")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_keywords")
          .setLabel("Keywords (comma-separated)")
          .setValue(entry.keywords.join(", "))
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(200)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_category")
          .setLabel("Category")
          .setValue(entry.category)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(50)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("kb_content")
          .setLabel("Content (the answer)")
          .setValue(entry.content)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000)
      )
    );
}

/**
 * Handle KB add modal submission
 */
export async function handleAddSubmission(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const keywords = interaction.fields
    .getTextInputValue("kb_keywords")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  const category = interaction.fields.getTextInputValue("kb_category").toLowerCase();
  const content = interaction.fields.getTextInputValue("kb_content");

  const entry: KBEntry = {
    id: generateId(),
    keywords,
    content,
    category,
    addedBy: interaction.user.id,
    addedAt: new Date(),
    approved: false,
  };

  // Check if user is admin (auto-approve)
  const isAdmin = interaction.memberPermissions?.has("Administrator") || false;

  if (isAdmin) {
    entry.approved = true;
    customEntries.set(entry.id, entry);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle("✅ Entry Added")
          .setDescription("Your knowledge base entry has been added.")
          .addFields(
            { name: "Keywords", value: keywords.join(", "), inline: true },
            { name: "Category", value: category, inline: true },
            { name: "Content Preview", value: content.slice(0, 200) + "...", inline: false }
          ),
      ],
      ephemeral: true,
    });
  } else {
    pendingEntries.set(entry.id, entry);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle("📝 Entry Submitted for Review")
          .setDescription("An admin will review your submission.")
          .addFields(
            { name: "Keywords", value: keywords.join(", "), inline: true },
            { name: "Category", value: category, inline: true }
          ),
      ],
      ephemeral: true,
    });
  }

  console.log(`[KB Editor] Entry ${isAdmin ? "added" : "submitted"} by ${interaction.user.tag}`);
}

/**
 * Handle KB edit modal submission
 */
export async function handleEditSubmission(
  interaction: ModalSubmitInteraction,
  entryId: string
): Promise<void> {
  const entry = customEntries.get(entryId);
  if (!entry) {
    await interaction.reply({
      content: "Entry not found.",
      ephemeral: true,
    });
    return;
  }

  entry.keywords = interaction.fields
    .getTextInputValue("kb_keywords")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  entry.category = interaction.fields.getTextInputValue("kb_category").toLowerCase();
  entry.content = interaction.fields.getTextInputValue("kb_content");

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle("✅ Entry Updated")
        .setDescription("The knowledge base entry has been updated."),
    ],
    ephemeral: true,
  });

  console.log(`[KB Editor] Entry ${entryId} updated by ${interaction.user.tag}`);
}

/**
 * Create pending entries list embed
 */
export function createPendingListEmbed(): EmbedBuilder {
  const entries = Array.from(pendingEntries.values());

  if (entries.length === 0) {
    return new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("📋 Pending KB Entries")
      .setDescription("No pending entries to review.");
  }

  const list = entries
    .slice(0, 10)
    .map((e, i) => `${i + 1}. **${e.keywords.slice(0, 3).join(", ")}** (${e.category}) by <@${e.addedBy}>`)
    .join("\n");

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle("📋 Pending KB Entries")
    .setDescription(list)
    .setFooter({ text: `${entries.length} pending entries` });
}

/**
 * Create approval buttons for an entry
 */
export function createApprovalButtons(entryId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`kb_approve:${entryId}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅"),
    new ButtonBuilder()
      .setCustomId(`kb_reject:${entryId}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("❌"),
    new ButtonBuilder()
      .setCustomId(`kb_preview:${entryId}`)
      .setLabel("Preview")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👁️")
  );
}

/**
 * Handle approval button click
 */
export async function handleApproval(
  interaction: ButtonInteraction,
  entryId: string,
  approved: boolean
): Promise<void> {
  const entry = pendingEntries.get(entryId);
  if (!entry) {
    await interaction.reply({
      content: "Entry not found or already processed.",
      ephemeral: true,
    });
    return;
  }

  if (approved) {
    entry.approved = true;
    customEntries.set(entry.id, entry);
    pendingEntries.delete(entryId);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle("✅ Entry Approved")
          .setDescription(`Entry for "${entry.keywords.join(", ")}" has been approved and added to the knowledge base.`),
      ],
    });

    // Notify the submitter
    try {
      const user = await interaction.client.users.fetch(entry.addedBy);
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x22c55e)
            .setTitle("✅ Your KB Entry Was Approved!")
            .setDescription(`Your knowledge base entry for "${entry.keywords.join(", ")}" has been approved.`),
        ],
      });
    } catch {
      // Can't DM user
    }
  } else {
    pendingEntries.delete(entryId);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xef4444)
          .setTitle("❌ Entry Rejected")
          .setDescription(`Entry for "${entry.keywords.join(", ")}" has been rejected.`),
      ],
    });
  }

  console.log(`[KB Editor] Entry ${entryId} ${approved ? "approved" : "rejected"} by ${interaction.user.tag}`);
}

/**
 * Search custom entries
 */
export function searchCustomEntries(query: string): KBEntry[] {
  const lowerQuery = query.toLowerCase();
  const results: KBEntry[] = [];

  for (const entry of Array.from(customEntries.values())) {
    if (!entry.approved) continue;

    const keywordMatch = entry.keywords.some((k: string) => lowerQuery.includes(k) || k.includes(lowerQuery));
    const contentMatch = entry.content.toLowerCase().includes(lowerQuery);
    const categoryMatch = entry.category.includes(lowerQuery);

    if (keywordMatch || contentMatch || categoryMatch) {
      results.push(entry);
    }
  }

  return results;
}

/**
 * Get all custom entries
 */
export function getAllCustomEntries(): KBEntry[] {
  return Array.from(customEntries.values()).filter((e) => e.approved);
}

/**
 * Delete an entry
 */
export function deleteEntry(entryId: string): boolean {
  return customEntries.delete(entryId) || pendingEntries.delete(entryId);
}

/**
 * Create entry detail embed
 */
export function createEntryDetailEmbed(entry: KBEntry): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(entry.approved ? 0x22c55e : 0xffd700)
    .setTitle(`KB Entry: ${entry.keywords[0]}`)
    .addFields(
      { name: "Keywords", value: entry.keywords.join(", "), inline: true },
      { name: "Category", value: entry.category, inline: true },
      { name: "Status", value: entry.approved ? "✅ Approved" : "⏳ Pending", inline: true },
      { name: "Added By", value: `<@${entry.addedBy}>`, inline: true },
      { name: "Added", value: entry.addedAt.toLocaleDateString(), inline: true },
      { name: "Content", value: entry.content.slice(0, 1000), inline: false }
    )
    .setFooter({ text: `ID: ${entry.id}` });
}

/**
 * Check if interaction is KB related
 */
export function isKBInteraction(customId: string): boolean {
  return customId.startsWith("kb_");
}

/**
 * Get stats about KB
 */
export function getKBStats(): {
  totalEntries: number;
  pendingEntries: number;
  categories: Record<string, number>;
} {
  const categories: Record<string, number> = {};

  for (const entry of Array.from(customEntries.values())) {
    if (entry.approved) {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    }
  }

  return {
    totalEntries: Array.from(customEntries.values()).filter((e) => e.approved).length,
    pendingEntries: pendingEntries.size,
    categories,
  };
}

export default {
  createAddModal,
  createEditModal,
  handleAddSubmission,
  handleEditSubmission,
  createPendingListEmbed,
  createApprovalButtons,
  handleApproval,
  searchCustomEntries,
  getAllCustomEntries,
  deleteEntry,
  createEntryDetailEmbed,
  isKBInteraction,
  getKBStats,
};
