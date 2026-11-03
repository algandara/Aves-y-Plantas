// ===== Juegos: unir fotos con nombres y "¿Quién es?" =====
// Unir usa las fotos fijas locales (carpeta fotos/).
// ¿Quién es? usa por defecto las fotos descargadas y puede cambiar a fotos de iNaturalist.

const MATCH_SIZE = 6;
let gameMode = "match";
let gameFilter = "all";
let matchState = null;
let whoState = null;

function gamePool() {
  if (gameFilter === "bird") return speciesList.filter(s => s.type === "bird");
  if (gameFilter === "plant") return speciesList.filter(s => s.type === "plant");
  return speciesList;
}

function showGamesChooser() {
  document.getElementById("gameChooser").style.display = "block";
  document.getElementById("gameContent").style.display = "none";
  document.getElementById("gameArea").innerHTML = "";
  matchState = null;
  whoState = null;
}

function startGame(mode) {
  gameMode = mode;
  document.getElementById("gameChooser").style.display = "none";
  document.getElementById("gameContent").style.display = "block";
  if (mode === "match") startMatchRound();
  else startWhoRound();
}

function setGameFilter(filter) {
  gameFilter = filter;
  document.querySelectorAll("#gameFilter button").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === filter);
  });
  whoState = null;
  startGame(gameMode);
}

// ----- Juego 1: unir fotos con nombres -----

// Nombres extra sin foto para dificultar la ronda; se eligen del mismo grupo cuando es posible
const MATCH_DECOYS = 3;

function startMatchRound() {
  const pool = gamePool();
  const items = shuffleArray(pool).slice(0, MATCH_SIZE);
  const groups = new Set(items.map(s => s.group));
  const others = pool.filter(s => !items.includes(s));
  const decoys = [
    ...shuffleArray(others.filter(s => groups.has(s.group))),
    ...shuffleArray(others.filter(s => !groups.has(s.group)))
  ].slice(0, MATCH_DECOYS);

  matchState = {
    items,
    names: shuffleArray([...items, ...decoys]),
    selPhoto: null,
    selName: null,
    matched: new Set(),
    wrong: null,
    errors: 0,
    busy: false
  };
  renderMatch();
}

function renderMatch() {
  const st = matchState;
  const photos = st.items.map(sp => {
    const cls = [
      "match-card",
      st.matched.has(sp.sci) ? "done" : "",
      st.selPhoto === sp.sci ? "selected" : "",
      st.wrong && st.wrong.photo === sp.sci ? "wrong" : ""
    ].join(" ");
    return `<button class="${cls}" ${st.matched.has(sp.sci) ? "disabled" : ""} onclick="pickMatch('photo', '${sp.sci}')">
      <img src="${sp.fixedImg}" alt="">
    </button>`;
  }).join("");

  const names = st.names.map(sp => {
    const cls = [
      "match-card match-name",
      st.matched.has(sp.sci) ? "done" : "",
      st.selName === sp.sci ? "selected" : "",
      st.wrong && st.wrong.name === sp.sci ? "wrong" : ""
    ].join(" ");
    return `<button class="${cls}" ${st.matched.has(sp.sci) ? "disabled" : ""} onclick="pickMatch('name', '${sp.sci}')">
      <span class="species-de">${sp.de[0]}</span>
    </button>`;
  }).join("");

  const won = st.matched.size === MATCH_SIZE;
  document.getElementById("gameArea").innerHTML = `
    <div class="game-status">Parejas: ${st.matched.size} / ${MATCH_SIZE} · Errores: ${st.errors}</div>
    <div class="match-grid">
      <div class="match-col match-photos">${photos}</div>
      <div class="match-col">${names}</div>
    </div>
    ${won ? `
      <div class="game-result">🎉 ¡Ronda completa con ${st.errors} error(es)!</div>
      <button class="btn-primary" onclick="startMatchRound()">Siguiente ronda →</button>
    ` : ""}
  `;
}

function pickMatch(kind, sci) {
  const st = matchState;
  if (!st || st.busy || st.matched.has(sci)) return;

  if (kind === "photo") st.selPhoto = st.selPhoto === sci ? null : sci;
  else st.selName = st.selName === sci ? null : sci;

  if (st.selPhoto && st.selName) {
    if (st.selPhoto === st.selName) {
      st.matched.add(sci);
      st.selPhoto = null;
      st.selName = null;
      renderMatch();
    } else {
      st.errors++;
      st.busy = true;
      // Guardar foto y nombre por separado: si no, la tarjeta del nombre correcto también se marcaría
      st.wrong = { photo: st.selPhoto, name: st.selName };
      renderMatch();
      setTimeout(() => {
        if (matchState !== st) return;
        st.wrong = null;
        st.selPhoto = null;
        st.selName = null;
        st.busy = false;
        renderMatch();
      }, 700);
    }
    return;
  }
  renderMatch();
}

// ----- Juego 2: ¿Quién es? (rasgo clave y 4 opciones) -----

// Distractores: primero del mismo grupo (los más parecidos), luego del mismo tipo
function pickDistractors(target, n) {
  const sameGroup = speciesList.filter(s => s !== target && s.group === target.group);
  const sameType = speciesList.filter(s => s !== target && s.group !== target.group && s.type === target.type);
  const others = speciesList.filter(s => s.type !== target.type);
  return [
    ...shuffleArray(sameGroup).slice(0, 2),
    ...shuffleArray(sameType),
    ...shuffleArray(others)
  ].slice(0, n);
}

