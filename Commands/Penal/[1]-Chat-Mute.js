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
    name: "cmute",
    description: "",
    aliases: ['cmute','cmuted','yazılı-sustur','yazılısustur','yazilisustur'],
    usage: "",
    /**@param {Discord.Message} messageCreate
     * @param {Array} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client, embed) {
        if(!message.member.permissions.has(8n) && ![...Roles.muteRoles].some(x => message.member.roles.cache.get(x))) return message.channel.send({ embeds: [embed.setDescription(`Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.`)]}).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send({ embeds: [embed.setDescription(`Lütfen bir ${member == undefined ? "**üye**" : ""} belirtin.`)] }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) });
        if(await client.kontrolEt({ message: message, member: member }) === true) return;
        
        let count = await punishmentSchema.countDocuments().exec();
        count = count == 0 ? 1 : count + 1;
        
        if(member.roles.cache.get(Roles.mutes.voice)) return message.channel.send({ embeds: [embed.setDescription(`Bu kullanıcının aktif bir **Chat Mute** cezası var.`)]}).then(x => setTimeout(() => x.delete(), 5000));

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Yapılacak eylemi seçin.')
                    .addOptions([
                        {
                            label: 'Kışkırtma , Troll , Hakaret , Dalga Geçmek',
                            description: '5 Dakika',
                            value: 'ktd-CMute',
                        },
                        {
                            label: 'Ailevi Değerlere Küfür , ADK',
                            description: '15 Dakika',
                            value: 'fsc-CMute',
                        },
                        {
                            label: 'Flood , Spam , Capslock , Ortam Bozma',
                            description: '5 Dakika',
                            value: 'kar-CMute',
                        },
                        {
                            label: 'Metin kanallarını amacı dışında kullanmak',
                            description: '10 Dakika',
                            value: 'mka-CMute',
                        },
                        {
                            label: 'Sunucu Kötüleme ve Yetkiliye Hakaret , Argo',
                            description: '15 Dakika',
                            value: 'sy-CMute',
                        },
                        {
                            label: 'Din, Irk, Siyasi, Cinsiyetçilik davranışlar',
                            description: '25 Dakika',
                            value: 'dis-CMute',
                        },
                    ]),
            );
            message.channel.send({ embeds: [embed.setDescription(`Lütfen yapılacak işlemi aşağıdaki menü aracılığıyla seçin.`)], components: [row] }).then(async (msg) => {
            
                let collector = msg.createMessageComponentCollector({ ComponentType: 3, time: 60000 });
                collector.on('collect', async (i) => {
                    if(i.user.id === message.author.id) {

                        if(i.values[0] === "ktd-CMute") {
                            client.cmute(member, row.components[0].options[0].data.label, 1000 * 60 * 5, "5 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                      
                        } else if(i.values[0] === "fsc-CMute") {
                            client.cmute(member, row.components[0].options[1].data.label, 1000 * 60 * 15, "15 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                  
                        } else if(i.values[0] === "kar-CMute") {
                            client.cmute(member, row.components[0].options[2].data.label, 1000 * 60 * 5, "5 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                        
                        } else if(i.values[0] === "mka-CMute") {
                            client.cmute(member, row.components[0].options[3].data.label, 1000 * 60 * 10, "10 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                        
                        } else if(i.values[0] === "sy-CMute") {
                            client.cmute(member, row.components[0].options[4].data.label, 1000 * 60 * 15, "15 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                        
                        } else if(i.values[0] === "dis-CMute") {
                            client.cmute(member, row.components[0].options[5].data.label, 1000 * 60 * 25, "25 Dakika", i, count)
                            if(msg) msg.delete().catch(err => { })                        
                        } else if(i.values[0] === "cancel-CMute") {
                            if(msg) msg.delete().catch(err => { })                       
                        }

                    } else {
                    i.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz bulunmuyor.', ephemeral: true })
                    }
                })
            
                collector.on('end', async (collected, reason) => {

                    if(msg) msg.delete().catch(err => { })
                    
                })

            })

    }
}