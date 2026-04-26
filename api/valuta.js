console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "OK" : "MISSING");

import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non supportato" });
  }

  const { prompt } = req.body;

  if (!prompt || !prompt.titolo || !prompt.descrizione) {
    return res.status(400).json({ error: "Prompt mancante o incompleto" });
  }

  const input = `
Valuta questo oggetto per un marketplace di baratto.

Titolo: ${prompt.titolo}
Descrizione: ${prompt.descrizione}
Categoria originale: ${prompt.categoria_originale || "N/D"}

Restituisci SOLO un JSON valido con:
{
  "valore_euro": "range in euro",
  "categoria": "categoria suggerita",
  "rarita": "Comune | Raro | Molto raro",
  "descrizione": "testo sintetico"
}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "Sei un valutatore di oggetti usati. Rispondi SOLO in JSON valido." },
        { role: "user", content: input }
      ],
      temperature: 0.2
    });

    const raw = completion.choices[0].message.content.trim();

    // Prova a fare il parse del JSON
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON non valido generato dal modello:", raw);
      return res.status(500).json({ error: "Risposta AI non in formato JSON", raw });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Errore Groq:", error);
    return res.status(500).json({ error: "Errore nella valutazione AI" });
  }
}
