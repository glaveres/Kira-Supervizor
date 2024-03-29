const { MessageEmbed } = require('discord.js')
const config = require('../config.json')
const db = require('quick.db')
require("../structures/function")(client);

module.exports = {
    name: 'erkek',
    aliases: ["erkek", "e"],
    usage: ".erkek @kullanıcı isim yaş",
    run: async (client, message, args) => {
        if (!args[0]) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} Komutu yanlış kullandınız. .e <@Kira/ID> <İsim> <Yaş>`).then(msg => { setTimeout(() => { msg.delete() }, 10000); });

        const member = message.mentions.users.size > 0 ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

        let name = args[1]
        let age = args[2]

        if (!message.member.roles.cache.has(config.kayıt.kayıtYetkiliID) && !message.member.permissions.has(8)) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} | Bu komutu kullanabilmek için gerekli izinlere sahip değilsin.`).then(msg => { setTimeout(() => { msg.delete() }, 10000); })
        if (!member) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} Komutu yanlış kullandınız. .e <@Kira/ID> <İsim> <Yaş>`).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
        if (!name) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} Komutu yanlış kullandınız. .e <@Kira/ID> <İsim> <Yaş>`).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
        if (!age) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} Komutu yanlış kullandınız. .e <@Kira/ID> <İsim> <Yaş>`).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
        if (isNaN(age)) return message.reply(`${client.emojis.cache.find(x => x.name === "1013946680296616006")} Komutu yanlış kullandınız. .e <@Kira/ID> <İsim> <Yaş>`).then(msg => { setTimeout(() => { msg.delete() }, 10000); });
    //    if (!member.roles.cache.has(config.kayıt.kayıtsızID)) return message.reply('${client.emojis.cache.find(x => x.name === "1013946680296616006")} | Kullanıcının kayıtsız rolü yok.').then(msg => { setTimeout(() => { msg.delete() }, 10000); });

        await member.setNickname(`${config.kayıt.tag} ${name} | ${age}`);
        await member.roles.add([...config.kayıt.erkekID]);
        await member.roles.remove(config.kayıt.kayıtsızID)

        let embed = new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('RANDOM')
            .setDescription(`${member} adlı üye **Erkek** olarak kayıt oldu!`)

        message.reply({ embeds: [embed] })

        let kayit = {
            name: `${member.nickname}`,
            rol: "Erkek",
            yetkili: {
                name: `${message.member.nickname ? message.member.nickname : message.author.username}`,
                id: `${message.author.id}`
            }
        }
        if (!db.fetch(`isimler_${member.id}`)) await db.set(`isimler_${member.id}`, [])
        await db.push(`isimler_${member.id}`, kayit)
    }
}