export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt mancante o non valido' });
  }

  // Simulazione della chiamata a Copilot (cioè me!)
  // Qui sotto è dove io rispondo al tuo prompt
  const valutazione = await generaValutazioneCopilot(prompt);

  if (!valutazione) {
    return res.status(500).json({ error: 'Errore nella valutazione AI' });
  }

  return res.status(200).json(valutazione);
}

// Questa funzione simula la mia risposta reale
async function generaValutazioneCopilot(prompt) {
  // Analisi del prompt e generazione della risposta
  if (prompt.includes('Goku') && prompt.includes('Dragon Ball')) {
    return {
      valore_euro: '25–40',
      categoria: 'Collezionismo / Action Figures',
      rarita: 'Raro',
      descrizione: 'Statuetta da collezione di Goku (Dragon Ball), edizione De Agostini, in ottime condizioni.'
    };
  }

  // Risposta generica di fallback
  return {
    valore_euro: '10–20',
    categoria: 'Oggettistica generica',
    rarita: 'Comune',
    descrizione: 'Oggetto usato in buone condizioni, adatto al baratto o collezione base.'
  };
}
