const defaultState = {
  header: {
    name: "Akshad Agrawal",
    contact: "San Francisco, CA | akshad.contact@gmail.com | (555) 123-4567",
  },
  sections: [
    {
      title: "Experience",
      entries: [
        {
          title: "Senior Software Engineer",
          meta: "Google | 2020 - Present",
          stacked: false, // Default to inline
          bullets: [
            "Led the **frontend overhaul** using React",
            "Improved performance by 40%",
          ],
        },
      ],
    },
  ],
};

let resumeData = JSON.parse(localStorage.getItem("resumeData")) || defaultState;
let editingContext = null;
let confirmCallback = null;

function render() {
  const preview = document.getElementById("resume-preview");
  preview.innerHTML = "";

  // --- HEADER ---
  const header = document.createElement("header");
  header.onclick = () => openModal("header");
  header.innerHTML = `
    <h1>${parseMarkdown(resumeData.header.name)}</h1>
    <p>${parseMarkdown(resumeData.header.contact)}</p>
    <div class="action-btn-group" style="top: 10px; right: 10px;">
      <button class="action-btn" title="Edit"><i class="ph ph-pencil-simple"></i></button>
    </div>
  `;
  preview.appendChild(header);

  // --- SECTIONS ---
  resumeData.sections.forEach((section, secIdx) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "resume-section";

    const isFirstSec = secIdx === 0;
    const isLastSec = secIdx === resumeData.sections.length - 1;

    const h2 = document.createElement("h2");
    h2.innerHTML = `
      ${parseMarkdown(section.title)}
      <div class="action-btn-group">
        ${
          !isFirstSec
            ? `<button class="action-btn" title="Move Up" onclick="event.stopPropagation(); moveItem('section', -1, ${secIdx})"><i class="ph ph-arrow-up"></i></button>`
            : ""
        }
        ${
          !isLastSec
            ? `<button class="action-btn" title="Move Down" onclick="event.stopPropagation(); moveItem('section', 1, ${secIdx})"><i class="ph ph-arrow-down"></i></button>`
            : ""
        }
        <button class="action-btn" title="Edit Section" onclick="event.stopPropagation(); openModal('section', ${secIdx})"><i class="ph ph-pencil-simple"></i></button>
        <button class="action-btn add-btn" title="Add Entry" onclick="event.stopPropagation(); openModal('new-entry', ${secIdx})"><i class="ph ph-plus"></i></button>
        <button class="action-btn delete-btn" title="Delete Section" onclick="event.stopPropagation(); deleteItem('section', ${secIdx})"><i class="ph ph-trash"></i></button>
      </div>
    `;
    sectionEl.appendChild(h2);

    // --- ENTRIES ---
    section.entries.forEach((entry, entryIdx) => {
      const entryEl = document.createElement("div");
      entryEl.className = "entry";

      const isFirstEntry = entryIdx === 0;
      const isLastEntry = entryIdx === section.entries.length - 1;

      // Check layout preference
      const isStacked = entry.stacked === true;

      const entryHeader = document.createElement("div");
      // Add 'stacked' class if true
      entryHeader.className = `entry-header ${isStacked ? "stacked" : ""}`;

      entryHeader.innerHTML = `
        <div class="entry-title">${parseMarkdown(entry.title)}</div>
        <div class="entry-meta">${parseMarkdown(entry.meta)}</div>
        
        <div class="action-btn-group">
          ${
            !isFirstEntry
              ? `<button class="action-btn" title="Move Up" onclick="event.stopPropagation(); moveItem('entry', -1, ${secIdx}, ${entryIdx})"><i class="ph ph-arrow-up"></i></button>`
              : ""
          }
          ${
            !isLastEntry
              ? `<button class="action-btn" title="Move Down" onclick="event.stopPropagation(); moveItem('entry', 1, ${secIdx}, ${entryIdx})"><i class="ph ph-arrow-down"></i></button>`
              : ""
          }
          <button class="action-btn" title="Edit Entry" onclick="event.stopPropagation(); openModal('entry', ${secIdx}, ${entryIdx})"><i class="ph ph-pencil-simple"></i></button>
          <button class="action-btn add-btn" title="Add Bullet" onclick="event.stopPropagation(); openModal('new-bullet', ${secIdx}, ${entryIdx})"><i class="ph ph-list-plus"></i></button>
          <button class="action-btn delete-btn" title="Delete Entry" onclick="event.stopPropagation(); deleteItem('entry', ${secIdx}, ${entryIdx})"><i class="ph ph-trash"></i></button>
        </div>
      `;
      entryEl.appendChild(entryHeader);

      // --- BULLETS ---
      if (entry.bullets.length > 0) {
        const ul = document.createElement("ul");
        ul.className = "entry-bullets";
        entry.bullets.forEach((bullet, bulletIdx) => {
          const isFirstBullet = bulletIdx === 0;
          const isLastBullet = bulletIdx === entry.bullets.length - 1;

          const li = document.createElement("li");
          li.innerHTML = `
            ${parseMarkdown(bullet)}
            <div class="action-btn-group">
              ${
                !isFirstBullet
                  ? `<button class="action-btn" title="Move Up" onclick="event.stopPropagation(); moveItem('bullet', -1, ${secIdx}, ${entryIdx}, ${bulletIdx})"><i class="ph ph-arrow-up"></i></button>`
                  : ""
              }
              ${
                !isLastBullet
                  ? `<button class="action-btn" title="Move Down" onclick="event.stopPropagation(); moveItem('bullet', 1, ${secIdx}, ${entryIdx}, ${bulletIdx})"><i class="ph ph-arrow-down"></i></button>`
                  : ""
              }
              <button class="action-btn" title="Edit Bullet" onclick="event.stopPropagation(); openModal('bullet', ${secIdx}, ${entryIdx}, ${bulletIdx})"><i class="ph ph-pencil-simple"></i></button>
              <button class="action-btn delete-btn" title="Delete Bullet" onclick="event.stopPropagation(); deleteItem('bullet', ${secIdx}, ${entryIdx}, ${bulletIdx})"><i class="ph ph-trash"></i></button>
            </div>
          `;
          ul.appendChild(li);
        });
        entryEl.appendChild(ul);
      }
      sectionEl.appendChild(entryEl);
    });

    preview.appendChild(sectionEl);
  });

  saveData();
}

