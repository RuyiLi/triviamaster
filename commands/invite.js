const { Command } = require('discord-akairo');
const sqlite = require('sqlite')
const { mixpanel } = require('../bot');

module.exports = class Invite extends Command{
  constructor(){
    super('invite', {
      aliases: ['invite']
    })
  }

  async exec(msg){
    mixpanel.track("Invite");
    return msg.say('Want to invite me to your server? Click here: <https://is.gd/triviamaster>.\nOr, if you want to join the official Discord server, click here: <https://discord.gg/p6MAC99>.');
  }
}
