// ===== Cuerpo humano: esquema del aparato digestivo con dos juegos =====
// Unir: se toca un nombre y su parte del esquema (o al revés).
// Escribir: se toca la parte del esquema que se quiera y hay que escribir su nombre en alemán. Se pueden elegir partes en cualquier orden.

let unirState = null;
let escribirState = null;

// Color de cada parte cuando está bien: una gama de verdes, distinto para cada parte
const PART_COLORS = {
  dickdarm: "#14532d",
  duennndarm: "#84cc16",
  blinddarm: "#065f46",
  wurmfortsatz: "#a3e635",
  enddarm: "#166534",
  leber: "#4ade80",
  gallenblase: "#047857",
  magen: "#bbf7d0",
  bauchspeicheldruese: "#22c55e",
  zwoelffingerdarm: "#365314",
  speiseroehre: "#86efac",
  zaehne: "#15803d",
  speicheldruesen: "#d9f99d",
  ohrspeicheldruese: "#0f766e"
};

// Nombre que se muestra en los juegos: el latín si la parte lo tiene (páncreas), si no, el alemán
function nombreJuego(p) {
  return p.la || p.de;
}

// Acepta la respuesta en alemán y, si la parte tiene nombre latino, también en latín
function checkParte(typed, p) {
  const res = checkGerman(typed, p.de);
  if (res.ok || !p.la) return res;
  return checkGerman(typed, p.la);
}

// Ancho del trazo de color de los tubos (en coordenadas de la imagen), para cubrir el interior del tubo
const TUBE_WIDTH = { wurmfortsatz: 7 };

// Zona de color de una parte: misma forma que su zona de toque, pero pintada.
// Los tubos (path) se pintan como un trazo ancho; las formas cerradas y elipses se rellenan.
function regionOf(p) {
  return p.svg
    .replace(/<path class="organ line/g, '<path class="region tube')
    .replace(/class="organ line/g, 'class="region')
    .replace(/class="organ/g, 'class="region');
}

// Esquema: la imagen de fondo y, encima, cada parte en un grupo con su id
function schemaSvg(classes, mode) {
  const groups = bodyParts.map(p => {
    const color = PART_COLORS[p.id];
    const width = TUBE_WIDTH[p.id] || 10;
    return `<g class="organ-group ${classes[p.id] || ""}" data-id="${p.id}" style="--c:${color};--w:${width}">` +
      `${regionOf(p)}${p.svg}</g>`;
  }).join("");
  const { width, height } = BODY_VIEW;
  return `<svg class="body-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" onclick="onOrganClick('${mode}', event)">` +
    `${BODY_CALCO}${groups}</svg>`;
}

function onOrganClick(mode, event) {
  const g = event.target.closest("[data-id]");
  if (!g) return;
  if (mode === "unir") pickUnir("organ", g.dataset.id);
  else if (mode === "escribir") pickEscribir(g.dataset.id);
}

const BODY_SCREENS = ["bodyMenu", "bodyUnir", "bodyEscribir", "bodyStats"];

function showBodyScreen(id) {
  BODY_SCREENS.forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function showBodyMenu() {
  showBodyScreen("bodyMenu");
  unirState = null;
  recordEscribir(escribirState);
  escribirState = null;
}

function startBodyGame(mode) {
  if (mode === "unir") {
    showBodyScreen("bodyUnir");
    startUnirRound();
  } else if (mode === "stats") {
    showBodyScreen("bodyStats");
    renderBodyStats();
  } else {
    showBodyScreen("bodyEscribir");
    startEscribirRound();
  }
}

// ----- Estadísticas (se guardan en este navegador) -----

const STATS_KEY = "cuerpo_stats_v1";

function emptyBodyStats() {
  return {
    games: {
      unir: { completed: 0, errors: 0, bestErrors: null },
      escribir: { exams: 0, ok: 0, total: 0, bestOk: null }
    },
    // por parte: cuántas veces fue acierto a la primera (ok) y cuántas no (fail)
    organs: {}
  };
}

function loadBodyStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY));
    if (raw && raw.games && raw.organs) return raw;
  } catch (e) { /* sin datos guardados */ }
  return emptyBodyStats();
}

let bodyStats = loadBodyStats();

function saveBodyStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(bodyStats));
  } catch (e) { /* almacenamiento no disponible */ }
}

function countOrgan(id, ok) {
  const o = bodyStats.organs[id] || { ok: 0, fail: 0 };
  if (ok) o.ok++;
  else o.fail++;
  bodyStats.organs[id] = o;
  saveBodyStats();
}

// Partida completada de unir, con sus errores
function recordRound(game, errors) {
  const g = bodyStats.games[game];
  g.completed++;
  g.errors += errors;
  g.bestErrors = g.bestErrors === null ? errors : Math.min(g.bestErrors, errors);
  saveBodyStats();
}

// Examen de escribir: cuenta las partes respondidas (última respuesta de cada una)
function recordEscribir(st) {
  if (!st || st.recorded) return;
  const ids = Object.keys(st.results);
  if (!ids.length) return;
  const ok = ids.filter(id => st.results[id]).length;
  const g = bodyStats.games.escribir;
  g.exams++;
  g.ok += ok;
  g.total += ids.length;
  g.bestOk = g.bestOk === null ? ok : Math.max(g.bestOk, ok);
  st.recorded = true;
  saveBodyStats();
}

function resetBodyStats() {
  if (!confirm("¿Borrar todas las estadísticas del cuerpo humano?")) return;
  bodyStats = emptyBodyStats();
  saveBodyStats();
  renderBodyStats();
}

