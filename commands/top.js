const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const sqlite = require('sqlite')
const { mixpanel } = require('../bot');

module.exports = class Top extends Command{
  constructor(){
    super('top', {
      aliases: ['top', 'leaderboards'],
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
    mixpanel.track("Top");
    const { page } = args;
    const db = await sqlite.open('db.sqlite')
    try{
      const res = await db.all(`SELECT * FROM users ORDER BY points DESC LIMIT 10 OFFSET ${10 * (page - 1)};`);
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
