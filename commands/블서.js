const config = require('../config.json');
const { ERBS } = require('../config.json');
const request = require('request');
const urlencode = require('urlencode');
const nodeHtmlToImage = require('node-html-to-image')
const Sequelize = require('sequelize');
const fs = require("fs");

const tierName={
	99:"언 랭",
	0:"아이언 서브젝트 Ⅳ",
	1:"아이언 서브젝트 Ⅲ",
	2:"아이언 서브젝트 Ⅱ",
	3:"아이언 서브젝트 Ⅰ",
	4:"브론즈 서브젝트 Ⅳ",
	5:"브론즈 서브젝트 Ⅲ",
	6:"브론즈 서브젝트 Ⅱ",
	7:"브론즈 서브젝트 Ⅰ",
	8:"실버 서브젝트 Ⅳ",
	9:"실버 서브젝트 Ⅲ",
	10:"실버 서브젝트 Ⅱ",
	11:"실버 서브젝트 Ⅰ",
	12:"골드 서브젝트 Ⅳ",
	13:"골드 서브젝트 Ⅲ",
	14:"골드 서브젝트 Ⅱ",
	15:"골드 서브젝트 Ⅰ",
	16:"플래티넘 서브젝트 Ⅳ",
	17:"플래티넘 서브젝트 Ⅲ",
	18:"플래티넘 서브젝트 Ⅱ",
	19:"플래티넘 서브젝트 Ⅰ",
	20:"다이아 서브젝트 Ⅳ",
	21:"다이아 서브젝트 Ⅲ",
	22:"다이아 서브젝트 Ⅱ",
	23:"다이아 서브젝트 Ⅰ",
	24:"데미갓 Ⅳ",
	25:"데미갓 Ⅲ",
	26:"데미갓 Ⅱ",
	27:"데미갓 Ⅰ",
	28:"이터니티 Ⅳ",
	29:"이터니티 Ⅲ",
	30:"이터니티 Ⅱ",
	31:"이터니티 Ⅰ",
}

