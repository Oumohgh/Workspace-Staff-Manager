
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


imageUrlInput.addEventListener("input", (e)=>{
  const url = e.target.value.trim();
  if(url){
    imagePreview.src = url;
    imagePreview.classList.remove("hidden");
    placeholderText.classList.add("hidden");
  } else {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    placeholderText.classList.remove("hidden");
  }
});

const addExpBtn = document.querySelector(".btn-add-experience button") || document.querySelector(".btn-add-experience");
const expContainer = document.querySelector(".form-experience");

if(addExpBtn){
  addExpBtn.addEventListener("click", ()=> {
    const block = document.createElement("div");
    block.className = "mb-3 exp-block border p-3 rounded bg-white/70";
    block.innerHTML = `
      <label class="block text-sm mb-1">Entreprise:</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-company" type="text">
      <label class="block text-sm mb-1">Role:</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-role" type="text">
      <label class="block text-sm mb-1">Date de  entree:</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-role" type="text">
      <label class="block text-sm mb-1">Date de sortie:</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-duration" type="text">
      <div class="text-right"><button type="button" class="remove-exp inline-block px-3 py-1 text-sm bg-red-500 text-white rounded">Supprimer</button></div>
    `;
    expContainer.appendChild(block);
  });
}

/* remove  blocks dial exper */
document.addEventListener("click", (e)=>{
  if(e.target.classList.contains("remove-exp")){
    e.target.closest(".exp-block").remove();
  }
});

/* form submit -> aajouter employe */
staffForm.addEventListener("submit", (ev)=>{
  ev.preventDefault();

  const firstname = document.getElementById("nom-worker").value.trim();
  const lastname  = document.getElementById("prenom-worker").value.trim();
  const email     = document.getElementById("email-worker").value.trim();
  const imageUrl  = document.getElementById("imageUrl").value.trim() || placeholderPhoto();
  const role      = document.getElementById("role-worker").value || "autres";

  const newEmp = {
    id:idcount,// crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    firstname,
    lastname,
    email,
    tele: "", // not present in this form
    photo: imageUrl,
    role,
    experiences: [],
    zone: null
  };

  // collect experiences
  document.querySelectorAll(".exp-block").forEach(b => {
    newEmp.experiences.push({
      company: b.querySelector(".exp-company")?.value || "",
      role: b.querySelector(".exp-role")?.value || "",
      duration: b.querySelector(".exp-duration")?.value || ""
    });
  });

  employees.push(newEmp);
  saveEmployees();


  staffForm.reset();
  document.querySelector(".form-experience").innerHTML = "";
  formAffichageEmploye.classList.add("hidden");
  formAffichageEmploye.classList.remove("flex");
  imagePreview.src = "";
  imagePreview.classList.add("hidden");
  placeholderText.classList.remove("hidden");

  // update stylee
  renderSidebarUnassigned();
  renderRooms();
});


document.addEventListener("click", (e)=>{
  const t = e.target;
  if(t.matches(".preview-trigger") || t.closest(".preview-trigger") || t.classList.contains("btn-edit")){
    
    const id = t.getAttribute("data-id") || t.closest("[data-id]")?.getAttribute("data-id") || t.getAttribute("data-id");
    let emp = employees.find(x => x.id === id);
    if(!emp){
    
      const text = t.textContent?.trim();
      emp = employees.find(x => fullName(x) === text);
    }
    if(emp){
      showModal(emp);
    }
  }

  // 
  if(t.id === "closePreview" || t.id === "closePreview2"){
    document.querySelector(".info-popup").classList.add("hidden");
    document.querySelector(".info-popup").classList.remove("flex");
  }

  
  if(t.classList.contains("assign-btn")){
    const id = t.getAttribute("data-id");
    assignToRoomById(id, currentAssignRoom);
   
    document.querySelector(".section-workers").classList.add("hidden");
  }

  if(t.classList.contains("unassign-btn")){
    const wrapper = t.closest("[data-employee-id]");
    const id = wrapper ? wrapper.getAttribute("data-employee-id") : null;
    if(id){
      const emp = employees.find(x => x.id === id);
      if(emp){
        emp.zone = null;
        saveEmployees();
        renderSidebarUnassigned();
        renderRooms();
      }
    }
  }
});

const mappingBtnToRoom = [
  {cls: "btn-add-conference", room: "conference"},
  {cls: "btn-add-serveurs", room: "serveurs"},
  {cls: "btn-add-securite", room: "securite"},
  {cls: "btn-add-reception", room: "reception"},
  {cls: "btn-add-personnel", room: "personnel"},
  {cls: "btn-add-archives", room: "archives"}
];

mappingBtnToRoom.forEach(m => {
  document.querySelectorAll("."+m.cls).forEach(btn => {
    btn.addEventListener("click", ()=>{
      currentAssignRoom = m.room;
      openAssignModalFor(m.room);
    });
  });
});


const closeShowWorkers = document.getElementById("close-showworkers");
if(closeShowWorkers){
  closeShowWorkers.addEventListener("click", ()=> {
    document.querySelector(".section-workers").classList.add("hidden");
  });
}
