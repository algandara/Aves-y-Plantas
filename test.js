// ===== Progreso guardado en el navegador (localStorage) =====
const PROGRESS_KEY = "avesPlantas.progreso.v1";
function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (data && typeof data === "object") {
      return {
        stats: data.stats && typeof data.stats === "object" ? data.stats : {},
        mistakes: Array.isArray(data.mistakes) ? data.mistakes : [],
        modes: data.modes && typeof data.modes === "object" ? data.modes : {},
        history: Array.isArray(data.history) ? data.history : []
      };
    }
  } catch (e) {
    // Si el dato guardado está roto, empezamos de cero
  }
  return { stats: {}, mistakes: [], modes: {}, history: [] };
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    // Sin almacenamiento disponible (p. ej. modo privado): la app sigue funcionando
  }
}

let progress = loadProgress();

let sessionDeck = [];
// Especies falladas y aún no acertadas (se mantienen entre rondas y al recargar)
let mistakesDeck = progress.mistakes
  .map(sci => speciesList.find(s => s.sci === sci))
  .filter(Boolean);
let deckIndex = -1;
let currentSpecies = null;
let currentQuestionAnswered = false;
let hintLevel = 0;
let quizFilter = "all";
let correctCount = 0;
let wrongCount = 0;

let photoPool = [];
let currentPhotoIndex = 0;
let activeRequestId = 0;
const taxonCache = {};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function syncMistakes() {
  progress.mistakes = mistakesDeck.map(s => s.sci);
  saveProgress();
}

function addMistake(sp) {
  if (!mistakesDeck.some(s => s.sci === sp.sci)) mistakesDeck.push(sp);
  syncMistakes();
}

function removeMistake(sp) {
  mistakesDeck = mistakesDeck.filter(s => s.sci !== sp.sci);
  syncMistakes();
}

const HISTORY_LIMIT = 3000;

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Guarda una respuesta: acumulado por especie, por modo y en el historial con fecha
function recordStat(sp, ok, mode = "examen") {
  const st = progress.stats[sp.sci] || { ok: 0, fail: 0 };
  if (ok) st.ok++;
  else st.fail++;
  progress.stats[sp.sci] = st;

  const m = progress.modes[mode] || { ok: 0, total: 0 };
  m.total++;
  if (ok) m.ok++;
  progress.modes[mode] = m;

  progress.history.push({ d: dayKey(new Date()), m: mode, s: sp.sci, ok: ok ? 1 : 0 });
  if (progress.history.length > HISTORY_LIMIT) {
    progress.history.splice(0, progress.history.length - HISTORY_LIMIT);
  }
  saveProgress();
}

function hardestSpecies(n) {
  return Object.entries(progress.stats)
    .filter(([, st]) => st.fail > 0)
    .map(([sci, st]) => ({ sci, fail: st.fail, ratio: st.fail / (st.ok + st.fail) }))
    .sort((a, b) => b.ratio - a.ratio || b.fail - a.fail)
    .slice(0, n)
    .map(x => speciesList.find(s => s.sci === x.sci))
    .filter(Boolean);
}

function resetProgress() {
  if (!confirm("¿Borrar todas las estadísticas y el progreso guardado en este navegador?")) return;
  progress = { stats: {}, mistakes: [], modes: {}, history: [] };
  mistakesDeck = [];
  saveProgress();
  if (document.getElementById("screenStats").style.display === "block") renderStats();
  else showSessionSummary();
}

// ===== Filtro por sección (todas / aves / árboles) =====
function speciesForFilter() {
  if (quizFilter === "bird") return speciesList.filter(s => s.type === "bird");
  if (quizFilter === "plant") return speciesList.filter(s => s.type === "plant");
  return speciesList;
}

function setQuizFilter(filter) {
  quizFilter = filter;
  document.querySelectorAll(".quiz-filter button").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === filter);
  });
  startFullSession();
}

