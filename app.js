const STORAGE_KEY = "paguro-storytelling-os-v1";

const knowledgeFields = [
  ["name", "Nombre de marca", "input"],
  ["category", "Categoría / mercado", "input"],
  ["personality", "Personalidad de marca", "textarea"],
  ["voice", "Tono y lenguaje", "textarea"],
  ["offer", "Oferta principal", "textarea"],
  ["price", "Precio / rango high ticket", "input"],
  ["transformation", "Transformación prometida", "textarea"],
  ["buyer", "Buyer persona detallado", "textarea"],
  ["pains", "Dolores profundos", "textarea"],
  ["desires", "Deseos aspiracionales", "textarea"],
  ["objections", "Objeciones frecuentes", "textarea"],
  ["proof", "Prueba social disponible", "textarea"],
  ["founderStory", "Historia o punto de vista del fundador", "textarea"],
  ["productionNotes", "Reglas visuales y producción", "textarea"]
];

const awarenessMap = {
  "No consciente del problema": {
    frame: "abrir una tensión que el buyer siente pero todavía no ha nombrado",
    proof: "usar señales cotidianas, contraste y lenguaje de espejo",
    cta: "guardar la idea y observar el patrón durante la semana"
  },
  "Consciente del problema": {
    frame: "hacer que el problema se vea urgente, costoso y solucionable",
    proof: "mostrar consecuencias acumuladas y errores que repite el buyer",
    cta: "pedir diagnóstico o revisar la alternativa premium"
  },
  "Consciente de la solución": {
    frame: "educar por qué esta categoría de solución cambia el resultado",
    proof: "comparar mecanismo, método y criterio de decisión",
    cta: "ver casos, proceso o explicación de la oferta"
  },
  "Consciente del producto": {
    frame: "reforzar confianza, diferenciación y autoridad específica",
    proof: "usar prueba social, objeciones resueltas y detalles de entrega",
    cta: "agendar, aplicar o pedir información concreta"
  },
  "Más consciente / listo para comprar": {
    frame: "quitar fricción final y justificar acción ahora",
    proof: "usar escasez real, costo de espera y seguridad de decisión",
    cta: "tomar acción directa con una instrucción simple"
  }
};

const angleMap = {
  "Dolor latente": "mostrar el síntoma invisible que el buyer normalizó",
  "Deseo aspiracional": "hacer tangible la identidad que el buyer quiere habitar",
  "Objeción específica": "responder una duda real sin sonar defensivo",
  "Comparación con opciones baratas": "hacer evidente el costo estratégico de elegir por precio",
  "Error común del buyer": "nombrar una conducta que parece lógica pero retrasa el resultado",
  "Lifestyle habilitado": "conectar la compra con libertad, estatus o tranquilidad concreta",
  "Historia del fundador": "convertir el punto de vista de la marca en autoridad narrativa",
  "Caso de cliente": "usar transformación real como prueba y espejo aspiracional",
  "Exclusividad": "reforzar criterio, curaduría y pertenencia selectiva",
  "Costo oculto de no comprar": "cuantificar lo que se pierde por esperar o improvisar"
};

const defaultState = {
  activeProjectId: "atelier-norte",
  projects: [
    {
      id: "atelier-norte",
      name: "Atelier Norte",
      category: "Mobiliario artesanal premium para hogares de alto diseño",
      personality: "Calma, criterio editorial, obsesión por materiales nobles y diseño que envejece bien.",
      voice: "Humano, sobrio y específico. Evita urgencia barata. Habla con seguridad, como un asesor que entiende arquitectura, patrimonio y buen vivir.",
      offer: "Piezas de mobiliario a medida en madera maciza, diseño consultivo y producción artesanal para propietarios que están construyendo o renovando casas premium.",
      price: "Desde USD 8.000 por proyecto",
      transformation: "Pasar de comprar muebles sueltos a crear un hogar con identidad, coherencia estética y piezas que se vuelven patrimonio familiar.",
      buyer: "Propietario de 35 a 58 años, alto poder adquisitivo, valora arquitectura, viajes, diseño y experiencias. Tiene poco tiempo, teme equivocarse con decisiones visibles y quiere que su casa comunique criterio sin ostentación.",
      pains: "Miedo a invertir mucho y que el resultado se vea común. Cansancio de proveedores que no entienden su estándar. Frustración con muebles caros pero impersonales.",
      desires: "Una casa que se sienta curada, exclusiva y serena. Ser reconocido como alguien con gusto. Comprar una vez y bien.",
      objections: "Es caro, toma tiempo, no sé si vale la pena hacerlo a medida, puedo comprar algo parecido importado, me preocupa el mantenimiento.",
      proof: "Casas publicadas en revistas locales, clientes referidos por arquitectos, videos de taller, testimonios sobre proceso sin estrés, garantía de restauración.",
      founderStory: "La marca nació como respuesta al mobiliario de lujo sin alma: piezas bonitas en foto pero sin historia, materialidad ni permanencia.",
      productionNotes: "Visuales limpios, luz natural, close ups de textura, manos trabajando, casas reales. Evitar música agresiva, claims exagerados y fondos saturados.",
      briefs: []
    }
  ]
};

let state = loadState();
let currentBrief = null;

