// /api/valuta.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto valutatore di oggetti usati per un marketplace di baratto. Riceverai un prompt con titolo, descrizione e categorie. Rispondi in JSON con i seguenti campi:
{
  "valore_euro": "range di prezzo stimato in euro, es. '20–30'",
  "categoria": "una delle categorie suggerite nel prompt",
  "rarita": "Comune, Raro o Molto raro",
  "descrizione": "breve descrizione sintetica dell'oggetto (max 200 caratteri)"
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;

    // Prova a fare il parsing del JSON
    const valutazione = JSON.parse(raw);

    return res.status(200).json(valutazione);
  } catch (error) {
    console.error('Errore nella valutazione AI:', error);
    return res.status(500).json({ error: 'Errore nella valutazione AI' });
  }
}
