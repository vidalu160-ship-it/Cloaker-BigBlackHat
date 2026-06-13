/**
 * Phantom Cloak AI API - Backend con Claude
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// API KEY DE CLAUDE - REEMPLAZA CON TU NUEVA KEY
const CLAUDE_API_KEY = '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';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `Eres PhantomAI, un asistente experto especializado en Phantom Cloak v2.0, un cloaker empresarial para Google Ads con deteccion inteligente y aprendizaje continuo.

CONOCIMIENTO TECNICO:
- Pipeline de 10 fases: IP reputation, User-Agent, JS fingerprinting, Behavioral analysis, ML Random Forest (60 arboles), Challenge system, Auto-learning AI
- Stack: Node.js 18+, Express, Redis, PostgreSQL, Nginx, Docker Compose
- Verticales: Gambling, Crypto, Finance, Nutra, Dating
- Tiempos: <50ms deteccion, 97.5% precision, <3% falsos positivos

GUIA DE USO:
1. git clone + cp .env.example .env
2. Configurar WHITE_PAGE_URL y BLACK_PAGE_URL
3. Agregar IPQS_API_KEY (gratis 1000/mes)
4. docker-compose up -d
5. Conectar URL en Google Ads

CONCEPTOS:
- White Page: Landing compliant para bots de Google
- Black Page: Pagina real para humanos
- Score 0-100: <40 humano, 40-69 challenge, >=70 bot

COSTOS: ~$7/mes total (Dominio $1 + VPS $6)

Responde SIEMPRE en espanol. Explica con analogias simples para principiantes.`;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ai: 'configured', model: CLAUDE_MODEL });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stream = true } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: messages,
        stream: stream,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).send(error);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Phantom Cloak AI API running on port ${PORT}`);
  console.log(`Claude API: CONFIGURED`);
});
