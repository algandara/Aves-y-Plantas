let studyRendered = false;

function showStudyChooser() {
  document.getElementById("studyChooser").style.display = "block";
  const container = document.getElementById("studyContent");
  container.style.display = "none";
  container.innerHTML = "";
}

function renderStudySection(type) {
  document.getElementById("studyChooser").style.display = "none";
  const container = document.getElementById("studyContent");
  container.innerHTML = "";
  container.style.display = "block";

  const backBtn = document.createElement("button");
  backBtn.className = "btn-back study-back";
  backBtn.textContent = "← Secciones";
  backBtn.onclick = showStudyChooser;
  container.appendChild(backBtn);

  const sectionHeader = document.createElement("h2");
  sectionHeader.className = "study-section-title";
  sectionHeader.textContent = type === "bird" ? "🦅 Aves" : "🌿 Árboles y arbustos";
  container.appendChild(sectionHeader);

  const toolbar = document.createElement("div");
  toolbar.className = "study-toolbar";
  toolbar.innerHTML = `
    <button class="btn-back" onclick="setAllGroups(true)">Expandir todo</button>
    <button class="btn-back" onclick="setAllGroups(false)">Plegar todo</button>
  `;
  container.appendChild(toolbar);

  const groups = [...new Set(speciesList.filter(s => s.type === type).map(s => s.group))];

  groups.forEach(groupName => {
    const groupItems = speciesList.filter(s => s.group === groupName);
    const icon = groupItems[0].type === "plant" ? "🌿" : "🦅";
    const box = document.createElement("details");
    box.className = "study-group";
    box.open = true;

    let rowsHtml = "";
    groupItems.forEach((sp) => {
      const escapedDe = sp.de[0].replace(/'/g, "\\'");
      const escapedEs = sp.es.replace(/'/g, "\\'");
      const escapedTrait = sp.trait.replace(/'/g, "\\'");
      const escapedMnemo = sp.mnemo.replace(/'/g, "\\'");

      rowsHtml += `
        <tr>
          <td style="width: 76px; text-align: center;">
            <div class="img-thumb-container" onclick="openModal('${sp.fixedImg}', '${escapedDe} (${escapedEs})', '${escapedTrait}', '${escapedMnemo}')">
              <img class="cell-img" src="${sp.fixedImg}" alt="${sp.de[0]}" loading="lazy" onerror="handleFixedImgError(this, '${sp.sci}')">
              <span class="zoom-hint">🔍</span>
            </div>
          </td>
          <td style="width: 38%;">
            <div class="species-de">${sp.de[0]}</div>
            <div class="species-es">${sp.es}</div>
            <div style="font-size:11px; color:#0284c7; font-weight:600; margin-top:3px; line-height:1.25;">
              <em>${sp.literal}</em>
            </div>
          </td>
          <td>
            <div class="diff-trait">${sp.trait}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">🧠 ${sp.mnemo}</div>
          </td>
        </tr>
      `;
    });

    box.innerHTML = `
      <summary class="group-title">
        <span>${icon} ${groupName}</span>
        <span class="group-meta">(${groupItems.length} ${groupItems.length === 1 ? "especie" : "especies"})<span class="group-chevron">▾</span></span>
      </summary>
      <div class="table-container">
        <table class="comp-table">
          <thead>
            <tr>
              <th>Foto fija</th>
              <th>Especie y Significado</th>
              <th>Rasgo Clave Diferenciador</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
    container.appendChild(box);
  });
}

function setAllGroups(open) {
  document.querySelectorAll("#studyContent .study-group").forEach(d => {
    d.open = open;
  });
}

function openModal(imgSrc, title, desc, mnemo) {
  if (!imgSrc) return;
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const caption = document.getElementById("modalCaption");
  
  modalImg.src = imgSrc;
  caption.innerHTML = `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px;">${title}</div>
    <div style="font-size: 13px; font-weight: normal; color: #93c5fd; margin-bottom: 8px;"><strong>🔍 Rasgo clave:</strong> ${desc}</div>
    <div style="font-size: 13px; font-weight: normal; color: #fde047; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; line-height: 1.4;">
      <strong>🧠 Cómo acordarse:</strong> ${mnemo}
    </div>
  `;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

function handleFixedImgError(imgElement, sciName) {
  const sp = speciesList.find(s => s.sci === sciName);
  if (!sp) return;
  fetchPhotosForSpecies(sp).then(urls => {
    if (urls && urls.length > 0) {
      imgElement.src = urls[0];
      const parentThumb = imgElement.closest('.img-thumb-container');
      if (parentThumb) {
        parentThumb.onclick = () => openModal(urls[0], `${sp.de[0]} (${sp.es})`, sp.trait, sp.mnemo);
      }
    }
  });
}
