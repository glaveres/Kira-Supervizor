/* Core Modules */
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin, ActionRow } = require('discord.js');

/* Core Config */
const Config = require('../../Core/Settings/Settings');
const Roles = require('../../Core/Settings/Roles');
const Channels = require('../../Core/Settings/Channels');

/* Core Database */
const punishmentSchema = require('../../Core/Database/punishmentSchema')
const infractionSchema = require('../../Core/Database/infractionSchema');

module.exports = {
    name: "sicil-sıfırla",
    description: "",
    aliases: ["sicil-sifirla","sicilsıfırla","sicilsifirla"],
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
            .setCustomId("punishmentDelete")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Sicil Sıfırla"),

            new ButtonBuilder()
            .setCustomId("punishmentPointDelete")
            .setStyle(ButtonStyle.Success)
            .setLabel("Ceza Puan Sıfırla"),

            new ButtonBuilder()
            .setCustomId("cancel")
            .setStyle(ButtonStyle.Danger)
            .setLabel("İptal")

        )

        message.channel.send({
            components: [row],
            embeds: [
            client.embed
            .setDescription(`${message.author} Sıfırlama Paneline Hoşgeldiniz.
                
            \`\`\`diff\n- Sicil Sıfırlama (Chat Mute - Voice Mute - Ban - Jail)\n- İhlal Sıfırlama (Ceza - Chat Mute - Voice Mute - Ban - Jail)\`\`\`
            
            ${member.toString()} üyesine ait sıfırlamak istediğin veriyi aşağıdaki butonlar yardımıyla seçebilirsiniz.`)
        ]}).then(async (msg) => {

            let collector = msg.createMessageComponentCollector({ ComponentType: 2, time: 1000 * 30 });
            collector.on('collect', async (i) => {
                if(i.user.id === message.author.id) {
                    if(i.customId === "punishmentDelete") {
                        punishmentSchema.find({ guildID: message.guild.id, userID: member.id }).deleteMany().exec();
                        i.reply({ embeds: [client.embed.setDescription(`\` ${member.user.tag} \` üyesinin tüm cezaları başarıyla sıfırlandı.`)], ephemeral: true });
                    }
                    if(i.customId === "punishmentPointDelete") {
                        infractionSchema.find({ guildID: message.guild.id, userID: member.id }).deleteMany().exec();
                        i.reply({ embeds: [client.embed.setDescription(`\` ${member.user.tag} \` üyesinin ihlalleri başarıyla sıfırlandı.`)], ephemeral: true });
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