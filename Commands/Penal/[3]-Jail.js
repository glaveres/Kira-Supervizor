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
    name: "jail",
    description: "",
    aliases: ["cezalı", "jailed"],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {
        if(!message.member.permissions.has(8n) && ![...Roles.jailRoles].some(x => message.member.roles.get.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir ${member == undefined ? "**üye**" : ""} belirtin.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        if(await client.kontrolEt({ message: message, member: member }) === true) return;
        if(Roles.suspendedRoles.some(x => member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu kullanıcının aktif bir **Jail** cezası var.`)]}).then(x => setTimeout(() => x.delete(), 5000));
        let count = await punishmentSchema.countDocuments().exec();
        count = count == 0 ? 1 : count + 1;
        let saveRoles = await member.roles.cache.filter(x => x.id !== member.guild.id).map(x => `${x.id}`);

        let row = new ActionRowBuilder()
        .addComponents(
            new SelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Yapılacak eylemi seçin.')
            .addOptions([
                {
                    label: 'Cinsellik, taciz ve ağır hakaret',
                    description: '1 Dakika',
                    value: 'cta-Jail',
                },
                {
                    label: 'Sunucu kurallarına uyum sağlamamak',
                    description: '3 Gün',
                    value: 'skus-Jail',
                },
                {
                    label: 'Sesli/Mesajlı/Ekran P. DM Taciz',
                    description: '1 Gün',
                    value: 'sme-Jail',
                },
                {
                    label: 'Dini, Irki ve Siyasi değerlere Hakaret',
                    description: '1 Ay',
                    value: 'dis-Jail',
                },
                {
                    label: 'Abartı rahatsız edici yaklaşımda bulunmak!',
                    description: '2 Hafta',
                    value: 'ard-Jail',
                },
                {
                    label: 'Sunucu içerisi abartı trol / Kayıt trol yapmak!',
                    description: '3 Gün',
                    value: 'sia-Jail',
                },
                {
                    label: 'Sunucu Kötüleme / Saygısız Davranış',
                    description: '1 Ay',
                    value: 'sksd-Jail',
                }
            ])
        )

        message.channel.send({ embeds: [embed.setDescription(`Lütfen yapılacak işlemi aşağıdaki menü aracılığıyla seçin.`)], components: [row] }).then(async (msg) => {
            let collector = msg.createMessageComponentCollector({ componentType: 3, time: 60000 });

            collector.on('collect', async (i) => {
                if(i.user.id === message.author.id) {
                    if(i.values[0] === "cta-Jail") {
                        client.jail(member, row.components[0].options[0].data.label, 1000 * 60 * 1, "1 Dakika", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "skus-Jail") {
                        client.jail(member, row.components[0].options[1].data.label, 1000 * 60 * 60 * 24 * 3, "3 Gün", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "sme-Jail") {
                        client.jail(member, row.components[0].options[2].data.label, 1000 * 60 * 60 * 24 * 1, "1 Gün", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "dis-Jail") {
                        client.jail(member, row.components[0].options[3].data.label, 1000 * 60 * 60 * 24 * 30, "1 Ay", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "ard-Jail") {
                        client.jail(member, row.components[0].options[4].data.label, 1000 * 60 * 60 * 24 * 14, "2 Hafta", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "sia-Jail") {
                        client.jail(member, row.components[0].options[5].data.label, 1000 * 60 * 60 * 24 * 30, "1 Ay", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    } else if(i.values[0] === "sksd-Jail") {
                        client.jail(member, row.components[0].options[6].data.label, 1000 * 60 * 1, "1 Dakika", i, count, saveRoles)
                        if(msg) msg.delete().catch(err => {})
                    }
                } else {
                    i.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.', ephemeral: true })
                }
            })

            collector.on('end', () => {
                if(msg) msg.delete().catch(err => {})
            })

        })

    }
}