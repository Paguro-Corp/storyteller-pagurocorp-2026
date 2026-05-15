const SUPABASE_URL = process.env.SUPABASE_URL || "https://uzhkhcxccryjgtslmuji.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const MEMORY_ID = process.env.SUPABASE_MEMORY_ID || "paguro-storytelling-os";

module.exports = async function handler(req, res) {
  try {
    if (!SUPABASE_KEY) {
      res.status(500).json({ error: "Falta SUPABASE_SECRET_KEY. Define la variable de entorno en Vercel." });
      return;
    }

    if (req.method === "GET") {
      const memory = await readMemory();
      res.status(200).json(memory);
      return;
    }

    if (req.method === "POST") {
      const payload = req.body;
      if (!payload || !Array.isArray(payload.projects)) {
        res.status(400).json({ error: "Payload invalido. Se requiere el estado completo de la app." });
        return;
      }

      const saved = await writeMemory(payload);
      res.status(200).json(saved);
      return;
    }

    res.status(405).json({ error: "Metodo no permitido" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error de memoria" });
  }
};

async function readMemory() {
  const response = await supabaseFetch(`/rest/v1/app_memory?id=eq.${encodeURIComponent(MEMORY_ID)}&select=data,updated_at`, {
    method: "GET"
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo leer la memoria.");
  }

  const rows = await response.json();
  return rows[0]?.data || null;
}

async function writeMemory(data) {
  const response = await supabaseFetch("/rest/v1/app_memory", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: MEMORY_ID,
      data,
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo guardar la memoria.");
  }

  const rows = await response.json();
  return rows[0]?.data || data;
}

function supabaseFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}