function startFullSession() {
  sessionDeck = shuffleArray(speciesForFilter());
  deckIndex = -1;
  correctCount = 0;
  wrongCount = 0;
  document.getElementById("btnNewRound").textContent = `🔄 Nueva ronda (las ${sessionDeck.length})`;
  document.getElementById("summaryScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  nextQuestion();
}

function startMistakesSession() {
  sessionDeck = shuffleArray(mistakesDeck);
  deckIndex = -1;
  correctCount = 0;
  wrongCount = 0;
  document.getElementById("summaryScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  nextQuestion();
}

function updateTopBar() {
  const total = sessionDeck.length;
  const currentNum = Math.min(deckIndex + 1, total);
  document.getElementById("sessionProgress").textContent = `Especie ${currentNum} / ${total}`;
  document.getElementById("scoreDisplay").innerHTML = `✅ ${correctCount} &nbsp; ❌ ${wrongCount}`;
  const pct = total > 0 ? (currentNum / total) * 100 : 0;
  document.getElementById("progressBar").style.width = `${pct}%`;
}

function extractValidPhotos(obsResults, sciName) {
  const urls = [];
  for (const obs of obsResults) {
    if (obs.taxon && obs.taxon.name.toLowerCase().startsWith(sciName.toLowerCase()) && obs.photos) {
      for (const p of obs.photos.slice(0, 2)) {
        if (p.url) urls.push(p.url.replace("square", "medium"));
      }
    }
  }
  return [...new Set(urls)];
}

async function fetchPhotosForSpecies(speciesObj) {
  const sciName = speciesObj.sci;
  if (taxonCache[sciName]) return shuffleArray(taxonCache[sciName]);

  const taxonRes = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&rank=species`);
  const taxonData = await taxonRes.json();
  const exactTaxon = taxonData.results.find(t => t.name.toLowerCase() === sciName.toLowerCase()) || taxonData.results[0];

  let urls = [];
  if (speciesObj.type === "plant") {
    if (!speciesObj.onlyLeaves) {
      const months = speciesObj.winterFruit ? "1,2,3,9,10,11,12" : "6,7,8,9,10";
      const fruitRes = await fetch(`https://api.inaturalist.org/v1/observations?taxon_id=${exactTaxon.id}&quality_grade=research&photos=true&term_id=12&term_value_id=14&month=${months}&per_page=40&order_by=votes`);
      const fruitData = await fruitRes.json();
      urls = extractValidPhotos(fruitData.results, sciName);
    }
    if (urls.length < 15) {
      const fallbackMonths = speciesObj.winterFruit ? "11,12,1,2" : "7,8,9";
      const leavesRes = await fetch(`https://api.inaturalist.org/v1/observations?taxon_id=${exactTaxon.id}&quality_grade=research&photos=true&month=${fallbackMonths}&per_page=40&order_by=votes`);
      const leavesData = await leavesRes.json();
      urls = [...new Set([...urls, ...extractValidPhotos(leavesData.results, sciName)])];
    }
  } else {
    const birdRes = await fetch(`https://api.inaturalist.org/v1/observations?taxon_id=${exactTaxon.id}&quality_grade=research&photos=true&per_page=40&order_by=votes`);
    const birdData = await birdRes.json();
    urls = extractValidPhotos(birdData.results, sciName);
  }
  taxonCache[sciName] = urls;
  return shuffleArray(urls);
}

// Precarga los datos y la primera foto de la siguiente especie mientras se responde
function prefetchNext() {
  const next = sessionDeck[deckIndex + 1];
  if (!next) return;
  fetchPhotosForSpecies(next)
    .then(urls => { if (urls.length > 0) new Image().src = urls[0]; })
    .catch(() => {});
}

