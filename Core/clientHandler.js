const Discord = require('discord.js');
const client = new Discord.Client({ intents: [3276799] });


client.commands = new Discord.Collection();
client.channelDuration = new Map()
client.login(require('../Core/Settings/Settings').token);

module.exports = client;