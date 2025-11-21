
const STORAGE_KEY = "employees1";

const ZONE_CAPACITY = {
  conference: 4,
  reception: 4,
  serveurs: 4,
  securite: 4,
  personnel: 4,
  archives: 2
};

const ROOM_IDS = {
  conference: "zone-conference",
  reception: "zone-reception",
  serveurs: "zone-serveurs",
  securite: "zone-securite",
  personnel: "zone-personnel",
  archives: "zone-archives"
};


const roleZones = {
  it: ["serveurs"],
  securite: ["securite"],
  reception: ["reception"],
  manager: ["reception","serveurs","securite","personnel","archives","conference"],
  nettoyage: ["reception","serveurs","securite","personnel","conference"],
  autres: ["reception","serveurs","securite","personnel","conference","archives"]
};


const ROLE_MAP = {
  "receptionniste": "reception",
  "technicien it": "it",
  "technicien": "it",
  "agent de sécurité": "securite",
  "agent de securite": "securite",
  "agent": "securite",
  "manager": "manager",
  "nettoyage": "nettoyage",
  "autre": "autres",
  "autres": "autres"
};

function placeholderPhoto() {
  return "./assets/profile.png";
}

// melange nom
function fullName(emp) {
  return `${emp.firstname || ""} ${emp.lastname || ""}`.trim();
}

// Charger employes mn LocalStorage
function loadEmployees() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// Sauvegarder
function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  //console.log(1);
}
//DD
// Normaliser le rle
function normalizeRoleLabel(raw) {
  if (!raw) return "autres";
  return (raw || "").toLowerCase().trim();
}//maju et minis traiti meme maniere

