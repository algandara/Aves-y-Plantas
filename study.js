let studyRendered = false;

function renderStudySection() {
  if (studyRendered) return;
  studyRendered = true;
  const container = document.getElementById("studyContent");

  const groups = [...new Set(speciesList.map(s => s.group))];

  groups.forEach(groupName => {
    const groupItems = speciesList.filter(s => s.group === groupName);
    const box = document.createElement("div");
    box.className = "study-group";

    let rowsHtml = "";
    groupItems.forEach((sp) => {
      const escapedDe = sp.de[0].replace(/'/g, "\\'");
      const escapedEs = sp.es.replace(/'/g, "\\'");
      const escapedTrait = sp.trait.replace(/'/g, "\\'");

      rowsHtml += `
        <tr>
          <td style="width: 76px; text-align: center;">
            <div class="img-thumb-container" onclick="openModal('${sp.fixedImg}', '${escapedDe} (${escapedEs})', '${escapedTrait}')">
              <img class="cell-img" src="${sp.fixedImg}" alt="${sp.de[0]}" loading="lazy" onerror="handleFixedImgError(this, '${sp.sci}')">
              <span class="zoom-hint">🔍</span>
            </div>
          </td>
          <td style="width: 38%;">
            <div class="species-de">${sp.de[0]}</div>
            <div class="species-es">${sp.es}</div>
            <div style="font-size:11px; color:#0284c7; font-weight:600; margin-top:3px; line-height:1.25;">
              🔍 Lit.: <em>${sp.literal}</em>
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
      <div class="group-title">
        <span>${groupName.startsWith("Plantas") || groupName.startsWith("Aves con patrón") ? "📌 " : "🔍 "}${groupName}</span>
        <span style="font-size:12px; color:#64748b; font-weight:normal;">(${groupItems.length} especies)</span>
      </div>
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

function openModal(imgSrc, title, desc) {
  if (!imgSrc) return;
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const caption = document.getElementById("modalCaption");
  
  modalImg.src = imgSrc;
  caption.innerHTML = `${title}<br><span style="font-size:13px; font-weight:normal; color:#cbd5e1;">${desc}</span>`;
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
        parentThumb.onclick = () => openModal(urls[0], `${sp.de[0]} (${sp.es})`, sp.trait);
      }
    }
  });
}
