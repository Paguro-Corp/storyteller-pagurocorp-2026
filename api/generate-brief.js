const { SYSTEM_PROMPT, buildUserPrompt, briefSchema } = require("../prompts");

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({
        error: "Falta OPENAI_API_KEY. Define la variable de entorno en Vercel."
      });
      return;
    }

    const { project, input } = req.body || {};
    if (!project || !input) {
      res.status(400).json({ error: "Payload invalido. Se requiere project e input." });
      return;
    }

    const aiBrief = await callOpenAI({ project, input });
    const score = aiBrief.score?.total || 0;
    const now = new Date().toISOString();

    res.status(200).json({
      id: `brief-${Date.now()}`,
      createdAt: now,
      status: score >= 82 ? "approved" : "draft",
      projectId: project.id,
      projectName: project.name,
      input,
      ...aiBrief,
      metrics: null,
      scheduledDate: null
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error interno" });
  }
};

async function callOpenAI({ project, input }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(removeEmpty({
      model: MODEL,
      instructions: SYSTEM_PROMPT,
      input: buildUserPrompt({ project, input }),
      reasoning: supportsReasoning(MODEL) ? { effort: process.env.OPENAI_REASONING_EFFORT || "medium" } : undefined,
      text: {
        format: {
          type: "json_schema",
          name: "content_brief",
          strict: true,
          schema: briefSchema
        }
      }
    }))
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI API error");
  }

  const outputText = extractOutputText(data);
  if (!outputText) {
    throw new Error("El modelo no devolvio texto estructurado.");
  }

  return JSON.parse(outputText);
}

function extractOutputText(data) {
  if (data.output_text) return data.output_text;

  const message = data.output?.find((item) => item.type === "message");
  const textItem = message?.content?.find((item) => item.type === "output_text");
  return textItem?.text || "";
}

function supportsReasoning(model) {
  return /^(gpt-5|o\d|o-series)/i.test(model);
}

function removeEmpty(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
