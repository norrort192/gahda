const express = require("express");
const app = express();

// --- Hämta miljövariabler ---
const STAT_API_KEY = process.env.STAT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

// --- Debug: kolla om nycklarna finns ---
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

// --- Port för Render ---
const PORT = process.env.PORT || 3000;