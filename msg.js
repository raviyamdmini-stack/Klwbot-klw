const { PREFIX } = require("./config");
const { rankingListener, rankingCmd, myRankCmd } = require("./lib/ranking");
const { menuCmd } = require("./lib/menu");

async function handleMessage(sock, msg) {
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  await rankingListener(msg);

  if (!text.startsWith(PREFIX)) return;

  const cmd = text.slice(1).toLowerCase();

  if (cmd === "menu") return menuCmd(sock, msg);
  if (["ranking","global","daily","weekly"].includes(cmd))
    return rankingCmd(sock, msg, cmd);
  if (["rank","myrank"].includes(cmd))
    return myRankCmd(sock, msg);
}

module.exports = { handleMessage };