const els = {
  projectSelect: document.querySelector("#projectSelect"),
  brandHealth: document.querySelector("#brandHealth"),
  brandHealthCopy: document.querySelector("#brandHealthCopy"),
  pageTitle: document.querySelector("#pageTitle"),
  briefForm: document.querySelector("#briefForm"),
  briefOutput: document.querySelector("#briefOutput"),
  projectForm: document.querySelector("#projectForm"),
  projectDiagnostics: document.querySelector("#projectDiagnostics"),
  calendarGrid: document.querySelector("#calendarGrid"),
  libraryList: document.querySelector("#libraryList"),
  fatigueAlert: document.querySelector("#fatigueAlert"),
  librarySearch: document.querySelector("#librarySearch"),
  libraryFilter: document.querySelector("#libraryFilter"),
  dialog: document.querySelector("#projectDialog")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindEvents();
  renderAll();
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  els.projectSelect.addEventListener("change", (event) => {
    state.activeProjectId = event.target.value;
    saveState();
    currentBrief = null;
    renderAll();
  });

  els.briefForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(els.briefForm).entries());
    await generateBriefFromBackend(formData);
  });

  document.querySelector("#newProjectBtn").addEventListener("click", () => els.dialog.showModal());
  document.querySelector("#createProjectConfirm").addEventListener("click", createProjectFromDialog);
  document.querySelector("#seedWeekBtn").addEventListener("click", planWeek);
  document.querySelector("#exportBtn").addEventListener("click", exportData);
  document.querySelector("#importInput").addEventListener("change", importData);
  els.librarySearch.addEventListener("input", renderLibrary);
  els.libraryFilter.addEventListener("change", renderLibrary);
}

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach((item) => item.classList.toggle("active", item.id === `${view}View`));
  const titles = { generator: "Generador de briefs", projects: "Proyectos y conocimiento", calendar: "Calendario", library: "Biblioteca y aprendizaje" };
  els.pageTitle.textContent = titles[view];
  if (view === "calendar") renderCalendar();
  if (view === "library") renderLibrary();
}

