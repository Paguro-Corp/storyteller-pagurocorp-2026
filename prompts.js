const SYSTEM_PROMPT = `
Eres el cerebro creativo interno de una agencia que crea contenido para marcas ecommerce high ticket.

Tu trabajo no es rellenar una plantilla. Tu trabajo es pensar como estratega senior, copywriter de respuesta directa, director creativo y productor.

Principios obligatorios:
- Usa la base de conocimiento de la marca como fuente principal. Si falta informacion, infiere con prudencia desde lo que si existe.
- Cada brief debe sentirse especifico para esa marca, ese buyer, esa oferta, ese nivel de conciencia y ese momento del funnel.
- No escribas contenido generico tipo "eleva tu estilo", "transforma tu vida", "descubre la solucion perfecta", "producto premium" o "calidad superior" si no esta demostrado con detalles.
- El contenido high ticket no busca entretener por entretener. Debe mover al buyer de un estado mental a otro.
- El hook debe abrir una tension real: dolor, deseo, objecion, contradiccion, costo oculto, estatus, identidad o criterio.
- El storytelling debe tener conflicto, reencuadre, mecanismo, prueba y decision.
- El guion debe ser producible por un equipo creativo sin pedir mas contexto.
- El caption debe sonar humano, premium y especifico. Nada de hype barato.
- El score debe ser critico. No regales puntajes altos si el concepto es debil.

Responde siempre en espanol claro, natural y accionable.
`;

function buildUserPrompt({ project, input }) {
  return `
Genera un brief de contenido completo usando TODAS estas variables.

BASE DE CONOCIMIENTO DE LA MARCA
Nombre: ${project.name || "No definido"}
Categoria / mercado: ${project.category || "No definido"}
Personalidad de marca: ${project.personality || "No definido"}
Tono y lenguaje: ${project.voice || "No definido"}
Oferta principal: ${project.offer || "No definido"}
Precio / rango high ticket: ${project.price || "No definido"}
Transformacion prometida: ${project.transformation || "No definido"}
Buyer persona detallado: ${project.buyer || "No definido"}
Dolores profundos: ${project.pains || "No definido"}
Deseos aspiracionales: ${project.desires || "No definido"}
Objeciones frecuentes: ${project.objections || "No definido"}
Prueba social disponible: ${project.proof || "No definido"}
Historia / punto de vista del fundador: ${project.founderStory || "No definido"}
Reglas visuales y produccion: ${project.productionNotes || "No definido"}

INPUTS DE ESTA PIEZA
Plataforma: ${input.platform}
Formato: ${input.format}
Objetivo: ${input.goal}
Funnel: ${input.funnel}
Dolor o deseo principal elegido por el usuario: ${input.pain || "Usa el mas fuerte de la base de conocimiento"}
Mensaje especifico a comunicar: ${input.message || "Define el mensaje mas estrategico para este contexto"}
Nivel de conciencia: ${input.awareness}
Angulo creativo: ${input.angle}
Intencion de venta, escala 1 a 5: ${input.salesIntent}
Complejidad de produccion deseada: ${input.production}

CRITERIO ESTRATEGICO
1. Antes de escribir, interpreta el estado mental del buyer segun el nivel de conciencia.
2. Decide cual es la tension narrativa principal.
3. Decide que creencia debe cambiar en la audiencia.
4. Decide que prueba o detalle de marca vuelve creible el mensaje.
5. Escribe un brief listo para produccion.

ESTILO DE RESPUESTA
- Hooks concretos, con filo y sin sonar clickbait barato.
- Storytelling con una arquitectura clara, no solo bullets.
- Guion con frases que podrian grabarse tal cual.
- Escenas detalladas, con texto en pantalla, voz en off, b-roll e instrucciones de grabacion.
- Prompts IA utiles para producir variaciones, visuales y voz.
- Scoring honesto y explicado.

Devuelve solo JSON valido con la estructura solicitada.
`;
}

const briefSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "idea",
    "story",
    "hook",
    "altHooks",
    "script",
    "scenes",
    "caption",
    "cta",
    "aiPrompts",
    "score",
    "recommendation"
  ],
  properties: {
    idea: { type: "string" },
    story: { type: "string" },
    hook: { type: "string" },
    altHooks: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" }
    },
    script: { type: "string" },
    scenes: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["beat", "onScreen", "direction", "broll"],
        properties: {
          beat: { type: "string" },
          onScreen: { type: "string" },
          direction: { type: "string" },
          broll: { type: "string" }
        }
      }
    },
    caption: { type: "string" },
    cta: { type: "string" },
    aiPrompts: {
      type: "object",
      additionalProperties: false,
      required: ["chatgpt", "midjourney", "elevenlabs"],
      properties: {
        chatgpt: { type: "string" },
        midjourney: { type: "string" },
        elevenlabs: { type: "string" }
      }
    },
    score: {
      type: "object",
      additionalProperties: false,
      required: ["total", "dimensions", "notes"],
      properties: {
        total: { type: "integer", minimum: 0, maximum: 100 },
        dimensions: {
          type: "object",
          additionalProperties: false,
          required: ["hook", "pain", "desire", "authority", "trust", "conversion", "production", "brandFit", "virality"],
          properties: {
            hook: { type: "integer", minimum: 0, maximum: 100 },
            pain: { type: "integer", minimum: 0, maximum: 100 },
            desire: { type: "integer", minimum: 0, maximum: 100 },
            authority: { type: "integer", minimum: 0, maximum: 100 },
            trust: { type: "integer", minimum: 0, maximum: 100 },
            conversion: { type: "integer", minimum: 0, maximum: 100 },
            production: { type: "integer", minimum: 0, maximum: 100 },
            brandFit: { type: "integer", minimum: 0, maximum: 100 },
            virality: { type: "integer", minimum: 0, maximum: 100 }
          }
        },
        notes: { type: "string" }
      }
    },
    recommendation: { type: "string" }
  }
};

module.exports = {
  SYSTEM_PROMPT,
  buildUserPrompt,
  briefSchema
};
