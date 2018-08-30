const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const sqlite = require('sqlite')
const { mixpanel } = require('../bot');

module.exports = class TopGuild extends Command{
  constructor(){
    super('topguild', {
      aliases: ['topguild', 'guildleaderboards'],
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        }
      ]
    })
  }

  async exec(msg, args){
    mixpanel.track("TopGuild");
    const { page } = args;
    const db = await sqlite.open('db.sqlite')
    try{
      let res = await db.all(`SELECT * FROM users ORDER BY points DESC;`)
      res = res.filter(u => !!msg.guild.members.get(u.userId)).slice((page - 1) * 10, page * 10);

      const positions = Array.apply(null, Array(res.length)).map((_, i) => i + 1 + 10 * (page - 1));
      const users = await Promise.all(res.map(async u => {
        try{
          let user = await this.client.fetchUser(u.userId);
          return `${positions[res.indexOf(u)]}. ${user.tag}`;
        }catch(err){
          return `<@${u.userId}>`;
        }
      }));
      const points = res.map(u => u.points);

      if(!users) return msg.reply('There were no results found for this guild.')

      const embed = new RichEmbed()
                      .setAuthor('TriviaMaster top players', this.client.user.displayAvatarURL)
                      .addField('User', users.join('\n'), true)
                      .addField('Points', points.join('\n'), true)
                      .setColor('RANDOM')
                      .setFooter(`Page ${page}`)
      return msg.channel.send(embed)
    }catch(err){
      msg.say('There was an error:')
      return msg.say(err);
    }
  }
}
