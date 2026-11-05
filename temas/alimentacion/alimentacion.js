// ===== Alimentación infantil: juegos y examen del plan semanal =====
// Los datos, las reglas, el catálogo de platos y los fallos están en data.js.

const FOOD_SCREENS = ["foodMenu", "foodAprender", "foodClasificar", "foodFrecuencia", "foodExamen"];
const FOOD_SLOTS = ["plato", "postre"];
const FOOD_SLOT_NAMES = { plato: "Plato", postre: "Postre" };
const CARB_TYPE_NAMES = {
  kart_frisch: "patata fresca",
  kart_sobre: "patata de sobre",
  reis: "arroz",
  nudeln: "pasta",
  vollnudeln: "pasta integral",
  brot: "pan",
  vollbrot: "pan integral",
  vollreis: "cereal integral"
};

function showFoodScreen(id) {
  FOOD_SCREENS.forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function showFoodMenu() {
  showFoodScreen("foodMenu");
}

function startFoodGame(mode) {
  if (mode === "aprender") { showFoodScreen("foodAprender"); renderLearn(); }
  else if (mode === "clasificar") { showFoodScreen("foodClasificar"); startClassify(); }
  else if (mode === "frecuencia") { showFoodScreen("foodFrecuencia"); startFreq(); }
  else if (mode === "examen") { showFoodScreen("foodExamen"); startExam(); }
}

function foodRandInt(n) {
  return Math.floor(Math.random() * n);
}

// ----- Generador de planes -----

// Plan base (5 días) que cumple todas las reglas, con platos del catálogo
function buildBaseline() {
  for (let t = 0; t < 5000; t++) {
    const kinds = shuffleList(["veg", "veg", "veg", "veg", randomPick(["meat", "fish"])]);
    const rawDays = shuffleList([0, 1, 2, 3, 4]).slice(0, 2 + foodRandInt(2));
    const fruitDays = shuffleList([0, 1, 2, 3, 4]).slice(0, 2 + foodRandInt(2));
    const plan = FOOD_DAYS.map((_, i) => ({
      day: i,
      main: pickMain(kinds[i]),
      carb: pickFrom(FOOD_CARB_BASE_POOL),
      raw: rawDays.includes(i) ? pickFrom(FOOD_RAW_BASE_POOL) : pickFrom(FOOD_COOKED_POOL),
      dessert: fruitDays.includes(i) ? pickFrom(FOOD_FRUIT_POOL) : pickFrom(FOOD_DESSERT_POOL)
    }));
    if (checkPlan(plan).length === 0) return plan;
  }
  throw new Error("No se pudo crear el plan base");
}

// Celdas "día-slot" en las que el plan difiere del plan base
// Celdas "día-plato" o "día-postre" en las que el plan difiere del plan base
function plateKey(d) {
  return [d.main, d.carb, d.raw].map(x => (x ? x.de : "")).join("|");
}

function changedCells(base, plan) {
  const out = [];
  plan.forEach((d, i) => {
    if (plateKey(d) !== plateKey(base[i])) out.push(i + "-plato");
    if (d.dessert.de !== base[i].dessert.de) out.push(i + "-postre");
  });
  return out;
}

// Plan con nErrors fallos de reglas distintas, cada uno en una celda distinta.
// Devuelve { base, plan, errors, broken }: las reglas incumplidas son exactamente las de los fallos.
function makeExam(nErrors) {
  for (let t = 0; t < 2000; t++) {
    const base = buildBaseline();
    let plan = clonePlan(base);
    const used = new Set();
    const applied = [];
    for (const err of shuffleList(FOOD_ERRORS)) {
      if (applied.length === nErrors) break;
      if (err.rules.some(r => used.has(r))) continue;
      const next = err.apply(clonePlan(plan));
      if (!next) continue;
      // Cada fallo cambia exactamente una celda más: un fallo = un plato que sustituir
      if (changedCells(base, next).length !== applied.length + 1) continue;
      plan = next;
      applied.push(err);
      err.rules.forEach(r => used.add(r));
    }
    if (applied.length !== nErrors) continue;
    const broken = checkPlan(plan);
    if (sameSet(broken, sortRules([...used]))) return { base, plan, errors: applied, broken };
  }
  throw new Error("No se pudo crear el plan con fallos");
}

function cellHtml(x) {
  return `${x.de}<br><small>${x.es}</small>`;
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// ----- Aprender -----

// Niveles de la pirámide de arriba abajo (de menos a más consumo; lo de arriba se toma con moderación)
const PYRAMID_LEVELS = [
  ["extras"],
  ["oele"],
  ["milch", "protein"],
  ["getreide"],
  ["obst"],
  ["getraenke"]
];

// Ejemplos que se muestran en la pirámide por grupo (la lista completa está en el juego Clasificar)
const PYRAMID_EXAMPLES_PER_GROUP = 5;

function pyramidGroupHtml(id) {
  const group = FOOD_GROUPS.find(g => g.id === id);
  const items = FOOD_ITEMS.filter(i => i.g === id);
  const shown = items.slice(0, PYRAMID_EXAMPLES_PER_GROUP);
  const rest = items.length - shown.length;
  const chips = shown.map(i => `<span class="pyr-chip">${i.de} <small>${i.es}</small></span>`).join("")
    + (rest > 0 ? `<span class="pyr-chip pyr-more">+${rest} más</span>` : "");
  return `
    <div class="pyr-group pyr-${id}">
      <strong>${group.de}</strong>
      <small>${group.es}</small>
      <div class="pyr-chips">${chips}</div>
    </div>`;
}

function renderLearn() {
  const levels = PYRAMID_LEVELS.map((ids, i) => {
    const width = 40 + i * 12; // la base es más ancha que la punta
    return `<div class="pyr-level" style="width: ${width}%;">${ids.map(pyramidGroupHtml).join("")}</div>`;
  }).join("");
  const points = FOOD_POINTS.map(p => `<li><strong>${p.de}</strong><br><small>${p.es}</small></li>`).join("");
  document.getElementById("learnArea").innerHTML = `
    <h3 class="food-title">Pirámide alimentaria</h3>
    <p class="food-hint">Abajo están los alimentos que más se comen; arriba, los que menos.</p>
    <div class="pyramid">${levels}</div>
    <h3 class="food-title">Checklist de la semana</h3>
    <ul class="learn-list">${points}</ul>
    <p class="food-hint">El punto 4 (Wunschessen de los niños) no se puede comprobar con un plan semanal, por eso no aparece aquí.</p>`;
}

// ----- Clasificar alimentos -----

let classifyState = null;

function startClassify() {
  classifyState = { item: null, ok: 0, total: 0, answered: false, lastOk: false };
  nextClassify();
}

function nextClassify() {
  classifyState.item = randomPick(FOOD_ITEMS);
  classifyState.answered = false;
  renderClassify();
}

function answerClassify(groupId) {
  const st = classifyState;
  if (st.answered) return;
  st.answered = true;
  st.total++;
  st.lastOk = groupId === st.item.g;
  if (st.lastOk) st.ok++;
  renderClassify();
}

function renderClassify() {
  const st = classifyState;
  const it = st.item;
  const group = FOOD_GROUPS.find(g => g.id === it.g);
  let feedback = "";
  if (st.answered) {
    feedback = st.lastOk
      ? `<div class="who-feedback"><span style="color:#16a34a;">✅ ${it.de} (${it.es}) va en: <strong>${group.de}</strong></span></div>`
      : `<div class="who-feedback"><span style="color:#dc2626;">❌ ${it.de} (${it.es}) va en: <strong>${group.de}</strong></span></div>`;
  }
  const buttons = FOOD_GROUPS.map(g => `
    <button class="group-btn" ${st.answered ? "disabled" : ""} onclick="answerClassify('${g.id}')">
      ${g.de}<small>${g.es}</small>
    </button>`).join("");
  document.getElementById("classifyArea").innerHTML = `
    <div class="game-status">Aciertos: ${st.ok} / ${st.total}</div>
    <div class="food-card"><strong>${it.de}</strong></div>
    <p class="food-hint">¿A qué grupo de la pirámide pertenece?</p>
    <div class="group-grid">${buttons}</div>
    ${feedback}
    ${st.answered ? `<div class="btn-action-row"><button class="btn-primary" onclick="nextClassify()">Siguiente →</button></div>` : ""}`;
}

// ----- ¿Con qué frecuencia? -----

let freqState = null;

function startFreq() {
  freqState = { item: null, ok: 0, total: 0, answered: false, lastOk: false };
  nextFreq();
}

function nextFreq() {
  freqState.item = randomPick(FOOD_ITEMS);
  freqState.answered = false;
  renderFreq();
}

function answerFreq(freqId) {
  const st = freqState;
  if (st.answered) return;
  st.answered = true;
  st.total++;
  st.lastOk = freqId === foodFreqOf(st.item);
  if (st.lastOk) st.ok++;
  renderFreq();
}

function renderFreq() {
  const st = freqState;
  const it = st.item;
  const correct = FOOD_FREQS.find(f => f.id === foodFreqOf(it));
  let feedback = "";
  if (st.answered) {
    feedback = st.lastOk
      ? `<div class="who-feedback"><span style="color:#16a34a;">✅ ${it.de} (${it.es}): <strong>${correct.es}</strong></span></div>`
      : `<div class="who-feedback"><span style="color:#dc2626;">❌ ${it.de} (${it.es}): <strong>${correct.es}</strong></span></div>`;
  }
  const buttons = FOOD_FREQS.map(f => `
    <button class="group-btn" ${st.answered ? "disabled" : ""} onclick="answerFreq('${f.id}')">
      ${f.es}<small>${f.de}</small>
    </button>`).join("");
  document.getElementById("freqArea").innerHTML = `
    <div class="game-status">Aciertos: ${st.ok} / ${st.total}</div>
    <div class="food-card"><strong>${it.de}</strong><br><small>${it.es}</small></div>
    <p class="food-hint">¿Con qué frecuencia conviene servir este alimento?</p>
    <div class="group-grid">${buttons}</div>
    ${feedback}
    ${st.answered ? `<div class="btn-action-row"><button class="btn-primary" onclick="nextFreq()">Siguiente →</button></div>` : ""}`;
}
// ----- Examen semanal -----
// Fases: select (marcar 3 platos o postres) → pick (elegir 3 sustitutos del catálogo) → done (resultado)

let examState = null;

function startExam() {
  const res = makeExam(3);
  examState = {
    base: res.base,           // plan con los fallos
    broken: res.broken,       // reglas incumplidas por el plan original
    phase: "select",
    removed: [],              // { day, slot }, máximo 3
    placed: {},               // "día-slot" → plato o postre del catálogo que sustituye
    slotFilter: "plato",
    search: "",
    msg: "",
    newPlan: null
  };
  renderExam();
}

function cellKey(day, slot) {
  return day + "-" + slot;
}

function isRemoved(st, day, slot) {
  return st.removed.some(r => r.day === day && r.slot === slot);
}

function examToggleCell(day, slot) {
  const st = examState;
  if (st.phase !== "select") return;
  const i = st.removed.findIndex(r => r.day === day && r.slot === slot);
  if (i >= 0) st.removed.splice(i, 1);
  else if (st.removed.length < 3) st.removed.push({ day, slot });
  renderExam();
}

function examGoPick() {
  const st = examState;
  if (st.removed.length !== 3) return;
  st.phase = "pick";
  st.slotFilter = st.removed[0].slot;
  st.msg = "";
  renderExam();
}

function examBackToSelect() {
  const st = examState;
  st.phase = "select";
  st.removed = [];
  st.placed = {};
  st.msg = "";
  st.newPlan = null;
  renderExam();
}

function examSetFilter(slot) {
  examState.slotFilter = slot;
  renderExam();
}

function examSearch(text) {
  examState.search = text;
  renderExamCatalog();
}

function examCatalog(slot) {
  return slot === "plato" ? FOOD_PLATE_CATALOG : FOOD_DESSERT_CATALOG;
}

function examPick(slot, idx) {
  const st = examState;
  const dish = examCatalog(slot)[idx];
  const free = st.removed.find(r => r.slot === slot && !st.placed[cellKey(r.day, r.slot)]);
  if (!free) {
    st.msg = `No hay ninguna casilla libre de tipo «${FOOD_SLOT_NAMES[slot]}». Marca antes un ${slot === "plato" ? "plato" : "postre"} para sustituir.`;
  } else {
    st.placed[cellKey(free.day, free.slot)] = JSON.parse(JSON.stringify(dish));
    st.msg = "";
  }
  renderExam();
}

function examUnplace(day, slot) {
  const st = examState;
  if (st.phase !== "pick") return;
  delete st.placed[cellKey(day, slot)];
  st.msg = "";
  renderExam();
}

function examCheck() {
  const st = examState;
  if (Object.keys(st.placed).length !== 3) return;
  const plan = clonePlan(st.base);
  Object.entries(st.placed).forEach(([key, dish]) => {
    const [day, slot] = key.split("-");
    const row = plan[Number(day)];
    if (slot === "plato") {
      row.main = dish.main;
      row.carb = dish.carb || FOOD_CARB_NONE;
      row.raw = dish.raw;
    } else {
      row.dessert = dish;
    }
  });
  st.newPlan = plan;
  st.phase = "done";
  renderExam();
}

function examBackToPick() {
  examState.phase = "pick";
  examState.msg = "";
  renderExam();
}

// Etiqueta corta de un plato o postre del catálogo (lo que hace que cumpla o no una regla)
function dishTags(slot, d) {
  if (slot === "postre") return d.fruit ? "fruta fresca" : "postre sin fruta fresca";
  const main = !d.main ? "sin principal"
    : d.main.kind === "veg" ? (d.main.leg ? "vegetariano · legumbres" : "vegetariano")
    : d.main.kind === "meat" ? "carne" : "pescado";
  const carb = d.carb ? CARB_TYPE_NAMES[d.carb.type] : "sin guarnición";
  const raw = !d.raw ? "sin verdura" : d.raw.raw ? "verdura cruda" : "verdura cocida";
  return [main, carb, raw].join(" · ");
}

// Texto que se muestra en una celda del plan
function cellView(d, slot) {
  if (slot === "postre") return d.dessert;
  return plateName(d.main, d.carb && d.carb.id !== "none" ? d.carb : null, d.raw);
}

function examTableHtml(plan, st) {
  const mode = st.phase;
  const rows = plan.map((d, i) => {
    const cells = FOOD_SLOTS.map(slot => {
      const key = cellKey(i, slot);
      const placed = !!st.placed[key];
      const removed = isRemoved(st, i, slot);
      const shown = mode === "pick" && placed ? st.placed[key] : cellView(d, slot);
      const classes = [];
      let extra = "";
      let onclick = "";
      if (mode === "select") {
        classes.push("clickable");
        if (removed) classes.push("cell-remove");
        onclick = `examToggleCell(${i}, '${slot}')`;
      } else if (mode === "pick") {
        if (placed) {
          classes.push("cell-new", "clickable");
          onclick = `examUnplace(${i}, '${slot}')`;
          extra = `<br><em>toca para quitar</em>`;
        } else if (removed) {
          classes.push("cell-remove");
          extra = `<br><em>sustituir</em>`;
        }
      } else if (mode === "done" && placed) {
        classes.push("cell-new");
      }
      const attrs = (classes.length ? ` class="${classes.join(" ")}"` : "") + (onclick ? ` onclick="${onclick}"` : "");
      return `<td${attrs}>${cellHtml(shown)}${extra}</td>`;
    }).join("");
    return `<tr><td><strong>${FOOD_DAYS[i].es}</strong><br><small>${FOOD_DAYS[i].de}</small></td>${cells}</tr>`;
  }).join("");
  return `
    <table class="plan-table ${mode === "select" ? "editable" : ""}">
      <tr><th>Día</th><th>Plato</th><th>Postre</th></tr>
      ${rows}
    </table>`;
}

function renderExamCatalog() {
  const st = examState;
  const q = st.search.trim().toLowerCase();
  const chosen = new Set(Object.values(st.placed).map(p => p.de));
  const items = [];
  examCatalog(st.slotFilter).forEach((d, idx) => {
    if (q && !(d.de + " " + d.es).toLowerCase().includes(q)) return;
    items.push(`
      <button class="cat-item${chosen.has(d.de) ? " picked" : ""}" onclick="examPick('${st.slotFilter}', ${idx})">
        <strong>${d.de}</strong><small>${d.es} · ${dishTags(st.slotFilter, d)}</small>
      </button>`);
  });
  document.getElementById("examCatalog").innerHTML = items.length
    ? items.join("")
    : `<p class="food-hint">Ningún plato coincide con la búsqueda.</p>`;
}

function renderExam() {
  const st = examState;
  const area = document.getElementById("examArea");

  if (st.phase === "select") {
    const n = st.removed.length;
    area.innerHTML = `
      <p class="food-hint">Este plan tiene 3 fallos. Toca los 3 platos o postres que quieres eliminar (${n}/3).</p>
      ${examTableHtml(st.base, st)}
      <div class="btn-action-row">
        <button class="btn-primary" ${n === 3 ? "" : "disabled"} onclick="examGoPick()">Elegir 3 sustitutos →</button>
      </div>`;
    return;
  }

  if (st.phase === "pick") {
    const n = Object.keys(st.placed).length;
    area.innerHTML = `
      <p class="food-hint">Elige en el catálogo 3 sustitutos (${n}/3). Un plato sustituye a un plato y un postre a un postre.</p>
      ${examTableHtml(st.base, st)}
      ${st.msg ? `<div class="food-msg">${st.msg}</div>` : ""}
      <div class="catalog-tools">
        <div class="cat-tabs">
          ${FOOD_SLOTS.map(s => `<button class="cat-tab${st.slotFilter === s ? " active" : ""}" onclick="examSetFilter('${s}')">${FOOD_SLOT_NAMES[s]}</button>`).join("")}
        </div>
        <input type="search" class="cat-search" placeholder="Buscar plato…" value="${escHtml(st.search)}" oninput="examSearch(this.value)">
      </div>
      <div id="examCatalog" class="cat-list"></div>
      <div class="btn-action-row">
        <button class="btn-secondary" onclick="examBackToSelect()">← Cambiar los marcados</button>
        <button class="btn-primary" ${n === 3 ? "" : "disabled"} onclick="examCheck()">Comprobar menú</button>
      </div>`;
    renderExamCatalog();
    return;
  }

  // done
  const remaining = checkPlan(st.newPlan);
  const ok = remaining.length === 0;
  area.innerHTML = `
    <div class="summary-box ${ok ? "pass" : "fail"}">
      <strong>${ok ? "🎉 Menú corregido: cumple todas las reglas" : "Todavía no cumple todas las reglas"}</strong>
      ${ok ? "" : `<br>Reglas que tu menú sigue incumpliendo: ${remaining.map(id => ruleById(id).es).join("; ")}`}
    </div>
    <p class="food-hint">El plan original incumplía: ${st.broken.map(id => ruleById(id).es).join("; ")}</p>
    ${examTableHtml(st.newPlan, st)}
    <div class="btn-action-row">
      <button class="btn-secondary" onclick="examBackToPick()">Seguir editando</button>
      <button class="btn-primary" onclick="startExam()">Nuevo menú</button>
    </div>`;
}