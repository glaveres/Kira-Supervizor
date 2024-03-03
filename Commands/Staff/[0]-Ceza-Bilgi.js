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
    name: "cbilgi",
    description: "",
    aliases: ["cezabilgi", "ceza","ceza-bilgi","cb"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {

        if(!message.member.permissions.has(8n) && ![...Roles.ownerRoles,...Roles.mainOwnerRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        if(!args[0]) return;
        let pdb = await punishmentSchema.findOne({ guildID: message.guild.id, cezaID: args[0] });
        if(!pdb) return message.channel.send({ embeds: [embed.setDescription(`Belirtilen ID\'ye sahip bir ceza bulunamadı.`)] }).then(x => setTimeout(() => x.delete(), 5000));
        message.channel.send({ embeds: [
            embed.setDescription(`**\` #${args[0]} \`** ceza numarasına ait ceza-i işlem verileri; 
Kullanıcı: \` ${message.guild.members.cache.get(pdb.userID) ? message.guild.members.cache.get(pdb.userID).user.tag : pdb.userID } \` (\` ${pdb.userID} \`)
Tür: \` ${pdb.punishmentType} \`
Sebep: \` ${pdb.punishmentReason} \`
Başlangıç Tarihi: <t:${Math.floor(pdb.punishmentAt / 1000)}>
Bitiş Tarihi: <t:${Math.floor(pdb.punishmentFinish / 1000)}>
Ceza Durumu: \` ${pdb.punishmentContinue == true ? "🟢 [AKTİF]" : pdb.punishmentContinue == "null" ? "🔴 [DE-AKTİF]" : "🔴 [DE-AKTİF]"} \`\n
Haksız bir ceza-i işlem oldugunu düşünüyorsanız Üst yetkililerimize yazmaktan çekinmemelisin.`)
        ] 
    });

    }
}