const { Command } = require('discord-akairo');

module.exports = class Restart extends Command{
  constructor(){
    super('restart', {
      aliases: ['restart'],
      ownerOnly: true
    })
  }

  async exec(msg){
    await msg.reply('Restarting bot...');
    process.exit(0);
  }
}
