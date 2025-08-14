const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// Byt ut "DIN_OPENAI_API_KEY" mot din faktiska OpenAI-nyckel
const openai = new OpenAI({ apiKey: "process.env.OPENAI_API_KEY;" });

// Testendpoint
app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

app.get("/get-match-analysis", async (req, res) => {
  const matchId = req.query.match_id;
  if (!matchId) return res.status(400).send("match_id saknas");

  try {
    const statsResponse = await axios.get(
      "https://dashboard.api-football.com/#/matches/" + matchId, // <-- BYT UT mot din statistik-API URL
      {
        headers: { "X-API-Key": "process.env.STAT_API_KEY;" }, // <-- BYT UT mot din statistiknyckel
      }
    );

    const oddsResponse = await axios.get(
      "https://api.the-odds-api.com" // <-- BYT UT mot din Odds API URL
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Servern kör på port ${PORT}`));
