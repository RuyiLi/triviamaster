const { Command } = require('discord-akairo');
const { get } = require('snekfetch');
const { RichEmbed } = require('discord.js')
const { categories } = require('./categories');
const { decode } = require('he');
const { count, max } = require('./count');
const { addPoint, addUserIfNotExists } = require('./sql');
const { mixpanel } = require('../bot');

const errors = [
  "ERROR: Could not return results. The API doesn't have enough questions for your query. Try running the command again with a smaller amount, or check the amount of questions in a category with `t.count`.",
  "ERROR: Invalid parameter. Make sure the command is in the format of `t.rivia [category] [difficulty] [amount]`."
]

module.exports = class Jeopardy extends Command{
  constructor(){
    super('jeopardy', {
      aliases: ['jeopardy', 'j', 'quiz'],
      channelRestriction: 'guild',
      cooldown: 5000,
      args: [
        {
          id: 'amount',
          type: word => {
            if (!word || isNaN(word)) return null;
            const num = parseInt(word);
            if (num < 1 || num > 100) return null;
            return num;
          },
          default: 1,
          prompt: {
            start: 'Invalid amount! Please enter a number larger than 0 and smaller than 100. Type `cancel` to cancel the command.',
            retry: 'That\'s not a valid amount! Please enter a number larger than 0 and smaller than 100. Type `cancel` to cancel the command.',
            optional: true
          }
        }
      ]
    })
  }

  async exec(msg, args){
    mixpanel.track("Jeopardy");
    const { amount } = args;
    if(amount !== 1) await msg.reply(`Starting a jeopardy game with \`${amount}\` questions.`);

    const url = `http://www.jservice.io/api/random?count=${amount}`

    console.log(`Jeopardy game started by ${msg.author.tag}. Request URL: ${url}`);

    let res = JSON.parse((await get(url)).text)

    if(res.error) return msg.reply(`There was an error: ${res.error}. Status code: ${res.status}`)

    let points = 0;

    addUserIfNotExists(msg.author.id);

    for(const r of res){
      let { answer, question, value, category } = r;

      //get rid of all html elements in the answer
      answer = answer.replace(/<(?:.|\n)*?>/gm, '');

      let embed = new RichEmbed()
                      .setTitle('You have five tries and 60 seconds to answer.')
                      .setColor('RANDOM')
                      .addField(`Category: ${category.title} ($${value})`, decode(question) || ('ERR: Invalid question. Please type "quit" and try again.'))
                      .setFooter(`Category: "${category.title}" with a value of $${value}. Question ${res.indexOf(r) + 1}/${amount}. Type "quit" to quit, or "skip" to skip the question.`)
      await msg.channel.send(embed);

      let tries = 0;

      const _quit = await new Promise((resolve, reject) => {
        const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id, { time: 60000 });

        collector.on('collect', m => {
          const c = m.content.toLowerCase()
          if(c === 'quit' || c === 'skip'){
            return collector.stop(c);
          }else if(c === answer.toLowerCase()){
            points += Math.floor((value ? value/100 : 1));
            addPoint(msg.author.id, points);
            return collector.stop('correct');
          }else{
            tries++;
            if(tries >= 10) collector.stop('incorrect')
            else msg.reply(`Incorrect. You have ${10 - tries} more attempt${tries < 9 ? 's' : ''}.`);
          }
        });
        collector.on('end', (collected, reason) => {
          if(reason === 'correct')
            msg.reply(`Correct! The answer was _**${answer}**_.`)
          else if(reason === 'incorrect')
            msg.reply(`No more attempts! The correct answer was _**${answer}**_.`)
          else if(reason === 'time')
            msg.reply(`Time! The correct answer was _**${answer}**_.`)
          else if(reason === 'quit'){
            msg.reply('Trivia game cancelled.')
            return resolve(1);
          }
          else if(reason === 'skip'){
            if(amount === 1){
              msg.reply(`Ending the game. The answer was **${answer}**.`);
              return resolve(1)
            }
            msg.reply(`Skipping the question. The answer was **${answer}**.`);
            return resolve(2);
          }
          resolve(0)
        });
      });

      if(_quit === 1) break;
      if(_quit === 2) continue;
    }
    if(amount !== 1) return msg.reply(`The game is over! Out of ${amount} questions, you scored ${points} points. ${(points >= amount / 2) ? 'Good job!' : 'Better luck next time!'}`)
  }
}
