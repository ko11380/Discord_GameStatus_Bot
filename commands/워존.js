const config = require('../config.json');
const idjson = require('./loginid.json');
const request = require('request');
var urlencode = require('urlencode');
const nodeHtmlToImage = require('node-html-to-image')
var loginidcount = "1";
const j = request.jar();

const Sequelize = require('sequelize');

getLoginCookie();

const sequelize = new Sequelize(config.database, config.db_id, config.db_pw, {
	host: config.db_host,
	dialect: 'mariadb',
    logging: false,
    dialectOptions: {
        timezone: "Etc/GMT+9"
    }
});

const Tags = sequelize.define('wz_status', {
	user_id: Sequelize.STRING,
	user_name: Sequelize.STRING,
});

Tags.sync();

module.exports = {
    name: '워존',
	description: 'Search for Warzone achievements.',
	async execute(message, client) {
        const messageArray = message.content.slice(config.prefix.length).split(/\s+/);
        const temp = makeNameMode(messageArray);
        const uid = message.member.id;

        if(messageArray.length == 2){
            cheackDB(client,message,uid,temp);
        }
        else if(messageArray.length >= 3 && messageArray.length <= 4){
            if(messageArray[1] == '등록')
            {
                try{
                const [user, created] = await Tags.findOrCreate({
                    where: {user_id:uid},
                    defaults:{user_name:temp}
                  });
                        if (created) {
                            sendLoginDiscord(client,`이름 : ${message.author.username}, 닉네임 : ${temp} 등록 완료 in ${message.guild.name}`);
                            console.log(`이름 : ${message.author.username}, 닉네임 : ${temp} 등록 완료 in ${message.guild.name}`);
                            return message.reply('```diff\n+등록 완료되었습니다.```');
                        }else{
                            updateDB(client,message,uid,temp);
                        }
                    
                }
                catch(error){
                    sendLoginDiscord(client,'등록 명령어 에러');
                    console.log(error);
                }
            }else{
                //통상 전적검색 요청
                sattusCardCR(client,message,temp[0],temp[1]);
            }
        }
        else{
            message.reply("```diff\n-명령어의 사용법이 잘못되었습니다.```");
        }
    }
};

function makeNameMode(messageArray){
    let username;
    let mode;
    if(messageArray[1] == '등록')
    {
        if (messageArray.length >= 4) {
            let tmp = messageArray[2] + ' ' + messageArray[3];
            username = tmp;
        }else{
            username = messageArray[2];
        } 
        return username;
    }else if(messageArray.length == 2){
        return messageArray[1]; //모드값반환
    }else{
        if (messageArray.length >= 4) {
            let tmp = messageArray[1] + ' ' + messageArray[2];
            username = tmp;
            mode = messageArray[3];
        }else{
            username = messageArray[1];
            mode = messageArray[2];
        }
        return new Array(username,mode);
    }
}
async function updateDB(client,message,id,name){
    const affectedRows = await Tags.update({ user_name : name }, { where: { user_id: id } });
    if (affectedRows > 0) {
        sendLoginDiscord(client,`이름 : ${message.author.username}, 닉네임 : ${name} 수정 완료 in ${message.guild.name}`);
        console.log(`이름 : ${message.author.username}, 닉네임 : ${name} 수정 완료 in ${message.guild.name}`);
        return message.reply('```diff\n+수정 완료되었습니다.```');
    }
}
async function cheackDB(client,message,id,temp){
    const tag = await Tags.findOne({ where: { user_id: id } });
    if(!tag){
        sendLoginDiscord(client,`이름 : ${message.author.username}, 닉네임 : ${temp} 닉네임 등록 안되있음 in ${message.guild.name}`);
        console.log(`이름 : ${message.author.username}, 닉네임 : ${temp} 닉네임 등록 안되있음 in ${message.guild.name}`);
        message.reply("```diff\n-등록된 닉네임이 없습니다.\n!워존 등록 <닉네임>를 통해 등록해주세요```");   
    }else{
        const name =tag.get('user_name');
        sattusCardCR(client,message,name,temp);
    }
}

