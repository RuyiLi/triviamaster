const { Command } = require('discord-akairo');
const { mixpanel } = require('../bot');

module.exports = class Ping extends Command{
  constructor(){
    super('ping', {
      aliases: ['ping']
    })
  }

  async exec(msg){
    mixpanel.track("Ping");
    let ponger = await msg.say('Pinging...');
    return ponger.edit(`Pong! The client ping is \`${Math.abs(ponger.createdTimestamp - msg.createdTimestamp)}\`ms. The heartbeat ping is \`${this.client.ping}\`ms.`)
  }
}
