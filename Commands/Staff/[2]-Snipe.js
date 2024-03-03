/* Core Modules */
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin, ActionRow } = require('discord.js');

/* Core Config */
const Config = require('../../Core/Settings/Settings');
const Roles = require('../../Core/Settings/Roles');
const Channels = require('../../Core/Settings/Channels');

/* Core Database */
const punishmentSchema = require('../../Core/Database/punishmentSchema')
const infractionSchema = require('../../Core/Database/infractionSchema')
const snipeSchema = require('../../Core/Database/snipeSchema')

module.exports = {
    name: "snipe",
    description: "",
    aliases: ["temizle"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {

        if(!message.member.permissions.has(8n) && ![...Roles.registerRoles,...Roles.commanderRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        let content = await snipeSchema.findOne({ guildID: message.guild.id, channelID: message.channel.id })
        if(!content) return message.channel.send({ embeds: [embed.setDescription(`Bu kanalda silinen mesaj bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        message.channel.send({ embeds: [embed.setDescription(`<@${content.userID}> tarafından **${content.lastSnipeContent}** mesajı silindi.\n\nSilinen mesajın tarihi: <t:${Math.floor(content.lastSnipeDate / 1000)}> (<t:${Math.floor(content.lastSnipeDate / 1000)}:R>)`)]}).catch(async (x) => { setTimeout(() => {msg.delete8}, 10000 )});

    }
}