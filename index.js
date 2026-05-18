const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CONFIG_FILE = 'config.json';

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

let config = loadConfig();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('.bypass')) return;

  const args = message.content.slice('.bypass'.length).trim().split(/ +/);
  const sub = args[0];
  const guildId = message.guild.id;

  // .bypass setup
  if (sub === 'setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ You need to be a moderator to use this.');
    }
    config[guildId] = message.channel.id;
    saveConfig(config);
    return message.reply(`✅ Bypass channel set to ${message.channel}`);
  }

  // .bypass <url>
  if (sub) {
    const allowedChannel = config[guildId];
    if (!allowedChannel) {
      return message.reply('❌ No bypass channel set. A mod must run `.bypass setup` first.');
    }
    if (message.channel.id !== allowedChannel) {
      const channel = client.channels.cache.get(allowedChannel);
      return message.reply(`❌ You can only use \`.bypass\` in ${channel}`);
    }
    return message.reply(`🔗 Bypass URL: ${sub}`);
  }

  message.reply('Usage: `.bypass setup` (mods only) or `.bypass <url>`');
});

client.login(process.env.DISCORD_TOKEN);
