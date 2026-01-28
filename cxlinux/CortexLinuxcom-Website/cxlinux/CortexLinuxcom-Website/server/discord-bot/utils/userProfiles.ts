/**
 * User Profiles
 *
 * Tracks user preferences, expertise level, and interaction history
 * for personalized responses.
 */

import { db } from "../../db.js";
import { botAnalytics } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

interface UserProfile {
  discordUserId: string;
  expertiseLevel: "beginner" | "intermediate" | "advanced";
  topicsAsked: string[];
  questionCount: number;
  lastSeen: Date;
  preferences: {
    verboseResponses: boolean;
    technicalDetail: boolean;
  };
}

// In-memory cache of user profiles
const profileCache = new Map<string, UserProfile>();

// Topic detection patterns
const TOPIC_PATTERNS: Record<string, RegExp> = {
  installation: /\b(install|setup|download|boot|partition|dual.?boot)\b/i,
  commands: /\b(command|terminal|cli|natural language|ai command)\b/i,
  hackathon: /\b(hackathon|competition|prize|ideathon|submit)\b/i,
  referral: /\b(referral|invite|reward|tier|waitlist)\b/i,
  troubleshooting: /\b(error|problem|issue|fix|broken|not working|help)\b/i,
  technical: /\b(kernel|driver|systemd|pacman|aur|arch|config)\b/i,
  community: /\b(discord|github|contribute|community)\b/i,
  pricing: /\b(price|cost|free|pro|premium|subscription)\b/i,
};

// Expertise indicators
const ADVANCED_INDICATORS = [
  /\b(kernel|systemd|grub|bootloader|partition|lvm|btrfs)\b/i,
  /\b(compile|makefile|cmake|build from source)\b/i,
  /\b(docker|kubernetes|container|virtualization)\b/i,
  /\b(networking|firewall|iptables|selinux)\b/i,
  /\b(driver|module|dkms)\b/i,
];

const BEGINNER_INDICATORS = [
  /\b(how do i|what is|can you explain|new to)\b/i,
  /\b(simple|basic|easy|beginner|first time)\b/i,
  /\b(help me|guide|tutorial|step by step)\b/i,
];

/**
 * Detect topics from a question
 */
function detectTopics(question: string): string[] {
  const topics: string[] = [];

  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    if (pattern.test(question)) {
      topics.push(topic);
    }
  }

  return topics;
}

/**
 * Estimate expertise level from question
 */
function estimateExpertise(question: string): "beginner" | "intermediate" | "advanced" {
  // Check for advanced indicators
  for (const pattern of ADVANCED_INDICATORS) {
    if (pattern.test(question)) {
      return "advanced";
    }
  }

  // Check for beginner indicators
  for (const pattern of BEGINNER_INDICATORS) {
    if (pattern.test(question)) {
      return "beginner";
    }
  }

  return "intermediate";
}

/**
 * Get or create user profile
 */
export async function getUserProfile(discordUserId: string): Promise<UserProfile> {
  // Check cache first
  const cached = profileCache.get(discordUserId);
  if (cached && Date.now() - cached.lastSeen.getTime() < 3600000) {
    return cached;
  }

  // Create default profile
  const profile: UserProfile = {
    discordUserId,
    expertiseLevel: "intermediate",
    topicsAsked: [],
    questionCount: 0,
    lastSeen: new Date(),
    preferences: {
      verboseResponses: false,
      technicalDetail: true,
    },
  };

  // Try to load history from analytics
  try {
    const history = await db
      .select()
      .from(botAnalytics)
      .where(eq(botAnalytics.discordUserId, discordUserId))
      .orderBy(desc(botAnalytics.createdAt))
      .limit(20);

    if (history.length > 0) {
      profile.questionCount = history.length;

      // Aggregate topics
      const topicCounts = new Map<string, number>();
      for (const entry of history) {
        if (entry.questionCategory) {
          topicCounts.set(
            entry.questionCategory,
            (topicCounts.get(entry.questionCategory) || 0) + 1
          );
        }
      }

      // Sort by frequency
      profile.topicsAsked = Array.from(topicCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic)
        .slice(0, 5);
    }
  } catch (error) {
    console.error("[UserProfiles] Error loading history:", error);
  }

  profileCache.set(discordUserId, profile);
  return profile;
}

/**
 * Update user profile with new question
 */
export function updateProfile(discordUserId: string, question: string): UserProfile {
  const profile = profileCache.get(discordUserId) || {
    discordUserId,
    expertiseLevel: "intermediate" as const,
    topicsAsked: [],
    questionCount: 0,
    lastSeen: new Date(),
    preferences: {
      verboseResponses: false,
      technicalDetail: true,
    },
  };

  // Update topics
  const newTopics = detectTopics(question);
  for (const topic of newTopics) {
    if (!profile.topicsAsked.includes(topic)) {
      profile.topicsAsked.push(topic);
    }
  }

  // Update expertise estimate (weighted towards recent questions)
  const newExpertise = estimateExpertise(question);
  if (profile.questionCount < 5) {
    // For new users, take the estimate directly
    profile.expertiseLevel = newExpertise;
  } else if (newExpertise === "advanced" && profile.expertiseLevel !== "advanced") {
    // Upgrade to advanced if they ask advanced questions
    profile.expertiseLevel = "advanced";
  }

  profile.questionCount++;
  profile.lastSeen = new Date();

  // Keep only top 10 topics
  profile.topicsAsked = profile.topicsAsked.slice(0, 10);

  profileCache.set(discordUserId, profile);
  return profile;
}

/**
 * Format profile context for prompt injection
 */
export function formatProfileContext(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.expertiseLevel === "beginner") {
    parts.push("User appears to be new to Linux - keep explanations simple");
  } else if (profile.expertiseLevel === "advanced") {
    parts.push("User is technically experienced - can use technical terms");
  }

  if (profile.topicsAsked.length > 0) {
    parts.push(`User has previously asked about: ${profile.topicsAsked.slice(0, 3).join(", ")}`);
  }

  if (parts.length === 0) return "";

  return `\n\n[Profile: ${parts.join(". ")}]`;
}

/**
 * Get personalization hints for response
 */
export function getPersonalizationHints(profile: UserProfile): {
  shouldSimplify: boolean;
  shouldBeDetailed: boolean;
  relatedTopics: string[];
} {
  return {
    shouldSimplify: profile.expertiseLevel === "beginner",
    shouldBeDetailed: profile.expertiseLevel === "advanced",
    relatedTopics: profile.topicsAsked,
  };
}

export default {
  getUserProfile,
  updateProfile,
  formatProfileContext,
  getPersonalizationHints,
  detectTopics,
};
