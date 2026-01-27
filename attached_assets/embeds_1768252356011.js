/**
 * Rich Embed Templates for Discord
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

// Brand colors
const COLORS = {
  primary: 0x5865f2, // Discord blurple
  success: 0x57f287, // Green
  warning: 0xfee75c, // Yellow
  error: 0xed4245, // Red
  info: 0x3498db, // Blue
  cortex: 0x9b59b6, // Purple (Cortex brand)
};

/**
 * Create a standard response embed
 */
export function createResponseEmbed(content, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || COLORS.cortex)
    .setDescription(content);

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.footer) {
    embed.setFooter({ text: options.footer });
  }

  if (options.fields) {
    embed.addFields(options.fields);
  }

  embed.setTimestamp();

  return embed;
}

/**
 * Create an error embed
 */
export function createErrorEmbed(message, details = null) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle("Error")
    .setDescription(message);

  if (details) {
    embed.addFields({ name: "Details", value: `\`\`\`${details}\`\`\`` });
  }

  embed.setTimestamp();

  return embed;
}

/**
 * Create a help/info embed
 */
export function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.cortex)
    .setTitle("CortexLinuxAI")
    .setDescription("Support bot for Cortex Linux. Ask me anything about installation, usage, or troubleshooting.")
    .addFields(
      {
        name: "How to use",
        value: "Mention me or reply to my messages. I'll remember the conversation in threads.",
      },
      {
        name: "Commands",
        value: "`/cortex ask` - Ask a question\n`/cortex install` - Installation guide\n`/cortex debug` - Analyze an error\n`/cortex search` - Search GitHub issues",
      },
      {
        name: "Links",
        value: "[GitHub](https://github.com/cxlinux-ai/cortex) | [Website](https://cxlinux-ai.com) | [Docs](https://github.com/cxlinux-ai/cortex/tree/main/docs)",
      }
    )
    .setTimestamp();
}

/**
 * Create an installation guide embed
 */
export function createInstallEmbed(step = 0) {
  const steps = [
    {
      title: "Step 1: System Requirements",
      description: "Make sure you have:\n• Ubuntu 22.04+ or Debian 12+\n• Python 3.10+\n• 4GB RAM minimum",
      color: COLORS.info,
    },
    {
      title: "Step 2: Install Cortex",
      description: "```bash\npip install cortex-linux\n```\nOr clone from source:\n```bash\ngit clone https://github.com/cxlinux-ai/cortex\ncd cortex && pip install -e .\n```",
      color: COLORS.info,
    },
    {
      title: "Step 3: Configure LLM",
      description: "**Option A - Ollama (Free, Local):**\n```bash\npython scripts/setup_ollama.py\n```\n\n**Option B - Claude API:**\n```bash\necho 'ANTHROPIC_API_KEY=your-key' > .env\n```",
      color: COLORS.info,
    },
    {
      title: "Step 4: Verify Installation",
      description: "```bash\ncortex --version\ncortex \"something to edit text files\"\n```\nThe first command shows version, the second tests the AI!",
      color: COLORS.success,
    },
  ];

  const currentStep = steps[Math.min(step, steps.length - 1)];

  const embed = new EmbedBuilder()
    .setColor(currentStep.color)
    .setTitle(currentStep.title)
    .setDescription(currentStep.description)
    .setFooter({ text: `Step ${step + 1} of ${steps.length}` });

  return { embed, totalSteps: steps.length };
}

/**
 * Create navigation buttons for multi-step guides
 */
export function createNavigationButtons(currentStep, totalSteps, customId) {
  const row = new ActionRowBuilder();

  if (currentStep > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}:prev:${currentStep - 1}`)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (currentStep < totalSteps - 1) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}:next:${currentStep + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
    );
  } else {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}:done`)
        .setLabel("Done")
        .setStyle(ButtonStyle.Success)
    );
  }

  return row;
}

/**
 * Create feedback buttons
 */
export function createFeedbackButtons(messageId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`feedback:helpful:${messageId}`)
      .setLabel("Helpful")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`feedback:unhelpful:${messageId}`)
      .setLabel("Not helpful")
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * Create a GitHub issue embed
 */
export function createIssueEmbed(issue) {
  const stateColor = issue.state === "open" ? COLORS.success : COLORS.error;

  const embed = new EmbedBuilder()
    .setColor(stateColor)
    .setTitle(`#${issue.number}: ${issue.title}`)
    .setURL(issue.html_url)
    .setDescription(issue.body?.slice(0, 300) + (issue.body?.length > 300 ? "..." : "") || "No description")
    .addFields(
      { name: "State", value: issue.state, inline: true },
      { name: "Comments", value: String(issue.comments), inline: true },
      { name: "Labels", value: issue.labels?.map(l => l.name).join(", ") || "None", inline: true }
    )
    .setFooter({ text: `Created by ${issue.user?.login || "unknown"}` })
    .setTimestamp(new Date(issue.created_at));

  return embed;
}

/**
 * Create a search results embed
 */
export function createSearchResultsEmbed(results, query) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`Search Results: "${query}"`)
    .setDescription(results.length > 0
      ? `Found ${results.length} result(s)`
      : "No results found. Try different keywords.");

  if (results.length > 0) {
    const fields = results.slice(0, 5).map((issue, i) => ({
      name: `${i + 1}. #${issue.number}: ${issue.title.slice(0, 50)}`,
      value: `[View](${issue.html_url}) • ${issue.state} • ${issue.comments} comments`,
    }));
    embed.addFields(fields);
  }

  embed.setTimestamp();

  return embed;
}

/**
 * Create a debug/error analysis embed
 */
export function createDebugEmbed(error, analysis) {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle("Error Analysis")
    .addFields(
      { name: "Error", value: `\`\`\`${error.slice(0, 500)}\`\`\`` },
      { name: "Analysis", value: analysis.explanation || "Unable to analyze" },
      { name: "Suggested Fix", value: analysis.fix || "No specific fix available" }
    )
    .setFooter({ text: "Tip: Share more context for better analysis" })
    .setTimestamp();
}

export { COLORS };
