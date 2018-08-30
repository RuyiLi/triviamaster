const { Listener } = require('discord-akairo');
const { logChannel } = require('../config');
const { dbl } = require('../bot');
const { addPoint, addUserIfNotExists } = require('../commands/sql');

module.exports = class Ready extends Listener{
  constructor(){
    super('ready', {
      emitter: 'client',
      eventName: 'ready'
    })
  }

  exec(){
    const tg = this.client.guilds.get('316593660135342082')

    console.log(`TriviaMaster started. ${this.client.guilds.size} guilds, ${this.client.channels.size} channels, and ${this.client.users.size} users.`);

    if(this.client.channels.has(logChannel)) this.client.channels.get(logChannel).send('Bot restarted.')
    this.client.user.setGame(`t.help | ${[`${this.client.guilds.size} guilds`, `${this.client.channels.size} channels`, `${this.client.users.size} users`][Math.floor(Math.random() * 3)]}`)
    setInterval(() => {
      this.client.user.setGame(`t.help | ${[`${this.client.guilds.size} guilds`, `${this.client.channels.size} channels`, `${this.client.users.size} users`][Math.floor(Math.random() * 3)]}`)
    }, 3e4)
    setInterval(() => {
      dbl.getVotes(true).then(v => v.forEach(async e => {
        if(tg.members.has(e)){
          if(!tg.members.get(e).roles.has('397451657849470976')){
            tf.members.get(e).addRole('397451657849470976');
          }
        }
        await addUserIfNotExists(e);
        await addPoint(e, 50)
      }))
    }, 9e6)
  }
}
