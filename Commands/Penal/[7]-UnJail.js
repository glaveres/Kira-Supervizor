/* Core Modules */
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin, ActionRow } = require('discord.js');

/* Core Config */
const Config = require('../../Core/Settings/Settings');
const Roles = require('../../Core/Settings/Roles');
const Channels = require('../../Core/Settings/Channels');

/* Core Database */
const punishmentSchema = require('../../Core/Database/punishmentSchema')
const infractionSchema = require('../../Core/Database/infractionSchema')
const roleSchema = require('../../Core/Database/roleSchema')

module.exports = {
    name: "unjail",
    description: "",
    aliases: ["cezalıkaldır", "unjailed"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {
        if(!message.member.permissions.has(8n) && ![...Roles.jailRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir ${member == undefined ? "**üye**" : ""} belirtin.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        if(await client.kontrolEt({ message: message, member: member }) === true) return;

        let data = await roleSchema.findOne({ guildID: message.guild.id, userID: member.id });
        if(!Roles.suspendedRoles.some(x => member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu kullanıcının aktif bir **Jail** cezası yok.`)]}).then(x => setTimeout(() => x.delete(), 5000));

        await punishmentSchema.findOneAndUpdate({ guildID: message.guild.id, userID: member.id, punishmentType: "JAIL" }, { punishmentContinue: false }, { upsert: true });
        member.roles.set(...[data.jailRoles], `Jail cezası kaldırıldı. Yetkili: ${message.author.tag} (${message.author.id})`).catch(err => { });
        message.channel.send({ embeds: [embed.setDescription(`${member} üyesinin **Jail** cezası kaldırıldı.`)] }).then(x => setTimeout(() => x.delete(), 5000));

    }
}