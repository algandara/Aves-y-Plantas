// ===== Cuerpo humano: esquema del aparato digestivo con dos juegos =====
// Unir: se toca un nombre y su parte del esquema (o al revés).
// Escribir: se marca una parte cada vez y hay que escribir su nombre en alemán (todas las partes, una vez).

let unirState = null;
let escribirState = null;

function shuffleList(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  else if (mode === "ruta") pickRuta(g.dataset.id);
}

const BODY_SCREENS = ["bodyMenu", "bodyUnir", "bodyRuta", "bodyEscribir", "bodyStats"];

function showBodyScreen(id) {
  BODY_SCREENS.forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function showBodyMenu() {
  showBodyScreen("bodyMenu");
  unirState = null;
  escribirState = null;
  routeState = null;
}

function startBodyGame(mode) {
  if (mode === "unir") {
    showBodyScreen("bodyUnir");
    startUnirRound();
  } else if (mode === "ruta") {
    showBodyScreen("bodyRuta");
    startRutaRound();
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
      ruta: { completed: 0, errors: 0, bestErrors: null },
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

// Juegos de partida (unir y ruta): una partida completada con X errores
function recordRound(game, errors) {
  const g = bodyStats.games[game];
  g.completed++;
  g.errors += errors;
  g.bestErrors = g.bestErrors === null ? errors : Math.min(g.bestErrors, errors);
  saveBodyStats();
}

function recordEscribir(st) {
  const g = bodyStats.games.escribir;
  g.exams++;
  g.ok += st.ok;
  g.total += st.order.length;
  g.bestOk = g.bestOk === null ? st.ok : Math.max(g.bestOk, st.ok);
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
      <div class="bar-label" title="${r.p.de} (${r.p.es})">${r.p.de}</div>
      <div class="bar-track"><div class="bar-fill ${levelClass(r.pct)}" style="width: ${r.pct === null ? 0 : r.pct}%"></div></div>
      <div class="bar-value">${r.pct === null ? "sin datos" : `${r.pct}% (${r.ok}/${r.n})`}</div>
    </div>`).join("");

  const pctWrite = g.escribir.total ? `${Math.round(100 * g.escribir.ok / g.escribir.total)}%` : "–";

  document.getElementById("statsArea").innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><strong>${g.unir.completed}</strong><span>Unir completadas</span></div>
      <div class="stat-card"><strong>${avg(g.unir.errors, g.unir.completed)}</strong><span>Errores medios (unir)</span></div>
      <div class="stat-card"><strong>${val(g.unir.bestErrors)}</strong><span>Mejor unir (errores)</span></div>
      <div class="stat-card"><strong>${g.ruta.completed}</strong><span>Rutas completas</span></div>
      <div class="stat-card"><strong>${avg(g.ruta.errors, g.ruta.completed)}</strong><span>Errores medios (ruta)</span></div>
      <div class="stat-card"><strong>${g.escribir.exams}</strong><span>Exámenes escritos</span></div>
      <div class="stat-card"><strong>${pctWrite}</strong><span>Acierto al escribir</span></div>
    </div>
    <h3 style="font-size: 15px; color: #0f172a; margin: 16px 0 6px;">Partes del cuerpo (de peor a mejor)</h3>
    ${bars}
    <p class="unir-hint">Cuenta los aciertos a la primera de cada parte en los tres juegos.</p>
    <button class="btn-secondary" onclick="resetBodyStats()">🗑️ Borrar estadísticas</button>
    <button class="btn-secondary" onclick="showBodyMenu()">← Menú</button>
  `;
}

// ----- Juego 3: ruta del alimento -----

const ROUTE = ["zaehne", "speiseroehre", "magen", "zwoelffingerdarm", "duennndarm", "blinddarm", "dickdarm", "enddarm"];
let routeState = null;

function startRutaRound() {
  routeState = { idx: 0, errors: 0, wrong: null, busy: false, missed: new Set(), recorded: false };
  renderRuta();
}

function pickRuta(id) {
  const st = routeState;
  if (!st || st.busy || st.idx >= ROUTE.length) return;
  const target = ROUTE[st.idx];
  if (id === target) {
    countOrgan(id, !st.missed.has(id));
    st.idx++;
    renderRuta();
    return;
  }
  st.errors++;
  st.missed.add(target);
  st.wrong = id;
  st.busy = true;
  renderRuta();
  setTimeout(() => {
    if (routeState !== st) return;
    st.wrong = null;
    st.busy = false;
    renderRuta();
  }, 700);
}

function renderRuta() {
  const st = routeState;
  const total = ROUTE.length;

  if (st.idx >= total) {
    if (!st.recorded) {
      recordRound("ruta", st.errors);
      st.recorded = true;
    }
    const classes = {};
    ROUTE.forEach(id => { classes[id] = "correct"; });
    document.getElementById("rutaArea").innerHTML = `
      <div class="game-status">Ruta completa · Errores: ${st.errors}</div>
      ${schemaSvg(classes, "ruta")}
      <div class="game-result">🎉 ¡Ruta completa con ${st.errors} error(es)!</div>
      <button class="btn-primary" onclick="startRutaRound()">Repetir ruta →</button>
    `;
    return;
  }

  const classes = {};
  ROUTE.slice(0, st.idx).forEach(id => { classes[id] = "correct"; });
  classes[ROUTE[st.idx]] = "target";
  if (st.wrong) classes[st.wrong] = "wrong";
  const next = bodyParts.find(p => p.id === ROUTE[st.idx]);

  document.getElementById("rutaArea").innerHTML = `
    <div class="game-status">Parada ${st.idx + 1} / ${total} · Errores: ${st.errors}</div>
    <div class="who-clue"><strong>🍽️ Siguiente parada: ${next.es}</strong></div>
    ${schemaSvg(classes, "ruta")}
    <p class="unir-hint">Toca en el esquema el órgano por donde pasa la comida ahora.</p>
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
    return `<button class="${cls}" ${style} ${st.matched.has(p.id) ? "disabled" : ""} onclick="pickUnir('name', '${p.id}')">${p.de}</button>`;
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

// ----- Examen: escribir nombres -----

function startEscribirRound() {
  escribirState = {
    order: shuffleList(bodyParts),
    idx: 0,
    ok: 0,
    misses: [],
    answered: null,
    recorded: false
  };
  renderEscribir();
}

// Normaliza para comparar: sin mayúsculas, con ä/ö/ü/ß escritas como ae/oe/ue/ss o sin diacrítico
function germanForms(s) {
  const base = s.trim().toLowerCase().replace(/ß/g, "ss");
  const withAe = base.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  const plain = base.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
  return [withAe, plain];
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

// Devuelve si la respuesta vale: exacta (sin importar mayúsculas y umlauts) o con una errata en palabras largas
function checkGerman(typed, target) {
  const t = germanForms(typed);
  const g = germanForms(target);
  for (const a of t) {
    for (const b of g) {
      if (a === b) return { ok: true, typo: false };
    }
  }
  const tLong = t[0];
  const gLong = g[0];
  if (gLong.length >= 6 && levenshtein(tLong, gLong) <= 1) return { ok: true, typo: true };
  return { ok: false, typo: false };
}

function checkEscribir() {
  const st = escribirState;
  if (!st || st.answered) return;
  const input = document.getElementById("escribirInput");
  const typed = input.value.trim();
  if (!typed) {
    input.focus();
    return;
  }
  const target = st.order[st.idx];
  const res = checkGerman(typed, target.de);
  st.answered = { typed, ok: res.ok, typo: res.typo };
  if (res.ok) st.ok++;
  else st.misses.push(target);
  countOrgan(target.id, res.ok);
  renderEscribir();
}

function nextEscribir() {
  const st = escribirState;
  if (!st) return;
  st.idx++;
  st.answered = null;
  renderEscribir();
}

function onEscribirEnter() {
  const st = escribirState;
  if (!st) return;
  if (st.answered) nextEscribir();
  else checkEscribir();
}

function showEscribirHint() {
  const st = escribirState;
  if (!st || st.answered) return;
  const target = st.order[st.idx].de;
  const pattern = target.charAt(0) + " " + Array(target.length - 1).fill("_").join(" ");
  document.getElementById("escribirHint").textContent = `💡 ${pattern}  (${target.length} letras)`;
}

function renderEscribir() {
  const st = escribirState;
  const total = st.order.length;

  // Fin del examen
  if (st.idx >= total) {
    if (!st.recorded) {
      recordEscribir(st);
      st.recorded = true;
    }
    const misses = st.misses.map(p => `<li><strong>${p.de}</strong> (${p.es})</li>`).join("");
    document.getElementById("escribirArea").innerHTML = `
      <div class="game-status">Examen terminado · ${st.ok} / ${total} correctas</div>
      ${schemaSvg({}, "escribir")}
      <div class="game-result">🎉 ${st.ok} de ${total} correctas</div>
      ${st.misses.length ? `<p class="unir-hint">Para repasar:</p><ul class="miss-list">${misses}</ul>` : ""}
      <button class="btn-primary" onclick="startEscribirRound()">Repetir examen</button>
      <button class="btn-secondary" onclick="showBodyMenu()">← Menú</button>
    `;
    return;
  }

  const target = st.order[st.idx];
  const classes = { [target.id]: st.answered ? "correct" : "target" };

  let question;
  if (st.answered) {
    const a = st.answered;
    let msg;
    if (a.ok && !a.typo) msg = `<span style="color:#16a34a;">✅ ¡Correcto! ${target.de} (${target.es})</span>`;
    else if (a.ok) msg = `<span style="color:#16a34a;">✅ Correcto con una errata. Se escribe: <strong>${target.de}</strong> (${target.es})</span>`;
    else msg = `<span style="color:#dc2626;">❌ Escribiste «${a.typed}». Se escribe: <strong>${target.de}</strong> (${target.es})</span>`;
    question = `
      <div class="who-feedback">${msg}</div>
      <button class="btn-primary" onclick="nextEscribir()">Siguiente →</button>
    `;
  } else {
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

  document.getElementById("escribirArea").innerHTML = `
    <div class="game-status">Pregunta ${st.idx + 1} / ${total} · Aciertos: ${st.ok}</div>
    <div class="who-clue"><strong>🔍 ¿Cómo se llama la parte marcada en amarillo?</strong></div>
    ${schemaSvg(classes, "escribir")}
    ${question}
  `;

  if (!st.answered) {
    setTimeout(() => {
      const input = document.getElementById("escribirInput");
      if (input) input.focus();
    }, 0);
  }
}
