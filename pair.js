const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("web"));

app.get("/", (_,res)=>res.sendFile(__dirname+"/web/index.html"));
app.get("/pair", (_,res)=>res.sendFile(__dirname+"/web/pair.html"));

app.get("/pair-code",(req,res)=>{
 const num=req.query.num;
 if(!num || !num.startsWith("94"))
  return res.send("❌ Invalid number");

 const code=Math.floor(100000+Math.random()*900000);
 res.send(
`🤖 KLW RANKING BOT

📱 Number: ${num}
🔐 Pair Code: ${code}

Enter this code in WhatsApp`
 );
});

app.listen(PORT,()=>console.log("🌐 Pair server running on",PORT));