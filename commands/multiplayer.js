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

module.exports = class Multiplayer extends Command{
  constructor(){
    super('multiplayer', {
      aliases: ['multi', 'multiplayer'],
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
    mixpanel.track("Multiplayer");
    const { category, difficulty, amount } = args;
    if(amount !== 1) await msg.reply(`Starting a multiplayer trivia game with \`${amount}\` multiple choice questions about \`${category === 'any' ? 'any' : categories[category - 9]}\` with \`${difficulty}\` difficulty.`);

    //Type now defaults to multiple choice. Users can do a true/false one with `t.tf/truefalse/boolean`
    let url = 'https://opentdb.com/api.php?type=multiple'
    if(category > 8) url += `&category=${category}`
    if(difficulty !== 'any') url += `&difficulty=${difficulty}`
    if(amount === 'endless'){
      const c = await count(category);
      const m = await max();
      url += `&amount=${category > 8 ? c : m}`
    }else
      url += `&amount=${amount}`

    console.log(`Multiplayer trivia game started by ${msg.author.tag}. Request URL: ${url}`);

    let body = JSON.parse((await get(url)).text)

    if(body.response_code != 0) return msg.reply(errors[body.response_code - 1])

    const res = body.results;

    let points = 0;

    addUserIfNotExists(msg.author.id);

    for(const r of res){
      let answers = r.incorrect_answers;
      answers.push(r.correct_answer);
      answers = this.shuffle(answers);

      const correct = answers.indexOf(r.correct_answer) + 1;

      //decode here so we don't have to do it again once the collector ends
      answers = answers.map(a => `${answers.indexOf(a) + 1}. ${decode(a)}`);

      let embed = new RichEmbed()
                      .setTitle('You have two tries and 30 seconds to answer.')
                      .addField(decode(r.question), answers.join('\n'))
                      .setColor('RANDOM')
                      .setFooter(`Category: "${r.category}" with difficulty ${r.difficulty}. Question ${res.indexOf(r) + 1}/${amount}. Type "quit" to quit or "skip" to skip the question.`)
      await msg.channel.send(embed);
      let tries = 0;
      //underscores look cool
      const _quit = await new Promise((resolve, reject) => {
        const collector = msg.channel.createMessageCollector(m => ['1', '2', '3', '4', 'quit', 'skip'].includes(m.content), { time: 30000 });

        collector.on('collect', m => {
          if(m.content.toLowerCase() === 'quit' && m.author.id == msg.author.id){
            collector.stop('quit')
          }else if(m.content.toLowerCase() === 'skip' && m.author.id == msg.author.id){
            collector.stop('skip')
          }else if(parseInt(m.content) === correct){
            addUserIfNotExists(m.author.id);
            addPoint(m.author.id);
            points++;
            collector.stop('correct')
          }else{
            tries++;
            if(tries >= 2) collector.stop('incorrect')
            else m.reply(`Incorrect. You have 1 more attempt.`);
          }
        });
        collector.on('end', (collected, reason) => {
          if(reason === 'correct')
            msg.say(`${collected.map(c => c.author.toString()).join(', ')} Correct! The answer was _**${answers[correct - 1]}**_.`)
          else if(reason === 'incorrect')
            msg.say(`${collected.map(c => c.author.toString()).join(', ')} No more attempts! The correct answer was _**${answers[correct - 1]}**_.`)
          else if(reason === 'time')
            msg.say(`${collected.map(c => c.author.toString()).join(', ')} Time! The correct answer was _**${answers[correct - 1]}**_.`)
          else if(reason === 'quit'){
            msg.reply('Trivia game cancelled.')
            return resolve(1);
          }else if(reason === 'skip'){
            if(amount === 1){
              msg.reply(`Ending the game. The answer was **${answers[correct - 1]}**.`);
              return resolve(1)
            }
            msg.reply(`Skipping the question. The answer was **${answers[correct - 1]}**.`);
            return resolve(2);
          }
          
          resolve(0)
        });
      });

      if(_quit === 1) break;
      else if(_quit === 2) continue;
    }
    if(amount !== 1) return msg.reply(`The game is over! Out of ${amount} questions, ${points} points were scored between all players. ${(points >= amount / 2) ? 'Good job!' : 'Better luck next time!'}`)
  }

  shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
}
