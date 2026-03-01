export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;

  if (!prompt || !prompt.titolo || !prompt.descrizione) {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  const input = `Valuta questo oggetto per un marketplace di baratto.\nTitolo: ${prompt.titolo}\nDescrizione: ${prompt.descrizione}\nCategoria originale: ${prompt.categoria_originale || 'N/D'}\n\nRestituisci un oggetto JSON con:\n- valore_euro\n- categoria\n- rarita (Comune, Raro, Molto raro)\n- descrizione sintetica`;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: input })
    });

    const data = await response.json();
    const output = data?.[0]?.generated_text || data?.generated_text || JSON.stringify(data);

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Errore Hugging Face:", error);
    return res.status(500).json({ error: "Errore nella valutazione AI" });
  }
}
