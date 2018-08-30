const { Listener } = require('discord-akairo');
const { logChannel, dbl } = require('../config');
const { RichEmbed } = require('discord.js')
const { mixpanel } = require('../bot');
const { post } = require('snekfetch')

module.exports = class GuildCreate extends Listener{
  constructor(){
    super('guildCreate', {
      emitter: 'client',
      eventName: 'guildCreate'
    })
  }

  exec(guild){
    mixpanel.track("New Guild");
    console.log(`Joined guild ${guild.name}, with ${guild.memberCount} members.`);
    const gData = `**Joined a guild [${guild.name} (${guild.id})]**\n**Member count:** ${guild.memberCount}\n**Created at:** ${new Date(guild.createdAt)}`

    let embed = new RichEmbed()
                    .setTitle('Joined a guild')
                    .setThumbnail(guild.iconURL)
                    .addField(`${guild.name} (${guild.id})`, `**Member count:** ${guild.memberCount}\n**Created at:** ${new Date(guild.createdAt)}`)
    if(this.client.channels.has(logChannel)) this.client.channels.get(logChannel).send(embed);
  }
}
