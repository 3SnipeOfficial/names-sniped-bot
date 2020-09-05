require('dotenv').config();
const Eris = require("eris");
const bot = new Eris(process.env.token);
const puppeteer = require('puppeteer');
const fs = require('fs');
let content;

bot.on("ready", () => {
    console.log("ready!");
});
bot.on("messageCreate", (msg) => {
    if(msg.channel.id == 751301214175625216) {
    	msg.delete('names-sniped-bot: Deleted automatically!');
    	bot.getMessages("736993036319588362", 1000)
			.then((messages)=>{
				if (messages.filter((a)=>a.content.toLowerCase().includes(msg.content.toLowerCase()))[0]) return msg.author.getDMChannel().then((user)=>{user.createMessage('You cannot submit an already submitted name.')}); else {
					let yes = false;
			    	(async () => {
					  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
					  const page = await browser.newPage();
					  await page.goto(`https://namemc.com/profile/${msg.content}.100`);
					  const cookies = [{
					  	'name': 'theme',
					  	'value': 'dark'
					  }];
					  await page.setCookie(...cookies);
					  await page.reload()
					  await page.click('[data-original-title=Discord]');
					  await page.screenshot({path: 'screenshot.png'});
					  const element = await page.$('.text-md-left');
					  let text = await page.evaluate(element => element.innerHTML.split('content="')[1].split('"')[0], element)
					  if (text.includes('3snipe')) {
					  	fs.readFile('./screenshot.png', function read(err, data) {
						    if (err) {
						        throw err;
						    }
						    content = new Buffer(data);

						    embed = {embed: {
					    		title: msg.content,
					    		description: `${msg.author.mention} (${msg.author.id}) has submitted a name. Please identify if this name abides the rules.`
					    		}
					    	};
					        bot.createMessage("751477536625786971", embed, {
					        	file: content,
			  					name: msg.content+".png"
					        })
					        	.then((msg)=>{
					        		msg.addReaction('👍');
					        		msg.addReaction('👎');
					        		msg.addReaction('🚫');
					        	})
						});
					  }
					  await browser.close();
					})();
				}
			})
   	}
});
bot.on("messageReactionAdd", (message, emoji, userId)=>{
	if(message.channel.name != "name-submissions") return;
	if(userId != bot.user.id) {
		if(emoji.name=="👍") {
			bot.createMessage("736993036319588362", `\`${message.embeds[0].title}\` by ${message.embeds[0].description.split(' ')[0]}`, {file: content, name: message.embeds[0].title+".png"})
			message.delete();
			bot.createMessage(message.channel.id, "Sent successfully! A DM has been sent to "+message.embeds[0].description.split(' ')[0]+".");
			bot.getDMChannel(message.embeds[0].description.split('>')[0].split('<@')[1])
				.then((user)=>{	
					user.createMessage(`Your submission for ${message.embeds[0].title} has been approved!`)
						.catch((e)=>{
							bot.createMessage(message.channel.id, "Direct messages are off for "+$message.embeds[0].description.split(' ')[0]+".");
						})
				});
			return;
		} else if (emoji.name=="👎") {
			message.delete();
			bot.createMessage(message.channel.id, `Denied ${message.embeds[0].description.split(' ')[0]}. A DM has been sent to them.`);
			bot.getDMChannel(message.embeds[0].description.split('>')[0].split('<@')[1])
				.then((user)=>{
					user.createMessage(`Your submission for ${message.embeds[0].title} has been denied.`)
						.catch((e)=>{
							bot.createMessage(message.channel.id, "Direct messages are off for "+message.embeds[0].description.split(' ')[0]+".");
						})
				})
			return;
		} else if (emoji.name=="🚫") {
			message.delete();
			bot.createMessage(message.channel.id, `Blocked ${message.embeds[0].description.split(' ')[0]} from posting anymore submissions. A DM has been sent to them.`)
			bot.getDMChannel(message.embeds[0].description.split('>')[0].split('<@')[1])
				.then((user)=>{
					user.createMessage('You have been banned from posting in <#751301214175625216> due to Spam or Abuse.')
						.catch((e)=>{
							bot.createMessage(message.channel.id, "Direct messages are off for "+message.embeds[0].description.split(' ')[0]+".");
						})
				});
			return bot.editChannelPermission("751301214175625216",message.embeds[0].description.split('>')[0].split('<@')[1], "1024","2146957815","member","names-sniped-bot: Abuse/Spam")
		}
	}
});
bot.connect();