// ... (Import/Export Logic remains same) ...
function exportJSON() {
  const dataStr = JSON.stringify(resumeData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = "my-resume.json";
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
  showToast("Resume exported successfully");
}

function triggerImport() {
  document.getElementById("import-input").click();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!importedData.header || !importedData.sections) {
        throw new Error("Invalid resume JSON format");
      }
      resumeData = importedData;
      saveData();
      render();
      showToast("Resume imported successfully");
      event.target.value = "";
    } catch (err) {
      alert("Error parsing JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ... (Reordering Logic remains same) ...
window.moveItem = function (type, direction, secIdx, entryIdx, bulletIdx) {
  if (type === "section") {
    const newIdx = secIdx + direction;
    if (newIdx >= 0 && newIdx < resumeData.sections.length) {
      [resumeData.sections[secIdx], resumeData.sections[newIdx]] = [
        resumeData.sections[newIdx],
        resumeData.sections[secIdx],
      ];
    }
  } else if (type === "entry") {
    const entries = resumeData.sections[secIdx].entries;
    const newIdx = entryIdx + direction;
    if (newIdx >= 0 && newIdx < entries.length) {
      [entries[entryIdx], entries[newIdx]] = [
        entries[newIdx],
        entries[entryIdx],
      ];
    }
  } else if (type === "bullet") {
    const bullets = resumeData.sections[secIdx].entries[entryIdx].bullets;
    const newIdx = bulletIdx + direction;
    if (newIdx >= 0 && newIdx < bullets.length) {
      [bullets[bulletIdx], bullets[newIdx]] = [
        bullets[newIdx],
        bullets[bulletIdx],
      ];
    }
  }
  render();
  saveData();
};

window.openModal = function (type, secIdx, entryIdx, bulletIdx) {
  const modal = document.getElementById("universal-modal");
  const titleEl = document.getElementById("modal-title");
  const fieldsEl = document.getElementById("modal-fields");

  editingContext = { type, secIdx, entryIdx, bulletIdx };
  fieldsEl.innerHTML = "";

  if (type === "header") {
    titleEl.textContent = "Edit Header";
    fieldsEl.innerHTML = `
      <div class="form-group"><label>Full Name</label><input type="text" id="input-name" value="${resumeData.header.name}"></div>
      <div class="form-group"><label>Contact Info</label><input type="text" id="input-contact" value="${resumeData.header.contact}"></div>
    `;
  } else if (type === "section") {
    titleEl.textContent = "Edit Section";
    fieldsEl.innerHTML = `<div class="form-group"><label>Title</label><input type="text" id="input-title" value="${resumeData.sections[secIdx].title}"></div>`;
  } else if (type === "entry") {
    const entry = resumeData.sections[secIdx].entries[entryIdx];
    titleEl.textContent = "Edit Job/Degree";
    // ADDED CHECKBOX FOR STACKED LAYOUT
    fieldsEl.innerHTML = `
      <div class="form-group"><label>Role / Degree</label><input type="text" id="input-title" value="${
        entry.title
      }"></div>
      <div class="form-group"><label>Company / Date</label><input type="text" id="input-meta" value="${
        entry.meta
      }"></div>
      <div class="form-group" style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="input-stacked" style="width:auto;" ${
          entry.stacked ? "checked" : ""
        }>
        <label for="input-stacked" style="margin:0; font-weight:normal;">Show Date below Title? (Stacked)</label>
      </div>
    `;
  } else if (type === "bullet") {
    const bullet =
      resumeData.sections[secIdx].entries[entryIdx].bullets[bulletIdx];
    titleEl.textContent = "Edit Bullet";
    fieldsEl.innerHTML = `<div class="form-group"><label>Details</label><textarea id="input-text" rows="4">${bullet}</textarea></div>`;
  } else if (type === "new-section") {
    titleEl.textContent = "Add Section";
    fieldsEl.innerHTML = `<div class="form-group"><label>Title</label><input type="text" id="input-title" placeholder="Experience, Education, etc."></div>`;
  } else if (type === "new-entry") {
    titleEl.textContent = "Add Entry";
    fieldsEl.innerHTML = `
      <div class="form-group"><label>Role / Degree</label><input type="text" id="input-title" placeholder="Software Engineer"></div>
      <div class="form-group"><label>Company / Date</label><input type="text" id="input-meta" placeholder="Google | 2023 - Present"></div>
      <div class="form-group" style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="input-stacked" style="width:auto;">
        <label for="input-stacked" style="margin:0; font-weight:normal;">Show Date below Title? (Stacked)</label>
      </div>
    `;
  } else if (type === "new-bullet") {
    titleEl.textContent = "Add Bullet";
    fieldsEl.innerHTML = `<div class="form-group"><label>Details</label><textarea id="input-text" rows="4" placeholder="Did X and improved Y by Z%"></textarea></div>`;
  }

  modal.classList.add("active");
  setTimeout(() => fieldsEl.querySelector("input, textarea")?.focus(), 50);
};

function saveModal() {
  const { type, secIdx, entryIdx, bulletIdx } = editingContext;

  if (type === "header") {
    resumeData.header.name = document.getElementById("input-name").value;
    resumeData.header.contact = document.getElementById("input-contact").value;
  } else if (type === "section")
    resumeData.sections[secIdx].title =
      document.getElementById("input-title").value;
  else if (type === "entry") {
    resumeData.sections[secIdx].entries[entryIdx].title =
      document.getElementById("input-title").value;
    resumeData.sections[secIdx].entries[entryIdx].meta =
      document.getElementById("input-meta").value;
    // SAVE STACKED PREFERENCE
    resumeData.sections[secIdx].entries[entryIdx].stacked =
      document.getElementById("input-stacked").checked;
  } else if (type === "bullet")
    resumeData.sections[secIdx].entries[entryIdx].bullets[bulletIdx] =
      document.getElementById("input-text").value;
  else if (type === "new-section") {
    const title = document.getElementById("input-title").value;
    if (title) resumeData.sections.push({ title, entries: [] });
  } else if (type === "new-entry") {
    const title = document.getElementById("input-title").value;
    const meta = document.getElementById("input-meta").value;
    const stacked = document.getElementById("input-stacked").checked;
    if (title)
      resumeData.sections[secIdx].entries.push({
        title,
        meta,
        stacked,
        bullets: [],
      });
  } else if (type === "new-bullet") {
    const text = document.getElementById("input-text").value;
    if (text) resumeData.sections[secIdx].entries[entryIdx].bullets.push(text);
  }

  closeModal();
  render();
  showToast("Saved successfully");
}

function closeModal() {
  document.getElementById("universal-modal").classList.remove("active");
  editingContext = null;
}

function openConfirmModal(message, onConfirm) {
  const modal = document.getElementById("confirm-modal");
  document.getElementById("confirm-message").textContent = message;
  confirmCallback = onConfirm;
  modal.classList.add("active");
}

function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.remove("active");
  confirmCallback = null;
}

function handleConfirmYes() {
  if (confirmCallback) confirmCallback();
  closeConfirmModal();
}

window.deleteItem = function (type, secIdx, entryIdx, bulletIdx) {
  openConfirmModal(
    "Are you sure you want to delete this item? This cannot be undone.",
    () => {
      if (type === "section") resumeData.sections.splice(secIdx, 1);
      else if (type === "entry")
        resumeData.sections[secIdx].entries.splice(entryIdx, 1);
      else if (type === "bullet")
        resumeData.sections[secIdx].entries[entryIdx].bullets.splice(
          bulletIdx,
          1
        );
      render();
      showToast("Item deleted");
    }
  );
};

function saveData() {
  localStorage.setItem("resumeData", JSON.stringify(resumeData));
}

function parseMarkdown(text) {
  if (!text) return "";
  let updatedText = text
    .replace(/\n/g, "<br>")
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;
      return `<a href="${finalUrl}" target="_blank" style="color:inherit; text-decoration:underline;">${linkText}</a>`;
    });
  return updatedText
    .replace(/~~(.*?)~~/g, "<s>$1</s>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(_|\*)(.*?)\1/g, "<em>$2</em>");
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="ph ph-check-circle"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  render();

  document
    .getElementById("btn-edit-header")
    .addEventListener("click", () => openModal("header"));
  document
    .getElementById("btn-add-section")
    .addEventListener("click", () => openModal("new-section"));

  document.getElementById("modal-save").addEventListener("click", saveModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document
    .getElementById("modal-close-x")
    .addEventListener("click", closeModal);

  document
    .getElementById("confirm-yes")
    .addEventListener("click", handleConfirmYes);
  document
    .getElementById("confirm-cancel")
    .addEventListener("click", closeConfirmModal);
  document
    .getElementById("confirm-close-x")
    .addEventListener("click", closeConfirmModal);

  document.getElementById("save-btn").addEventListener("click", () => {
    saveData();
    showToast("Progress saved");
  });

  document.getElementById("export-btn").addEventListener("click", exportJSON);
  document
    .getElementById("import-btn")
    .addEventListener("click", triggerImport);
  document
    .getElementById("import-input")
    .addEventListener("change", handleFileImport);

  document.getElementById("clear-btn").addEventListener("click", () => {
    openConfirmModal(
      "Are you sure you want to clear all data? This cannot be undone.",
      () => {
        resumeData = JSON.parse(JSON.stringify(defaultState));
        render();
        showToast("All data reset");
      }
    );
  });

  document.getElementById("download-btn").addEventListener("click", () => {
    const originalTitle = document.title;
    document.title = "Resume";
    window.print();
    document.title = originalTitle;
  });

  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  if (toggle && sidebar)
    toggle.addEventListener("click", () => sidebar.classList.toggle("active"));
});
