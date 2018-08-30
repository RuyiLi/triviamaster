const { Command } = require('discord-akairo');
const sqlite = require('sqlite')

module.exports = class SQL extends Command{
  constructor(){
    super('sql', {
      aliases: ['sql'],
      split: 'none',
      ownerOnly: true,
      args: [
        {
          id: 'query',
          type: 'string'
        }
      ]
    })
  }

  async exec(msg, args){
    const { query } = args;
    const db = await sqlite.open('db.sqlite')
    db.exec(query);
    return msg.say('Ok')
  }
}

module.exports.addUserIfNotExists = async function(id){
  const db = await sqlite.open('db.sqlite')
  let asdf = await db.get(`SELECT * FROM users WHERE userId=${id};`)
  if(typeof asdf === 'undefined'){
    db.exec(`INSERT INTO users VALUES (${id}, 0);`);
    console.log(`Successfully added user to database with id ${id}`)
  }
}

module.exports.addPoint = async function(id, amount = 1){
  const db = await sqlite.open('db.sqlite')
  try{
    let res = await db.get(`SELECT * FROM users WHERE userId=${id};`);
    db.exec(`UPDATE users SET userId=${id}, points=${res.points + amount} WHERE userId=${id};`);
    console.log(`Successfully gave user with id ${id} a point.`)
  }catch(err){
    console.log(err);
  }
}
