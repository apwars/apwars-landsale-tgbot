const TelegramBot = require('node-telegram-bot-api');
const TG = require('telegram-bot-api')
const ABI = require('./APWarsWorldManager.json');
const Web3 = require('web3');
const fs = require('fs');

require('dotenv').config();

let web3 = new Web3(process.env.RPC_URL);

const smc = new web3.eth.Contract(ABI, process.env.SMART_CONTRACT);
const bot = new TelegramBot(process.env.TOKEN, { polling: true });

const api = new TG({
  token: process.env.TOKEN
})

smc.events.NewLandPrice({}, () => { }).on('data', (event) => {
  console.log("NEW EVENT");

  try {
    let foundationType = '';

  switch (event.returnValues.foundationType) {
    case '1':
      foundationType = 'Land';
      break;
    case '62':
      foundationType = 'Village';
      break;
    case '60':
      foundationType = 'Market';
      break;
    case '58':
      foundationType = 'Temple';
      break;
    case '61':
      foundationType = 'Hideout';
      break;
    case '59':
      foundationType = 'Watchtower';
      break;
    case '38':
      foundationType = 'Clan';
      break;
  };

  const photos = {};
  const sentences = {};

  photos['1'] = './images/land.png';
  photos['58'] = './images/temple.png';
  photos['59'] = './images/tower.png';
  photos['62'] = './images/village.png';
  photos['60'] = './images/market.png';
  photos['61'] = './images/hideout.png';

  sentences['1'] = 'Hooray! You are a conqueror';
  sentences['58'] = 'You are a preacher now and can start to evangelize. Amen!';
  sentences['59'] = 'You are an active military leader and can provide protection now.';
  sentences['62'] = 'You started your civilization.';
  sentences['60'] = 'You are a trader now and exchange culture in the form of goods.';
  sentences['61'] = 'Hide and seek! You are a military planner now.';

  const address = event.returnValues.sender.slice(0, 4) + '...' + event.returnValues.sender.slice(-4);

  api.sendPhoto({
    chat_id : parseInt(process.env.GROUP_ID),
    caption: `Congrats to ${address}, the owner of a new ${foundationType}!
${sentences[event.returnValues.foundationType]}

Map position: (${event.returnValues.x}, ${event.returnValues.y})
${event.returnValues.foundationType === 1 ? `Price:  ${parseFloat(web3.utils.fromWei(event.returnValues.currentPrice)).toFixed(2)} wLAND` : ''}
Next price for a land in this region: ${parseFloat(web3.utils.fromWei(event.returnValues.newPrice)).toFixed(2)} wLAND

If you want to be conqueror, go to: app.apwars.farm
      `,
      photo: fs.createReadStream(photos[event.returnValues.foundationType])
    }); 
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  
  if (chatId !== parseInt(process.env.GROUP_ID)) {
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Go to @apwars and learn more about APWars');
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
});

const test = async () => {
  const w = await smc.methods.getLandPriceByRegion(1, 1).call();
  console.log(w.toString());
}

test();