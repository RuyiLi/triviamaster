const { Command } = require('discord-akairo');
const sqlite = require('sqlite')

module.exports = class SQLGet extends Command{
  constructor(){
    super('sqlget', {
      aliases: ['sqlget'],
      split: 'none',
      ownerOnly: true,
      args: [
        {
          id: 'query',
          type: 'string'
        }
      ]
    })
  }

  async exec(msg, args){
    const { query } = args;
    const db = await sqlite.open('db.sqlite')
    let res = await db.all(query);
    return msg.say('```' + JSON.stringify(res) + '```');
  }
}
