const fs = require("fs");
const moment = require("moment-timezone");
const { RANKING_FOLDER } = require("../config");

const rankingCache = {};
const groupsToSave = new Set();

const getDayKey = () =>
  moment().tz("Asia/Colombo").format("YYYY-MM-DD");
const getWeekKey = () =>
  moment().tz("Asia/Colombo").format("YYYY-WW");

setInterval(() => {
  for (const g of groupsToSave) {
    fs.writeFileSync(
      `${RANKING_FOLDER}/${g}.json`,
      JSON.stringify(rankingCache[g], null, 2)
    );
  }
  groupsToSave.clear();
}, 60000);

/* LISTENER */
async function rankingListener(msg) {
  try {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;

    const groupId = msg.key.remoteJid;
    const senderId = msg.key.participant;

    const file = `${RANKING_FOLDER}/${groupId}.json`;
    if (!rankingCache[groupId]) {
      rankingCache[groupId] = fs.existsSync(file)
        ? JSON.parse(fs.readFileSync(file))
        : {};
    }

    const db = rankingCache[groupId];
    if (!db[senderId]) {
      db[senderId] = {
        global: 0,
        daily: { count: 0, dayKey: getDayKey() },
        weekly: { count: 0, weekKey: getWeekKey() }
      };
    }

    db[senderId].global++;
    db[senderId].daily.dayKey === getDayKey()
      ? db[senderId].daily.count++
      : (db[senderId].daily = { count: 1, dayKey: getDayKey() });

    db[senderId].weekly.weekKey === getWeekKey()
      ? db[senderId].weekly.count++
      : (db[senderId].weekly = { count: 1, weekKey: getWeekKey() });

    groupsToSave.add(groupId);
  } catch (e) {
    console.log("Ranking Error", e);
  }
}

/* RANKING */
async function rankingCmd(sock, msg, mode) {
  const gid = msg.key.remoteJid;
  const db = rankingCache[gid];
  if (!db) return sock.sendMessage(gid, { text: "📉 No data yet." });

  const day = getDayKey();
  const week = getWeekKey();

  const sorted = Object.entries(db)
    .map(([id, d]) => {
      let c = d.global;
      if (mode === "daily" && d.daily.dayKey === day) c = d.daily.count;
      if (mode === "weekly" && d.weekly.weekKey === week) c = d.weekly.count;
      return { id, c };
    })
    .filter(x => x.c > 0)
    .sort((a, b) => b.c - a.c)
    .slice(0, 15);

  let text = `🏆 ${mode.toUpperCase()} RANKING\n\n`;
  let mentions = [];

  sorted.forEach((u, i) => {
    mentions.push(u.id);
    text += `${i + 1}. @${u.id.split("@")[0]} : ${u.c}\n`;
  });

  await sock.sendMessage(gid, { text, mentions });
}

/* MY RANK */
async function myRankCmd(sock, msg) {
  const gid = msg.key.remoteJid;
  const uid = msg.key.participant;
  const db = rankingCache[gid];
  if (!db || !db[uid])
    return sock.sendMessage(gid, { text: "📉 No rank yet." });

  const sorted = Object.entries(db)
    .map(([id, d]) => ({ id, g: d.global }))
    .sort((a, b) => b.g - a.g);

  const rank = sorted.findIndex(x => x.id === uid) + 1;

  await sock.sendMessage(gid, {
    text: `👤 YOUR RANK\n\n🏆 Rank: #${rank}\n🌐 Global: ${db[uid].global}`,
    mentions: [uid]
  });
}

module.exports = { rankingListener, rankingCmd, myRankCmd };