document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const circle = document.createElement("span");
    circle.classList.add("ripple");
    this.appendChild(circle);
    const d = Math.max(this.clientWidth, this.clientHeight);
    circle.style.width = circle.style.height = d + "px";
    circle.style.left = e.clientX - this.offsetLeft - d / 2 + "px";
    circle.style.top = e.clientY - this.offsetTop - d / 2 + "px";
    setTimeout(() => circle.remove(), 600);
  });
});

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  toast.addEventListener("animationend", () => toast.remove());
}

function parseMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/~~(.*?)~~/g, "<s>$1</s>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(_|\*)(.*?)\1/g, "<em>$2</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

function promptInput(message) {
  return window.prompt(message) || "";
}

document.addEventListener("DOMContentLoaded", () => {
  const addSectionBtn = document.getElementById("add-section-heading");
  const addTitleBtn = document.getElementById("add-title-line");
  const addBulletBtn = document.getElementById("add-bullet-point");
  const undoBtn = document.getElementById("undo-btn");
  const downloadBtn = document.getElementById("download-btn");
  const updateNameBtn = document.getElementById("update-name");
  const updateContactBtn = document.getElementById("update-contact");

  const dynamicContainer = document.getElementById("dynamic-sections");
  const nameEl = document.getElementById("name");
  const contactEl = document.getElementById("contact");

  let currentSection = null;
  let currentEntry = null;
  const actionStack = [];

  function createSection(title) {
    const section = document.createElement("div");
    section.className = "resume-section fade-in";
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);
    const content = document.createElement("div");
    section.appendChild(content);
    dynamicContainer.appendChild(section);
    currentSection = content;
    currentEntry = null;
    actionStack.push(() => section.remove());
  }

  function createEntry(title, meta) {
    if (!currentSection) return showToast("Please add a section first.");
    const entry = document.createElement("div");
    entry.className = "entry fade-in";
    const header = document.createElement("div");
    header.className = "entry-header";
    const titleEl = document.createElement("span");
    titleEl.className = "entry-title";
    titleEl.innerHTML = parseMarkdown(title);
    const metaEl = document.createElement("span");
    metaEl.className = "entry-meta";
    metaEl.innerHTML = parseMarkdown(meta);
    header.appendChild(titleEl);
    header.appendChild(metaEl);
    const ul = document.createElement("ul");
    ul.className = "entry-bullets";
    entry.appendChild(header);
    entry.appendChild(ul);
    currentSection.appendChild(entry);
    currentEntry = ul;
    actionStack.push(() => entry.remove());
  }

  function addBullet(text) {
    if (!currentSection) return showToast("Please add a section first.");
    if (!currentEntry) {
      const entry = document.createElement("div");
      entry.className = "entry";
      const ul = document.createElement("ul");
      ul.className = "entry-bullets";
      entry.appendChild(ul);
      currentSection.appendChild(entry);
      currentEntry = ul;
      actionStack.push(() => entry.remove());
    }
    const li = document.createElement("li");
    li.className = "fade-in";
    li.innerHTML = parseMarkdown(text);
    currentEntry.appendChild(li);
    actionStack.push(() => li.remove());
  }

  function updateName() {
    const newName = promptInput("Enter your name:");
    if (!newName) return;
    const prev = nameEl.textContent;
    nameEl.textContent = newName;
    actionStack.push(() => {
      nameEl.textContent = prev;
    });
  }

  function updateContact() {
    const newContact = promptInput("Enter contact info:");
    if (!newContact) return;
    const prev = contactEl.textContent;
    const isPlaceholder = prev.trim().includes("Location | Email");
    contactEl.textContent = isPlaceholder
      ? newContact
      : prev + " | " + newContact;
    actionStack.push(() => {
      contactEl.textContent = prev;
    });
  }

  function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");
    const resumeEl = document.getElementById("resume-preview");
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - 2 * margin;

    document.body.classList.add("exporting");

    html2canvas(resumeEl, { scale: 2 }).then((canvas) => {
      document.body.classList.remove("exporting");

      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const imgWidth = usableWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      doc.save("resume.pdf");
    });
  }

  downloadBtn.addEventListener("click", downloadPDF);

  addSectionBtn.addEventListener("click", () => {
    const title = promptInput("Section Title:");
    if (title) createSection(title);
  });
  addTitleBtn.addEventListener("click", () => {
    const title = promptInput("Title:");
    const meta = promptInput("Date or Link (optional):");
    if (title) createEntry(title, meta);
  });
  addBulletBtn.addEventListener("click", () => {
    const text = promptInput("Bullet Point:");
    if (text) addBullet(text);
  });
  undoBtn.addEventListener("click", () => {
    if (!actionStack.length) return showToast("Nothing to undo");
    const action = actionStack.pop();
    action();
  });
  updateNameBtn.addEventListener("click", updateName);
  updateContactBtn.addEventListener("click", updateContact);
  downloadBtn.addEventListener("click", downloadPDF);
});

window.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
});
