let sessionDeck = [];
let mistakesDeck = [];
let deckIndex = -1;
let currentSpecies = null;
let currentQuestionAnswered = false;
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

function startFullSession() {
  sessionDeck = shuffleArray(speciesList);
  mistakesDeck = [];
  deckIndex = -1;
  correctCount = 0;
  wrongCount = 0;
  document.getElementById("summaryScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  nextQuestion();
}

function startMistakesSession() {
  sessionDeck = shuffleArray(mistakesDeck);
  mistakesDeck = [];
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

async function nextQuestion() {
  if (deckIndex >= 0 && !currentQuestionAnswered && currentSpecies) {
    wrongCount++;
    if (!mistakesDeck.some(s => s.sci === currentSpecies.sci)) {
      mistakesDeck.push(currentSpecies);
    }
  }

  deckIndex++;

  if (deckIndex >= sessionDeck.length) {
    showSessionSummary();
    return;
  }

  currentSpecies = sessionDeck[deckIndex];
  currentQuestionAnswered = false;
  updateTopBar();

  const requestId = ++activeRequestId;
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("hint").style.display = "none";
  document.getElementById("answer").value = "";
  document.getElementById("photo").src = "";
  document.getElementById("counter").textContent = "Cargando galería...";
  document.getElementById("btnMorePhoto").disabled = true;

  // Solo indica si es Planta o Ave (sin desvelar la categoría ni el subgrupo)
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
    photoPool = photos; currentPhotoIndex = 0;
    document.getElementById("btnMorePhoto").disabled = false;
    displayCurrentPhoto();
  } catch (e) {
    if (requestId !== activeRequestId) return;
    document.getElementById("counter").textContent = "Error de conexión.";
  }
}

function showSessionSummary() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("summaryScreen").style.display = "block";
  const total = sessionDeck.length;
  document.getElementById("summaryStats").innerHTML = 
    `Has acertado <strong>${correctCount}</strong> de <strong>${total}</strong> especies.<br>` +
    (mistakesDeck.length > 0 
      ? `Tienes <strong>${mistakesDeck.length}</strong> especie(s) pendiente(s) de dominar.` 
      : `¡Enhorabuena! Has dominado todas las especies de esta ronda.`);

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

function checkAnswer() {
  if (!currentSpecies) return;
  const userAns = document.getElementById("answer").value.trim().toLowerCase();
  const isCorrect = currentSpecies.de.some(ans => ans.toLowerCase() === userAns);
  const fb = document.getElementById("feedback");
  const hint = document.getElementById("hint");

  if (!currentQuestionAnswered) {
    currentQuestionAnswered = true;
    if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
      if (!mistakesDeck.some(s => s.sci === currentSpecies.sci)) {
        mistakesDeck.push(currentSpecies);
      }
    }
    updateTopBar();
  }

  fb.innerHTML = isCorrect 
    ? `<span style="color:#16a34a; font-weight:bold;">✅ ¡Correcto! ${currentSpecies.de[0]} (${currentSpecies.es})</span>`
    : `<span style="color:#dc2626; font-weight:bold;">❌ Era: ${currentSpecies.de[0]} (${currentSpecies.es})</span>`;
  hint.innerHTML = `<strong>💡 Grupo:</strong> ${currentSpecies.group}<br><strong>💡 Clave:</strong> ${currentSpecies.trait}<br><span style="font-size:12px; color:#64748b;">(Truco: ${currentSpecies.mnemo})</span>`;
  hint.style.display = "block";
}

document.getElementById("answer").addEventListener("keypress", function(e) {
  if (e.key === "Enter") { checkAnswer(); this.blur(); }
});
