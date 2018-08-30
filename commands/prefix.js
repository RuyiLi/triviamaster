const { Command } = require('discord-akairo');
const { mixpanel } = require('../bot');

module.exports = class Prefix extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix'],
      args: [
        {
          id: 'prefix'
        }
      ],
      channelRestriction: 'guild'
    });
  }

  async exec(msg, args) {
    mixpanel.track("Prefix");
    const oldPrefix = this.client.settings.get(msg.guild.id, 'prefix', 't.');
    if(args['prefix']){
      if(msg.member.hasPermission('ADMINISTRATOR')){
        await this.client.settings.set(msg.guild.id, 'prefix', args.prefix);
        return msg.reply(`Prefix changed from \`${oldPrefix}\` to \`${args.prefix}\``);
      }else{
        return msg.reply('Sorry, you must have the `ADMINISTRATOR` permission to change the prefix.')
      }
    }else{
      return msg.reply(`The current prefix for this guild is \`${oldPrefix}\``);
    }
  }
}
