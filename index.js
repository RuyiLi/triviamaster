const { ShardingManager } = require('discord.js');
const { token } = require('./config');
const manager = new ShardingManager('./bot.js', { token });

manager.spawn();
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));

/**
const http = require('http');
const { addPoint, addUserIfNotExists } = require('./commands/sql');

http.createServer((req, res) => {
    if(req.method === 'POST' && req.headers['authorization'] === 'myanimelist.net/animelist/_ryuusora'){
        let body = [];
        req.on('error', (err) => console.error(err))
            .on('data', (chunk) => { body.push(chunk); })
            .on('end', async () => {
                body = JSON.parse(Buffer.concat(body).toString());
                const { user, type } = body;
                await new Promise((_, __) => addUserIfNotExists(user));
                addPoint(user, 50);
                await manager.broadcastEval(`if(this.users.has('${user}')) this.users.get('${user}').send('Thanks for voting! You've received 50 trivia points as a reward.')`)
                await manager.broadcastEval(`if(this.guilds.has('316593660135342082')) if(this.guilds.get('316593660135342082').members.has('${user}')) this.guilds.get('316593660135342082').members.get('${user}').addRole('397451657849470976')`)
            });
    }
}).listen(2002)
**/