async function nextQuestion() {
  if (deckIndex >= 0 && !currentQuestionAnswered && currentSpecies) {
    wrongCount++;
    addMistake(currentSpecies);
    recordStat(currentSpecies, false);
  }

  deckIndex++;

  if (deckIndex >= sessionDeck.length) {
    showSessionSummary();
    return;
  }

  currentSpecies = sessionDeck[deckIndex];
  currentQuestionAnswered = false;
  hintLevel = 0;
  updateTopBar();

  const requestId = ++activeRequestId;
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("hint").style.display = "none";
  document.getElementById("pistaBox").style.display = "none";
  document.getElementById("btnHint").disabled = false;
  document.getElementById("btnHint").textContent = "💡 Pista";
  document.getElementById("answer").value = "";
  document.getElementById("photo").src = "";
  document.getElementById("counter").textContent = "Cargando galería...";
  document.getElementById("btnMorePhoto").disabled = true;

  const badge = document.getElementById("modeBadge");
  if (currentSpecies.type === "plant") {
    badge.textContent = "🌿 Planta";
    badge.style.background = "#dcfce7";
    badge.style.color = "#166534";
  } else {
    badge.textContent = "🦅 Ave";
    badge.style.background = "#dbeafe";
    badge.style.color = "#1e40af";
  }

  try {
    const photos = await fetchPhotosForSpecies(currentSpecies);
    if (requestId !== activeRequestId) return;
    // Sin fotos de iNaturalist: usar la foto fija local como respaldo
    photoPool = photos.length > 0 ? photos : [currentSpecies.fixedImg];
    currentPhotoIndex = 0;
    document.getElementById("btnMorePhoto").disabled = photoPool.length < 2;
    displayCurrentPhoto();
    prefetchNext();
  } catch (e) {
    if (requestId !== activeRequestId) return;
    // Sin conexión: mostrar la foto fija local
    photoPool = [currentSpecies.fixedImg];
    currentPhotoIndex = 0;
    document.getElementById("btnMorePhoto").disabled = true;
    displayCurrentPhoto();
  }
}

function showSessionSummary() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("summaryScreen").style.display = "block";
  const total = sessionDeck.length;
  let statsHtml =
    `Has acertado <strong>${correctCount}</strong> de <strong>${total}</strong> especies.<br>` +
    (mistakesDeck.length > 0
      ? `Tienes <strong>${mistakesDeck.length}</strong> especie(s) pendiente(s) de dominar.`
      : `¡Enhorabuena! No tienes especies pendientes.`);

  const hardest = hardestSpecies(3);
  if (hardest.length > 0) {
    statsHtml += `<br><span style="font-size:14px;">Más difíciles hasta ahora: ${hardest.map(s => `<strong>${s.de[0]}</strong>`).join(", ")}.</span>`;
  }
  document.getElementById("summaryStats").innerHTML = statsHtml;

  const btnMistakes = document.getElementById("btnReviewMistakes");
  if (mistakesDeck.length > 0) {
    btnMistakes.style.display = "block";
    btnMistakes.textContent = `🔁 Repasar las ${mistakesDeck.length} falladas / saltadas`;
  } else {
    btnMistakes.style.display = "none";
  }
}

function displayCurrentPhoto() {
  if (photoPool.length > 0) {
    document.getElementById("photo").src = photoPool[currentPhotoIndex];
    document.getElementById("counter").textContent = `Foto ${currentPhotoIndex + 1} de ${photoPool.length} de esta especie`;
  }
}

function showNextPhotoOfSameSpecies() {
  if (photoPool.length > 1) {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoPool.length;
    displayCurrentPhoto();
  }
}

// Normaliza un nombre alemán para comparar: sin mayúsculas, sin umlauts ni ß,
// sin espacios ni guiones, y "ae/oe/ue" equivalen a "ä/ö/ü".
function normalizeGerman(text) {
  return text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[äöü]/g, c => ({ ä: "a", ö: "o", ü: "u" })[c])
    .replace(/(a|o|u)e/g, "$1")
    .replace(/[\s-]/g, "");
}

// Distancia de Levenshtein (número mínimo de cambios entre dos textos)
function levenshtein(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev.splice(0, prev.length, ...cur);
  }
  return prev[b.length];
}

