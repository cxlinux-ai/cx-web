/**
 * Slash Commands Definition and Handlers
 */

import { SlashCommandBuilder, ChannelType } from "discord.js";
import { generateResponse } from "../llm/claude.js";
import { searchIssues, getIssue, searchErrorIssues } from "../rag/githubSearch.js";
import {
  createResponseEmbed,
  createErrorEmbed,
  createHelpEmbed,
  createInstallEmbed,
  createNavigationButtons,
  createSearchResultsEmbed,
  createIssueEmbed,
  createDebugEmbed,
  createFeedbackButtons,
} from "../utils/embeds.js";
import { addMessage } from "../memory/conversationMemory.js";
import { splitMessage } from "../utils/splitMessage.js";
import { recordFeedback } from "../memory/feedbackStore.js";

// Store recent Q&A pairs for feedback (messageId -> {question, answer})
const recentResponses = new Map();
const MAX_STORED = 100;

function storeResponse(messageId, question, answer) {
  recentResponses.set(messageId, { question, answer, timestamp: Date.now() });
  // Cleanup old entries
  if (recentResponses.size > MAX_STORED) {
    const oldest = [...recentResponses.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    recentResponses.delete(oldest[0]);
  }
}

function getStoredResponse(messageId) {
  return recentResponses.get(messageId);
}

/**
 * Define all slash commands
 */
export const commands = [
  new SlashCommandBuilder()
    .setName("cortex")
    .setDescription("Cortex Linux AI Assistant")
    .addSubcommand(sub =>
      sub
        .setName("ask")
        .setDescription("Ask any question about Cortex Linux")
        .addStringOption(opt =>
          opt
            .setName("question")
            .setDescription("Your question")
            .setRequired(true)
        )
        .addBooleanOption(opt =>
          opt
            .setName("thread")
            .setDescription("Create a thread for this conversation")
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("install")
        .setDescription("Get step-by-step installation guide")
    )
    .addSubcommand(sub =>
      sub
        .setName("debug")
        .setDescription("Analyze an error message")
        .addStringOption(opt =>
          opt
            .setName("error")
            .setDescription("The error message to analyze")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("search")
        .setDescription("Search GitHub issues and PRs")
        .addStringOption(opt =>
          opt
            .setName("query")
            .setDescription("Search query")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("state")
            .setDescription("Filter by state")
            .setRequired(false)
            .addChoices(
              { name: "All", value: "all" },
              { name: "Open", value: "open" },
              { name: "Closed", value: "closed" }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("issue")
        .setDescription("Get details about a specific issue")
        .addIntegerOption(opt =>
          opt
            .setName("number")
            .setDescription("Issue number")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("help")
        .setDescription("Show help and available commands")
    ),
];

/**
 * Handle slash command interactions
 */
export async function handleSlashCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case "ask":
        await handleAskCommand(interaction);
        break;
      case "install":
        await handleInstallCommand(interaction);
        break;
      case "debug":
        await handleDebugCommand(interaction);
        break;
      case "search":
        await handleSearchCommand(interaction);
        break;
      case "issue":
        await handleIssueCommand(interaction);
        break;
      case "help":
        await handleHelpCommand(interaction);
        break;
      default:
        await interaction.reply({
          embeds: [createErrorEmbed("Unknown command")],
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error("[Slash Command Error]", error);

    const errorResponse = {
      embeds: [createErrorEmbed("An error occurred", error.message)],
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorResponse);
    } else {
      await interaction.reply(errorResponse);
    }
  }
}

/**
 * Handle /cortex ask
 */
async function handleAskCommand(interaction) {
  const question = interaction.options.getString("question");
  const createThread = interaction.options.getBoolean("thread");

  await interaction.deferReply();

  // Generate response
  const response = await generateResponse(question, interaction);

  // Store in memory
  addMessage(interaction, "user", question);
  addMessage(interaction, "assistant", response);

  // Create thread if requested
  if (createThread && interaction.channel.type === ChannelType.GuildText) {
    const thread = await interaction.channel.threads.create({
      name: question.slice(0, 50) + (question.length > 50 ? "..." : ""),
      autoArchiveDuration: 60,
      reason: "Cortex AI conversation",
    });

    // Send response in thread
    const chunks = splitMessage(response);
    for (const chunk of chunks) {
      await thread.send(chunk);
    }

    await interaction.editReply({
      content: `Created a thread for this conversation: ${thread}`,
    });
  } else {
    // Send response directly
    const chunks = splitMessage(response);

    const reply = await interaction.editReply({
      content: chunks[0],
      components: [createFeedbackButtons(interaction.id)],
    });

    // Store Q&A for feedback learning
    storeResponse(interaction.id, question, response);

    // Send remaining chunks
    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp(chunks[i]);
    }
  }
}

/**
 * Handle /cortex install
 */
async function handleInstallCommand(interaction) {
  const { embed, totalSteps } = createInstallEmbed(0);
  const buttons = createNavigationButtons(0, totalSteps, "install");

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
  });
}

/**
 * Handle /cortex debug
 */
async function handleDebugCommand(interaction) {
  const errorMessage = interaction.options.getString("error");

  await interaction.deferReply();

  // Search for related issues
  const relatedIssues = await searchErrorIssues(errorMessage, 3);

  // Generate analysis with Claude
  const analysisPrompt = `Analyze this error from Cortex Linux and provide:
1. A brief explanation of what the error means
2. The most likely cause
3. A step-by-step fix

Error:
\`\`\`
${errorMessage}
\`\`\`

Be concise and practical. Format as JSON: {"explanation": "...", "cause": "...", "fix": "..."}`;

  const analysisResponse = await generateResponse(analysisPrompt, interaction);

  // Try to parse JSON response
  let analysis;
  try {
    const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { explanation: analysisResponse, fix: "" };
  } catch {
    analysis = { explanation: analysisResponse, fix: "" };
  }

  const embed = createDebugEmbed(errorMessage, analysis);

  // Add related issues if found
  if (relatedIssues.items?.length > 0) {
    embed.addFields({
      name: "Related Issues",
      value: relatedIssues.items
        .slice(0, 3)
        .map(i => `[#${i.number}](${i.html_url}): ${i.title.slice(0, 40)}...`)
        .join("\n"),
    });
  }

  await interaction.editReply({ embeds: [embed] });
}

/**
 * Handle /cortex search
 */
async function handleSearchCommand(interaction) {
  const query = interaction.options.getString("query");
  const state = interaction.options.getString("state") || "all";

  await interaction.deferReply();

  const results = await searchIssues(query, { state, limit: 5 });

  const embed = createSearchResultsEmbed(results.items, query);

  await interaction.editReply({ embeds: [embed] });
}

/**
 * Handle /cortex issue
 */
async function handleIssueCommand(interaction) {
  const issueNumber = interaction.options.getInteger("number");

  await interaction.deferReply();

  const issue = await getIssue(issueNumber);

  if (!issue) {
    await interaction.editReply({
      embeds: [createErrorEmbed(`Issue #${issueNumber} not found`)],
    });
    return;
  }

  const embed = createIssueEmbed(issue);

  await interaction.editReply({ embeds: [embed] });
}

/**
 * Handle /cortex help
 */
async function handleHelpCommand(interaction) {
  const embed = createHelpEmbed();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Handle button interactions
 */
export async function handleButtonInteraction(interaction) {
  const [action, type, value] = interaction.customId.split(":");

  try {
    if (action === "install") {
      const step = parseInt(value, 10);
      const { embed, totalSteps } = createInstallEmbed(step);

      if (type === "done") {
        await interaction.update({
          embeds: [embed.setTitle("Installation Complete!").setColor(0x57f287)],
          components: [],
        });
      } else {
        const buttons = createNavigationButtons(step, totalSteps, "install");
        await interaction.update({
          embeds: [embed],
          components: [buttons],
        });
      }
    } else if (action === "feedback") {
      const stored = getStoredResponse(value);

      if (type === "helpful") {
        if (stored) {
          recordFeedback(stored.question, stored.answer, true, interaction.user.id);
        }
        await interaction.reply({
          content: "Thanks for the feedback.",
          ephemeral: true,
        });
      } else if (type === "unhelpful") {
        if (stored) {
          recordFeedback(stored.question, stored.answer, false, interaction.user.id);
        }
        await interaction.reply({
          content: "Got it, I'll try to do better. Feel free to rephrase or ask a follow-up.",
          ephemeral: true,
        });
      } else if (type === "followup") {
        await interaction.reply({
          content: "Reply to my message or mention me to ask a follow-up question!",
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error("[Button Error]", error);
  }
}
