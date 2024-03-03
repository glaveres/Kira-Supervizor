const client = require('../Core/clientHandler.js');
const config = require('../Core/Settings/Settings');
const { GuildMember, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ActionRowBuilder, TextChannel, Client, Colors, ComponentType, ApplicationCommandOptionChannelTypesMixin } = require('discord.js');

/* Core Config */
const Config = require('../Core/Settings/Settings');
const Roles = require('../Core/Settings/Roles');
const Channels = require('../Core/Settings/Channels');

/**@param {Discord.Client} client
 * @param {Discord.messageCreate} messageCreate
 */

module.exports = async (message, client) => {

    const prefix = config.prefix;

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
 
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;
    
    const embed = client.embed = new EmbedBuilder()
    .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true})})
    .setColor('Random')
    .setTimestamp()
    .setFooter({ text: Config.embed.footer });


    try {

        command.execute(message, args, client, embed);

    } catch(err) {

        console.error(err);
        message.reply('Komutu çalıştırırken bir hata ile karşılaştım, geliştiricime ulaşın! (Hata Kodu: 1)');

    }

}