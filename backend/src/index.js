const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Penyimpanan histori chat
const sessionHistories = {};

// Tambahkan endpoint /get
app.get('/', (req, res) => {
  res.send('This is backend');
});

app.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Jika sesi baru, reset histori chat
    if (!sessionHistories[sessionId]) {
      sessionHistories[sessionId] = [];
    }

    // Ambil histori chat untuk sesi saat ini
    const history = sessionHistories[sessionId];

    // Tambahkan pesan baru ke histori
    history.push({ role: "user", content: message });

    // Buat permintaan ke Groq AI dengan histori chat
    const chatCompletion = await groq.chat.completions.create({
      messages: history,
      model: "llama3-8b-8192",
    });

    // Ambil balasan dari Groq AI
    const aiResponse =
      chatCompletion.choices[0]?.message?.content || "No response";

    // Tambahkan balasan AI ke histori
    history.push({ role: "assistant", content: aiResponse });

    // Simpan histori chat yang diperbarui
    sessionHistories[sessionId] = history;

    res.json(aiResponse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
