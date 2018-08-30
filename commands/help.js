const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const { owner } = require('../config')
const { mixpanel } = require('../bot');

module.exports = class Help extends Command{
  constructor(){
    super('help', {
      aliases: ['help']
    })
  }

  async exec(msg){
    let guilds = (await this.client.shard.broadcastEval('this.guilds.size')).reduce((a, b) => a + b, 0);
    let channels = (await this.client.shard.broadcastEval('this.channels.size')).reduce((a, b) => a + b, 0);
    let users = (await this.client.shard.broadcastEval('this.users.size')).reduce((a, b) => a + b, 0);
    mixpanel.track("Help");
    const app = await this.client.fetchApplication();
    const embed = new RichEmbed()
                      .setAuthor('TriviaMaster help', this.client.user.displayAvatarURL)
                      .addField('__Info:__', `**Creator:** \`${app.owner.tag}\`\n**Website:** http://ruyili.ca/triviamaster\n**Server:** https://discord.gg/p6MAC99 **      **\n**Invite:** http://ruyili.ca/triv\n**Library:** [discord.js](https://discord.js.org/#/)\n**GitHub:** [RuyiLi/TriviaMaster](https://github.com/RuyiLi/triviamaster)\n**Patreon:** [ruyili](https://www.patreon.com/ruyili)\n**DBL:** [discordbots.org](https://discordbots.org/bot/316591030432563202)`, true)
                      .addField('__Stats:__', `**Servers:** ${guilds}\n**Channels:** ${channels}\n**Users:** ${users}\n**Shards:** ${this.client.shard.count}`, true)
                      .setFooter('Type t.commands to get a list of available commands.');
    return msg.channel.send(embed);
  }
}