function renderBodyStats() {
  const g = bodyStats.games;
  const avg = (sum, n) => (n ? (sum / n).toFixed(1) : "–");
  const val = v => (v === null ? "–" : v);
  const levelClass = pct => (pct === null ? "" : pct >= 80 ? "good" : pct >= 50 ? "warn" : "bad");

  const rows = bodyParts.map(p => {
    const o = bodyStats.organs[p.id] || { ok: 0, fail: 0 };
    const n = o.ok + o.fail;
    return { p, n, ok: o.ok, pct: n ? Math.round(100 * o.ok / n) : null };
  }).sort((a, b) => {
    const ka = a.pct === null ? 1000 : a.pct;
    const kb = b.pct === null ? 1000 : b.pct;
    return ka - kb;
  });

  const bars = rows.map(r => `
    <div class="bar-row">
      <div class="bar-label" title="${nombreJuego(r.p)} (${r.p.es})">${nombreJuego(r.p)}</div>
      <div class="bar-track"><div class="bar-fill ${levelClass(r.pct)}" style="width: ${r.pct === null ? 0 : r.pct}%"></div></div>
      <div class="bar-value">${r.pct === null ? "sin datos" : `${r.pct}% (${r.ok}/${r.n})`}</div>
    </div>`).join("");

  const pctWrite = g.escribir.total ? `${Math.round(100 * g.escribir.ok / g.escribir.total)}%` : "–";

  document.getElementById("statsArea").innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><strong>${g.unir.completed}</strong><span>Unir completadas</span></div>
      <div class="stat-card"><strong>${avg(g.unir.errors, g.unir.completed)}</strong><span>Errores medios (unir)</span></div>
      <div class="stat-card"><strong>${val(g.unir.bestErrors)}</strong><span>Mejor unir (errores)</span></div>
      <div class="stat-card"><strong>${g.escribir.exams}</strong><span>Exámenes escritos</span></div>
      <div class="stat-card"><strong>${pctWrite}</strong><span>Acierto al escribir</span></div>
    </div>
    <h3 style="font-size: 15px; color: #0f172a; margin: 16px 0 6px;">Partes del cuerpo (de peor a mejor)</h3>
    ${bars}
    <p class="unir-hint">Cuenta los aciertos a la primera de cada parte en los dos juegos.</p>
    <button class="btn-secondary" onclick="resetBodyStats()">🗑️ Borrar estadísticas</button>
    <button class="btn-secondary" onclick="showBodyMenu()">← Menú</button>
  `;
}

// ----- Juego 1: unir nombres con partes -----

function startUnirRound() {
  unirState = {
    names: shuffleList(bodyParts),
    selName: null,
    selOrgan: null,
    matched: new Set(),
    missed: new Set(),
    errors: 0,
    wrong: null,
    busy: false
  };
  renderUnir();
}

function renderUnir() {
  const st = unirState;
  const classes = {};
  bodyParts.forEach(p => {
    const c = [];
    if (st.matched.has(p.id)) c.push("correct");
    if (st.wrong && st.wrong.organ === p.id) c.push("wrong");
    if (st.selOrgan === p.id) c.push("selected");
    classes[p.id] = c.join(" ");
  });

  const names = st.names.map(p => {
    const cls = [
      "name-btn",
      st.matched.has(p.id) ? "done" : "",
      st.selName === p.id ? "selected" : "",
      st.wrong && st.wrong.name === p.id ? "wrong" : ""
    ].join(" ");
    const style = st.matched.has(p.id) ? `style="border-color:${PART_COLORS[p.id]}; background:${PART_COLORS[p.id]}22;"` : "";
    return `<button class="${cls}" ${style} ${st.matched.has(p.id) ? "disabled" : ""} onclick="pickUnir('name', '${p.id}')">${nombreJuego(p)}</button>`;
  }).join("");

  const won = st.matched.size === bodyParts.length;
  document.getElementById("unirArea").innerHTML = `
    <div class="game-status">Emparejadas: ${st.matched.size} / ${bodyParts.length} · Errores: ${st.errors}</div>
    ${schemaSvg(classes, "unir")}
    <div class="name-grid">${names}</div>
    ${won ? `
      <div class="game-result">🎉 ¡Completo con ${st.errors} error(es)!</div>
      <button class="btn-primary" onclick="startUnirRound()">Otra ronda →</button>
    ` : `<p class="unir-hint">Toca un nombre y luego su parte en el esquema (o al revés).</p>`}
  `;
}

function pickUnir(kind, id) {
  const st = unirState;
  if (!st || st.busy || st.matched.has(id)) return;

  if (kind === "name") st.selName = st.selName === id ? null : id;
  else st.selOrgan = st.selOrgan === id ? null : id;

  if (st.selName && st.selOrgan) {
    if (st.selName === st.selOrgan) {
      countOrgan(id, !st.missed.has(id));
      st.matched.add(id);
      st.selName = null;
      st.selOrgan = null;
      if (st.matched.size === bodyParts.length) recordRound("unir", st.errors);
    } else {
      // Solo se marcan en rojo el nombre y la parte que elegiste, nunca la correcta
      st.errors++;
      st.missed.add(st.selName);
      st.wrong = { name: st.selName, organ: st.selOrgan };
      st.busy = true;
      renderUnir();
      setTimeout(() => {
        if (unirState !== st) return;
        st.wrong = null;
        st.selName = null;
        st.selOrgan = null;
        st.busy = false;
        renderUnir();
      }, 700);
      return;
    }
  }
  renderUnir();
}

// ----- Examen: escribir nombres (el usuario elige la parte) -----

function startEscribirRound() {
  recordEscribir(escribirState);
  escribirState = {
    selected: null,   // id de la parte elegida en el esquema
    answered: null,   // respuesta a la parte elegida
    results: {},      // id de parte -> true (acierto) / false (fallo), última respuesta
    finished: false,
    recorded: false
  };
  renderEscribir();
}

// El usuario toca una parte del esquema (puede tocar cualquiera, en cualquier orden)
function pickEscribir(id) {
  const st = escribirState;
  if (!st || st.finished) return;
  st.selected = id;
  st.answered = null;
  renderEscribir();
}

function checkEscribir() {
  const st = escribirState;
  if (!st || st.finished || !st.selected || st.answered) return;
  const input = document.getElementById("escribirInput");
  const typed = input.value.trim();
  if (!typed) {
    input.focus();
    return;
  }
  const target = bodyParts.find(p => p.id === st.selected);
  const res = checkParte(typed, target);
  st.answered = { typed, ok: res.ok, typo: res.typo };
  st.results[target.id] = res.ok;
  countOrgan(target.id, res.ok);
  renderEscribir();
}

function onEscribirEnter() {
  checkEscribir();
}

function showEscribirHint() {
  const st = escribirState;
  if (!st || !st.selected || st.answered) return;
  const target = nombreJuego(bodyParts.find(p => p.id === st.selected));
  const pattern = target.charAt(0) + " " + Array(target.length - 1).fill("_").join(" ");
  const box = document.getElementById("escribirHint");
  box.textContent = `💡 ${pattern}  (${target.length} letras)`;
  box.style.display = "block";
}

// Cierra el examen y muestra el resumen
function finishEscribir() {
  const st = escribirState;
  if (!st) return;
  st.finished = true;
  st.selected = null;
  st.answered = null;
  recordEscribir(st);
  renderEscribir();
}

// Colores del esquema: amarillo = parte elegida sin responder; verde/rojo = resultado de cada parte respondida
function classesEscribir(st) {
  const classes = {};
  bodyParts.forEach(p => {
    if (st.selected === p.id && !st.answered) classes[p.id] = "target";
    else if (p.id in st.results) classes[p.id] = st.results[p.id] ? "correct" : "wrong";
  });
  return classes;
}

function renderEscribir() {
  const st = escribirState;
  const total = bodyParts.length;
  const ids = Object.keys(st.results);
  const ok = ids.filter(id => st.results[id]).length;

  // Resumen al terminar
  if (st.finished) {
    const misses = bodyParts.filter(p => st.results[p.id] === false)
      .map(p => `<li><strong>${nombreJuego(p)}</strong> (${p.es})</li>`).join("");
    document.getElementById("escribirArea").innerHTML = `
      <div class="game-status">Examen terminado · ${ok} / ${ids.length} correctas</div>
      ${schemaSvg(classesEscribir(st), "escribir")}
      <div class="game-result">🎉 ${ok} de ${ids.length} correctas</div>
      ${misses ? `<p class="unir-hint">Para repasar:</p><ul class="miss-list">${misses}</ul>` : ""}
      <button class="btn-primary" onclick="startEscribirRound()">Nuevo examen</button>
      <button class="btn-secondary" onclick="showBodyMenu()">← Menú</button>
    `;
    return;
  }

  const target = st.selected ? bodyParts.find(p => p.id === st.selected) : null;
  let clue;
  let question = "";

  if (!target) {
    clue = "🔍 Toca una parte del esquema para escribir su nombre en alemán.";
  } else if (st.answered) {
    const a = st.answered;
    let msg;
    if (a.ok && !a.typo) msg = `<span style="color:#16a34a;">✅ ¡Correcto! ${nombreJuego(target)} (${target.es})</span>`;
    else if (a.ok) msg = `<span style="color:#16a34a;">✅ Correcto con una errata. Se escribe: <strong>${nombreJuego(target)}</strong> (${target.es})</span>`;
    else msg = `<span style="color:#dc2626;">❌ Escribiste «${a.typed}». Se escribe: <strong>${nombreJuego(target)}</strong> (${target.es})</span>`;
    clue = "🔍 Toca otra parte del esquema para seguir.";
    question = `<div class="who-feedback">${msg}</div>`;
  } else {
    clue = "🔍 ¿Cómo se llama la parte marcada en amarillo?";
    question = `
      <div class="input-container">
        <input type="text" id="escribirInput" class="input-text" placeholder="Escribe el nombre en alemán..." autocomplete="off" autocorrect="off" autocapitalize="none" onkeydown="if (event.key === 'Enter') onEscribirEnter()">
        <button class="btn-primary" onclick="checkEscribir()">OK</button>
      </div>
      <div id="escribirHint" class="hint-box" style="min-height: 0;"></div>
      <div class="btn-action-row">
        <button class="btn-secondary" onclick="showEscribirHint()">💡 Pista</button>
      </div>
    `;
  }

  const finishBtn = ids.length
    ? `<div class="btn-action-row"><button class="btn-secondary" onclick="finishEscribir()">Terminar examen</button></div>`
    : "";

  document.getElementById("escribirArea").innerHTML = `
    <div class="game-status">Partes respondidas: ${ids.length} / ${total} · Aciertos: ${ok}</div>
    <div class="who-clue"><strong>${clue}</strong></div>
    ${schemaSvg(classesEscribir(st), "escribir")}
    ${question}
    ${finishBtn}
  `;

  if (target && !st.answered) {
    setTimeout(() => {
      const input = document.getElementById("escribirInput");
      if (input) input.focus();
    }, 0);
  }
}
