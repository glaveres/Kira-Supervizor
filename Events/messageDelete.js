const client = require('../Core/clientHandler.js');
const config = require('../Core/Settings/Settings');
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin } = require('discord.js');

/* Core Config */
const Config = require('../Core/Settings/Settings');
const Roles = require('../Core/Settings/Roles');
const Channels = require('../Core/Settings/Channels');

/* Core Database */
const snipeSchema = require('../Core/Database/snipeSchema')

/**@param {Discord.Client} client
 * @param {Discord.messageDelete} messageDelete
 */

module.exports = async (message, client) => {
    if(message.author.bot === true) return;
    await snipeSchema.findOneAndUpdate({ guildID: message.guild.id, channelID: message.channel.id }, { $set: { userID: message.author.id, lastSnipeContent: message.content, lastSnipeDate: Date.now() } }, { upsert: true })
    await snipeSchema.findOneAndUpdate({ guildID: message.guild.id, channelID: message.channel.id }, { $push: { listSnipe: { userID: message.author.id, lastSnipeContent: message.content, lastSnipeDate: Date.now()} } }, { upsert: true })
}