const { Command } = require('discord-akairo');
const { mixpanel } = require('../bot');

module.exports = class Upvote extends Command{
  constructor(){
    super('upvote', {
      aliases: ['upvote', 'up']
    })
  }

  async exec(msg){
    mixpanel.track("Upvote");
    return msg.say(`Vote for TriviaMaster to support the bot and receive the following rewards:
\`\`\`diff
+ Special Voter role on the official TriviaMaster server
+ 50 trivia points
\`\`\`You can vote for TriviaMaster **once every month** at https://discordbots.org/bot/316591030432563202/vote`);
  }
}
