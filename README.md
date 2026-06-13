# Phantom Cloak v2.0 - Backend + Chat AI

Servidor completo con frontend + backend API + Claude AI integrado.

## Contenido

- **Frontend**: Webapp React con 11 secciones (todo en espanol)
- **Backend API**: Proxy seguro a Claude AI
- **Chat**: PhantomAI con Claude Sonnet 4

## Deploy en Render.com (Recomendado - Gratis)

### Opcion 1: Deploy con un clic (Blueprint)

1. Crea una cuenta gratuita en [render.com](https://render.com)
2. Ve a Dashboard > Blueprints > New Blueprint Instance
3. Conecta tu repositorio o sube los archivos
4. Render detectara automaticamente el `render.yaml`
5. Clic en **Apply** y espera 2 minutos

### Opcion 2: Deploy manual (Web Service)

1. Crea una cuenta gratuita en [render.com](https://render.com)
2. Ve a Dashboard > New > Web Service
3. Conecta tu repositorio de GitHub/GitLab o sube los archivos ZIP
4. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Agrega la variable de entorno:
   - `CLAUDE_API_KEY`: `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`
6. Clic en **Create Web Service**
7. Espera 2-3 minutos a que termine el deploy

### Opcion 3: Deploy local

```bash
# 1. Instalar dependencias
npm install

# 2. La API key ya esta en el archivo .env

# 3. Iniciar servidor
npm start

# 4. Abrir http://localhost:3000
```

## Estructura

```
backend/
├── server.js          # Servidor Express (API + frontend)
├── package.json       # Dependencias
├── .env              # Variables de entorno (API key incluida)
├── dist/             # Frontend build (React)
└── README.md         # Este archivo
```

## API Endpoints

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/health` | GET | Estado del servidor |
| `/api/chat` | POST | Chat con Claude AI |
| `/*` | GET | Frontend (SPA) |

## Variables de Entorno

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| `CLAUDE_API_KEY` | API key de Anthropic Claude | *(incluida en .env)* |
| `CLAUDE_MODEL` | Modelo de Claude | `claude-sonnet-4-20250514` |
| `PORT` | Puerto del servidor | `3000` |

## Seguridad

- La API key de Claude esta oculta en el servidor (nunca en el frontend)
- El proxy maneja CORS automaticamente
- No se expone ninguna credencial al cliente

## Notas

- Render.com (gratis) duerme el servidor despues de 15 min de inactividad
- El primer request despues de inactividad puede tardar 30-60 segundos
- Para produccion con trafico constante, considera el plan de $7/mes en Render
