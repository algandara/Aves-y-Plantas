// ===== Alimentación infantil: juegos y examen del plan semanal =====
// Los datos, las reglas, el catálogo de platos y los fallos están en data.js.

const FOOD_SCREENS = ["foodMenu", "foodAprender", "foodClasificar", "foodFrecuencia", "foodExamen"];

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

// ----- Generador de menús -----

// Menú base (5 días) que cumple todas las reglas
function buildBaseline() {
  for (let t = 0; t < 20000; t++) {
    const kinds = shuffleList(["veg", "veg", "veg", "veg", randomPick(["meat", "fish"])]);
    const rawDays = shuffleList([0, 1, 2, 3, 4]).slice(0, 2 + foodRandInt(2));
    const fruitDays = shuffleList([0, 1, 2, 3, 4]).slice(0, 2 + foodRandInt(2));
    // Cada plato aparece como máximo una vez en la semana (dentro de su comida)
    const seen = { starter: new Set(), main: new Set(), dessert: new Set() };
    const take = (course, list) => {
      const c = list.filter(x => !seen[course].has(x.de));
      if (!c.length) return null;
      const d = pickFrom(c);
      seen[course].add(d.de);
      return d;
    };
    const plan = FOOD_DAYS.map((_, i) => ({
      starter: take("starter", FOOD_STARTERS.filter(s => s.raw === rawDays.includes(i))),
      main: take("main", FOOD_MAINS.filter(m => m.kind === kinds[i])),
      dessert: take("dessert", FOOD_DESSERTS.filter(x => x.fruit === fruitDays.includes(i)))
    }));
    if (plan.some(d => !d.starter || !d.main || !d.dessert)) continue;
    if (checkPlan(plan).length === 0) return plan;
  }
  throw new Error("No se pudo crear el menú base");
}

// Casillas (día-curso) que cambian entre dos menús, por ejemplo "2-main"
function changedCells(base, plan) {
  const out = [];
  plan.forEach((d, i) => {
    ["starter", "main", "dessert"].forEach(c => {
      if (d[c].de !== base[i][c].de) out.push(i + "-" + c);
    });
  });
  return out;
}

// Menú con nErrors fallos (cada uno en una casilla distinta y con reglas distintas)
function makeExam(nErrors) {
  for (let t = 0; t < 500; t++) {
    const base = buildBaseline();
    let plan = clonePlan(base);
    const applied = [];
    const usedRules = [];
    for (const f of shuffleList(FOOD_FAULTS)) {
      if (applied.length === nErrors) break;
      if (f.rules.some(r => usedRules.includes(r))) continue;
      const next = f.apply(clonePlan(plan));
      if (!next) continue;
      if (changedCells(base, next).length !== changedCells(base, plan).length + 1) continue;
      const broken = checkPlan(next);
      const expected = sortRules([...usedRules, ...f.rules]);
      if (!sameSet(broken, expected)) continue;
      plan = next;
      applied.push(f.id);
      usedRules.push(...f.rules);
    }
    if (applied.length === nErrors) {
      return { base, plan, errors: applied, broken: checkPlan(plan) };
    }
  }
  throw new Error("No se pudo crear el examen");
}

// ----- Examen semanal: el alumno corrige el menú cambiando platos -----
const MENU_COURSES = [
  { id: "starter", label: "Vorspeise" },
  { id: "main", label: "Mittagessen" },
  { id: "dessert", label: "Nachspeise" }
];
const MENU_IDEAL_CHANGES = 3;
let examState = null;

function startExam() {
  const res = makeExam(3);
  examState = {
    faulty: clonePlan(res.plan),
    plan: clonePlan(res.plan),
    pick: null,
    search: "",
    checked: false
  };
  renderExam();
}

function examChangedCells() {
  return changedCells(examState.faulty, examState.plan);
}

// 100 puntos con 3 cambios; -10 por cada cambio de más
function examScore(nChanges) {
  return Math.max(0, 100 - 10 * Math.max(0, nChanges - MENU_IDEAL_CHANGES));
}

function examOpenPick(course, day) {
  examState.pick = { course, day };
  examState.search = "";
  renderExam();
}

function examClosePick() {
  examState.pick = null;
  renderExam();
}

