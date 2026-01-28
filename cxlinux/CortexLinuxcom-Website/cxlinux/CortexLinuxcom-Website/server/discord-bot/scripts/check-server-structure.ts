/**
 * Script to check current Discord server structure
 * Run with: npx tsx server/discord-bot/scripts/check-server-structure.ts
 */

import { Client, GatewayIntentBits, ChannelType } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN not found in environment");
  process.exit(1);
}

async function checkServerStructure() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    // Get the first guild the bot is in
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.error("Bot is not in any guilds!");
      client.destroy();
      process.exit(1);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`SERVER: ${guild.name}`);
    console.log(`ID: ${guild.id}`);
    console.log(`Members: ${guild.memberCount}`);
    console.log(`${"=".repeat(60)}\n`);

    // Fetch all roles
    await guild.roles.fetch();
    console.log("ROLES:");
    console.log("-".repeat(40));
    const sortedRoles = guild.roles.cache.sort((a, b) => b.position - a.position);
    sortedRoles.forEach((role) => {
      if (role.name !== "@everyone") {
        const permissions: string[] = [];
        if (role.permissions.has("Administrator")) permissions.push("Admin");
        if (role.permissions.has("ManageMessages")) permissions.push("ManageMsg");
        if (role.permissions.has("ManageChannels")) permissions.push("ManageCh");
        if (role.permissions.has("ManageRoles")) permissions.push("ManageRoles");

        const permStr = permissions.length > 0 ? ` [${permissions.join(", ")}]` : "";
        const color = role.hexColor !== "#000000" ? ` (${role.hexColor})` : "";
        console.log(`  ${role.position.toString().padStart(2)}. ${role.name}${color}${permStr}`);
        console.log(`      ID: ${role.id}`);
      }
    });

    // Fetch all channels
    await guild.channels.fetch();
    console.log("\n\nCHANNELS & CATEGORIES:");
    console.log("-".repeat(40));

    // Group channels by category
    const categories = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);

    const uncategorized = guild.channels.cache
      .filter((c) => c.type !== ChannelType.GuildCategory && !c.parentId)
      .sort((a, b) => a.position - b.position);

    // Print uncategorized channels first
    if (uncategorized.size > 0) {
      console.log("\n[No Category]");
      uncategorized.forEach((channel) => {
        const typeIcon = channel.type === ChannelType.GuildText ? "#" :
                         channel.type === ChannelType.GuildVoice ? "🔊" : "?";
        console.log(`  ${typeIcon} ${channel.name}`);
        console.log(`    ID: ${channel.id}`);
      });
    }

    // Print categories with their channels
    categories.forEach((category) => {
      console.log(`\n📁 ${category.name}`);
      console.log(`   ID: ${category.id}`);

      const children = guild.channels.cache
        .filter((c) => c.parentId === category.id)
        .sort((a, b) => a.position - b.position);

      children.forEach((channel) => {
        const typeIcon = channel.type === ChannelType.GuildText ? "#" :
                         channel.type === ChannelType.GuildVoice ? "🔊" :
                         channel.type === ChannelType.GuildForum ? "📋" : "?";
        console.log(`  ${typeIcon} ${channel.name}`);
        console.log(`    ID: ${channel.id}`);
      });
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log("SUMMARY:");
    console.log(`  Roles: ${guild.roles.cache.size - 1}`); // -1 for @everyone
    console.log(`  Categories: ${categories.size}`);
    console.log(`  Channels: ${guild.channels.cache.size - categories.size}`);
    console.log(`${"=".repeat(60)}\n`);

    client.destroy();
    process.exit(0);
  });

  client.login(TOKEN);
}

checkServerStructure().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
