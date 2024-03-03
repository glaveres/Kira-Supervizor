/* Core Modules */
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin, ActionRow } = require('discord.js');

/* Core Config */
const Config = require('../../Core/Settings/Settings');
const Roles = require('../../Core/Settings/Roles');
const Channels = require('../../Core/Settings/Channels');

/* Core Database */
const punishmentSchema = require('../../Core/Database/punishmentSchema')
const infractionSchema = require('../../Core/Database/infractionSchema')

module.exports = {
    name: "unban",
    description: "",
    aliases: ["yasakkaldır", "unbanned"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {

        if(!message.member.permissions.has(8n) && ![...Roles.banRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        if(isNaN(args[0])) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir sayısal değer olarak yazın.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        let member = await client.users.fetch(args[0]);
        if (!member) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir ${member == undefined ? "**ID**" : ""} belirtin.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        if(await client.kontrolEt({ message: message, member: member }) === true) return;
        
        let count = await punishmentSchema.countDocuments().exec();
        count = count == 0 ? 1 : count + 1;
        let ban = await client.fetchBan(message.guild, args[0]);
        if(!ban) return message.channel.send({ embeds: [embed.setDescription(`Bu üye sunucudan yasaklanmamış.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        await punishmentSchema.findOneAndUpdate({ guildID: message.guild.id, userID: member.id, punishmentType: "BAN" }, { punishmentContinue: false }, { upsert: true });
        message.channel.send({ embeds: [embed.setDescription(`**${member.tag}** üyesinin **Ban** cezası kaldırıldı.`)] }).then(x => setTimeout(() => x.delete(), 5000));
        message.guild.members.unban(member.id, `Ban cezası kaldırıldı. Yetkili: ${message.author.tag} (${message.author.id})`);
    }
}