module.exports = {
	name: '블서',
	description: 'Search for Eternal Return achievements.',
	execute(message, client) {
		const messageArray = message.content.slice(config.prefix.length).split(/\s+/);
		if(messageArray.length > 3){
			sendLoginDiscord(client,`이름 : ${message.author.username}, 명령어 오류 in ${message.guild.name}`)
			console.log(`이름 : ${message.author.username}, 명령어 오류 in ${message.guild.name}`)
			message.reply('```diff\n+명령어 사용법이 잘못되었습니다.```')
		} else {
			const name = messageArray[1]
			const mode = messageArray[2]
			let modeCode = 1;
			if(mode == '솔로'){
				modeCode = 1;
			}else if(mode == '듀오'){
				modeCode = 2;
			}else if(mode == '스쿼드'){
				modeCode = 3;
			}else{
				modeCode = 1;
			}
			request({
				url: ERBS.baseURL + "user/nickname?query=" + encodeURI(name),
				headers:{"x-api-key":ERBS.API_TOKEN}
			},function (error,response,body){
				if(!error && response.statusCode ==200){
					const json =JSON.parse(body);
					if(json.code == 200){
						const userNum = json.user.userNum;
						request({
							url: ERBS.baseURL +"user/stats/" + userNum +"/1",
							headers:{"x-api-key":ERBS.API_TOKEN}
						},async function (error,response,body) {
							const json1 = JSON.parse(body);
							if(json1.code == 200) {
								let idx = json1.userStats.findIndex(function (item, idx) {
									return item.matchingTeamMode == modeCode;
								});
								if (idx == -1) {
									idx = 0;
								}
								const userinfo = {
									"mmr": json1.userStats[idx].mmr,
									"userName": name
								}
								const len = userinfo.mmr.toString().length;
								let tierNum, score;
								if (userinfo.mmr == 0) { //언랭
									tierNum = 99;
									score = 0;
								} else if (len < 3) { //아이언4
									tierNum = 0;
									score = userinfo.mmr;
								} else if (len == 3) {
									tierNum = userinfo.mmr.toString().substr(0, 1);
									score = userinfo.mmr.toString().substr(1, 2);
								} else if (len == 4) {
									tierNum = userinfo.mmr.toString().substr(0, 2);
									score = userinfo.mmr.toString().substr(2, 2);
								}

								let tier;
								if (tierNum == 99) {
									tier = 0;
								} else if (tierNum < 4) {
									tier = 1;
								} else if (tierNum < 8) {
									tier = 2;
								} else if (tierNum < 12) {
									tier = 3;
								} else if (tierNum < 16) {
									tier = 4;
								} else if (tierNum < 20) {
									tier = 5;
								} else if (tierNum < 24) {
									tier = 6;
								} else if (tierNum < 28) {
									tier = 7;
								} else if (tierNum < 32) {
									tier = 8;
								}
								let modeName;
								if (json1.userStats[idx].matchingTeamMode == 1) {
									modeName = '솔 로'
								} else if (json1.userStats[idx].matchingTeamMode == 2) {
									modeName = '듀 오'
								} else if (json1.userStats[idx].matchingTeamMode == 3) {
									modeName = '스쿼드'
								}
								let id = getRandomInt(100000, 999999);

								const image = fs.readFileSync('./img/tier/' + tier + '.png');
								const base64Image = new Buffer.from(image).toString('base64');
								const dataURI = 'data:image/jpeg;base64,' + base64Image

								await nodeHtmlToImage({
									output: './bserData/' + id + '.png',
									html: `
									<!doctype html>
									<html>
									
									<head>
									  <meta charset="utf-8">
									  <title></title>
									
									  <link rel="stylesheet" href="./css/normalize.css">
									  <link rel="stylesheet" href="{{mainCss}}">
									  <style>
											*{
											  margin:0px;
											  padding: 0px;
											  color:white;
											  box-sizing: border-box;
											}
											html{
											  line-height: 1.15; /* 1 */
											}
											body{
											  background-image: url("https://i.imgur.com/qvyFWaU.png");
											  background-repeat: no-repeat;
											  height: 335px;
											  width: 600px;
											}
											
											.header{
											  height: 40px;
											  border-bottom: 2px solid rgb(79,79,79);
											}
											.header::after{
											  width:40px;
											  height: 8px;
											  background: rgb(79,79,79);
											  position: absolute;
											}
											.header_title{
											  line-height: 40px;
											  margin-left: 60px;
											  font-size: 15px;
											  font-weight: bold;
											}
											.container{
											  height: 335px;
											  width: 600px;
											}
											.left-Side{
											  float:left;
											  height:335px;
											  width: 229px;
											
											}
											.ls-tierImg{
											  display: inline-block;
											  margin-top:58px;
											  margin-bottom: 28px;
											  width:230px;
											}
											.tierImg{
											  margin:auto 53px;
											}
											.ls-tierName{
											  font-weight: bold;
											  font-size: 18px;
											  margin:5px auto;
											  text-align: center;
											  color:rgb(225,248,173);
											}
											.ls-tierMmr{
											  font-size: 15px;
											  margin:5px auto;
											  text-align: center;
											  color:rgb(230,232,232);
											}
											.right-Side{
											  float:left;
											  width:371px;
											  height: 335px;
											}
											.top_card_container,.card_container
											{
											  width: 220px;
											  display:flex;
											  flex-direction: row;
											}
											
											.card_container{
											  width: 330px;
											
											}
											
											.data-container{
											  width: 330px;
											  margin: auto 20px;
											}
											.top{
											  width: 330px;
											  display:flex;
											  flex-direction: row;
											}
											
											.avrg{
											  width: 110px;
											  height: 42px;
											  margin: 10px 10px;
											  display: inline-block;
											}
											
											.avrg_rank{
											  font-size: 12px;
											}
											
											.avrg_rank_value{
											  font-size: 45px;
											}
											
											.middle,.bottom{
											  width: 330px;
											}
											
											.mode{
											  margin:5px auto;
											  text-align: center;
											  line-height:15px;
											  font-size: 15px;
											  width:330px;
											  height: 20px;
											  border-bottom: 2px solid rgb(182,126,49);
											}
											
											.avrg_right{
											  display: inline-block;
											}
											
											.card{
											  margin:10px auto;
											  height: 40px;
											  width:110px;
											  display:inline-block;
											}
											
											.line_header{
											  background-color: rgb(79,79,79);
											  opacity: 0.5;
											  width: 330px;
											  height: 25px;
											}
											.line_header_text{
											  margin-left: 8px;
											  line-height: 25px;
											  font-size: 12px;
											  font-weight: bold;
											  color:rgb(130,180,190);
											}
											
											.option_name{
											  line-height: 12px;
											  font-size: 12px;
											  font-weight: bold;
											  color:rgb(97,97,97)
											}
											.option_value{
											  margin-top:8px;
											  line-height: 20px;
											  font-size: 20px;
											}
											
											.isTop{
											  width: 220px;
											}
	
									  </style>
									</head>
									
									<body>
									  <div class="container">
										<div class="left-Side">
										  <div class="ls-tierImg"><img class="tierImg" src="{{imageSource}}" align="center" width="124px"></div>
										  <div class="ls-tierName">`+tierName[tierNum]+`</div>
										  <div class="ls-tierMmr">LP `+score+`</div>
										</div>
										<div class="right-Side">
											<div class="header">
											  <p class="header_title">`+ name +` 전투 통계</p>
											</div>
											<div style="position: absolute; top: 32px; height: 8px; width:30px; background-color:rgb(79,79,79);"></div>
											<div style="position: absolute; top: 32px; left:259px; border-top: 8px solid transparent; border-left: 15px solid rgb(79,79,79); "></div>
											<div style="position: absolute; top: 28px; width:13px; border-top: 2px solid rgb(182, 126, 49)"></div>
											<p class="mode">` + modeName + `</p>
										  <div class="data-container">
											<div class="top">
											  <div class="avrg">
												<p class="avrg_rank">평균 순위</p>
												<p class="avrg_rank_value">`+json1.userStats[idx].averageRank.toFixed(1)+`</p>
											  </div>
											  <div class="avrg_right">
												<div class="line_header isTop">
												  <p class="line_header_text">플레이</p>
												</div>
												<div class="card_container isTop">
												  <div class="card">
													<p class="option_name">플레이 횟수</p>
													<p class="option_value">`+json1.userStats[idx].totalGames+`</p>
												  </div>
												  <div class="card">
													<p class="option_name">승리 횟수</p>
													<p class="option_value">`+json1.userStats[idx].totalWins+`</p>
												  </div>
												</div>
											  </div>
											</div>
									
											<div class="middle">
											  <div class="line_header">
												<p class="line_header_text">평균</p>
											  </div>
											  <div class="card_container">
												<div class="card">
												  <p class="option_name">평균 킬</p>
												  <p class="option_value">`+json1.userStats[idx].averageKills.toFixed(1)+`</p>
												</div>
												<div class="card">
												  <p class="option_name">평균 어시스트</p>
												  <p class="option_value">`+json1.userStats[idx].averageAssistants.toFixed(1)+`</p>
												</div>
												<div class="card">
												  <p class="option_name">평균 야생동물 사냥</p>
												  <p class="option_value">`+json1.userStats[idx].averageHunts.toFixed(1)+`</p>
												</div>
											  </div>
											</div>
									
											<div class="bottom">
											  <div class="line_header">
												<p class="line_header_text">상위권 비율</p>
											  </div>
											  <div class="card_container">
												<div class="card">
												  <p class="option_name">Top 1</p>
												  <p class="option_value">`+json1.userStats[idx].top1.toFixed(1)*100+`%</p>
												</div>
												<div class="card">
												  <p class="option_name">Top 2</p>
												  <p class="option_value">`+json1.userStats[idx].top2.toFixed(1)*100+`%</p>
												</div>
												<div class="card">
												  <p class="option_name">Top 3</p>
												  <p class="option_value">`+json1.userStats[idx].top3.toFixed(1)*100+`%</p>
												</div>
											  </div>
											</div>
										  </div>
										</div>
									  </div>
									</body>
									
									</html>	
									`,
									content: {imageSource: dataURI}
								})
									.then(() => console.log(`이름 : ${message.author.username}, 전적 이미지생성 완료 in ${message.guild.name}`))
									.catch(console.error);

								sendLoginDiscord(client, `이름 : ${message.author.username}, 전적검색 성공 in ${message.guild.name}`);
								message.reply({files: ['./bserData/' + id + '.png']})
									.then(() => console.log(`이름 : ${message.author.username}, 전적검색 성공 in ${message.guild.name}`))
							}
							else{
								sendLoginDiscord(client,`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`)
								console.log(`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`)
								message.reply('```diff\n+정보를 찾을수 없습니다.\n+플레이 기록이 없습니다..```')
							}
							});
						}
						else
						{
							sendLoginDiscord(client,`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`)
							console.log(`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`)
							message.reply('```diff\n+정보를 찾을수 없습니다.\n+닉네임이 맞는지 확인해주세요.```')
						}
					}
			});
		}
    }
};

function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
	return Math.floor(Math.random() * (max - min)) + min;
}

function sendLoginDiscord(client,log){
	client.guilds.cache.get('700801242284294325').channels.cache.get('706819268133519410').send("```diff\n-" +log + "```");
}
