const { Command } = require('discord-akairo');
const { mixpanel } = require('../bot');

module.exports = class Commands extends Command{
  constructor(){
    super('commands', {
      aliases: ['commands']
    })
  }

  exec(msg){
    mixpanel.track("Commands");
    let commands = '**t.rivia** (mc, multiple, multiplechoice, trivia)\n_Arguments: category, difficulty, amount_\nStarts a multiple choice trivia game.'
    commands += '\n\n**t.multi** (multiplayer)\n_Arguments: category, difficulty, amount_\nStarts a multiplayer multiple choice trivia game.'
    commands += '\n\n**t.tf** (boolean, truefalse)\n_Arguments: category, difficulty, amount_\nStarts a true/false trivia game.'
    commands += '\n\n**t.quiz** (jeopardy, j)\n_Arguments: amount_\nStarts a jeopardy trivia game.'
    commands += '\n\n**t.categories**\nReturns a list of available categories for use in trivia games.'
    commands += '\n\n**t.count**\n_Arguments: category_\nReturns the question count of the specified category.'
    commands += '\n\n**t.help**\nReturns some statistics and information about the bot.'
    commands += '\n\n**t.invite**\nReturns a link to invite the bot to your server and an invite link to the official Discord server.'
    commands += '\n\n**t.ping**\nReturns the client and heartbeat ping of the bot.'
    commands += '\n\n**t.points**\n_Arguments: user_\nReturns the specified user\'s trivia points, or the user who ran the command\'s trivia points if there is none specified.'
    commands += '\n\n**t.prefix**\n_Arguments: newPrefix_\nReturns the prefix that the guild the command was run on is using with TriviaMaster. If [newPrefix] is specified, this command will change the prefix instead.'
    commands += '\n\n**t.top** (leaderboards)\n_Arguments: pageNumber_\nReturns a list of the top ten users, or the top users on a specified page.'
    commands += '\n\n**t.topGuild** (guildLeaderboards)\n_Arguments: pageNumber_\nReturns a list of the top ten users in the guild that the command was run on, or the top users on a specified page.'
    commands += '\n\n**t.upvote** (up)\nReturns some information about upvoting.'
    msg.author.send(commands).then(m => msg.reply("I've sent you a DM with all of my commands.")).catch(err => msg.reply('your DMs are disabled, so the command list will be sent here:\n' + commands))
  }
}
