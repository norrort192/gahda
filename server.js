const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// --- Hämta miljövariabler ---
const STAT_API_KEY = process.env.STAT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

// --- Debug: kolla att nycklarna finns ---
console.log("STAT_API_KEY:", STAT_API_KEY ? "✅ finns" : "❌ saknas");
console.log("OPENAI_API_KEY:", OPENAI_API_KEY ? "✅ finns" : "❌ saknas");
console.log("ODDS_API_KEY:", ODDS_API_KEY ? "✅ finns" : "❌ saknas");

// --- Testendpoints ---
app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.get("/test-keys", (req, res) => {
  res.json({
    STAT_API_KEY: STAT_API_KEY ? "✅ finns" : "❌ saknas",
    OPENAI_API_KEY: OPENAI_API_KEY ? "✅ finns" : "❌ saknas",
    ODDS_API_KEY: ODDS_API_KEY ? "✅ finns" : "❌ saknas",
  });
});

// --- Minimal get-match-analysis med API-Football ---
app.get("/get-match-analysis", async (req, res) => {
  const matchId = req.query.match_id;
  if (!matchId) return res.status(400).send("match_id saknas");

  try {
    console.log("Hämtar statistik från API-Football...");
    const statsResponse = await axios.get(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      {
        headers: {
          "X-RapidAPI-Key": STAT_API_KEY,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      }
    );

    console.log("Data från API-Football hämtad!");
    res.json(statsResponse.data);
  } catch (err) {
    console.error("Fel i get-match-analysis:", err.response ? err.response.data : err);
    res.status(500).send("Något gick fel");
  }
});

// --- Starta servern på Render-port ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern kör på port ${PORT}`));
