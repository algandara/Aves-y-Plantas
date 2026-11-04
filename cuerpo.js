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

// Color de cada parte en el juego de unir (uno distinto por parte)
const PART_COLORS = {
  dickdarm: "#f97316",
  duennndarm: "#eab308",
  blinddarm: "#84cc16",
  wurmfortsatz: "#22c55e",
  enddarm: "#14b8a6",
  leber: "#06b6d4",
  gallenblase: "#3b82f6",
  magen: "#8b5cf6",
  bauchspeicheldruese: "#d946ef",
  zwoelffingerdarm: "#ec4899",
  speiseroehre: "#f43f5e",
  zaehne: "#a16207",
  speicheldruesen: "#64748b",
  ohrspeicheldruese: "#78350f"
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
    const color = mode === "escribir" ? "#22c55e" : PART_COLORS[p.id];
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
}

function showBodyMenu() {
  document.getElementById("bodyMenu").style.display = "block";
  document.getElementById("bodyUnir").style.display = "none";
  document.getElementById("bodyEscribir").style.display = "none";
  unirState = null;
  escribirState = null;
}

function startBodyGame(mode) {
  document.getElementById("bodyMenu").style.display = "none";
  if (mode === "unir") {
    document.getElementById("bodyUnir").style.display = "block";
    document.getElementById("bodyEscribir").style.display = "none";
    startUnirRound();
  } else {
    document.getElementById("bodyEscribir").style.display = "block";
    document.getElementById("bodyUnir").style.display = "none";
    startEscribirRound();
  }
}

// ----- Juego 1: unir nombres con partes -----

function startUnirRound() {
  unirState = {
    names: shuffleList(bodyParts),
    selName: null,
    selOrgan: null,
    matched: new Set(),
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
      st.matched.add(id);
      st.selName = null;
      st.selOrgan = null;
    } else {
      // Solo se marcan en rojo el nombre y la parte que elegiste, nunca la correcta
      st.errors++;
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
    answered: null
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
