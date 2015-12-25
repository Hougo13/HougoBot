var DiscordClient = require('discord.io');
var fs = require('fs');
var id3 = require('id3js');
var path = require('path');
var config = require('./bot.json');

var email = config[0]['email'];
var password = config[0]['password'];
var textChan = config[1]['textChan'];
var voiceChan = config[1]['voiceChan'];
var musicDir = config[2]['musicDir'];
var songs = walkSync(musicDir);
var d = new Date();
var stopped = true;
var notifs = [];
var currentSong;
var botID;

var bot = new DiscordClient({
	email: email,
	password: password,
	autorun: true
});

bot.on('ready', function(rawEvent) {
    botID = bot.id;
    console.log(bot.username + " - (" + botID + ")");
		clearChannel(textChan);
		join(voiceChan, play);
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
	switch(message){
		case "!play":
			play();
			bot.deleteMessage({
				channel: channelID,
				messageID: rawEvent.d.id
			});
			break;
		case "!stop":
			bot.deleteMessage({
				channel: channelID,
				messageID: rawEvent.d.id
			});
			stop();
			break;
		case "!skip":
			skip();
			bot.deleteMessage({
				channel: channelID,
				messageID: rawEvent.d.id
			});
			break;
		case "!halt":
			halt();
			bot.deleteMessage({
				channel: channelID,
				messageID: rawEvent.d.id
			});
			break;
		default:
			if (userID != botID && channelID == textChan) {
				bot.deleteMessage({
					channel: channelID,
					messageID: rawEvent.d.id
				});
			}
	}
});

function play() {
  var rand;
  var title;
  var artist;
  stopped = false;
	bot.testAudio({ channel:voiceChan , stereo: true}, function(stream) {
		rand = Math.floor(Math.random() * songs.length);
		currentSong = songs[rand];
		stream.playAudioFile( songs[rand]);
		id3({ file: currentSong, type: id3.OPEN_LOCAL }, function(err, tags) {
			title = tags['title'];
			artist = tags['artist'];
			console.log("Playing " + title + " - " + artist);
			notif(textChan, "Playing *" + title + "* - ***" + artist + "***");
		});
		stream.once('fileEnd',function(){
			if(!stopped){
				setTimeout(function(){
					notifes = clear(textChan, notifs);
					play();
				}, 5000);
			}
		});
	});
}

function stop(){
  bot.testAudio({ channel:voiceChan , stereo: true}, function(stream) {
		stopped = true;
		setTimeout(function(){ stream.stopAudioFile();},1000);
	});
	clearChannel(textChan);
}

function skip() {
  stop();
  setTimeout(function(){
    play();
  },2000);
}

function join(channelID, callback){
	bot.joinVoiceChannel(channelID, function(){
		console.log("Connected to " + channelID);
    if (callback) {
      callback();
    }
	});
}

function halt() {
	stop();
	setTimeout(function(){
		process.exit();
	},5000);
}

function notif(channelID, msg) {
	bot.sendMessage({
		to: channelID,
		message: msg,
	}, function(res){
		notifs.push(res.id);
	});
}

function clearChannel(channelID) {
  bot.getMessages({
	    channel: channelID,
	}, function(messageArr) {
		for (var i in messageArr) {
			bot.deleteMessage({
				channel: channelID,
				messageID: messageArr[i]['id']
			});
		}
	});
}

function clear(channelID, msgList){
	for (var i in msgList) {
		bot.deleteMessage({
			channel: channelID,
			messageID: msgList[i]
		});
		msgList.splice(i,1);
	}
	return msgList;
}

function walkSync(dir) {
  var files = fs.readdirSync(dir);
  var filelist= [];
  files.forEach(function(file) {
    if (fs.statSync(dir + "/" + file).isDirectory()) {
      filelist = filelist.concat(walkSync(dir + '/' + file, filelist));
    }
    else if (path.extname(dir + "/" + file) == '.mp3') {
      filelist.push(dir + "/" + file);
    }
  });
  return filelist;
};
