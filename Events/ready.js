const client = require('../Core/clientHandler.js');
const Config = require('../Core/Settings/Settings');
const Roles = require('../Core/Settings/Roles');
const Channels = require('../Core/Settings/Channels');
const punishmentSchema = require('../Core/Database/punishmentSchema');
const infractionSchema = require('../Core/Database/infractionSchema');
const roleSchema = require('../Core/Database/roleSchema');

const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = async (client) => {

    client.user.setActivity("Kira Svartalf 💙");

    await client.user.setStatus('dnd');

    let VoiceChannel = client.channels.cache.get(Channels.botVoiceChannel);

    joinVoiceChannel({
        channelId: VoiceChannel.id,
        guildId: VoiceChannel.guild.id,
        adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true
    })

    setInterval(async () => {

        joinVoiceChannel({
            channelId: VoiceChannel.id,
            guildId: VoiceChannel.guild.id,
            adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true
        })

    }, 1000 * 60 * 5);

    setInterval(async () => { await voiceMuteControl() }, 1 * 1000);
    setInterval(async () => { await chatMuteControl() }, 3 * 1000);
    setInterval(async () => { await jailControl() }, 5 * 1000);

}

async function voiceMuteControl() {

    const server = client.guilds.cache.get(Config.server.ID);
    punishmentSchema.find({ guildID: server.id, punishmentContinue: true, punishmentType: "VMUTE" }, async function(err, pdb) {
    if((!pdb) || (pdb.length < 1)) return null;

    for (var newPunishment of pdb) {

        let user = server.members.cache.get(newPunishment.userID);
        if(!user) return null;

        if(Date.now() >= newPunishment.punishmentFinish) {
            if((user.voice.channel) || (user.roles.cache.get(Roles.mutes.voice))) {
            if(user.voice.channel) user.voice.setMute(false, `Voice Mute cezası bittiği sesli kanallara erişimi açıldı.`).catch(err => {});
            user.roles.remove(Roles.mutes.voice, `Voice Mute cezası cezası bittiği için rolü geri aldım.`).catch(err => {});
            newPunishment.punishmentContinue = false;
            newPunishment.save();
            }
        } else {
            if(!user.roles.cache.get(Roles.mutes.voice) || user.voice.serverMute === false) {
                if(user.voice.channel) user.voice.setMute(true, `Voice Mute cezası olduğu için sesli kanallarda susturuldu.`).catch(err => {});
                user.roles.add(Roles.mutes.voice, `Voice Mute cezası olduğu için rolü tekrar verildi.`).catch(err => {});
            }
        }

    }
})
}

async function chatMuteControl() {

    const server = client.guilds.cache.get(Config.server.ID);
    punishmentSchema.find({ guildID: server.id, punishmentContinue: true, punishmentType: "CMUTE" }, async function(err, pdb) {
        if((!pdb) || (pdb.length < 1)) return null;

        for (var newPunishment of pdb) {

            let user = server.members.cache.get(newPunishment.userID);
            if(!user) return null;

            if(Date.now() >= newPunishment.punishmentFinish) {
                if((user.roles.cache.get(Roles.mutes.chat))) {
                    user.roles.remove(Roles.mutes.chat, `Chat Mute cezası sonlandırıldı.`).catch(err => {});
                    newPunishment.punishmentContinue = false;
                    newPunishment.save();
                }
            } else {
                if(!user.roles.cache.get(Roles.mutes.chat)) {
                    user.roles.add(Roles.mutes.chat, `Chat Mute cezası olduğu için rolü tekrar verildi.`).catch(err => {});
                }
            }
        }
    })
}

async function jailControl() {

    const server = client.guilds.cache.get(Config.server.ID);
    punishmentSchema.find({ guildID: server.id, punishmentContinue: true, punishmentType: "JAIL" }, async function(err, pdb) {
        if((!pdb) || (pdb.length < 1)) return null;
        for (var newPunishment of pdb) {

            let user = server.members.cache.get(newPunishment.userID);
            if(!user) return null;
            let oldRoles = await roleSchema.findOne({ guildID: server.id, userID: user.id });
            if(Date.now() >= newPunishment.punishmentFinish) {
                if(Roles.suspendedRoles.some(role => user.roles.cache.get(role))) {
                    user.roles.set(...[oldRoles.jailRoles], `Jail cezası bittiği için önceki rolleri geri verildi.`)
                    newPunishment.punishmentContinue = false;
                    newPunishment.save();
                }
            } else {
                if(![Roles.suspendedRoles].some(role => user.roles.cache.get(role))) {
                    user.roles.add(...Roles.suspendedRoles, `Jail cezası olduğu için rolü tekrar verildi.`).catch(err => {});
                }
            }
        }
    })
}