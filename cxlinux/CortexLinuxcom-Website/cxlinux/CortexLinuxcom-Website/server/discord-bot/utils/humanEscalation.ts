/**
 * Smart Human Escalation
 *
 * Detects when the bot can't help and escalates to moderators
 * or creates support tickets automatically.
 */

import { Message, TextChannel, EmbedBuilder, Role } from "discord.js";

// Escalation triggers
const ESCALATION_PATTERNS = {
  urgent: [
    /\b(urgent|emergency|critical|asap|immediately)\b/i,
    /\b(down|outage|crashed|broken|offline)\b/i,
    /\b(security|vulnerability|breach|hack)\b/i,
  ],
  frustrated: [
    /\b(still not working|doesn't help|useless|frustrated|annoyed)\b/i,
    /\b(already tried|nothing works|give up)\b/i,
    /\b(this is ridiculous|waste of time)\b/i,
  ],
  complex: [
    /\b(speak to|talk to|contact|reach)\s*(a\s*)?(human|person|staff|admin|mod)\b/i,
    /\b(real person|actual support|human support)\b/i,
    /\b(escalate|ticket|report)\b/i,
  ],
  payment: [
    /\b(payment|billing|charge|refund|subscription|invoice)\b/i,
    /\b(money|paid|purchase|buy)\b/i,
  ],
};

// Role IDs for escalation (from environment)
const MODERATOR_ROLE = process.env.DISCORD_ROLE_MODERATOR || "";
const ADMIN_ROLE = process.env.DISCORD_ROLE_ADMIN || "";
const SUPPORT_CHANNEL = process.env.DISCORD_SUPPORT_CHANNEL || "";

interface EscalationResult {
  shouldEscalate: boolean;
  reason: string;
  priority: "low" | "medium" | "high" | "urgent";
  suggestedAction: "tag_mod" | "create_ticket" | "dm_admin" | "none";
}

/**
 * Analyze if escalation is needed
 */
export function analyzeEscalation(
  question: string,
  conversationHistory: Array<{ role: string; content: string }>,
  botConfidence: number = 1.0
): EscalationResult {
  const lowerQuestion = question.toLowerCase();

  // Check for urgent issues
  for (const pattern of ESCALATION_PATTERNS.urgent) {
    if (pattern.test(question)) {
      return {
        shouldEscalate: true,
        reason: "Urgent issue detected",
        priority: "urgent",
        suggestedAction: "tag_mod",
      };
    }
  }

  // Check for explicit human request
  for (const pattern of ESCALATION_PATTERNS.complex) {
    if (pattern.test(question)) {
      return {
        shouldEscalate: true,
        reason: "User requested human support",
        priority: "medium",
        suggestedAction: "tag_mod",
      };
    }
  }

  // Check for payment/billing issues
  for (const pattern of ESCALATION_PATTERNS.payment) {
    if (pattern.test(question)) {
      return {
        shouldEscalate: true,
        reason: "Payment/billing issue",
        priority: "high",
        suggestedAction: "tag_mod",
      };
    }
  }

  // Check for frustrated user
  for (const pattern of ESCALATION_PATTERNS.frustrated) {
    if (pattern.test(question)) {
      return {
        shouldEscalate: true,
        reason: "User appears frustrated",
        priority: "medium",
        suggestedAction: "tag_mod",
      };
    }
  }

  // Check conversation length (long back-and-forth without resolution)
  if (conversationHistory.length >= 8) {
    return {
      shouldEscalate: true,
      reason: "Extended conversation without resolution",
      priority: "low",
      suggestedAction: "tag_mod",
    };
  }

  // Check if bot is uncertain
  if (botConfidence < 0.3) {
    return {
      shouldEscalate: true,
      reason: "Bot confidence is low",
      priority: "low",
      suggestedAction: "tag_mod",
    };
  }

  return {
    shouldEscalate: false,
    reason: "",
    priority: "low",
    suggestedAction: "none",
  };
}

/**
 * Create escalation embed
 */
export function createEscalationEmbed(
  message: Message,
  question: string,
  reason: string,
  priority: string
): EmbedBuilder {
  const priorityColors: Record<string, number> = {
    urgent: 0xff0000,
    high: 0xff6600,
    medium: 0xffcc00,
    low: 0x00cc00,
  };

  return new EmbedBuilder()
    .setColor(priorityColors[priority] || 0x0099ff)
    .setTitle(`🎫 Support Escalation - ${priority.toUpperCase()}`)
    .setDescription(`A user needs human assistance.`)
    .addFields(
      { name: "User", value: `<@${message.author.id}>`, inline: true },
      { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
      { name: "Reason", value: reason, inline: false },
      { name: "Question", value: question.slice(0, 500), inline: false }
    )
    .setTimestamp()
    .setFooter({ text: `User ID: ${message.author.id}` });
}

/**
 * Execute escalation
 */
export async function escalate(
  message: Message,
  question: string,
  result: EscalationResult
): Promise<string> {
  const { reason, priority, suggestedAction } = result;

  try {
    // Build mention string - prefer Admin role
    let mention = "";
    
    // Try to find Admin role by ID or by name
    if (ADMIN_ROLE) {
      mention = `<@&${ADMIN_ROLE}>`;
    } else if (message.guild) {
      // Look for Admin role by name
      const adminRole = message.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "admin"
      );
      if (adminRole) {
        mention = `<@&${adminRole.id}>`;
      }
    }
    
    // Fallback to moderator role
    if (!mention && MODERATOR_ROLE) {
      mention = `<@&${MODERATOR_ROLE}>`;
    }

    // Create escalation message for the user
    let userMessage = "";

    switch (priority) {
      case "urgent":
        userMessage = `I understand this is urgent. I'm alerting the team right now. ${mention ? `${mention} - urgent support needed!` : "A moderator will assist you shortly."}`;
        break;
      case "high":
        userMessage = `This looks like something that needs human attention. ${mention ? `${mention} can you help here?` : "Let me get a team member to help you."}`;
        break;
      case "medium":
        userMessage = `I think a team member can help you better with this. ${mention || "Someone from the team will be with you soon."}`;
        break;
      default:
        userMessage = `Let me bring in a team member to help. ${mention || "A moderator will assist you shortly."}`;
    }

    // Log escalation
    console.log(`[Escalation] ${priority} - ${reason} - User: ${message.author.tag}`);

    // If there's a support channel, also post there
    if (SUPPORT_CHANNEL && message.guild) {
      try {
        const supportChannel = await message.guild.channels.fetch(SUPPORT_CHANNEL);
        if (supportChannel && supportChannel.isTextBased()) {
          const embed = createEscalationEmbed(message, question, reason, priority);
          await (supportChannel as TextChannel).send({
            content: mention || undefined,
            embeds: [embed],
          });
        }
      } catch (e) {
        // Support channel not found, continue
      }
    }

    return userMessage;
  } catch (error: any) {
    console.error("[Escalation] Error:", error.message);
    return "Let me get a team member to help you with this.";
  }
}

/**
 * Format escalation notice for response
 */
export function formatEscalationNotice(priority: string): string {
  const notices: Record<string, string> = {
    urgent: "\n\nI've flagged this as urgent and alerted the team.",
    high: "\n\nI've notified the team to assist you.",
    medium: "\n\nA team member has been notified.",
    low: "\n\nFeel free to wait for a team member or ask me more questions.",
  };
  return notices[priority] || "";
}

export default {
  analyzeEscalation,
  createEscalationEmbed,
  escalate,
  formatEscalationNotice,
};
