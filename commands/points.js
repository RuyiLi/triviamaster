const { Command } = require('discord-akairo');
const sqlite = require('sqlite')
const { mixpanel } = require('../bot');

module.exports = class Points extends Command{
  constructor(){
    super('points', {
      aliases: ['points'],
      args: [
        {
          id: 'user',
          type: 'user',
          default: msg => msg.author
        }
      ]
    })
  }

  async exec(msg, args){
    mixpanel.track("Points");
    const { user } = args;
    const db = await sqlite.open('db.sqlite')
    try{
      const { points } = await db.get('SELECT points FROM users WHERE userId=' + user.id);
      if(msg.author.id === user.id)
        return msg.reply(`you have ${points} trivia point${points === 1 ? '' : 's'}.`)
      else
        return msg.reply(`${user} has ${points} trivia point${points === 1 ? '' : 's'}.`)
    }catch(err){
      return msg.reply('Could not find that user. Try again later.')
    }
  }
}