function startWhoRound() {
  const pool = gamePool();
  const target = pool[Math.floor(Math.random() * pool.length)];
  const options = shuffleArray([target, ...pickDistractors(target, 3)]);
  const prev = whoState || { ok: 0, total: 0 };
  whoState = { target, options, chosen: null, ok: prev.ok, total: prev.total, photos: {} };
  renderWho();
}

// Fuente de fotos del juego: "local" (descargadas, por defecto) o "web" (iNaturalist)
let whoSource = "local";

// Carga la foto de una especie según la fuente elegida
function loadWhoPhotos(st, sp) {
  if (whoSource === "local") {
    st.photos[sp.sci] = { pool: [sp.fixedImg], idx: 0, url: sp.fixedImg, loading: false };
    return;
  }
  const entry = { pool: [], idx: 0, url: null, loading: true };
  st.photos[sp.sci] = entry;
  const finish = urls => {
    if (whoState !== st) return;
    entry.pool = urls.length > 0 ? urls : [sp.fixedImg];
    entry.idx = 0;
    entry.url = entry.pool[0];
    entry.loading = false;
    renderWho();
  };
  fetchPhotosForSpecies(sp)
    .then(finish)
    .catch(() => finish([]));
}

// Cambia a otra foto de la misma especie (por si la actual se ve mal)
function nextWhoPhoto(sci) {
  const st = whoState;
  const entry = st && st.photos[sci];
  if (!entry || entry.loading || entry.pool.length < 2) return;
  entry.idx = (entry.idx + 1) % entry.pool.length;
  entry.url = entry.pool[entry.idx];
  renderWho();
}

// Cambia entre fotos descargadas y fotos de la web
function toggleWhoSource() {
  whoSource = whoSource === "local" ? "web" : "local";
  const st = whoState;
  if (st && st.chosen !== null) {
    const chosenSp = st.options[st.chosen];
    st.photos = {};
    loadWhoPhotos(st, st.target);
    if (chosenSp !== st.target) loadWhoPhotos(st, chosenSp);
  }
  renderWho();
}

function photoCard(st, sp, label) {
  const entry = st.photos[sp.sci];
  const img = !entry || entry.loading
    ? `<div class="who-photo-loading">Cargando foto...</div>`
    : `<img class="who-photo" src="${entry.url}" alt="">`;
  const more = whoSource === "web" && entry && !entry.loading && entry.pool.length > 1
    ? `<button class="btn-secondary" onclick="nextWhoPhoto('${sp.sci}')">🔄 Otra foto</button>`
    : "";
  return `
    <div class="who-photo-card">
      <div class="who-photo-label">${label}: ${sp.de[0]}</div>
      ${img}
      <div class="who-photo-actions">${more}</div>
    </div>
  `;
}

function renderWho() {
  const st = whoState;
  const opts = st.options.map((sp, i) => {
    let cls = "who-option";
    if (st.chosen !== null) {
      if (sp === st.target) cls += " correct";
      else if (i === st.chosen) cls += " wrong";
    }
    return `<button class="${cls}" ${st.chosen !== null ? "disabled" : ""} onclick="answerWho(${i})">
      <span class="species-de">${sp.de[0]}</span>
      <span class="species-es">${sp.es}</span>
    </button>`;
  }).join("");

  let footer = "";
  if (st.chosen !== null) {
    const chosenSp = st.options[st.chosen];
    const ok = chosenSp === st.target;
    const msg = ok
      ? `<span style="color:#16a34a;">✅ ¡Correcto! ${st.target.de[0]} (${st.target.es})</span>`
      : `<span style="color:#dc2626;">❌ Era: ${st.target.de[0]} (${st.target.es})</span>`;
    // Al acertar: la foto de la correcta. Al fallar: la correcta y la que elegiste
    const photos = ok
      ? photoCard(st, st.target, "✅ Correcta")
      : `<div class="who-photos-pair">${photoCard(st, st.target, "✅ Correcta")}${photoCard(st, chosenSp, "❌ Tu elección")}</div>`;
    footer = `
      <div class="who-feedback">${msg}</div>
      ${photos}
      <div class="who-mnemo">🧠 ${st.target.mnemo}</div>
      <button class="btn-primary" onclick="startWhoRound()">Siguiente →</button>
    `;
  }

  document.getElementById("gameArea").innerHTML = `
    <div class="game-status">Acertadas: ${st.ok} / ${st.total}</div>
    <div class="who-clue"><strong>🔍 ¿Quién tiene este rasgo?</strong><br>${st.target.trait}</div>
    <div class="who-source">
      <button class="btn-secondary" onclick="toggleWhoSource()">${whoSource === "local" ? "🌐 Usar fotos de la web" : "🖼 Usar fotos descargadas"}</button>
    </div>
    <div class="who-options">${opts}</div>
    ${footer}
  `;
}

function answerWho(i) {
  const st = whoState;
  if (!st || st.chosen !== null) return;
  st.chosen = i;
  st.total++;
  const chosenSp = st.options[i];
  const ok = chosenSp === st.target;
  if (ok) st.ok++;
  st.photos = {};
  loadWhoPhotos(st, st.target);
  if (!ok) loadWhoPhotos(st, chosenSp);
  renderWho();
}