function getRoleKey(rawLabel) {
  const r = normalizeRoleLabel(rawLabel);
  return ROLE_MAP[r] || r;
}
const validators = {
  firstname: v => /^[A-Za-z À-ÖØ-öø-ÿ'’-]{2,40}$/.test(v.trim()),
  lastname:  v => /^[A-Za-z À-ÖØ-öø-ÿ'’-]{0,40}$/.test(v.trim()),
  email:     v => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone:     v => v.trim() === "" || /^\+?[0-9 ()\-]{6,20}$/.test(v.trim()),
  photo:     v => v.trim() === "" || /^(https?:\/\/.+\.(jpg|jpeg|png|webp|gif))$/i.test(v.trim())
};

let employees = loadEmployees();
let editingId = null;
let currentAssignZone = null;

const unassignedListEl = document.getElementById("unassignedList");
const openAddModalBtn = document.getElementById("openAddModal");
const addModal = document.getElementById("addModal");
const addEmployeeForm = document.getElementById("addEmployeeForm");

const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const photoInput = document.getElementById("photo");
const previewImg = document.getElementById("preview");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const experiencesContainer = document.getElementById("experiences");
const addExpBtn = document.getElementById("addExp");
const clearExpsBtn = document.getElementById("clearExps");

const cancelAddBtn = document.getElementById("cancelAdd");

const assignModal = document.getElementById("assignModal");
const eligibleList = document.getElementById("eligibleList");
const closeAssign = document.getElementById("closeAssign");

const profileModal = document.getElementById("profileModal");
const profileContent = document.getElementById("profileContent");
const closeProfile = document.getElementById("closeProfile");

const errName  = document.getElementById("err-name");
const errPhoto = document.getElementById("err-photo");
const errEmail = document.getElementById("err-email");
const errPhone = document.getElementById("err-phone");

function renderUnassigned() {
  unassignedListEl.innerHTML = "";

  const unassigned = employees.filter(e => !e.zone);
  if (unassigned.length === 0) {
    unassignedListEl.innerHTML = `<li class="text-gray-500 p-2">Aucun employe non affecte</li>`;
    return;
  }

  unassigned.forEach(emp => {
    const li = document.createElement("li");
    li.className = "flex items-center gap-3 p-2 bg-white rounded shadow-sm";

    li.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-cover bg-center"
           style="background-image:url('${emp.photo || placeholderPhoto()}')"></div>

      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm preview-trigger" data-id="${emp.id}">
          ${fullName(emp)}
        </div>
        <div class="text-xs text-gray-500">${emp.role}</div>
      </div>

      <div class="flex gap-1">
        <button class="edit-btn px-2 py-1 text-sm bg-yellow-200 rounded" data-id="${emp.id}">Edit</button>
        <button class="delete-btn px-2 py-1 text-sm bg-red-200 rounded" data-id="${emp.id}">Delete</button>
      </div>
    `;

    unassignedListEl.appendChild(li);
  });
}

function renderZones() {
  Object.keys(ROOM_IDS).forEach(zoneKey => {
    const zoneEl = document.getElementById(ROOM_IDS[zoneKey]);
    if (!zoneEl) return;

    const occupantsEl = zoneEl.querySelector(".zone-occupants");
    occupantsEl.innerHTML = "";

    const occupants = employees.filter(e => e.zone === zoneKey);
    const capacity  = ZONE_CAPACITY[zoneKey] ?? DEFAULT_CAPACITY;

    /* Affichage du compteur */
    const labelEl = zoneEl.querySelector(".zone-label");
    if (labelEl) {
      const labelTxt = labelEl.textContent.split("(")[0].trim();
      labelEl.textContent = `${labelTxt} (${occupants.length}/${capacity})`;
    }

  /* liste de occupants */
    occupants.forEach(emp => {
      const div = document.createElement("div");
      div.className = "flex items-center gap-2 p-2 bg-white/90 rounded shadow-sm";
      div.setAttribute("data-employee-id", emp.id);

      div.innerHTML = `
        <img class="w-10 h-10 rounded-full cursor-pointer preview-trigger"
             src="${emp.photo || placeholderPhoto()}" data-id="${emp.id}">

        <div class="flex-1">
          <div class="text-sm preview-trigger" data-id="${emp.id}">
            ${fullName(emp)}
          </div>
          <div class="text-xs text-gray-500">${emp.role}</div>
        </div>

        <button class="unassign-btn px-2 py-1 text-sm bg-red-100 rounded"
                data-id="${emp.id}">
          X
        </button>
      `;

      occupantsEl.appendChild(div);
    });

    if (occupants.length === 0) {
      occupantsEl.innerHTML = `<div class="text-gray-500 p-2 text-sm">Aucun occupant</div>`;
    }
  });
}

function setError(node, msg) {
  node.textContent = msg || "";
}

function validateField(field, value) {
  const fn = validators[field];
  return fn ? fn(value) : true;
}


//dd///


function createExperienceBlock(data = {}) {
  const div = document.createElement("div");
  div.className = "exp-block border p-2 rounded bg-white/80 flex flex-col gap-2";

  div.innerHTML = `
    <input class="exp-company border p-1 rounded" placeholder="Entreprise" value="${data.company || ""}">
    <input class="exp-role border p-1 rounded"     placeholder="Rôle"       value="${data.role || ""}">
    <input class="exp-duration border p-1 rounded" placeholder="Durée"      value="${data.duration || ""}">
    <button type="button" class="remove-exp px-2 py-1 bg-red-200 rounded self-end">Supprimer</button>
  `;

  return div;
}

openAddModalBtn.addEventListener("click", () => openAddModal());

function openAddModal(emp = null) {

  editingId = emp ? emp.id : null;

  /* Reinitialisation */
  addEmployeeForm.reset();
  experiencesContainer.innerHTML = "";
  previewImg.classList.add("hidden");
  previewImg.src = "";

  /* Si mode edition : remplir les doneees */
  if (emp) {
    nameInput.value  = `${emp.firstname} ${emp.lastname}`.trim();
    roleInput.value  = emp.role;
    photoInput.value = emp.photo;
    emailInput.value = emp.email || "";
    phoneInput.value = emp.tele || "";

    if (emp.photo) {
      previewImg.src = emp.photo;
      previewImg.classList.remove("hidden");
    }

    if (emp.experiences) {
      emp.experiences.forEach(x =>
        experiencesContainer.appendChild(createExperienceBlock(x))
      );
    }
  }

  addModal.classList.remove("hidden");
}

/* Annuler */
cancelAddBtn.addEventListener("click", () => {
  addModal.classList.add("hidden");
  editingId = null;
});

/* Ajouter une experience */
addExpBtn.addEventListener("click", () => {
  experiencesContainer.appendChild(createExperienceBlock());
});

/* Vider expr */
clearExpsBtn.addEventListener("click", () => {
  experiencesContainer.innerHTML = "";
});

/* Supprimer une expe */
experiencesContainer.addEventListener("click", e => {
  if (e.target.classList.contains("remove-exp")) {
    e.target.closest(".exp-block")?.remove();
  }
});

/* Prev image */
photoInput.addEventListener("input", e => {
  const url = e.target.value.trim();
  previewImg.src = url || "";
  previewImg.classList.toggle("hidden", url === "");
});



[nameInput, emailInput, phoneInput, photoInput].forEach(input => {
  if (!input) return;

  input.addEventListener("blur", e => {
    const id = e.target.id;
    const value = e.target.value;

    switch (id) {
      case "name":
        setError(errName,
          validateField("firstname", value) ? "" :
          "Nom invalide (min. 2 lettres)"
        );
        break;

      case "email":
        setError(errEmail,
          validateField("email", value) ? "" :
          "Email invalide"
        );
        break;

      case "phone":
        setError(errPhone,
          validateField("phone", value) ? "" :
          "Numéro invalide"
        );
        break;

      case "photo":
        setError(errPhoto,
          validateField("photo", value) ? "" :
          "URL image invalide"
        );
        break;
    }
  });
});


addEmployeeForm.addEventListener("submit", e => {
  e.preventDefault();

  const name  = nameInput.value.trim();
  const role  = roleInput.value.trim();
  const photo = photoInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  /* Validation */
  const valide =
    validateField("firstname", name) &&
    validateField("email", email) &&
    validateField("phone", phone) &&
    validateField("photo", photo);

  if (!valide) return;

  
  const parts = name.split(" ");
  const firstname = parts[0];
  const lastname = parts.slice(1).join(" ");

  /* Recup expr */
  const experiences = [];
  experiencesContainer.querySelectorAll(".exp-block").forEach(b => {
    experiences.push({
      company: b.querySelector(".exp-company").value.trim(),
      role:    b.querySelector(".exp-role").value.trim(),
      duration:b.querySelector(".exp-duration").value.trim()
    });
  });

  if (editingId) {
    /* mode edi */
    const emp = employees.find(x => x.id === editingId);

    emp.firstname   = firstname;
    emp.lastname    = lastname;
    emp.role        = role;
    emp.photo       = photo || placeholderPhoto();
    emp.email       = email;
    emp.tele        = phone;
    emp.experiences = experiences;

  } else {
    /* Nv*/
    employees.push({
      id: crypto.randomUUID(),
      firstname,
      lastname,
      role,
      photo: photo || placeholderPhoto(),
      email,
      tele: phone,
      experiences,
      zone: null
    });
  }

  saveEmployees();
  addModal.classList.add("hidden");
  editingId = null;

  renderAll();
});

function openAssignModal(zoneKey) {
  currentAssignZone = zoneKey;
  eligibleList.innerHTML = "";

  const capacity = ZONE_CAPACITY[zoneKey] ?? DEFAULT_CAPACITY;
  const count    = employees.filter(e => e.zone === zoneKey).length;

  if (count >= capacity) {
    eligibleList.innerHTML = `
      <div class="p-3 text-red-600">
        Zone pleine (${count}/${capacity})
      </div>`;
    assignModal.classList.remove("hidden");
    return;
  }

  /* Employés non affectés et autorisés */
  const list = employees.filter(e =>
    !e.zone && isAdmisForRoom(e.role, zoneKey)
  );

  if (list.length === 0) {
    eligibleList.innerHTML = `<div class="p-3 text-gray-600">Aucun employé éligible</div>`;
  }

  list.forEach(emp => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between p-2 border-b";

    row.innerHTML = `
      <div class="flex items-center gap-2">
        <img class="w-10 h-10 rounded-full"
             src="${emp.photo || placeholderPhoto()}">
        <div>
          <div class="text-sm">${fullName(emp)}</div>
          <div class="text-xs text-gray-500">${emp.role}</div>
        </div>
      </div>
      <button class="assign-now px-3 py-1 bg-green-200 rounded" data-id="${emp.id}">
        Affecter
      </button>
    `;

    eligibleList.appendChild(row);
  });

  assignModal.classList.remove("hidden");
}

closeAssign.addEventListener("click", () => {
  assignModal.classList.add("hidden");
  currentAssignZone = null;
});

eligibleList.addEventListener("click", e => {
  const btn = e.target.closest(".assign-now");
  if (!btn) return;

  const id = btn.dataset.id;
  const emp = employees.find(x => x.id === id);
  if (!emp) return;

  const capacity = ZONE_CAPACITY[currentAssignZone];
  const count    = employees.filter(e => e.zone === currentAssignZone).length;

  if (count >= capacity) {
    alert("Capacité atteinte dans cette zone.");
    return;
  }

  if (!isAdmisForRoom(emp.role, currentAssignZone)) {
    alert("Ce rôle n'est pas autorisé dans cette zone.");
    return;
  }

  emp.zone = currentAssignZone;

  saveEmployees();
  assignModal.classList.add("hidden");
  renderAll();
});

/* Vérifier rôle autorisé */
function isAdmisForRoom(roleString, roomKey) {
  const rKey = getRoleKey(roleString);
  const allowed = roleZones[rKey];
  return allowed ? allowed.includes(roomKey) : false;
}

function showProfile(emp) {
  profileContent.innerHTML = `
    <div class="flex flex-col gap-3">

      <div class="flex justify-end">
        <button id="profileCloseBtn" class="text-lg">×</button>
      </div>

      <div class="flex items-center gap-3">
        <img src="${emp.photo || placeholderPhoto()}" class="w-24 h-24 rounded-full">
        <div>
          <h3 class="font-bold">${fullName(emp)}</h3>
          <div class="text-sm text-gray-500">${emp.role}</div>
          <div class="text-sm">${emp.email || ""}</div>
          <div class="text-sm">${emp.tele || ""}</div>
          <div class="text-sm text-gray-400">Zone : ${emp.zone || "Non affecté"}</div>
        </div>
      </div>

      <h4 class="font-semibold mt-3">Expériences</h4>
      <div class="p-2 border rounded bg-gray-50">
        ${
          emp.experiences?.length
            ? emp.experiences.map(x => `
                <div class="text-sm my-1">
                  <strong>${x.company || ""}</strong> — ${x.role || ""}<br>
                  <small>${x.duration || ""}</small>
                </div>
              `).join("")
            : "<div class='text-xs text-gray-500'>Aucune expérience</div>"
        }
      </div>

      <div class="flex justify-end gap-2 mt-3">
        <button id="profileEdit" class="px-3 py-1 bg-yellow-200 rounded" data-id="${emp.id}">Modifier</button>
        <button id="profileDelete" class="px-3 py-1 bg-red-200 rounded" data-id="${emp.id}">Supprimer</button>
      </div>

    </div>
  `;

  profileModal.classList.remove("hidden");
}
/* Actions du profil */
profileContent.addEventListener("click", e => {
  const t = e.target;

  if (t.id === "profileCloseBtn") {
    profileModal.classList.add("hidden");
    return;
  }

  if (t.id === "profileEdit") {
    const emp = employees.find(x => x.id === t.dataset.id);
    profileModal.classList.add("hidden");
    openAddModal(emp);
    return;
  }

  if (t.id === "profileDelete") {
    const id = t.dataset.id;
    if (!confirm("Supprimer cet employé ?")) return;

    employees = employees.filter(x => x.id !== id);
    saveEmployees();
    profileModal.classList.add("hidden");
    renderAll();
  }
});

closeProfile.addEventListener("click", () => profileModal.classList.add("hidden"));

document.addEventListener("click", e => {
  const t = e.target;

  /* Ouvrir assignation depuis le bouton + */
  if (t.classList.contains("zone-plus")) {
    openAssignModal(t.dataset.zone);
  }

  /* Apercu profil */
  if (t.classList.contains("preview-trigger")) {
    const emp = employees.find(x => x.id === t.dataset.id);
    if (emp) showProfile(emp);
  }

  /* Modifier un employe */
  if (t.classList.contains("edit-btn")) {
    const emp = employees.find(x => x.id === t.dataset.id);
    openAddModal(emp);
  }

  /* Supprimer de la liste non affecte */
  if (t.classList.contains("delete-btn")) {
    if (!confirm("Supprimer cet employé ?")) return;
    employees = employees.filter(x => x.id !== t.dataset.id);
    saveEmployees();
    renderAll();
  }

  /* desaffecter depuis zone */
  if (t.classList.contains("unassign-btn")) {
    const emp = employees.find(x => x.id === t.dataset.id);
    emp.zone = null;
    saveEmployees();
    renderAll();
  }
});

function renderAll() {
  renderUnassigned();
  renderZones();
}

(function init() {
  renderAll();
})();