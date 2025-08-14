const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// --- Miljövariabler ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const STAT_API_KEY = process.env.STAT_API_KEY; // API-Football nyckel
const ODDS_API_KEY = process.env.ODDS_API_KEY; // Odds API nyckel

// --- Testendpoints ---
app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.get("/stats", (req, res) => {
  res.json({ message: "Stats endpoint fungerar!" });
});

// --- Match analysis endpoint ---
app.get("/get-match-analysis", async (req, res) => {
  const matchId = req.query.match_id;
  if (!matchId) return res.status(400).send("match_id saknas");

  try {
    console.log("Hämtar statistik från API-Football...");
    const statsResponse = await axios.get(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      { headers: { 
          "X-RapidAPI-Key": STAT_API_KEY,
          "X-RapidAPI-Host": "v3.football.api-sports.io"
        } 
      }
    );

    console.log("Hämtar odds (dummy-exempel)...");
    const oddsResponse = await axios.get(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${ODDS_API_KEY}`
    );

    const prompt = `
Här är matchstatistik:
${JSON.stringify(statsResponse.data)}

Här är bettinglinjer:
${JSON.stringify(oddsResponse.data)}

Analysera matchen och ge de mest spelvärda bettingalternativen samt en kort förklaring.
`;

    console.log("Skickar prompt till OpenAI...");
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ analysis: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error("Fel i get-match-analysis:", err.response ? err.response.data : err);
    res.status(500).send("Något gick fel");
  }
});

// --- Dynamisk port för Render ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern kör på port ${PORT}`));
