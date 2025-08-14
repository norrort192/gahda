const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// --- Miljövariabler ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const STAT_API_KEY = process.env.STAT_API_KEY;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

// --- Testendpoints ---
app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.get("/stats", (req, res) => {
  res.json({ message: "Stats endpoint fungerar!" });
});

// --- Example API endpoint ---
app.get("/get-match-analysis", async (req, res) => {
  const matchId = req.query.match_id;
  if (!matchId) return res.status(400).send("match_id saknas");

  try {
    const statsResponse = await axios.get(
      "https://your-stats-api.com/matches/" + matchId,
      { headers: { "X-API-Key": STAT_API_KEY } }
    );

    const oddsResponse = await axios.get(
      "https://your-odds-api.com/matches/" + matchId,
      { headers: { "X-API-Key": ODDS_API_KEY } }
    );

    const prompt = `
Här är matchstatistik:
${JSON.stringify(statsResponse.data)}

Här är bettinglinjer:
${JSON.stringify(oddsResponse.data)}

Analysera matchen och ge de mest spelvärda bettingalternativen samt en kort förklaring.
`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ analysis: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).send("Något gick fel");
  }
});

// --- Dynamisk port för Render ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern kör på port ${PORT}`));
