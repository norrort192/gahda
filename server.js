const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// --- Miljövariabler ---
const NEW_API_KEY = process.env.NEW_API_KEY;
const ODDS_API_KEY = process.env.ODDS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- Kontrollera nycklar ---
console.log("NEW_API_KEY:", NEW_API_KEY ? "✅ finns" : "❌ saknas");
console.log("ODDS_API_KEY:", ODDS_API_KEY ? "✅ finns" : "❌ saknas");
console.log("OPENAI_API_KEY:", OPENAI_API_KEY ? "✅ finns" : "❌ saknas");

// --- Bas-endpoint ---
app.get("/", (req, res) => {
  res.send("Servern fungerar!");
});

// --- Test av nycklar ---
app.get("/test-keys", (req, res) => {
  res.json({
    NEW_API_KEY: NEW_API_KEY ? "✅ finns" : "❌ saknas",
    ODDS_API_KEY: ODDS_API_KEY ? "✅ finns" : "❌ saknas",
    OPENAI_API_KEY: OPENAI_API_KEY ? "✅ finns" : "❌ saknas",
  });
});

// --- Test av statistik från nya API ---
app.get("/test-stats", async (req, res) => {
  try {
    const matchId = req.query.match_id || "EXEMPEL_MATCH_ID"; // byt ut mot giltigt match-id
    const statsResponse = await axios.get(
      `DIN_SPORTAPI_URL/match/${matchId}`,
      { headers: { "X-API-Key": NEW_API_KEY } }
    );

    res.json(statsResponse.data);
  } catch (err) {
    console.error("Fel vid test-stats:", err.response ? err.response.data : err);
    res.status(500).send("Kunde inte hämta statistik");
  }
});

// --- Get-match-analysis ---
app.get("/get-match-analysis", async (req, res) => {
  const matchId = req.query.match_id;
  if (!matchId) return res.status(400).send("match_id saknas");

  try {
    // 1️⃣ Hämta statistik
    const statsResponse = await axios.get(
      `DIN_SPORTAPI_URL/match/${matchId}`,
      { headers: { "X-API-Key": NEW_API_KEY } }
    );

    // 2️⃣ Hämta odds (förenklat)
    const oddsResponse = await axios.get(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${ODDS_API_KEY}`
    );

    // 3️⃣ Skapa prompt för OpenAI
    const prompt = `
Här är matchstatistik:
${JSON.stringify(statsResponse.data, null, 2)}

Här är odds:
${JSON.stringify(oddsResponse.data, null, 2)}

Analysera matchen och ge de mest spelvärda bettingalternativen samt en kort förklaring.
`;

    // 4️⃣ Skicka till OpenAI
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // 5️⃣ Returnera analys
    res.json({ analysis: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error("Fel i get-match-analysis:", err.response ? err.response.data : err);
    res.status(500).send("Något gick fel");
  }
});

// --- Starta server på Render-port ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern kör på port ${PORT}`));