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
    name: "sil",
    description: "",
    aliases: ["temizle"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {

        if(!message.member.permissions.has(8n) && ![...Roles.registerRoles,...Roles.commanderRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member) {
            if (!args[0] || (args[0] && isNaN(args[0])) || Number(args[0]) < 1 || Number(args[0]) > 100) return message.react('❌')
    
            message.channel.bulkDelete(Number(args[0])).then(msg => message.channel.send({ embeds: [client.embed.setDescription(`${message.channel} Kanalından **${msg.size}** adet mesaj temizlendi!`)]})).catch(() => { }).then(e => setTimeout(() => e.delete().catch(() => { }), 5000))
        } else {
    
            if (!args[1] || (args[1] && isNaN(args[1])) || Number(args[1]) < 1 || Number(args[1]) > 100) return message.react('❌')
    
            let messages = message.channel.messages.fetch({ limit: args[1] })
    
            let memberMessage = (await messages).filter((s) => s.author.id === member.id)
    
            await message.channel.bulkDelete(memberMessage).then(msg => message.channel.send({ embeds: [client.embed.setDescription(`${member} Kullanıcısına ait **${msg.size}** adet mesaj temizlendi!`)]})).catch(() => { }).then(e => setTimeout(() => e.delete().catch(() => { }), 5000))
    
        }

    }
}