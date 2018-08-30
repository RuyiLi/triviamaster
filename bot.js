const config = require('./config');
const { AkairoClient, SQLiteProvider } = require('discord-akairo');
const sqlite = require('sqlite');
const { Message } = require('discord.js')
const Mixpanel = require('mixpanel')
const DBL = require('dblapi.js');

module.exports.mixpanel = Mixpanel.init(config.mixpanelToken, { protocol: 'https' });

Message.prototype.say = function(content, options = {}){
  return this.channel.send(content, options);
}

class CustomClient extends AkairoClient {
    constructor() {
        super({
          ownerID: '210802688181534720',
          prefix: msg => {
            if (msg.guild) {
              return this.settings.get(msg.guild.id, 'prefix', 't.');
            }
            return 't.';
          },
          allowMention: true,
          commandDirectory: './commands/',
          listenerDirectory: './listeners/'
        });

        this.settings = new SQLiteProvider(sqlite.open('db.sqlite'), 'settings', {
            idColumn: 'guild_id'
        });
    }

    login(token) {
        return this.settings.init().then(() => super.login(token));
    }
}


process.on('unhandledRejection', console.error);

const client = new CustomClient();
const dbl = new DBL(config.dbl, client);
module.exports.dbl = dbl;

client.login(config.token);