// Solo actualiza la lista (el campo de búsqueda conserva el foco)
function examSearch(text) {
  examState.search = text;
  document.getElementById("examPickList").innerHTML = examPickListHtml();
}

function examPick(idx) {
  const { course, day } = examState.pick;
  examState.plan[day][course] = { ...FOOD_CATALOG[course][idx] };
  examState.pick = null;
  examState.checked = false;
  renderExam();
}

function examCheck() {
  examState.checked = true;
  renderExam();
}

function examRestore() {
  examState.plan = clonePlan(examState.faulty);
  examState.pick = null;
  examState.checked = false;
  renderExam();
}

function examCourseRowsHtml(course, changed) {
  const st = examState;
  const cells = st.plan.map((d, i) => {
    const isChanged = changed.includes(i + "-" + course.id);
    return `<td class="ms-dish${isChanged ? " ms-changed" : ""}" title="${escHtml(d[course.id].es)}" onclick="examOpenPick('${course.id}', ${i})">Bio-${escHtml(d[course.id].de)}</td>`;
  }).join("");
  const allergens = st.plan.map(d => `<td class="ms-al">${escHtml(d[course.id].al)}</td>`).join("");
  return `<tr><th class="ms-course">${course.label}</th>${cells}</tr>` +
    `<tr><th class="ms-al-label">Allergene</th>${allergens}</tr>`;
}

function examPickListHtml() {
  const st = examState;
  const q = st.search.trim().toLowerCase();
  return FOOD_CATALOG[st.pick.course]
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => !q || (d.de + " " + d.es).toLowerCase().includes(q))
    .map(({ d, idx }) => `<button class="cat-item" onclick="examPick(${idx})">Bio-${escHtml(d.de)}<small>${escHtml(d.es)} · ${escHtml(d.al || "sin alérgenos")}</small></button>`)
    .join("");
}

function examPickerHtml() {
  const { course, day } = examState.pick;
  const c = MENU_COURSES.find(x => x.id === course);
  return `<div class="ms-picker">
    <div class="ms-picker-head"><strong>${c.label} del ${FOOD_DAYS[day].de}</strong>
      <button class="btn-secondary" onclick="examClosePick()">Cancelar</button></div>
    <input type="search" class="cat-search" placeholder="Buscar plato…" value="${escHtml(examState.search)}" oninput="examSearch(this.value)">
    <div id="examPickList" class="cat-list">${examPickListHtml()}</div>
  </div>`;
}

function renderExam() {
  const st = examState;
  const changed = examChangedCells();
  const broken = checkPlan(st.plan);
  const valid = broken.length === 0;
  let status = "";
  if (st.checked) {
    status = valid
      ? `<div class="summary-box pass">✅ Menú correcto. Cambios: ${changed.length}. Puntuación: ${examScore(changed.length)}/100</div>`
      : `<div class="summary-box fail">Todavía no cumple: ${broken.map(r => escHtml(ruleById(r).es)).join("; ")}.</div>`;
  }
  document.getElementById("examArea").innerHTML = `
    <div class="ms-title">Speisenplan</div>
    <p class="food-hint">Haz clic en un plato para cambiarlo. Puntúa mejor cuantos menos cambios hagas.</p>
    <div class="ms-wrap"><table class="ms-table">
      <tr><th class="ms-corner"></th>${FOOD_DAYS.map(d => `<th>${escHtml(d.de)}</th>`).join("")}</tr>
      ${MENU_COURSES.map(c => examCourseRowsHtml(c, changed)).join("")}
    </table></div>
    <div class="ms-legend">${FOOD_LEGEND.map(([k, de]) => `<span><b>${k}</b> = ${escHtml(de)}</span>`).join(" · ")}</div>
    <div class="ms-counter">Cambios: <b>${changed.length}</b> (ideal: ${MENU_IDEAL_CHANGES})</div>
    <div class="btn-action-row">
      <button class="btn-primary" onclick="examCheck()">Comprobar menú</button>
      <button class="btn-secondary" onclick="examRestore()">Restaurar menú</button>
      <button class="btn-secondary" onclick="startExam()">Nuevo menú</button>
    </div>
    ${status}
    ${st.pick ? examPickerHtml() : ""}
  `;
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