// Acepta una errata de una letra en nombres largos, salvo que sea otro nombre válido
function isTypo(userNorm, names) {
  if (speciesList.some(s => s.de.some(d => normalizeGerman(d) === userNorm))) return false;
  return names.some(name => {
    const target = normalizeGerman(name);
    return target.length >= 7 && levenshtein(userNorm, target) === 1;
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function showHint() {
  if (!currentSpecies || currentQuestionAnswered || hintLevel >= 2) return;
  hintLevel++;
  const sp = currentSpecies;
  let text = `💡 <strong>Grupo:</strong> ${sp.group}`;
  if (hintLevel === 2) {
    const letters = sp.de[0].replace(/\s/g, "").length;
    text += `<br>💡 <strong>Empieza por:</strong> «${sp.de[0][0]}» · ${letters} letras`;
  }
  const box = document.getElementById("pistaBox");
  box.innerHTML = text;
  box.style.display = "block";
  const btn = document.getElementById("btnHint");
  btn.textContent = hintLevel === 1 ? "💡 Más pista" : "💡 Pistas agotadas";
  btn.disabled = hintLevel >= 2;
}

function revealAnswer(isCorrect, rawAnswer, typo) {
  const sp = currentSpecies;
  currentQuestionAnswered = true;
  if (isCorrect) {
    correctCount++;
    removeMistake(sp);
  } else {
    wrongCount++;
    addMistake(sp);
  }
  recordStat(sp, isCorrect);
  updateTopBar();

  const esc = escapeHtml(rawAnswer);
  let msg;
  if (isCorrect) {
    msg = `<span style="color:#16a34a; font-weight:bold;">✅ ¡Correcto! ${sp.de[0]} (${sp.es})</span>`;
    if (typo) msg += `<br><span style="font-size:13px; color:#64748b;">Escribiste «${esc}»: tiene una errata, pero se acepta.</span>`;
  } else {
    msg = `<span style="color:#dc2626; font-weight:bold;">❌ Era: ${sp.de[0]} (${sp.es})</span>`;
    if (rawAnswer) msg += `<br><span style="font-size:13px; color:#64748b;">Tu respuesta: «${esc}»</span>`;
  }
  msg += `<br><span style="font-size:13px; color:#0284c7;"><em>${sp.sci}</em></span>`;
  document.getElementById("feedback").innerHTML = msg;

  const hint = document.getElementById("hint");
  hint.innerHTML = `<strong>💡 Grupo:</strong> ${sp.group}<br><strong>💡 Clave:</strong> ${sp.trait}<br><span style="font-size:12px; color:#64748b;">(Truco: ${sp.mnemo})</span>`;
  hint.style.display = "block";
  document.getElementById("pistaBox").style.display = "none";
  document.getElementById("btnHint").disabled = true;
}

function checkAnswer() {
  if (!currentSpecies || currentQuestionAnswered) return;
  const raw = document.getElementById("answer").value.trim();
  if (!raw) return;
  const userAns = normalizeGerman(raw);

  if (currentSpecies.de.some(name => normalizeGerman(name) === userAns)) {
    revealAnswer(true, raw, false);
    return;
  }
  if (isTypo(userAns, currentSpecies.de)) {
    revealAnswer(true, raw, true);
    return;
  }

  revealAnswer(false, raw, false);
}

// Función de Zoom en el Modo Examen
function zoomQuizPhoto() {
  const photoEl = document.getElementById("photo");
  // Usar el atributo (no la propiedad): la propiedad src devuelve la URL de la página si está vacío
  const rawSrc = photoEl ? photoEl.getAttribute("src") : "";
  if (!rawSrc || rawSrc.includes("data:,") || !currentSpecies) return;

  const imgSrc = photoEl.src;

  if (!currentQuestionAnswered) {
    // Si aún no ha respondido, solo agranda la foto para ver los detalles sin spoilers
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const caption = document.getElementById("modalCaption");

    modalImg.src = imgSrc.replace("medium", "large").replace("square", "large");
    caption.innerHTML = `<div style="font-size: 16px; font-weight: bold; color: #e2e8f0;">🔍 Vista en detalle (¿Qué especie es?)</div>`;
    modal.style.display = "flex";
  } else {
    // Si ya respondió, muestra la foto ampliada junto con la solución y la mnemotecnia
    openModal(
      imgSrc,
      `${currentSpecies.de[0]} (${currentSpecies.es})`,
      currentSpecies.trait,
      currentSpecies.mnemo
    );
  }
}

// Enter: si aún no se ha respondido, comprueba; si ya se respondió, pasa a la siguiente
document.getElementById("answer").addEventListener("keypress", function(e) {
  if (e.key !== "Enter") return;
  if (currentQuestionAnswered) nextQuestion();
  else checkAnswer();
});