function renderAll() {
  renderProjectSelect();
  renderBrandHealth();
  renderProjectForm();
  renderDiagnostics();
  renderCalendar();
  renderLibrary();
  if (!currentBrief) renderEmptyBrief();
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function renderProjectSelect() {
  els.projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${project.id}" ${project.id === state.activeProjectId ? "selected" : ""}>${escapeHtml(project.name)}</option>`)
    .join("");
}

function renderBrandHealth() {
  const project = getActiveProject();
  const completeness = calculateCompleteness(project);
  els.brandHealth.textContent = `${completeness}%`;
  els.brandHealthCopy.textContent =
    completeness >= 90 ? "La marca tiene suficiente contexto para briefs consistentes." : "Faltan piezas de contexto que ayudan a evitar contenido genérico.";
}

function renderProjectForm() {
  const project = getActiveProject();
  els.projectForm.innerHTML = knowledgeFields
    .map(([key, label, type]) => {
      const value = escapeHtml(project[key] || "");
      const field =
        type === "textarea"
          ? `<textarea data-key="${key}" rows="4">${value}</textarea>`
          : `<input data-key="${key}" value="${value}" />`;
      return `<label>${label}${field}</label>`;
    })
    .join("") + `<button class="primary full" type="button" id="saveProjectBtn">Guardar base de conocimiento</button>`;

  document.querySelector("#saveProjectBtn").addEventListener("click", saveProjectForm);
}

function saveProjectForm() {
  const project = getActiveProject();
  els.projectForm.querySelectorAll("[data-key]").forEach((field) => {
    project[field.dataset.key] = field.value.trim();
  });
  saveState();
  renderAll();
}

function renderDiagnostics() {
  const project = getActiveProject();
  const missing = knowledgeFields.filter(([key]) => !String(project[key] || "").trim()).map(([, label]) => label);
  const topAngles = summarizePerformance(project).slice(0, 3);
  els.projectDiagnostics.innerHTML = [
    diagnosticCard("Contexto cargado", `${calculateCompleteness(project)}% completo. ${missing.length ? `Falta: ${missing.slice(0, 3).join(", ")}.` : "La base está lista para operar."}`),
    diagnosticCard("Ángulos con mejor señal", topAngles.length ? topAngles.map((item) => `${item.angle}: ${item.avg}%`).join(" · ") : "Aún no hay métricas reales suficientes."),
    diagnosticCard("Riesgo de consistencia", project.briefs.length > 6 ? "Ya hay suficiente historial para detectar patrones de fatiga y repetición." : "Genera y publica más piezas para que el sistema aprenda por marca.")
  ].join("");
}

function diagnosticCard(title, body) {
  return `<div class="diagnostic-card"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}

async function generateBriefFromBackend(input) {
  const button = els.briefForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Generando con IA...";
  renderLoadingBrief();

  try {
    const response = await fetch("/api/generate-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: getActiveProject(),
        input
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo generar el brief.");

    currentBrief = normalizeAiBrief(data);
    renderBrief(currentBrief);
  } catch (error) {
    renderBriefError(error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Generar brief estratégico";
  }
}

function normalizeAiBrief(brief) {
  return {
    ...brief,
    altHooks: Array.isArray(brief.altHooks) ? brief.altHooks : [],
    scenes: Array.isArray(brief.scenes) ? brief.scenes : [],
    aiPrompts: brief.aiPrompts || { chatgpt: "", midjourney: "", elevenlabs: "" },
    score: brief.score || {
      total: 0,
      dimensions: {},
      notes: "El modelo no devolvio scoring."
    },
    recommendation: brief.recommendation || "Revisar manualmente antes de producir."
  };
}

function generateBrief(project, input) {
  const awareness = awarenessMap[input.awareness];
  const angleStrategy = angleMap[input.angle];
  const pain = input.pain?.trim() || firstSentence(project.pains);
  const message = input.message?.trim() || `La decisión no es comprar ${project.category}; es proteger la transformación: ${project.transformation}`;
  const insight = buildInsight(project, input, pain);
  const hook = buildHook(project, input, pain);
  const altHooks = buildAltHooks(project, input, pain);
  const story = selectStoryType(input);
  const scenes = buildScenes(project, input, hook, pain, message, awareness, angleStrategy);
  const score = scoreBrief(project, input, pain, hook, scenes);
  const now = new Date().toISOString();

  return {
    id: `brief-${Date.now()}`,
    createdAt: now,
    status: score.total >= 82 ? "approved" : "draft",
    projectId: project.id,
    projectName: project.name,
    input,
    idea: insight,
    story,
    hook,
    altHooks,
    script: buildScript(project, input, hook, pain, message, awareness, story),
    scenes,
    caption: buildCaption(project, input, pain, message, awareness),
    cta: buildCta(input, awareness, project),
    aiPrompts: buildPrompts(project, input, hook, pain),
    score,
    recommendation: recommendation(score.total),
    metrics: null,
    scheduledDate: null
  };
}

function buildInsight(project, input, pain) {
  return `${project.name} debe convertir "${pain}" en una decisión de estatus silencioso: ${angleMap[input.angle]}. La pieza no vende por presión; vende porque le muestra al buyer que seguir improvisando contradice la identidad que quiere construir.`;
}

function buildHook(project, input, pain) {
  const hooks = {
    "Dolor latente": `Lo que realmente te está costando "${pain}" no es dinero. Es criterio.`,
    "Deseo aspiracional": `La diferencia entre comprar algo caro y construir una identidad premium está en esta decisión.`,
    "Objeción específica": `Si todavía piensas "es demasiado caro", mira qué estás comparando en realidad.`,
    "Comparación con opciones baratas": `La opción barata no siempre cuesta menos; a veces solo cobra más lento.`,
    "Error común del buyer": `El error que comete la gente con alto presupuesto cuando quiere resolver esto rápido.`,
    "Lifestyle habilitado": `No compras ${project.category}; compras la calma de saber que cada detalle habla por ti.`,
    "Historia del fundador": `Creamos ${project.name} porque el lujo empezó a verse demasiado fácil de copiar.`,
    "Caso de cliente": `Un cliente llegó con "${pain}" y terminó cambiando la forma en que tomaba decisiones.`,
    "Exclusividad": `Esto no es para quien quiere más opciones. Es para quien quiere mejor criterio.`,
    "Costo oculto de no comprar": `Cada mes postergando esta decisión tiene un costo que no aparece en la cotización.`
  };
  return hooks[input.angle] || hooks["Dolor latente"];
}

function buildAltHooks(project, input, pain) {
  return [
    `Si ${pain.toLowerCase()}, el problema probablemente no es falta de opciones.`,
    `Antes de invertir en ${project.category}, entiende esta diferencia.`,
    `La señal más clara de que estás listo para una solución premium no es el presupuesto.`,
    `Esto es lo que separa una compra cara de una decisión estratégica.`
  ];
}

function selectStoryType(input) {
  if (input.angle === "Caso de cliente") return "Transformación antes-después-prueba";
  if (input.angle === "Historia del fundador") return "Manifiesto con tensión de mercado";
  if (input.awareness.includes("No consciente")) return "Revelación de problema invisible";
  if (input.goal === "Cerrar venta") return "Objeción, prueba, decisión";
  return "Tensión, insight, mecanismo, siguiente paso";
}

function buildScript(project, input, hook, pain, message, awareness, story) {
  return [
    `Hook: ${hook}`,
    `Tensión: ${pain}. El buyer ya lo siente, pero normalmente lo justifica como falta de tiempo, exceso de opciones o miedo a equivocarse.`,
    `Insight: en una compra high ticket, el riesgo no es pagar más; es pagar por algo que no sostiene la transformación prometida.`,
    `Mecanismo: ${project.name} resuelve esto con ${project.offer}. La diferencia está en ${project.transformation.toLowerCase()}.`,
    `Prueba: apóyate en ${project.proof}. No lo presentes como premio; preséntalo como evidencia de criterio repetible.`,
    `Cierre: ${message}. Desde este nivel de conciencia, la pieza debe ${awareness.frame}.`,
    `CTA: ${awareness.cta}.`
  ].join("\n\n");
}

function buildScenes(project, input, hook, pain, message, awareness, angleStrategy) {
  const isVideo = ["Reel", "Stories", "Guion UGC", "YouTube Shorts", "TikTok"].includes(input.format) || input.platform !== "Email";
  if (!isVideo && input.format === "Email") {
    return [
      scene("Asunto", hook, "Texto limpio, sin exceso de signos.", "No aplica"),
      scene("Apertura", `Nombrar el dolor: ${pain}.`, "Primer párrafo corto, tono consultivo.", "No aplica"),
      scene("Cuerpo", `${awareness.frame}. Explicar por qué ${angleStrategy}.`, "Bloques de 2 a 3 líneas.", "No aplica"),
      scene("Cierre", message, "CTA directo con baja fricción.", "No aplica")
    ];
  }

  return [
    scene("0-3s", hook, "Texto grande en pantalla, plano visual con tensión clara.", "Close up de detalle premium o gesto de duda del buyer."),
    scene("3-8s", `Nombrar el problema real: ${pain}.`, "Voz en off pausada, sin dramatizar.", "Comparar una opción genérica versus una decisión curada."),
    scene("8-16s", `Reencuadre: ${angleStrategy}.`, "Mostrar el mecanismo, no solo el producto.", project.productionNotes),
    scene("16-24s", `Prueba: ${project.proof}.`, "Insertar evidencia visual o testimonial breve.", "Capturas, taller, cliente usando la solución, detalle de proceso."),
    scene("24-32s", message, "Cierre con autoridad tranquila.", "Plano final limpio del resultado o de la transformación habilitada.")
  ];
}

function scene(beat, onScreen, direction, broll) {
  return { beat, onScreen, direction, broll };
}

function buildCaption(project, input, pain, message, awareness) {
  return `${pain}.\n\nEn una decisión high ticket, lo caro no es elegir una solución premium. Lo caro es elegir algo que no sostiene la transformación que querías desde el principio.\n\nEn ${project.name}, la conversación empieza por criterio: qué resultado quieres, qué debes evitar y qué decisión tiene sentido para tu estándar.\n\n${message}\n\n${awareness.cta}.`;
}

function buildCta(input, awareness, project) {
  if (input.salesIntent >= 4) return `Escribe "CRITERIO" y te mostramos si ${project.name} tiene sentido para tu caso.`;
  if (input.funnel === "Top of funnel") return "Guarda esto antes de tomar una decisión solo por precio.";
  return awareness.cta;
}

function buildPrompts(project, input, hook, pain) {
  return {
    chatgpt: `Actúa como estratega senior de contenido high ticket para ${project.name}. Mantén este tono: ${project.voice}. Crea 5 variaciones del hook "${hook}" para ${input.platform}, formato ${input.format}, atacando "${pain}" desde el ángulo "${input.angle}". Evita lenguaje genérico y conserva la autoridad premium.`,
    midjourney: `Premium ecommerce brand ${project.name}, ${project.category}, natural light, editorial composition, tactile materials, quiet luxury, specific buyer tension: ${pain}, no cheap stock look, refined high-ticket visual language`,
    elevenlabs: `Voz cálida, segura y consultiva. Ritmo pausado, sin hype. Sensación de experto premium que aconseja, no vendedor agresivo. Leer el guion con intención de autoridad tranquila.`
  };
}

function generateBrief(project, input) {
  const context = buildGenerationContext(project, input);
  const awareness = awarenessMap[input.awareness];
  const angleStrategy = angleMap[input.angle];
  const insight = buildInsight(context);
  const hook = buildHook(context);
  const altHooks = buildAltHooks(context);
  const story = selectStoryType(context);
  const scenes = buildScenes(context, awareness, angleStrategy);
  const score = scoreBrief(project, input, context.pain, hook, scenes);
  const now = new Date().toISOString();

  return {
    id: `brief-${Date.now()}`,
    createdAt: now,
    status: score.total >= 82 ? "approved" : "draft",
    projectId: project.id,
    projectName: project.name,
    input,
    idea: insight,
    story,
    hook,
    altHooks,
    script: buildScript(context, awareness, story),
    scenes,
    caption: buildCaption(context, awareness),
    cta: buildCta(context, awareness),
    aiPrompts: buildPrompts(context),
    score,
    recommendation: recommendation(score.total),
    metrics: null,
    scheduledDate: null
  };
}

function buildGenerationContext(project, input) {
  const seed = `${project.id}-${input.platform}-${input.format}-${input.goal}-${input.funnel}-${input.awareness}-${input.angle}-${input.salesIntent}`;
  const buyerTruth = pickInsight(project.buyer, seed, "buyer de alto valor que no quiere sentirse vendido, quiere sentirse entendido");
  const storedPain = pickInsight(project.pains, seed, "miedo a pagar caro por una solucion que se siga sintiendo comun");
  const desire = pickInsight(project.desires, seed, "sentir que su decision comunica criterio, calma y estatus sin explicarlo");
  const objection = pickInsight(project.objections, seed, "no estar seguro de si la inversion realmente vale la diferencia");
  const proof = pickInsight(project.proof, seed, "evidencia concreta de clientes, proceso y resultado");
  const mechanism = pickInsight(project.offer, seed, project.category);
  const visualCode = pickInsight(project.productionNotes, seed, "visual sobrio, especifico y premium");
  const founderBelief = pickInsight(project.founderStory, seed, "la marca existe para reemplazar lujo generico por criterio real");
  const pain = cleanSentence(input.pain?.trim() || storedPain);
  const message = cleanSentence(input.message?.trim() || `la compra correcta protege esta transformacion: ${project.transformation}`);
  const enemy = inferEnemy(input.angle, objection, pain);

  return {
    project,
    input,
    seed,
    buyerTruth,
    pain,
    desire,
    objection,
    proof,
    mechanism,
    visualCode,
    founderBelief,
    message,
    enemy,
    awareness: awarenessMap[input.awareness],
    angleStrategy: angleMap[input.angle]
  };
}

function buildInsight(ctx) {
  return [
    `La pieza debe dramatizar una tension especifica: ${ctx.pain}.`,
    `El conflicto no es "comprar o no comprar"; es seguir tolerando ${ctx.enemy} cuando el buyer quiere ${ctx.desire}.`,
    `La resolucion narrativa es presentar a ${ctx.project.name} como criterio aplicado: ${ctx.mechanism}.`,
    `La prueba debe aparecer como evidencia natural, no como alarde: ${ctx.proof}.`
  ].join(" ");
}

function buildHook(ctx) {
  const hooks = {
    "Dolor latente": `Tu ${lowerFirst(ctx.project.category)} puede verse caro y aun asi contar la historia equivocada.`,
    "Deseo aspiracional": `El verdadero lujo no es que se note el precio. Es que se note el criterio.`,
    "Objeción específica": `Si la duda es "${ctx.objection}", probablemente estas comparando precio contra tranquilidad.`,
    "Comparación con opciones baratas": `La alternativa barata no compite con ${ctx.project.name}; compite con tu paciencia.`,
    "Error común del buyer": `El error no es gastar mucho. Es decidir rapido algo que vas a mirar todos los dias.`,
    "Lifestyle habilitado": `Lo que compras aqui no es ${lowerFirst(ctx.project.category)}. Es una casa que deja de pedir explicaciones.`,
    "Historia del fundador": `${ctx.project.name} nacio contra una idea: que el lujo puede fabricarse sin alma.`,
    "Caso de cliente": `Llego con "${ctx.pain}" y descubrio que el problema no era el presupuesto.`,
    "Exclusividad": `Esto no es para quien quiere mas opciones. Es para quien ya sabe filtrar.`,
    "Costo oculto de no comprar": `Cada decision "provisional" tambien decora tu casa. Solo que peor.`
  };
  return hooks[ctx.input.angle] || `La decision premium no empieza en el producto. Empieza en lo que ya no estas dispuesto a tolerar.`;
}

function buildAltHooks(ctx) {
  return [
    `Si ${lowerFirst(ctx.pain)}, no necesitas mas opciones: necesitas mejor criterio.`,
    `La pregunta no es si ${ctx.project.name} cuesta mas. Es que te cuesta seguir improvisando.`,
    `Un buyer premium no paga por el objeto. Paga por dejar de dudar.`,
    `Antes de elegir por precio, mira que identidad estas comprando sin darte cuenta.`
  ];
}

function selectStoryType(ctx) {
  const byAngle = {
    "Caso de cliente": "Antes / decision equivocada / criterio / transformacion visible",
    "Historia del fundador": "Enemigo del mercado / creencia fundadora / nueva forma de decidir",
    "Objeción específica": "Objecion nombrada / falsa comparacion / prueba / siguiente paso",
    "Comparación con opciones baratas": "Ahorro aparente / costo oculto / criterio premium",
    "Costo oculto de no comprar": "Postergacion / acumulacion de perdida / decision inevitable",
    "Exclusividad": "Filtro / pertenencia / estandar / accion selectiva"
  };
  if (byAngle[ctx.input.angle]) return byAngle[ctx.input.angle];
  if (ctx.input.awareness.includes("No consciente")) return "Sintoma cotidiano / tension invisible / nuevo marco mental";
  if (ctx.input.goal === "Cerrar venta") return "Riesgo de esperar / prueba / accion directa";
  return "Tension especifica / reencuadre / mecanismo / prueba / microdecision";
}

function buildScript(ctx, awareness, story) {
  return [
    `Hook: ${buildHook(ctx)}`,
    `Escena mental: habla con alguien que ${ctx.buyerTruth}. No le vendas primero; haz que se reconozca.`,
    `Tension: ${ctx.pain}. La trampa es pensar que se resuelve con mas opciones, cuando en realidad se resuelve con un estandar de decision mas claro.`,
    `Reencuadre: ${ctx.angleStrategy}. En este punto del funnel, el mensaje debe ${awareness.frame}.`,
    `Mecanismo: ${ctx.project.name} no promete "mas lujo"; promete ${lowerFirst(ctx.project.transformation)} mediante ${ctx.mechanism}.`,
    `Prueba integrada: muestra ${ctx.proof}. La prueba debe aparecer como consecuencia del proceso, no como medalla.`,
    `Objecion anticipada: si aparece "${ctx.objection}", responde con calma: el costo real no es pagar mas, es repetir una compra que no cambia la experiencia.`,
    `Cierre narrativo: ${ctx.message}.`,
    `CTA hablado: ${buildCta(ctx, awareness)}`
  ].join("\n\n");
}

function buildScenes(ctx, awareness, angleStrategy) {
  const isEmail = ctx.input.format === "Email" || ctx.input.platform === "Email";
  if (isEmail) {
    return [
      scene("Asunto", buildHook(ctx), "Debe sonar como una observacion privada, no como promocion.", "No aplica"),
      scene("Apertura", `Nombrar la tension: ${ctx.pain}.`, `Primer parrafo con espejo del buyer: ${ctx.buyerTruth}.`, "No aplica"),
      scene("Cuerpo", `Reencuadrar: ${angleStrategy}.`, `Explicar el mecanismo: ${ctx.mechanism}. Incluir objecion: ${ctx.objection}.`, "No aplica"),
      scene("Prueba", `Evidencia: ${ctx.proof}.`, "Una prueba especifica, sin exagerar claims.", "No aplica"),
      scene("Cierre", ctx.message, `CTA: ${buildCta(ctx, awareness)}.`, "No aplica")
    ];
  }

  return [
    scene("0-2s", buildHook(ctx), "Abrir con una frase que incomode con elegancia. No explicar todavia.", ctx.visualCode),
    scene("2-6s", `El problema no es falta de presupuesto; es ${ctx.enemy}.`, "Plano con contraste: decision generica vs detalle con criterio.", "Objeto comun, espacio sin coherencia, gesto de revision o duda."),
    scene("6-13s", `Lo que el buyer quiere en realidad: ${ctx.desire}.`, "Convertir deseo aspiracional en escena concreta, visible y humana.", ctx.visualCode),
    scene("13-21s", `El mecanismo: ${ctx.mechanism}.`, `Mostrar proceso, criterio y detalle. Evitar decir "premium" sin demostrarlo.`, ctx.project.productionNotes),
    scene("21-28s", `Prueba: ${ctx.proof}.`, "Incluir evidencia en pantalla: testimonio, proceso, referencia, antes/despues o detalle tecnico.", "Captura breve, taller, cliente, textura, entrega o resultado final."),
    scene("28-35s", ctx.message, `Cierre con autoridad tranquila. CTA: ${buildCta(ctx, awareness)}.`, "Plano final limpio que represente la transformacion, no solo el producto.")
  ];
}

function scene(beat, onScreen, direction, broll) {
  return { beat, onScreen, direction, broll };
}

function buildCaption(ctx, awareness) {
  return [
    `${ctx.pain}.`,
    `Eso rara vez se arregla con mas opciones. Se arregla cuando la decision empieza desde el estandar correcto.`,
    `El buyer que ${ctx.buyerTruth} no busca que le vendan mas fuerte. Busca una forma de decidir con menos ruido y mas criterio.`,
    `En ${ctx.project.name}, la diferencia esta en ${ctx.mechanism}: ${lowerFirst(ctx.project.transformation)}.`,
    `Si la objecion es "${ctx.objection}", la pregunta honesta no es cuanto cuesta. Es que te cuesta repetir una decision que no transforma nada.`,
    `${ctx.message}`,
    `${buildCta(ctx, awareness)}`
  ].join("\n\n");
}

function buildCta(ctx, awareness) {
  if (Number(ctx.input.salesIntent) >= 4) return `Escribe "CRITERIO" y revisamos si ${ctx.project.name} tiene sentido para tu caso.`;
  if (ctx.input.funnel === "Top of funnel") return "Guarda esto antes de decidir desde precio, urgencia o cansancio.";
  if (ctx.input.goal === "Construir confianza") return "Mira el proceso antes de comparar solo el resultado final.";
  return awareness.cta;
}

function buildPrompts(ctx) {
  return {
    chatgpt: [
      `Actua como estratega senior de contenido high ticket para ${ctx.project.name}.`,
      `Contexto de marca: ${ctx.project.personality}. Tono: ${ctx.project.voice}. Oferta: ${ctx.project.offer}. Precio: ${ctx.project.price}.`,
      `Buyer: ${ctx.project.buyer}. Dolor: ${ctx.pain}. Deseo: ${ctx.desire}. Objecion: ${ctx.objection}. Prueba disponible: ${ctx.proof}.`,
      `Genera 5 variaciones mas filosas del hook "${buildHook(ctx)}" para ${ctx.input.platform} / ${ctx.input.format}.`,
      `Reglas: no usar frases genericas como "eleva tu estilo", "transforma tu vida" o "solucion premium"; cada hook debe contener una tension concreta, una creencia del buyer y una razon para seguir viendo.`
    ].join(" "),
    midjourney: [
      `${ctx.project.name}, ${ctx.project.category}, high-ticket ecommerce editorial visual,`,
      `buyer tension: ${ctx.pain}, desired identity: ${ctx.desire},`,
      `${ctx.visualCode}, tactile proof of craft/process, natural imperfections, real environment,`,
      `quiet authority, no generic luxury stock photo, no glossy fake showroom, no overdone gold, no text`
    ].join(" "),
    elevenlabs: [
      `Voz en off para marca high ticket. Tono: ${ctx.project.voice}.`,
      `Interpretacion: hablar como asesor con criterio, no como vendedor. Pausas despues del hook y antes del reencuadre.`,
      `Subtexto emocional: el buyer teme equivocarse en una decision visible y cara, pero quiere sentirse seguro sin que lo presionen.`
    ].join(" ")
  };
}

function scoreBrief(project, input, pain, hook, scenes) {
  const hasSpecificProject = averageTextLength([project.buyer, project.pains, project.desires, project.objections, project.proof]) > 80;
  const dimensions = {
    hook: clampScore(hook.length > 55 ? 86 : 72),
    pain: clampScore(pain.length > 30 ? 88 : 68),
    desire: clampScore(project.desires.length > 80 ? 84 : 70),
    authority: clampScore(project.proof.length > 60 ? 86 : 66),
    trust: clampScore(project.objections.length > 60 ? 82 : 68),
    conversion: clampScore(Number(input.salesIntent) * 11 + (input.funnel.includes("Bottom") || input.funnel === "Retargeting" ? 34 : 24)),
    production: clampScore(input.production === "Baja" ? 90 : input.production === "Media" ? 78 : 62),
    brandFit: clampScore(hasSpecificProject ? 90 : 64),
    virality: clampScore(input.angle.includes("Error") || input.angle.includes("Costo") || input.angle.includes("baratas") ? 84 : 72)
  };
  const total = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.keys(dimensions).length);
  return { total, dimensions, notes: scoreNotes(dimensions, scenes) };
}

function scoreNotes(dimensions) {
  const low = Object.entries(dimensions).filter(([, value]) => value < 75).map(([key]) => key);
  if (!low.length) return "La pieza tiene suficiente especificidad, tensión y claridad de producción para pasar a aprobación.";
  return `Conviene iterar: ${low.join(", ")}. Revisa si falta prueba, deseo o una objeción más concreta.`;
}

function recommendation(score) {
  if (score >= 82) return "Publicar o mandar a producción. Solo requiere revisión humana final.";
  if (score >= 72) return "Iterar hook, prueba o CTA antes de producir.";
  return "Replantear ángulo o nivel de conciencia. La idea aún no tiene suficiente tensión estratégica.";
}

function renderBrief(brief) {
  els.briefOutput.innerHTML = `
    <div class="brief-header">
      <div class="brief-title-row">
        <div>
          <p class="eyebrow">${escapeHtml(brief.projectName)} · ${escapeHtml(brief.input.platform)} · ${escapeHtml(brief.input.format)}</p>
          <h2>${escapeHtml(brief.hook)}</h2>
        </div>
        <div class="score-badge"><strong>${brief.score.total}</strong><span>score</span></div>
      </div>
      <div class="recommendation">${escapeHtml(brief.recommendation)}</div>
      <div class="meta-grid">
        ${metaItem("Conciencia", brief.input.awareness)}
        ${metaItem("Ángulo", brief.input.angle)}
        ${metaItem("Storytelling", brief.story)}
      </div>
    </div>

    ${briefSection("Idea central", `<p>${escapeHtml(brief.idea)}</p>`)}
    ${briefSection("Hooks alternativos", `<ol>${brief.altHooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join("")}</ol>`)}
    ${briefSection("Guion completo", `<p>${escapeHtml(brief.script).replaceAll("\n", "<br>")}</p>`)}
    ${briefSection("Escenas y producción", renderScenes(brief.scenes))}
    ${briefSection("Caption y CTA", `<p>${escapeHtml(brief.caption).replaceAll("\n", "<br>")}</p><p><strong>CTA:</strong> ${escapeHtml(brief.cta)}</p>`)}
    ${briefSection("Prompts IA", renderPrompts(brief.aiPrompts))}
    ${briefSection("Scoring", renderScore(brief.score))}
    <div class="action-strip">
      <button class="primary" id="approveBriefBtn" type="button">Aprobar y guardar</button>
      <button class="secondary" id="iterateHookBtn" type="button">Regenerar con IA</button>
      <button class="secondary" id="copyBriefBtn" type="button">Copiar brief</button>
    </div>
  `;

  document.querySelector("#approveBriefBtn").addEventListener("click", approveBrief);
  document.querySelector("#iterateHookBtn").addEventListener("click", regenerateCurrentBriefWithAi);
  document.querySelector("#copyBriefBtn").addEventListener("click", () => navigator.clipboard.writeText(briefToText(brief)));
}

function renderEmptyBrief() {
  els.briefOutput.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">+</span>
      <h2>El brief aparecerá aquí</h2>
      <p>Selecciona una marca, define intención, conciencia y ángulo. El resultado quedará listo para producción y aprobación.</p>
    </div>`;
}

function renderLoadingBrief() {
  els.briefOutput.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">AI</span>
      <h2>Generando brief con IA</h2>
      <p>El backend esta combinando la base de conocimiento, los inputs, el nivel de conciencia y el angulo creativo en un prompt estrategico.</p>
    </div>`;
}

function renderBriefError(message) {
  els.briefOutput.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">!</span>
      <h2>No se pudo generar el brief</h2>
      <p>${escapeHtml(message)}</p>
    </div>`;
}

function metaItem(label, value) {
  return `<div class="meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function briefSection(title, body) {
  return `<section class="brief-section"><h3>${escapeHtml(title)}</h3>${body}</section>`;
}

function renderScenes(scenes) {
  return `<ol>${scenes.map((item) => `<li><strong>${escapeHtml(item.beat)}:</strong> ${escapeHtml(item.onScreen)}<br><span class="card-meta">Dirección: ${escapeHtml(item.direction)}<br>B-roll: ${escapeHtml(item.broll)}</span></li>`).join("")}</ol>`;
}

function renderPrompts(prompts) {
  return Object.entries(prompts).map(([tool, prompt]) => `<p><strong>${escapeHtml(tool)}:</strong> ${escapeHtml(prompt)}</p>`).join("");
}

function renderScore(score) {
  return `
    <div class="score-grid">
      ${Object.entries(score.dimensions).map(([label, value]) => `<div class="score-item"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("")}
    </div>
    <p>${escapeHtml(score.notes)}</p>
  `;
}

function approveBrief() {
  if (!currentBrief) return;
  const project = getActiveProject();
  const existing = project.briefs.find((brief) => brief.id === currentBrief.id);
  currentBrief.status = "approved";
  if (!existing) project.briefs.unshift(currentBrief);
  saveState();
  renderAll();
}

async function regenerateCurrentBriefWithAi() {
  if (!currentBrief) return;
  await generateBriefFromBackend(currentBrief.input);
}

function iterateHooks() {
  if (!currentBrief) return;
  const context = buildGenerationContext(getActiveProject(), currentBrief.input);
  currentBrief.altHooks = buildAltHooks(context).reverse();
  currentBrief.hook = currentBrief.altHooks[0];
  currentBrief.script = buildScript(context, context.awareness, currentBrief.story);
  currentBrief.score = scoreBrief(getActiveProject(), currentBrief.input, context.pain, currentBrief.hook, currentBrief.scenes);
  renderBrief(currentBrief);
}

function planWeek() {
  const project = getActiveProject();
  const approved = project.briefs.filter((brief) => brief.status === "approved");
  const start = new Date();
  approved.slice(0, 7).forEach((brief, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    brief.scheduledDate = day.toISOString().slice(0, 10);
  });
  saveState();
  renderCalendar();
}

function renderCalendar() {
  const project = getActiveProject();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() + index);
    return day;
  });
  const angleCounts = {};
  project.briefs.filter((brief) => brief.scheduledDate).forEach((brief) => {
    angleCounts[brief.input.angle] = (angleCounts[brief.input.angle] || 0) + 1;
  });
  const fatigued = Object.entries(angleCounts).find(([, count]) => count >= 3);
  els.fatigueAlert.classList.toggle("hidden", !fatigued);
  els.fatigueAlert.textContent = fatigued ? `Alerta de fatiga: el ángulo "${fatigued[0]}" aparece ${fatigued[1]} veces en la semana. Alterna con prueba social, objeción o deseo.` : "";

  els.calendarGrid.innerHTML = days
    .map((day) => {
      const date = day.toISOString().slice(0, 10);
      const items = project.briefs.filter((brief) => brief.scheduledDate === date);
      return `<div class="day-column"><h3>${day.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" })}</h3>${items.length ? items.map(renderCalendarItem).join("") : `<p class="card-meta">Sin piezas asignadas</p>`}</div>`;
    })
    .join("");
}

