const axios = require("axios");

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(text, retry = 3) {
  try {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML"
    });
  } catch (err) {
    if (retry > 0) {
      console.log("Retry gửi Telegram...");
      await new Promise(r => setTimeout(r, 2000));
      return sendTelegram(text, retry - 1);
    }
    console.error("Gửi Telegram thất bại:", err.message);
  }
}

module.exports = sendTelegram;