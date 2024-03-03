const { Formatters, GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin, ThreadMemberFlagsBitField } = require('discord.js');
const punishmentSchema = require('./Database/punishmentSchema');
const infractionSchema = require('./Database/infractionSchema');
const rolesSchema = require('./Database/roleSchema');

const Config = require('./Settings/Settings');
const Roles = require('./Settings/Roles');
const Channels = require('./Settings/Channels');
const ms = require('ms')
module.exports = (client) => {

    TextChannel.prototype.wsend = async function (message) {
        const hooks = await this.fetchWebhooks();
        let webhook = hooks.find(a => a.name === client.user.username && a.owner.id === client.user.id);
        if (webhook) return webhook.send(message);
        webhook = await this.createWebhook({ name: client.user.username, avatar: client.user.avatarURL() });
        return webhook.send(message);
      };    

    client.kontrolEt = async (options) => {

        let newData = "";

        if(options.member.id === options.message.author.id) return options.message.channel.send({ content: "<@" + options.message.author.id + ">, ` Kendinizi işlem yapmaya ` çalıştığınız için işlemler durduruldu!" }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) }), newData = true;
        if(options.member.id === options.message.guild.ownerId) return options.message.channel.send({ content: "<@" + options.message.author.id + ">, Kullanıcı ` Sunucu Sahibi ` olduğu için işlemler durduruldu!" }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) }), newData = true;
        if(options.member.user?.bot ? options.member.user.bot : options.member.bot) return options.message.channel.send({ content: "<@" + options.message.author.id + ">, Kullanıcı ` Bot ` olduğu için işlemler durduruldu!" }).then(async (msg) => { setTimeout(() => { msg.delete() }, 5000) }), newData = true

        return newData ? newData : false;

    }

    client.fetchBan = async (guild, user) => {

      try {
        const bans = await guild.fetchBans();
        return bans.find(ban => ban.user.id === user);
      }
      catch (err) {
        return undefined
      }
      
    }

    client.wait = async (time) => {
      
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, time);
      });
      
    }

    client.cmute = async (user, reason, time, timeLength, button, count) => {

        let cmute = client.channels.cache.get(Channels.cmuteLog)
        let pdb = await punishmentSchema.findOne({ guildID: user.guild.id, userID: user.id, punishmentType: "CMUTE" });

        await button.reply({ content: `<@${user.id}> adlı kullanıcı başarıyla metin kanallarında susturuldu!`, ephemeral: true });

        await user.roles.add(Roles.mutes.chat, `Susturulma sebebi: ${reason} | Susturulma süresi: ${timeLength} | Yetkili: ${button.user.username}#${button.user.discriminator} (${button.user.id})`);
        let save = await new punishmentSchema({ guildID: button.guild.id, executor: button.user.id, userID: user.id, punishmentAt: new Date(), punishmentFinish: (Date.now() + time), punishmentType: "CMUTE", punishmentReason: reason, punishmentContinue: true, cezaID: count }).save()
        await infractionSchema.findOneAndUpdate({ guildID: button.guild.id, userID: user.id }, { $inc: { Ban: 0, Jail: 0, CMute: 1, VMute: 0, punishmentPoint: Config.points.mutePoint }}, { upsert: true })
        let idb = await infractionSchema.findOne({ guildID: user.guild.id, userID: user.id });

        cmute.wsend({ 
          content: `${user} adlı kullanıcı **${reason}** sebebiyle sunucuda metin kanallarından (**+${timeLength}**) engellendi. (Ceza Numarası: \`#${count}\`)`,
          embeds: [
            client.embed
            .setTitle(`#${count} ID\'lı Ceza Numarası Sisteme Eklendi.`)
            .setDescription(`**Cezalandırılan Kullanıcı :** ${user} - (\`\`${user.id}\`\`)
            **Cezalandıran Yetkili :** ${button.user} - (\`\`${button.user.id}\`\`)
            **Cezalandırma Tarihi :** <t:${Math.floor(new Date() / 1000)}:f>
            **Cezalandırma Süresi :** ${timeLength}
            **Cezalandırma Sebebi :** \`\`\`fix\n${reason}\`\`\`
            `)
          ] 
        })
        cmute.wsend({ content: `${user} adlı kullanıcının güncel ceza puanı: **${idb.punishmentPoint}**` })

    }

    client.vmute = async (user, reason, time, timeLength, button, count) => {

      let vmute = client.channels.cache.get(Channels.vmuteLog)
      let pdb = await punishmentSchema.findOne({ guildID: user.guild.id, userID: user.id, punishmentType: "VMUTE" });

      user.roles.add(Roles.mutes.voice, `Susturulma sebebi: ${reason} | Susturulma süresi: ${timeLength} | Yetkili: ${button.user.username}#${button.user.discriminator} (${button.user.id})`);
      let save = await new punishmentSchema({ guildID: button.guild.id, executor: button.user.id, userID: user.id, punishmentAt: new Date(), punishmentFinish: (Date.now() + time), punishmentType: "VMUTE", punishmentReason: reason, punishmentContinue: true, cezaID: count }).save()
      await infractionSchema.findOneAndUpdate({ guildID: button.guild.id, userID: user.id }, { $inc: { Ban: 0, Jail: 0, CMute: 0, VMute: 1, punishmentPoint: Config.points.mutePoint }}, { upsert: true })
      let idb = await infractionSchema.findOne({ guildID: user.guild.id, userID: user.id });
     
      if(user.voice.channel) {

        user.voice.setMute(true)

        vmute.wsend({ 
          content: `${user} adlı kullanıcı **${reason}** sebebiyle sunucuda ses kanallarından (**+${timeLength}**) engellendi. (Ceza Numarası: \`#${count}\`)`,
          embeds: [
            client.embed
            .setTitle(`#${count} ID\'lı Ceza Numarası Sisteme Eklendi.`)
            .setDescription(`**Cezalandırılan Kullanıcı :** ${user} - (\`\`${user.id}\`\`)
            **Cezalandıran Yetkili :** ${button.user} - (\`\`${button.user.id}\`\`)
            **Cezalandırma Tarihi :** <t:${Math.floor(new Date() / 1000)}>
            **Cezalandırma Süresi :** ${timeLength}
            **Cezalandırma Sebebi :** \`\`\`fix\n${reason}\`\`\`
            `)
          ]
        })
        vmute.wsend({ content: `${user} adlı kullanıcının güncel ceza puanı: **${idb.punishmentPoint}**` })

      } else {

        vmute.wsend({ 
          content: `${user} adlı kullanıcı **${reason}** sebebiyle sunucuda ses kanallarından (**+${timeLength}**) engellendi. Sesliye girince otomatik susturulacak! (Ceza Numarası: \`#${count}\`)`,
          embeds: [
            client.embed
            .setTitle(`#${count} ID\'lı Ceza Numarası Sisteme Eklendi.`)
            .setDescription(`**Cezalandırılan Kullanıcı :** ${user} - (\`\`${user.id}\`\`)
            **Cezalandıran Yetkili :** ${button.user} - (\`\`${button.user.id}\`\`)
            **Cezalandırma Tarihi :** <t:${Math.floor(new Date() / 1000)}>
            **Cezalandırma Süresi :** ${timeLength}
            **Cezalandırma Sebebi :** \`\`\`fix\n${reason}\`\`\`
            `)
          ]
        })
        vmute.wsend({ content: `${user} adlı kullanıcının güncel ceza puanı: **${idb.punishmentPoint}**` })

      }

    }

    client.jail = async (user, reason, time, timeLength, button, count, roles) => {

      let jail = client.channels.cache.get(Channels.jailLog)

      await rolesSchema.findOneAndUpdate({ guildID: button.guild.id, userID: user.id }, { $set: { jailRoles: roles, userID: user.id, guildID: button.guild.id }}, { upsert: true })
      let save = await new punishmentSchema({ guildID: button.guild.id, executor: button.user.id, userID: user.id, punishmentAt: new Date(), punishmentFinish: (Date.now() + time), punishmentType: "JAIL", punishmentReason: reason, punishmentContinue: true, cezaID: count }).save()
      await infractionSchema.findOneAndUpdate({ guildID: button.guild.id, userID: user.id }, { $inc: { Ban: 0, Jail: 1, CMute: 0, VMute: 0, punishmentPoint: Config.points.jailPoint }}, { upsert: true })
      user.roles.set(Roles.suspendedRoles, `Hapis sebebi: ${reason} | Hapis süresi: ${timeLength} | Yetkili: ${button.user.username}#${button.user.discriminator} (${button.user.id})`);
      let idb = await infractionSchema.findOne({ guildID: user.guild.id, userID: user.id });
      jail.wsend({ 
        content: `${user} adlı kullanıcı **${reason}** sebebiyle sunucuda metin ve ses kanallarından (**+${timeLength}**) engellendi. (Ceza Numarası: \`#${count}\`)`,
        embeds: [
          client.embed
          .setTitle(`#${count} ID\'lı Ceza Numarası Sisteme Eklendi.`)
          .setDescription(`**Cezalandırılan Kullanıcı :** ${user} - (\`\`${user.id}\`\`)
          **Cezalandıran Yetkili :** ${button.user} - (\`\`${button.user.id}\`\`)
          **Cezalandırma Tarihi :** <t:${Math.floor(new Date() / 1000)}:f>
          **Cezalandırma Süresi :** ${timeLength}
          **Cezalandırma Sebebi :** \`\`\`fix\n${reason}\`\`\`
          `)
        ] 
      })
      jail.wsend({ content: `${user} adlı kullanıcının güncel ceza puanı: **${idb.punishmentPoint}**` })

    }

    client.ban = async (user, author, reason, count) => {

      let banLog = client.channels.cache.get(Channels.banLog);
      let save = await new punishmentSchema({ guildID: user.guild.id, executor: author.id, userID: user.id, punishmentAt: new Date(), punishmentFinish: (Date.now() + 999999999999), punishmentType: "BAN", punishmentReason: reason, punishmentContinue: true, cezaID: count }).save()
      await infractionSchema.findOneAndUpdate({ guildID: user.guild.id, userID: user.id }, { $inc: { Ban: 1, Jail: 0, CMute: 0, VMute: 0, punishmentPoint: Config.points.banPoint }}, { upsert: true })
      let idb = await infractionSchema.findOne({ guildID: user.guild.id, userID: user.id });
      user.ban({ reason: `Yetkili: ${author.username}#${author.discriminator} (${author.id}) | Sebep: ${reason}` })
      banLog.wsend({ 
        content: `${user} adlı kullanıcı **${reason}** sebebiyle sunucuya erişimi engellendi. (Ceza Numarası: \`#${count}\`)`,
        embeds:[
          client.embed
          .setTitle(`#${count} ID\'lı Ceza Numarası Sisteme Eklendi.`)
          .setDescription(`**Cezalandırılan Kullanıcı :** ${user} - (\`\`${user.id}\`\`)
          **Cezalandıran Yetkili :** ${author} - (\`\`${author.id}\`\`)
          **Cezalandırma Tarihi :** <t:${Math.floor(new Date() / 1000)}:f>
          **Cezalandırma Süresi :** Kalıcı
          **Cezalandırma Sebebi :** \`\`\`fix\n${reason}\`\`\``)
        ]
      })
      banLog.wsend({ content: `${user} adlı kullanıcının güncel ceza puanı: **${idb.punishmentPoint}**` })

    }


    GuildMember.prototype.rolAyarla = function (options) {
        if (!this.manageable) return;
        const newRoles = this.roles.cache.filter(x => x.managed).map(x => x.id).concat(options);
        return this.roles.set(newRoles).catch(() => {});
      };

      GuildMember.prototype.rolKontrolEt = function (role, every = true) {
        return (Array.isArray(role) && (every && role.every((x) => this.roles.cache.has(x)) || !every && role.some((x) => this.roles.cache.has(x))) || !Array.isArray(role) && this.roles.cache.has(role))
      };

}