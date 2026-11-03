// ===== Estadísticas: se calculan a partir del progreso guardado en el navegador =====

const STAT_MODES = { examen: "🎯 Examen", pareja: "🧩 En pareja", quien: "❓ ¿Quién es?" };
let statsFilter = "all";

function setStatsFilter(filter) {
  statsFilter = filter;
  renderStats();
}

function pct(ok, total) {
  return total > 0 ? Math.round((ok / total) * 100) : null;
}

function levelClass(p) {
  if (p === null) return "";
  if (p < 50) return "bad";
  if (p < 80) return "warn";
  return "good";
}

function barRow(label, p, sub) {
  const value = p === null ? "sin practicar" : `${p}% · ${sub}`;
  return `
    <div class="bar-row">
      <div class="bar-label" title="${label}">${label}</div>
      <div class="bar-track"><div class="bar-fill ${levelClass(p)}" style="width: ${p === null ? 0 : p}%"></div></div>
      <div class="bar-value">${value}</div>
    </div>
  `;
}

// Aciertos y fallos por especie: acumulado total, o solo del modo elegido (desde el historial)
function statsAggregate() {
  const agg = {};
  if (statsFilter === "all") {
    Object.entries(progress.stats).forEach(([sci, st]) => {
      agg[sci] = { ok: st.ok, fail: st.fail };
    });
  } else {
    progress.history.forEach(h => {
      if (h.m !== statsFilter) return;
      if (!agg[h.s]) agg[h.s] = { ok: 0, fail: 0 };
      if (h.ok) agg[h.s].ok++;
      else agg[h.s].fail++;
    });
  }
  return agg;
}

function renderStats() {
  const area = document.getElementById("statsContent");
  const stats = statsAggregate();
  const history = statsFilter === "all"
    ? progress.history
    : progress.history.filter(h => h.m === statsFilter);

  const filterHtml = `
    <div class="quiz-filter" id="statsFilter">
      <button class="${statsFilter === "all" ? "active" : ""}" onclick="setStatsFilter('all')">Todos</button>
      ${Object.keys(STAT_MODES).map(m => `
        <button class="${statsFilter === m ? "active" : ""}" onclick="setStatsFilter('${m}')">${STAT_MODES[m]}</button>
      `).join("")}
    </div>
  `;

  let totalAnswers = 0;
  let totalOk = 0;
  const bySection = { bird: { ok: 0, total: 0 }, plant: { ok: 0, total: 0 } };
  speciesList.forEach(s => {
    const st = stats[s.sci];
    if (!st) return;
    const total = st.ok + st.fail;
    totalAnswers += total;
    totalOk += st.ok;
    bySection[s.type].ok += st.ok;
    bySection[s.type].total += total;
  });

  if (totalAnswers === 0) {
    area.innerHTML = `${filterHtml}<div class="stats-empty">Todavía no hay datos${statsFilter === "all" ? "" : " en este modo"}. Haz alguna ronda y aquí verás tus estadísticas.</div>`;
    return;
  }

  const practiced = speciesList.filter(s => stats[s.sci] && stats[s.sci].ok + stats[s.sci].fail > 0).length;

  // Especies ordenadas: primero las de peor acierto, al final las sin practicar
  const rows = speciesList.map(s => {
    const st = stats[s.sci];
    const total = st ? st.ok + st.fail : 0;
    const ok = st ? st.ok : 0;
    return { sp: s, total, ok, p: pct(ok, total) };
  }).sort((a, b) => {
    if ((a.p === null) !== (b.p === null)) return a.p === null ? 1 : -1;
    return (a.p ?? 0) - (b.p ?? 0) || b.total - a.total;
  });

  const topFails = speciesList
    .filter(s => stats[s.sci] && stats[s.sci].fail > 0)
    .sort((a, b) => stats[b.sci].fail - stats[a.sci].fail)
    .slice(0, 5);

  // Últimos 14 días: número de respuestas por día, con su acierto al pasar el ratón
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayKey(d));
  }
  const perDay = {};
  history.forEach(h => {
    if (!perDay[h.d]) perDay[h.d] = { total: 0, ok: 0 };
    perDay[h.d].total++;
    perDay[h.d].ok += h.ok;
  });
  const maxDay = Math.max(1, ...days.map(d => (perDay[d] ? perDay[d].total : 0)));
  const dayCols = days.map(d => {
    const v = perDay[d] || { total: 0, ok: 0 };
    const h = v.total > 0 ? Math.max(4, Math.round((v.total / maxDay) * 100)) : 0;
    const p = pct(v.ok, v.total);
    const tip = `${d}: ${v.total} respuestas${p !== null ? `, ${p}% acierto` : ""}`;
    return `<div class="day-col" title="${tip}"><div class="day-bar" style="height: ${h}%"></div><div class="day-label">${d.slice(8)}</div></div>`;
  }).join("");

  area.innerHTML = `
    ${filterHtml}

    <div class="stat-cards">
      <div class="stat-card"><strong>${totalAnswers}</strong><span>Respuestas</span></div>
      <div class="stat-card"><strong>${pct(totalOk, totalAnswers)}%</strong><span>Acierto global</span></div>
      <div class="stat-card"><strong>${practiced} / ${speciesList.length}</strong><span>Especies practicadas</span></div>
      <div class="stat-card"><strong>${progress.mistakes.length}</strong><span>Pendientes</span></div>
    </div>

    <div class="stats-section">
      <h3>📈 Últimos 14 días</h3>
      <div class="days-chart">${dayCols}</div>
    </div>

    <div class="stats-section">
      <h3>🎮 Por modo</h3>
      ${Object.keys(STAT_MODES).map(m => {
        const v = progress.modes[m] || { ok: 0, total: 0 };
        return barRow(STAT_MODES[m], pct(v.ok, v.total), `${v.ok}/${v.total}`);
      }).join("")}
    </div>

    <div class="stats-section">
      <h3>🗂 Por sección</h3>
      ${barRow("🦅 Aves", pct(bySection.bird.ok, bySection.bird.total), `${bySection.bird.ok}/${bySection.bird.total}`)}
      ${barRow("🌿 Árboles y arbustos", pct(bySection.plant.ok, bySection.plant.total), `${bySection.plant.ok}/${bySection.plant.total}`)}
    </div>

    <div class="stats-section">
      <h3>🔥 Especies que más fallas</h3>
      ${topFails.length > 0
        ? topFails.map(s => `
            <div class="bar-row">
              <div class="bar-label" title="${s.de[0]}">${s.de[0]}</div>
              <div class="bar-value" style="flex: 1; text-align: left;">${stats[s.sci].fail} fallos</div>
            </div>`).join("")
        : `<div class="stats-empty">Ninguna todavía</div>`}
    </div>

    <div class="stats-section">
      <h3>🔤 Acierto por especie</h3>
      ${rows.map(r => barRow(`${r.sp.type === "bird" ? "🦅" : "🌿"} ${r.sp.de[0]}`, r.p, `${r.ok}/${r.total}`)).join("")}
    </div>

    <button class="btn-secondary" onclick="resetProgress()">🗑 Borrar estadísticas y progreso</button>
  `;
}
