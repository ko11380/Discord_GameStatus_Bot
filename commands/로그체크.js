module.exports = {
	name: '로그체크',
	description: 'out put log file',
	execute(message, client) {
		if(message.channel.id === '706805415333330954'){
        message.reply({ files: ['/home/ko87094323/.forever/Logging.log'] })
            .then(() => console.log(`이름 : ${message.author.username}, 로그파일 OUT in ${message.guild.name}`))
			.catch(console.error);
		}
    }
};