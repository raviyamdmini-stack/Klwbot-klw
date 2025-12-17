const makeWASocket = require("baileys").default;
const { useMultiFileAuthState } = require("baileys");
const express = require("express");
const { PORT, BOT_NAME } = require("./config");
const { handleMessage } = require("./msg");

const app = express();
app.use(express.static("public"));
app.listen(PORT, () =>
  console.log(`🌐 Pair Site: http://localhost:${PORT}`)
);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages[0]?.message) return;
    await handleMessage(sock, messages[0]);
  });

  console.log(`🤖 ${BOT_NAME} ONLINE`);
}

startBot();