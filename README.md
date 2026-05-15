# Paguro Storytelling OS

Herramienta interna para centralizar la creación estratégica de contenido para marcas ecommerce high ticket.

## Como abrirla

Define tu API key y arranca el backend:

```powershell
$env:OPENAI_API_KEY="tu_api_key"
npm start
```

La app queda servida localmente en:

```txt
http://localhost:4173
```

El frontend llama a `/api/generate-brief`. Ese endpoint construye un system prompt y un user prompt con la base de conocimiento de la marca y todos los inputs del generador.

## Qué incluye esta versión

- Gestión de múltiples proyectos/marcas.
- Base de conocimiento editable por marca.
- Generador de briefs con IA usando plataforma, formato, objetivo, funnel, nivel de conciencia, angulo e intencion de venta.
- Brief completo con idea central, storytelling, hook, hooks alternativos, guion, escenas, b-roll, caption, CTA y prompts para IA.
- Scoring por hook, dolor, deseo, autoridad, confianza, conversión, producción, fit de marca y viralidad.
- Aprobación de briefs.
- Biblioteca con registro de métricas reales.
- Calendario semanal con alerta de fatiga de ángulos.
- Importación/exportación JSON para respaldar o mover datos.

## Motor de IA

- `prompts.js` contiene el `SYSTEM_PROMPT`, el constructor del `user prompt` y el schema JSON esperado.
- `server.js` expone `/api/generate-brief` y usa la Responses API de OpenAI.
- El modelo por defecto es `gpt-4o-mini`. Puedes cambiarlo con:

```powershell
$env:OPENAI_MODEL="gpt-4o-mini"
```

## Persistencia

Los proyectos, briefs aprobados, calendario y metricas se guardan en Supabase usando `/api/memory`. `localStorage` queda como respaldo offline del navegador.

Variables de entorno necesarias en Vercel:

```txt
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=https://uzhkhcxccryjgtslmuji.supabase.co
SUPABASE_SECRET_KEY=...
SUPABASE_MEMORY_ID=paguro-storytelling-os
```

Antes de usar memoria en produccion, ejecuta el SQL de `supabase-schema.sql` en Supabase SQL Editor.
