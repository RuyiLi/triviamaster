const { Command } = require('discord-akairo');

module.exports = class Eval extends Command{
  constructor(){
    super('eval', {
      aliases: ['eval'],
      split: 'none',
      ownerOnly: true,
      args: [
        {
          id: 'code',
          type: 'string'
        }
      ]
    })
  }

  async exec(msg, args){
    const { code } = args;
    try {
      let evaled = eval(code);

      if (typeof evaled !== 'string')
        evaled = require('util').inspect(evaled);

      msg.say(clean(evaled), { code: 'js' });
    } catch (err) {
      msg.say(`:x: ERROR \`\`\`js\n${clean(err)}\n\`\`\``);
    }
  }
}

const clean = text => {
  if (typeof(text) === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
  else
      return text;
}
