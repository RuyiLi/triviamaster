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

module.exports = class TFTrivia extends Command{
  constructor(){
    super('boolean', {
      aliases: ['boolean', 'tf', 'truefalse'],
      channelRestriction: 'guild',
      cooldown: 5000,
      args: [
        {
          id: 'category',
          type: word => {
            const cat = word.toLowerCase();
            if (!categories.includes(cat) && cat !== 'any') return null;
            return categories.indexOf(cat) + 9;
          },
          default: 'any',
          prompt: {
            start: 'Invalid category! Please choose a valid category. Type `t.categories` to see a list of the available categories, or type `any` for any category. Type `cancel` to cancel the command.',
            retry: 'That\'s not a valid category! Type `t.categories` to see a list of the available categories, or type `any` for any category. Type `cancel` to cancel the command.',
            optional: true
          }
        },
        {
          id: 'difficulty',
          type: word => {
            const d = word.toLowerCase();
            if(!['easy', 'medium', 'hard', 'any'].includes(d)) return null;
            return d;
          },
          default: 'any',
          prompt: {
            start: 'Invalid difficulty! Please choose either `easy`, `medium`, or `hard`. Type `cancel` to cancel the command.',
            retry: 'That\'s not a valid difficulty! Please choose either `easy`, `medium`, or `hard`. Type `cancel` to cancel the command.',
            optional: true
          }
        },
        {
          id: 'amount',
          type: word => {
            if(word.toLowerCase() === 'endless') return 'endless';
            if (!word || isNaN(word)) return null;
            const num = parseInt(word);
            if (num < 1 || num > 50) return null;
            return num;
          },
          default: 1,
          prompt: {
            start: 'Invalid amount! Please enter a number larger than 0 and smaller than 50, or `endless` for an endless game. Type `cancel` to cancel the command.',
            retry: 'That\'s not a valid amount! Please enter a number larger than 0 and smaller than 50. Type `cancel` to cancel the command.',
            optional: true
          }
        }
      ]
    })
  }

  async exec(msg, args){
    mixpanel.track("TrueFalse");

    const { category, difficulty, amount } = args;
    if(amount !== 1) await msg.reply(`Starting a trivia game with \`${amount}\` multiple choice questions about \`${category === 'any' ? 'any' : categories[category - 9]}\` with \`${difficulty}\` difficulty.`);

    //Type now defaults to multiple choice. Users can do a true/false one with `t.tf/truefalse/boolean`
    let url = 'https://opentdb.com/api.php?type=boolean'
    if(category > 8) url += `&category=${category}`
    if(difficulty !== 'any') url += `&difficulty=${difficulty}`
    if(amount === 'endless'){
      const c = await count(category);
      const m = await max();
      url += `&amount=${category > 8 ? c : m}`
    }else
      url += `&amount=${amount}`

    console.log(`True/false trivia game started by ${msg.author.tag}. Request URL: ${url}`);

    let body = JSON.parse((await get(url)).text)

    if(body.response_code != 0) return msg.reply(errors[body.response_code - 1])

    const res = body.results;

    let points = 0;
    addUserIfNotExists(msg.author.id);

    for(const r of res){
      const correct = r.correct_answer.toLowerCase() === 'true' ? '1' : '2';

      let embed = new RichEmbed()
                      .setTitle('You have two tries and 30 seconds to answer.')
                      .addField(decode(r.question), '1. True\n2. False')
                      .setColor('RANDOM')
                      .setFooter(`Category: "${r.category}" with difficulty ${r.difficulty}. Question ${res.indexOf(r) + 1}/${amount}. Type "quit" to quit, or "skip" to skip the question.`)
      await msg.channel.send(embed);

      try{
        const answer = (await msg.channel.awaitMessages(m => m.author.id === msg.author.id && ['1', '2', 'skip', 'quit'].includes(m.content), { max: 1, time: 30000, errors: ['time'] })).first().content
        if(answer === correct){
          addPoint(msg.author.id);
          points++;
          msg.reply(`Correct! The answer was _**${correct}. ${r.correct_answer}**_.`)
        }else if(answer === 'skip'){
          msg.reply(`Skipped the question. The answer was _**${correct}. ${r.correct_answer}**_.`)
          continue;
        }else if(answer === 'quit'){
          msg.reply('Trivia game cancelled.');
          break;
        }
        else msg.reply(`Incorrect! The correct answer was _**${correct}. ${r.correct_answer}**_.`)
      }catch(err){
        console.log(err);
        msg.reply(`Time! The correct answer was _**${correct}. ${r.correct_answer}**_.`)
      }
    }
    if(amount !== 1) return msg.reply(`The game is over! Out of ${amount} questions, you scored ${points} points. ${(points >= amount / 2) ? 'Good job!' : 'Better luck next time!'}`)
  }
}
