document.addEventListener("DOMContentLoaded", function () {
  const formsContainer = document.getElementById("forms-container");
  const undoBtn = document.getElementById("undo-btn");
  let activeSection = null;
  const actionStack = [];

  function clearForms() {
    formsContainer.innerHTML = "";
  }

  function makeInput(label, name) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.marginBottom = "10px";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    lbl.style.marginBottom = "4px";

    const inp = document.createElement("input");
    inp.name = name;
    inp.required = true;
    inp.style.padding = "5px";
    inp.style.border = "1px solid #ccc";
    inp.style.borderRadius = "4px";

    wrapper.appendChild(lbl);
    wrapper.appendChild(inp);
    return wrapper;
  }

  function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && section.style.display !== "block") {
      section.style.display = "block";
    }
  }

  function nameForm() {
    const form = document.createElement("form");
    form.appendChild(makeInput("Full Name:", "name"));
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add";
    form.appendChild(btn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameEl = document.getElementById("name");
      const prev = nameEl.textContent;
      nameEl.textContent = form.name.value;
      actionStack.push(() => {
        nameEl.textContent = prev;
      });
      form.reset();
    });

    formsContainer.appendChild(form);
  }

  function contactForm() {
    const form = document.createElement("form");
    form.appendChild(makeInput("Contact Info:", "info"));
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add";
    form.appendChild(btn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const contact = document.getElementById("contact");
      const newInfo = form.info.value.trim();
      const prevText = contact.textContent.trim();
      if (newInfo) {
        contact.textContent =
          prevText && prevText !== "Location | Email | Phone | Website"
            ? prevText + " | " + newInfo
            : newInfo;
        actionStack.push(() => {
          contact.textContent = prevText;
        });
      }
      form.reset();
    });

    formsContainer.appendChild(form);
  }

  function educationForm() {
    const form = document.createElement("form");
    form.appendChild(makeInput("School Name:", "school"));
    form.appendChild(makeInput("Year:", "year"));
    form.appendChild(makeInput("Grade:", "grade"));
    form.appendChild(makeInput("Branch:", "branch"));
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add";
    form.appendChild(btn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const { school, year, grade, branch } = form;
      const entry = document.createElement("div");
      entry.innerHTML = `
          <div>
            <span class='entry-title'>${school.value}</span>
            <span class='entry-dates'>${year.value}</span>
            <div class='entry-subtitle'>${branch.value}</div>
            <div class='entry-details'>${grade.value}</div>
          </div>`;
      const section = document.getElementById("education-content");
      section.appendChild(entry);
      showSection("education-section");
      actionStack.push(() => entry.remove());
      form.reset();
    });

    formsContainer.appendChild(form);
  }

  function experienceForm() {
    const form = document.createElement("form");
    form.appendChild(makeInput("Role & Company:", "role"));
    form.appendChild(makeInput("Location:", "location"));
    form.appendChild(makeInput("Duration:", "duration"));
    form.appendChild(makeInput("Details:", "details"));
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add";
    form.appendChild(btn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const { role, location, duration, details } = form;
      const entry = document.createElement("div");
      entry.innerHTML = `
          <div>
            <span class='entry-title'>${role.value}</span>
            <span class='entry-dates'>${duration.value}</span>
            <div class='entry-subtitle'>${location.value}</div>
            <div class='entry-details'>${details.value}</div>
          </div>`;
      const section = document.getElementById("experience-content");
      section.appendChild(entry);
      showSection("experience-section");
      actionStack.push(() => entry.remove());
      form.reset();
    });

    formsContainer.appendChild(form);
  }

  function listForm(sectionId, fields) {
    const form = document.createElement("form");
    fields.forEach((f) => form.appendChild(makeInput(f + ":", f)));
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add";
    form.appendChild(btn);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const container = document.getElementById(sectionId + "-content");
      let ul = container.querySelector("ul");
      const createdNewList = !ul;
      if (!ul) {
        ul = document.createElement("ul");
        ul.className = sectionId === "technologies" ? "tech-list" : "";
        container.appendChild(ul);
      }
      const li = document.createElement("li");
      if (sectionId === "technologies") {
        li.textContent = form.tech.value;
      } else {
        fields.forEach((f) => {
          li.innerHTML += `${form[f].value} `;
        });
        li.className = "list-item";
      }
      ul.appendChild(li);
      showSection(sectionId + "-section");
      actionStack.push(() => {
        li.remove();
        if (createdNewList) ul.remove();
      });
      form.reset();
    });

    formsContainer.appendChild(form);
  }

  function toggleSection(name, fn) {
    if (activeSection === name) {
      clearForms();
      activeSection = null;
    } else {
      clearForms();
      fn();
      activeSection = name;
    }
  }

  document
    .getElementById("add-name-btn")
    .addEventListener("click", () => toggleSection("name", nameForm));
  document
    .getElementById("add-contact-btn")
    .addEventListener("click", () => toggleSection("contact", contactForm));
  document
    .getElementById("add-education-btn")
    .addEventListener("click", () => toggleSection("education", educationForm));
  document
    .getElementById("add-experience-btn")
    .addEventListener("click", () =>
      toggleSection("experience", experienceForm)
    );
  document
    .getElementById("add-publications-btn")
    .addEventListener("click", () =>
      toggleSection("publications", () =>
        listForm("publications", ["Title", "Authors", "Date"])
      )
    );
  document
    .getElementById("add-projects-btn")
    .addEventListener("click", () =>
      toggleSection("projects", () => listForm("projects", ["Project", "Link"]))
    );
  document
    .getElementById("add-technologies-btn")
    .addEventListener("click", () =>
      toggleSection("technologies", () => listForm("technologies", ["tech"]))
    );

  undoBtn.addEventListener("click", function () {
    if (actionStack.length === 0) {
      alert("Nothing to undo");
      return;
    }
    const undo = actionStack.pop();
    undo();
  });

  // Initially hide all sections except name/contact
  [
    "education-section",
    "experience-section",
    "publications-section",
    "projects-section",
    "technologies-section",
  ].forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.style.display = "none";
  });
});