function renderCalendarItem(brief) {
  return `<article class="calendar-item"><strong>${escapeHtml(brief.hook)}</strong><span class="card-meta">${escapeHtml(brief.input.platform)} · ${escapeHtml(brief.input.format)} · ${escapeHtml(brief.input.angle)}</span><span class="tag">Score ${brief.score.total}</span></article>`;
}

function renderLibrary() {
  const project = getActiveProject();
  const query = els.librarySearch.value.toLowerCase();
  const filter = els.libraryFilter.value;
  const briefs = project.briefs.filter((brief) => {
    const haystack = `${brief.hook} ${brief.input.angle} ${brief.input.format}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && brief.status === "approved") ||
      (filter === "published" && brief.metrics) ||
      (filter === "winner" && brief.metrics && calculateRealScore(brief.metrics) >= 80);
    return matchesQuery && matchesFilter;
  });
  els.libraryList.innerHTML = briefs.length ? briefs.map(renderLibraryCard).join("") : `<div class="empty-state"><p>No hay briefs guardados para este filtro.</p></div>`;
  document.querySelectorAll(".metric-form").forEach((form) => form.addEventListener("submit", saveMetrics));
}

function renderLibraryCard(brief) {
  const realScore = brief.metrics ? calculateRealScore(brief.metrics) : null;
  return `
    <article class="library-card">
      <header>
        <div>
          <span class="card-meta">${escapeHtml(brief.input.platform)} · ${escapeHtml(brief.input.format)} · ${escapeHtml(brief.input.angle)}</span>
          <h3>${escapeHtml(brief.hook)}</h3>
        </div>
        <span class="tag">${realScore ? `Real ${realScore}` : `Score ${brief.score.total}`}</span>
      </header>
      <p>${escapeHtml(brief.idea)}</p>
      <form class="metric-form" data-id="${brief.id}">
        <label>Engagement<input name="engagement" type="number" min="0" value="${brief.metrics?.engagement || ""}" /></label>
        <label>Clics<input name="clicks" type="number" min="0" value="${brief.metrics?.clicks || ""}" /></label>
        <label>Leads<input name="leads" type="number" min="0" value="${brief.metrics?.leads || ""}" /></label>
        <label>Ventas<input name="sales" type="number" min="0" value="${brief.metrics?.sales || ""}" /></label>
        <button class="secondary" type="submit">Guardar</button>
      </form>
    </article>
  `;
}

function saveMetrics(event) {
  event.preventDefault();
  const project = getActiveProject();
  const brief = project.briefs.find((item) => item.id === event.currentTarget.dataset.id);
  brief.metrics = Object.fromEntries(new FormData(event.currentTarget).entries());
  brief.status = "published";
  saveState();
  renderLibrary();
  renderDiagnostics();
}

function createProjectFromDialog() {
  const name = document.querySelector("#dialogProjectName").value.trim();
  const category = document.querySelector("#dialogProjectCategory").value.trim();
  if (!name) return;
  const id = slugify(name);
  const project = Object.fromEntries(knowledgeFields.map(([key]) => [key, ""]));
  Object.assign(project, {
    id,
    name,
    category,
    briefs: []
  });
  state.projects.push(project);
  state.activeProjectId = id;
  saveState();
  els.dialog.close();
  renderAll();
  switchView("projects");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "paguro-storytelling-os.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = JSON.parse(reader.result);
      saveState();
      renderAll();
    } catch {
      alert("El archivo no tiene un formato válido.");
    }
  };
  reader.readAsText(file);
}

function briefToText(brief) {
  return [
    `MARCA: ${brief.projectName}`,
    `HOOK: ${brief.hook}`,
    `IDEA: ${brief.idea}`,
    `GUION:\n${brief.script}`,
    `CAPTION:\n${brief.caption}`,
    `CTA: ${brief.cta}`,
    `SCORE: ${brief.score.total} - ${brief.recommendation}`
  ].join("\n\n");
}

function summarizePerformance(project) {
  const groups = {};
  project.briefs.filter((brief) => brief.metrics).forEach((brief) => {
    const angle = brief.input.angle;
    groups[angle] = groups[angle] || [];
    groups[angle].push(calculateRealScore(brief.metrics));
  });
  return Object.entries(groups)
    .map(([angle, scores]) => ({ angle, avg: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) }))
    .sort((a, b) => b.avg - a.avg);
}

function calculateRealScore(metrics) {
  const engagement = Number(metrics.engagement || 0);
  const clicks = Number(metrics.clicks || 0);
  const leads = Number(metrics.leads || 0);
  const sales = Number(metrics.sales || 0);
  return clampScore(Math.round(engagement * 0.25 + clicks * 0.25 + leads * 4 + sales * 15));
}

function calculateCompleteness(project) {
  const filled = knowledgeFields.filter(([key]) => String(project[key] || "").trim().length > 12).length;
  return Math.round((filled / knowledgeFields.length) * 100);
}

function averageTextLength(values) {
  return values.reduce((sum, value) => sum + String(value || "").length, 0) / values.length;
}

function pickInsight(text, seed, fallback) {
  const parts = splitIdeas(text);
  if (!parts.length) return fallback;
  const index = Math.abs(hashString(`${seed}-${text}`)) % parts.length;
  return cleanSentence(parts[index]);
}

function splitIdeas(text) {
  return String(text || "")
    .split(/[\n.;]+/)
    .map((part) => cleanSentence(part))
    .filter((part) => part.length > 8);
}

function cleanSentence(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/^[-:,\s]+|[-:,\s]+$/g, "")
    .trim();
}

function inferEnemy(angle, objection, pain) {
  const enemies = {
    "Dolor latente": `un sintoma que ya normalizo: ${lowerFirst(pain)}`,
    "Deseo aspiracional": "comprar objetos caros que no construyen una identidad coherente",
    "Objeción específica": `confundir "${objection}" con una razon objetiva para esperar`,
    "Comparación con opciones baratas": "ahorrar en la decision visible y pagar despues con frustracion",
    "Error común del buyer": "tomar una decision permanente con criterio provisional",
    "Lifestyle habilitado": "vivir rodeado de piezas que no estan a la altura del estilo que ya tiene",
    "Historia del fundador": "aceptar lujo sin punto de vista",
    "Caso de cliente": "resolver un sintoma sin cambiar el criterio de decision",
    "Exclusividad": "buscar demasiadas opciones cuando lo que falta es filtro",
    "Costo oculto de no comprar": "postergar una decision que sigue costando atencion, tiempo y seguridad"
  };
  return enemies[angle] || `seguir tolerando ${lowerFirst(pain)}`;
}

function lowerFirst(value) {
  const text = cleanSentence(value);
  if (!text) return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function firstSentence(text) {
  return String(text || "un problema que todavía no ha sido formulado con claridad").split(".")[0];
}

function clampScore(value) {
  return Math.max(48, Math.min(96, Math.round(value)));
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(defaultState);
  try {
    return JSON.parse(stored);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
