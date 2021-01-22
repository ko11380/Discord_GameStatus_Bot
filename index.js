const { prefix, token } = require('./config.json');
const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./struct/Client.js');
const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Online ${client.guilds.cache.size} Guilds`);
    console.log('---JOIN LIST---');
    const guildNames = client.guilds.cache.map(g => g.name).join("\n")
    console.log(guildNames);
    console.log('---------------');
    client.user.setActivity('봇 추가 원하시면 봇에게 DM', { type : 'PLAYING'});
});

client.on('message', message => {
    if(message.channel.type === "dm" && !message.author.bot){
        message.reply("https://discord.gg/chAVSea");
    }
    if(!message.content.startsWith(prefix)) return; //명령어로 시작하지않거나 dm일경우 무시
    if (message.author.bot) return; //다른 봇 무시

    const args = message.content.slice(prefix.length).split(/\s+/);
    const commandName = args[0];
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return; //message.reply("```diff\n-없거나 사용할 수 없는 명령어입니다.\n!전적 -> !워존 으로 명령어 변경되었습니다.```");

    try{
        var timestamp = new Date().getTime();
        const logs = "["+ new Date(timestamp) + "] / " + "명령어 실행 : " + message.content + " / 명령어 요청자 : " + message.author.username + " / 위치 : "+ message.guild.name;
        client.guilds.cache.get('700801242284294325').channels.cache.get('706819268133519410').send("```" + logs + "```");
        console.log(logs);
        command.execute(message, client);
    }
    catch(error){
        console.error(error);
        message.reply('```diff\n-잘못된 명령어.```');
    }
});

client.login(token);
