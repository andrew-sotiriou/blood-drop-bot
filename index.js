const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');
const cron = require('cron');
const http = require('http');
const express = require('express');
const app = express();
const { fortunes, eightBall, reminder } = require('./contents.json');

client.on('ready', () => {
    client.user.setActivity("You", {type: "WATCHING"});
    
    const job = cron.job('15 30 15 * * 5', () => sendReminder() );
    job.start();
});

function sendReminder() {
    const chatId = getChatId();
    let generalChannel = client.channels.cache.get(chatId);
    let reminderResponse = reminder[Math.floor(Math.random()*reminder.length)]; 
    const attachment = new Discord.MessageAttachment(reminderResponse);
    generalChannel.send("We jigglin or we jigglin?", {files: [attachment]});
}

function getChatId() {
    let chatId = '';
    client.guilds.cache.forEach((guild) => { 
        guild.channels.cache.forEach((channel) => {
            if (channel.name == "friday-night-links" && channel.type == "text" ){
                chatId = chatId + channel.id;
            }
        })
    });
    return chatId;
}

client.on('message', (receivedMessage) => {
    let checkMention = (receivedMessage.content).split(" ");
    if (receivedMessage.author == client.user) {
        return;
    }
    else if(checkMention[0].indexOf('@') > -1 && receivedMessage.mentions.users.first().username === "Blood Drop Bot"){
      processCommand(receivedMessage);
    }
})

function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content;
  let splitCommand = fullCommand.split(" ");
  let primaryCommand = splitCommand[1] !== '' ?  splitCommand[1] : splitCommand[2];
  let args = splitCommand.slice(2);
  
  switch (primaryCommand) {
    case 'help':
      helpCommand(args, receivedMessage);
      break;
    case '8ball':
      getEightBall(args, receivedMessage);
      break;
    case 'rollbones':
      rollDice(args, receivedMessage);
      break;
    case 'fortune':
      fortuneCookie(args, receivedMessage);
      break;
    case 'insult':
      insult(args, receivedMessage);
      break;
    default:
      receivedMessage.channel.send("I dont know that one. You should try the help command.");
      break;
  }
}

function helpCommand(args, receivedMessage) {
    receivedMessage.channel.send(`Here is what I can do: \n 8ball - ask a question, \n rollbones - will roll 2 6 sided dice OR you can pass a value for side of die (rollbones 8), \n insult - random insult or randomly insult someone like insult @NAME, \n fortune - get your fortune`);
}

function insult(args, receivedMessage) {
    https.get('https://evilinsult.com/generate_insult.php?lang=en&type=json', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let insultObj = JSON.parse(data);
            let name = '';
            if ((args[0] != null || args[0] != undefined) && args[0].indexOf('@') > -1) {
                name = args[0];
            }
            else {
                args.forEach((arg) => {
                    if (arg != "insult") {
                        name = name + arg + ' ';
                    }
                });
                name = name.slice(0, -1);
            }
            receivedMessage.channel.send(name + " " + insultObj.insult); 
        });
    }).on("error", (err) => {
        console.log(`Error: ${err.message}`);
    });
}

function fortuneCookie (args, receivedMessage) {
    let fortune = getFortuneCookieSaying();
    receivedMessage.channel.send(fortune);
}

function getFortuneCookieSaying() {
    return fortunes[Math.floor(Math.random()*fortunes.length)];
}

function rollDice(args, receivedMessage) {
    if (args == 0 || (args[0] == "rollbones" && args[1] == undefined)){
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const diceTotal = die1 + die2;
        receivedMessage.channel.send(`Rolling two six sided dice... \n Die 1 is ${die1} \n Die 2 is ${die2} \n total ${diceTotal}`);
    }
    else if (args[0] == "rollbones" && args[1] != undefined) {
        const die1 = Math.floor(Math.random() * args[1]) + 1;
        const die2 = Math.floor(Math.random() * args[1]) + 1;
        const diceTotal = die1 + die2;
        receivedMessage.channel.send(`Rolling two six sided dice... \n Die 1 is ${die1} \n Die 2 is ${die2} \n total ${diceTotal}`);
    }
    else {
        const die1 = Math.floor(Math.random() * args[0]) + 1;
        const die2 = Math.floor(Math.random() * args[0]) + 1;
        const diceTotal = die1 + die2;
        receivedMessage.channel.send(`Rolling two six sided dice... \n Die 1 is ${die1} \n Die 2 is ${die2} \n total ${diceTotal}`);
    }
}

function getEightBall(args, receivedMessage) {
    if (args == 0 || (args[0] == "8ball" && args[1] == undefined)) {
        receivedMessage.channel.send("What is your question?");
        return;
    }
    else {
        if (args[0] == "8ball") {
            args.shift();
        }
        let question = args.join(" ");
        let eightBallResponse = eightBall[Math.floor(Math.random()*eightBall.length)]; 
        receivedMessage.channel.send(`You asked: ${question} \n Magic 8Ball says: ${eightBallResponse}`);
    }
}

client.login(`${process.env.Token}`);
