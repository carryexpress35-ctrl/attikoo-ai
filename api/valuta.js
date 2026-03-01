export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non supportato' });
  }

  const { prompt } = req.body;

  if (!prompt || !prompt.titolo || !prompt.descrizione) {
    return res.status(400).json({ error: 'Prompt mancante o incompleto' });
  }

  const input = `Valuta questo oggetto per un marketplace di baratto.\nTitolo: ${prompt.titolo}\nDescrizione: ${prompt.descrizione}\nCategoria originale: ${prompt.categoria_originale || 'N/D'}\n\nRestituisci un oggetto JSON con:\n- valore_euro\n- categoria\n- rarita (Comune, Raro, Molto raro)\n- descrizione sintetica`;

  try {
    const response = await fetch("https://carryexpress35--attikoo-ai-space.hf.space/run/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: [input] })
    });

    const result = await response.json();

    // Estrai il testo generato
    const raw = result?.data?.[0];
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Errore nella chiamata al modello:", error);
    return res.status(500).json({ error: "Errore nella valutazione AI" });
  }
}
