export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;

  if (
    !prompt ||
    typeof prompt !== 'object' ||
    !prompt.titolo ||
    !prompt.descrizione
  ) {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  const testo = `Titolo: ${prompt.titolo}
Descrizione: ${prompt.descrizione}
Categoria originale: ${prompt.categoria_originale || 'N/D'}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-0613',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto valutatore di oggetti usati per un marketplace di baratto. Riceverai un titolo, una descrizione e una categoria. Rispondi usando la funzione "valutaOggetto".'
          },
          {
            role: 'user',
            content: testo
          }
        ],
        functions: [
          {
            name: 'valutaOggetto',
            description: 'Valuta un oggetto usato per un marketplace di baratto',
            parameters: {
              type: 'object',
              properties: {
                valore_euro: {
                  type: 'string',
                  description: "Range di prezzo stimato in euro, es. '20–30'"
                },
                categoria: {
                  type: 'string',
                  description: 'Una delle categorie suggerite nel prompt'
                },
                rarita: {
                  type: 'string',
                  enum: ['Comune', 'Raro', 'Molto raro'],
                  description: 'Livello di rarità'
                },
                descrizione: {
                  type: 'string',
                  description: "Breve descrizione sintetica dell'oggetto (max 200 caratteri)"
                }
              },
              required: ['valore_euro', 'categoria', 'rarita', 'descrizione']
            }
          }
        ],
        function_call: { name: 'valutaOggetto' },
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const args = data.choices?.[0]?.message?.function_call?.arguments;

    if (!args) {
      console.error('Function call non riuscita o vuota');
      return res.status(500).json({ error: 'Function call non riuscita o vuota' });
    }

    const valutazione = JSON.parse(args);
    return res.status(200).json(valutazione);
  } catch (error) {
    console.error('Errore nella valutazione AI:', error);
    return res.status(500).json({ error: 'Errore nella valutazione AI' });
  }
}
