const categories = ['general', 'books', 'film', 'music', 'theatres', 'television', 'videogames',
                'boardgames', 'science', 'computers', 'math', 'mythology', 'sports', 'geography',
                'history', 'politics', 'art', 'celebrities', 'animals',
                'vehicles', 'comics', 'gadgets', 'anime', 'cartoons'];
const { Command } = require('discord-akairo');
const { mixpanel } = require('../bot');

module.exports = class Categories extends Command{
  constructor(){
    super('categories', {
      aliases: ['categories', 'cats', 'dogs']
    })
  }

  exec(msg){
    mixpanel.track("Categories");
    return msg.reply(`List of available categories: \`\`\`fix\n${categories.join(', ')}\`\`\``)
  }
}

module.exports.categories = categories;
