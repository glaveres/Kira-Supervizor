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
    name: "sicil",
    description: "",
    aliases: [],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {
        if(!message.member.permissions.has(8n) && ![...Roles.ownerRoles,...Roles.mainOwnerRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir ${member == undefined ? "**üye**" : ""} belirtin.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        
        const idb = await infractionSchema.findOne({ guildID: message.guild.id, userID: member.id });

        let row = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
            .setCustomId("punishmentHistory")
            .setStyle(ButtonStyle.Success)
            .setLabel("Ceza Geçmişi"),

            new ButtonBuilder()
            .setCustomId("cancel")
            .setStyle(ButtonStyle.Danger)
            .setLabel("İptal")

        )

        message.channel.send({
            components: [row],
            embeds: [
            client.embed
            .setDescription(`${message.author} Sicil Paneline Hoşgeldiniz.
                
            \`\`\`diff\n- Ceza Geçmişi (Son 15 adet listelenir)\`\`\`
            
            ${member.toString()} üyesine ait sicil bilgilerine aşağıdaki butonlar yardımıyla ulaşabilirsiniz.`)
        ]}).then(async (msg) => {

            let collector = msg.createMessageComponentCollector({ ComponentType: 2, time: 1000 * 30 });
            collector.on('collect', async (i) => {
                if(i.user.id === message.author.id) {
                    if(i.customId === "punishmentHistory") {
                        punishmentSchema.find({ guildID: message.guild.id, userID: member.id }, async (err, data) => {
                        if(err) return i.reply({ ephemeral: true, embeds: [client.embed.setDescription(`Bu üyenin ceza geçmişi bulunmuyor.`)] })
                        let pdb = data.reverse()
                        let HistoryData = await pdb.slice(0, 15).map((x, index) => `\` ${index + 1} \` \` ${x.punishmentType} \` | \` ${x.punishmentReason} \` | <@${x.executor}> | <t:${Math.floor(x.punishmentAt / 1000)}>`).join("\n")
                        return i.reply({ ephemeral: true, embeds: [client.embed.setDescription(HistoryData+`\n\nToplam **${pdb.length}** ceza kaydı bulunmaktadır. (Chat Mute: **${idb?.CMute ?? "0"}** - Voice Mute: **${idb?.VMute ?? "0"}** - Jail: **${idb?.Jail ?? "0"}** - Ban: **${idb?.Ban ?? "0"}**)`)] })
                    })
                    } 
                    if(i.customId === "cancel") {
                        i.reply({ embeds: [client.embed.setDescription(`İşlem iptal edildi.`)], ephemeral: true });
                        if(msg) msg.delete().catch(err => { });
                    }
                } else {
                    i.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.', ephemeral: true })
                }
            })

            collector.on('end', async (i) => {

                if(msg) msg.delete().catch(err => { });

            })

        })

    }
}