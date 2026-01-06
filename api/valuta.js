export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  // Simulazione risposta Copilot (sostituibile in futuro)
  const valutazione = {
    valore_euro: '25–40',
    categoria: 'Collezionismo / Action Figures',
    rarita: 'Raro',
    descrizione: 'Statuetta da collezione di Goku (Dragon Ball), edizione De Agostini.'
  };

  return res.status(200).json(valutazione);
}
