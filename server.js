/**
 * Phantom Cloak v2.0 - Backend API + Frontend Server
 * Servidor Express que:
 * 1. Sirve el frontend estatico
 * 2. Proporciona API /api/chat con Claude AI (proxy seguro)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// API Key de Claude desde variables de entorno
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

// System prompt con conocimiento completo de Phantom Cloak
const SYSTEM_PROMPT = `Eres PhantomAI, un asistente experto especializado en Phantom Cloak v2.0, un cloaker empresarial para Google Ads con deteccion inteligente y aprendizaje continuo.

CONOCIMIENTO TECNICO:
- Phantom Cloak usa un pipeline de 10 fases de deteccion: IP reputation -> User-Agent analysis -> JS fingerprinting -> Behavioral analysis -> ML Random Forest scoring (60 arboles) -> Challenge system -> Auto-learning AI
- Tiempos: <50ms deteccion total, 97.5% precision, <3% falsos positivos
- Stack: Node.js 18+, Express, Redis, PostgreSQL, Nginx, Docker Compose
- Verticales soportados: Gambling, Crypto, Finance, Nutra, Dating
- Fingerprinting: Canvas 2D hash, WebGL vendor/renderer (SwiftShader detection), AudioContext, font enumeration
- Warming phase: 48-72h de campanas limpias antes de activar cloaking
- Auto-updaters: Google crawler IPs cada 4h, ASN datacenters diario, UA bot patterns cada 6h
- Alertas: Telegram, Discord, Email cuando score > umbral o campana baneada

GUIA DE USO:
1. Descargar: git clone + cp .env.example .env
2. Configurar URLs: WHITE_PAGE_URL (pagina compliant) y BLACK_PAGE_URL (oferta real)
3. Agregar APIs: IPQS_API_KEY (gratis 1000 lookups/mes), opcional Telegram
4. Deploy: docker-compose up -d (levanta 6 servicios)
5. Conectar: URL del dominio en Google Ads como URL final

CONCEPTOS CLAVE:
- White Page: Landing 100% compliant que ven los bots de Google
- Black Page/Money Page: Pagina real con la oferta que ven humanos
- Cloaker: Sistema que decide que pagina mostrar segun quien visita
- Score 0-100: <40 humano, 40-69 sospechoso (challenge), >=70 bot
- Feedback Loop: La IA aprende de cada baneo/campana para mejorar
- Umbrales Adaptativos: La IA ajusta la estrictitud segun la supervivencia de campanas

COSTOS:
- Dominio: ~$1/mes
- VPS: ~$6/mes
- APIs opcionales: tier gratuito disponible
- Total: ~$7/mes

RECOMENDACIONES:
- Siempre activar AI_AUTO_LEARN=true
- Usar PARANOIA_MODE=true para gambling/crypto
- Activar Cloudflare proxy en produccion
- NUNCA exponer puerto 3000 directamente
- Cambiar contrasena admin default

Responde SIEMPRE en espanol, de forma clara y directa. Si el usuario es principiante, explica los conceptos tecnicos con analogias simples. Manten las respuestas concisas pero completas.`;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'phantom-cloak-backend', ai: CLAUDE_API_KEY ? 'configured' : 'missing' });
});

// Chat API - Proxy seguro a Claude AI
app.post('/api/chat', async (req, res) => {
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ 
      error: 'Claude API key not configured',
      message: 'Set CLAUDE_API_KEY environment variable'
    });
  }

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
      const errorData = await response.text();
      return res.status(response.status).send(errorData);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
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
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
=======================================
  Phantom Cloak v2.0 - Server Running
=======================================
  Port: ${PORT}
  API: http://localhost:${PORT}/api/chat
  Health: http://localhost:${PORT}/api/health
  AI Status: ${CLAUDE_API_KEY ? 'CONFIGURED' : 'MISSING - Set CLAUDE_API_KEY'}
=======================================
  `);
});
