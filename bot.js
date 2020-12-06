const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const token = "1423055464:AAGkEeD8xwKcuWZg4hZ68Ko1MgGiK7V0MBs";
const chatId = "@cryptocurrency_prices";
const bot = new TelegramBot(token, { polling: true });
const URL = "https://binance.com/api/v3/ticker/price";
const time = 60000;

const taapi = require("taapi");
const client = taapi.client("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV2Z2VuaXk4NzA1QGdtYWlsLmNvbSIsImlhdCI6MTYwNzE4MTE0MSwiZXhwIjo3OTE0MzgxMTQxfQ.CA6fW6K1_wrhWIvAOfC_xn1tyZtwlGGnu7kRLOmkyGk");

let symbols;
let messagesId = [];
let rsi = {};

let intervalSendMessage = setInterval(() => {
  fetch(URL).then(response => response.json()).then(data => {
    symbols = data.filter(item => {
      if (item.symbol == "ETHUSDT" || item.symbol == "BTCUSDT" || item.symbol == "BNBUSDT") {
        return true;
      }
    });
  }).then(async () => {
    await client.getIndicator("rsi", "binance", "BTC/USDT", "30m").then(result => {
      rsi["btc"] = result.value;
    });

    await client.getIndicator("rsi", "binance", "ETH/USDT", "30m").then(result => {
      rsi["eth"] = result.value;
    });

    await client.getIndicator("rsi", "binance", "BNB/USDT", "30m").then(result => {
      rsi["bnb"] = result.value;
    });
  }).then(() => {
    bot.sendMessage(chatId, `
<code><b>BTC/USDT</b></code>
Price - <b>${(+symbols[0].price).toFixed(2)}</b>
RSI (30m) - ${(+rsi["btc"]).toFixed(2)}
  
<code><b>ETH/USDT</b></code>
Price - <b>${(+symbols[1].price).toFixed(2)}</b>
RSI (30m) - ${(+rsi["eth"]).toFixed(2)}
  
<code><b>BNB/USDT</b></code>
Price - <b>${(+symbols[2].price).toFixed(4)}</b>
RSI (30m) - ${(+rsi["bnb"]).toFixed(2)}
    `, {
      parse_mode: "HTML"
    }).then(message => {
      messagesId.push(message.message_id);
    }).then(() => {
      // console.log(messagesId); // debug
    });
  });
}, time);

let intervalDeleteMessages = setInterval(() => {
  for (let i = 0; i < messagesId.length; i += 1) {
    bot.deleteMessage(chatId, messagesId[i]);
  }

  messagesId = [];
}, time * 50);
