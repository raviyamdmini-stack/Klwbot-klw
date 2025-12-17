async function menuCmd(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, {
    image: { url: "https://i.imgur.com/Q6ZQZ9K.jpg" },
    caption:
`🤖 *KLW RANKING BOT*

🏆 .ranking
📅 .daily
🗓️ .weekly
👤 .myrank

👑 Owner: 94778430626`,
    buttons: [
      { buttonId: ".ranking", buttonText: { displayText: "🏆 Ranking" } },
      { buttonId: ".daily", buttonText: { displayText: "📅 Daily" } },
      { buttonId: ".weekly", buttonText: { displayText: "🗓️ Weekly" } }
    ],
    headerType: 4
  });
}
module.exports = { menuCmd };
