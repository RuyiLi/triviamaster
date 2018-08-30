const { categories } = require('./categories');
const { Command } = require('discord-akairo');
const { get } = require('snekfetch');
const { mixpanel } = require('../bot');

module.exports = class Count extends Command{
  constructor(){
    super('count', {
      aliases: ['count', 'amount'],
      args: [
        {
          id: 'category',
          type: word => {
            const cat = word.toLowerCase();
            return categories.includes(cat) ? cat : null;
          },
          prompt: {
            start: 'Invalid category! Please choose a valid category. Type `t.categories` to see a list of the available categories. Type `cancel` to cancel the command.',
            retry: 'That\'s not a valid category! Type `t.categories` to see a list of the available categories. Type `cancel` to cancel the command.'
          }
        }
      ]
    })
  }

  async exec(msg, args){
    mixpanel.track("Count");
    msg.guild.prefix = 't/';
    const { category } = args;
    const amounts = await module.exports.count(categories.indexOf(category) + 9);
    return msg.reply(`\`\`\`http\nQuestion count for category ${category}:\n\nTotal: ${amounts[0]}\nEasy: ${amounts[1]}\nMedium: ${amounts[2]}\nHard: ${amounts[3]}\`\`\``)
  }
}

module.exports.count = async function count(category){
  const body = JSON.parse((await get(`https://opentdb.com/api_count.php?category=${category}`)).text)
  const amounts = Object.values(body.category_question_count);
  return amounts;
}

module.exports.max = async function max(){
  const body = JSON.parse((await get('https://opentdb.com/api_count_global.php')).text)
  const a = body['overall'][0];
  return a;
}