function sattusCardCR(client,message,origin_username,mode){
        let username = origin_username.split('#');
        let modes;
        let pletform;
        let platforms;
        let id = getRandomInt(100000, 999999);
        
        if(username[1] == undefined){
            console.log(username[1]);
            sendLoginDiscord(client,`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`);
            sendcannotfound(message)
            return;
        }
        pletform = '배틀넷';
        /*
            if (username[1].length > 6) {
                pletform = '엑티비전';
            }
            else if (username[1].length <= 6) {
                pletform = '배틀넷';
            }
            else {
                pletform = 'asdf';
            }
*/
            switch (pletform) {
                case '엑티비전':
                    platforms = 'uno';
                    break;
                case '배틀넷':
                    platforms = 'battle';
                    break;
                default:
                    platforms = 'asdf';
                    break;
            }

            switch (mode) {
                case '전체':
                    modes = 'br_all';
                    break;

                case '배틀로얄':
                    modes = 'br';
                    break;

                case '약탈':
                    modes = 'br_dmz';
                    break;

                default:
                    modes = 'asdf';
                    break;
            }
            if (username[0].length <= 0) {
                console.log("USERNAME ERROR");
            }
            else {
                if (pletform === 'asdf') //배틀코드가 잘되어있는가
                {
                    message.reply('```diff\n-배틀코드가 잘못되었습니다..```');
                }
                else {
                    if (modes === 'asdf') {
                        message.reply('```css\n모드 정보가 잘못되었습니다\n선택가능 모드 => [ 전체, 배틀로얄, 약탈 ] ```');
                    }
                    else {
                                request({ url: 'https://my.callofduty.com/api/papi-client/stats/cod/v1/title/mw/platform/'+  platforms + '/gamer/'+ urlencode(username[0]) +'%23' + username[1] +'/profile/type/mp', jar: j }, async function callback(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        const json = JSON.parse(body);
                                        if (json.data.username === undefined) {
                                            sendLoginDiscord(client,`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`);
                                            sendcannotfound(message)
                                        }
                                        else {
                                            
                                            var winrate = (json.data.lifetime.mode[modes].properties.wins / json.data.lifetime.mode[modes].properties.gamesPlayed) * 100;
                                            var sskill = json.data.lifetime.mode[modes].properties.kills / json.data.lifetime.mode[modes].properties.gamesPlayed;
                                            var ssScore = json.data.lifetime.mode[modes].properties.score / json.data.lifetime.mode[modes].properties.gamesPlayed;
                                            var scocore = json.data.lifetime.mode[modes].properties.score;
                                            await nodeHtmlToImage({
                                                output: './data/' + id + '.png',
                                                html: `
                                    <!DOCTYPE html>
                                    <html>
                                    
                                        <head>
                                            <meta charset="utf-8">
                                            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
                                            <link rel="stylesheet" href="https://apex.tracker.gg/Content/trndesign/main.min.css?v=abc@SiteSettings.BootTime.Ticks">
                                            <style>
                                                @font-face {
                                                    font-family: 'MWfont';
                                                    src: url('src/ModernWarfare-8MM6z.ttf') format('truetype');
                                                }
                                                body {
                                                    font-family: MWfont;
                                                    width: 600px;
                                                    height: 320px;
                                                }
                                                .wrapper{
                                                    display: grid;
                                                }
                                                .top{
                                                    display: grid;
                                                    height: 80px;
                                                    grid-column:1/5;
                                                    gap:0px;
                                                    grid-template-columns: 21px 253px 71px;
                                                    grid-template-rows: 24px;
                                                }
                                                .back{
                                                    width: 30px;
                                                    grid-row-start: 2;
                                                    grid-row-end:5; 
                                                }
                                                .name{
                                                    color:white;
                                                    font-weight: bold;
                                                    grid-column: 2;
                                                    grid-row:2;
                                                    margin:0;
                                                    text-align: center;
                                                }
                                                .top-top{
                                                    grid-column:1/3;
                                                    margin:0;
                                                }
                                                .top-left{
                                                    grid-column: 1;
                                                    grid-row: 2/3;
                                                    margin:0;
                                                }
                                                .trn-gg-grid{
                                                    display: grid;
                                                    grid-column-gap: 8rem;
                                                }
                                            </style>
                                        </head>
                                    
                                        <body>
                                            <div style="background-image:url(http://egong.kr/bot/bg.png);">
                                                <div class="wrapper" style="width: 600px; height: 320px;">
                                                    <div class="top">
                                                        <div class="top-top"></div>
                                                        <div class="top-left"></div>
                                                        <div class="name">`+ mode + ` / ` + username[0] + `#` + username[1] + `</div>
                                                        
                                                        
                                                    </div>
                                                        <div class="back"></div>
                                                        <div class="trn-gg-grid trn-defstats-grid--col4">
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">매치</div>
                                                                <div class="trn-defstat__value" style="color:white;">` + json.data.lifetime.mode[modes].properties.gamesPlayed + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">K/D</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.kdRatio.toFixed(2) + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">승률</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ winrate.toFixed(1) + "%" + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">평균처치</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ sskill.toFixed(1) + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">승리</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.wins + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">TOP5</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.topFive + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">TOP10</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.topTen + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">TOP25</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.topTwentyFive + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:18px;">킬</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.kills + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:18px;">기절</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.downs + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:18px;">사망</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.deaths + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:18px;">부활</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.revives + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">점수</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ scocore.format() + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">평균점수</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ ssScore.toFixed(0) + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">계약</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.contracts + `</div>
                                                            </div>
                                                            <div class="trn-defstat">
                                                                <div class="trn-defstat__name" style="font-size:16px;">현금</div>
                                                                <div class="trn-defstat__value" style="color:white;">`+ json.data.lifetime.mode[modes].properties.cash + `</div>
                                                            </div>
                                                        </div>
                                                </div>
                                            </div>
                                            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
                                            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
                                        </body>
                                    
                                    </html>
                                    
                                    
                                    `
                                            })
                                            .then(() => console.log(`이름 : ${message.author.username}, 전적 이미지생성 완료 in ${message.guild.name}`))
                                            .catch(console.error);

                                            sendLoginDiscord(client,`이름 : ${message.author.username}, 전적검색 성공 in ${message.guild.name}`);
                                            message.reply({ files: ['./data/' + id + '.png'] })
                                                .then(() => console.log(`이름 : ${message.author.username}, 전적검색 성공 in ${message.guild.name}`))
                                                .catch(console.error);
                                        }
                                    }
                                });
                    }
                }
            }
        

}
function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}
String.prototype.format = function () {
    var num = parseFloat(this);
    if (isNaN(num)) return "0";

    return num.format();
};
Number.prototype.format = function () {
    if (this == 0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
    return n;
};


function sendLoginDiscord(client,log){
    client.guilds.cache.get('700801242284294325').channels.cache.get('706819268133519410').send("```diff\n-" +log + "```");
}


function sendcannotfound(message){
        message.reply('```diff\n전적검색방법\n1. https://www.callofduty.com/ko/ 사이트에 로그인한다.\n2. 계정설정에서 계정연결 탭으로들어간다.\n3. BATTLE.NET 계정을 연동후 아래 링크의 사진과같이 설정한다.\n4. 검색시 엑티비전 닉네임이아닌 연동한 배틀넷 이름과 태그로 검색한다.\n\n[주의사항]\n이미 아래 사진과 같이 설정되어 있었던경우 전부 None으로 변경했다가 다시 사진과같이 재설정하셔야합니다.\n\n[3번 참고사진]\nhttps://i.ibb.co/x1yph8q/11111.png\n\n잘이해가 안되는부분이나 도움이필요하시면 https://discord.gg/chAVSea 에서 #help 게시판 또는 서선유#7777 에게 DM 주세요\n```')
            .then(() => console.log(`이름 : ${message.author.username}, 정보를 찾을수 없음 in ${message.guild.name}`))
            .catch(console.error);
}
function getLoginCookie(){
    const firsturl = 'https://profile.callofduty.com/cod/login';

    request({ url: firsturl, jar: j }, async function () {
        //console.log(j);
        const tkn = j._jar.store.idx['callofduty.com']['/']['XSRF-TOKEN'];
        var xsrf = tkn + "";
        var aktn;
        var rtkn;
        xsrf = xsrf.split(`"`)[0].split(";")[0].split("=")[1];

        const formdata = {
            username: idjson[loginidcount].username,
            password: idjson[loginidcount].password,
            remember_me: 'true',
            _csrf: xsrf
        }
        //console.log("---------------------------------");
        await request.post({ url: 'https://profile.callofduty.com/do_login?new_SiteId=cod', formData: formdata, jar: j }, function (err, httpResponse, body) {
            console.log("워존 전적검색 서버 토큰 획득완료");
        });
    });
};