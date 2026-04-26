import Groq from "groq-sdk";

export default async function handler(req, res) {
  // Metodo non valido
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non supportato" });
  }

  // Controllo variabile ambiente
  if (!process.env.GROQ_API_KEY) {
    console.error("Manca GROQ_API_KEY nelle variabili ambiente");
    return res.status(500).json({ error: "Chiave API Groq mancante" });
  }

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const { prompt } = req.body;

  // Controllo struttura prompt
  if (!prompt || !prompt.titolo || !prompt.descrizione) {
    return res.status(400).json({ error: "Prompt mancante o incompleto" });
  }

  // Prompt JSON blindato
  const promptJSON = {
    istruzioni:
      "Sei un valutatore professionale di oggetti usati per un marketplace di baratto. Rispondi SOLO con un JSON valido. Non aggiungere testo fuori dal JSON.",
    oggetto: {
      titolo: prompt.titolo,
      descrizione: prompt.descrizione,
      categoria_originale: prompt.categoria_originale || "N/D"
    },
    output_richiesto: {
      valore_euro: "range in euro",
      categoria: "categoria suggerita",
      rarita: "Comune | Raro | Molto raro",
      descrizione: "testo sintetico"
    }
  };

  const input = `
Analizza il seguente oggetto e restituisci SOLO un JSON valido:

${JSON.stringify(promptJSON, null, 2)}

Il JSON finale deve avere ESATTAMENTE questa struttura:

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
        {
          role: "system",
          content: "Sei un valutatore professionale. Rispondi SOLO in JSON valido."
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.2
    });

    const raw = completion.choices[0].message.content.trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON non valido generato dal modello:", raw);
      return res.status(500).json({
        error: "Risposta AI non in formato JSON",
        raw
      });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("❌ Errore Groq:", error);
    return res.status(500).json({ error: "Errore nella valutazione AI" });
  }
}
