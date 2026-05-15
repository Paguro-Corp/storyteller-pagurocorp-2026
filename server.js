const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { SYSTEM_PROMPT, buildUserPrompt, briefSchema } = require("./prompts");

const PORT = Number(process.env.PORT || 4173);
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/api/generate-brief") {
      await handleGenerateBrief(req, res);
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Metodo no permitido" });
      return;
    }

    serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Error interno" });
  }
});

server.listen(PORT, () => {
  console.log(`Paguro Storytelling OS running on http://localhost:${PORT}`);
  console.log(`AI model: ${MODEL}`);
});

async function handleGenerateBrief(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, {
      error: "Falta OPENAI_API_KEY. Define la variable de entorno y reinicia el servidor."
    });
    return;
  }

  const body = await readJson(req);
  const { project, input } = body;

  if (!project || !input) {
    sendJson(res, 400, { error: "Payload invalido. Se requiere project e input." });
    return;
  }

  const aiBrief = await callOpenAI({ project, input });
  const score = aiBrief.score?.total || 0;
  const now = new Date().toISOString();

  sendJson(res, 200, {
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
}

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
    const message = data?.error?.message || "OpenAI API error";
    throw new Error(message);
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

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_500_000) {
        req.destroy();
        reject(new Error("Payload demasiado grande"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("JSON invalido"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(urlPath, res) {
  const cleanPath = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(ROOT, cleanPath));

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Ruta no permitida" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "Archivo no encontrado" });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function supportsReasoning(model) {
  return /^(gpt-5|o\d|o-series)/i.test(model);
}

function removeEmpty(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
