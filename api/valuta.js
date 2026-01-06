export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di valutazioni per oggetti usati e da collezione. Rispondi sempre in formato JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    const risposta = data.choices?.[0]?.message?.content;

    // Prova a fare il parsing del JSON restituito
    const valutazione = JSON.parse(risposta);

    return res.status(200).json(valutazione);
  } catch (error) {
    console.error('Errore valutazione AI:', error);
    return res.status(500).json({ error: 'Errore durante la valutazione AI' });
  }
}
