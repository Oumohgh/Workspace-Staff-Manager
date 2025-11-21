
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
//dd///

    const ajouterDiv = document.createElement("div");
    ajouterDiv.className = "worker-card flex flex-col items-center gap-1 m-2 text-center";
    ajouterDiv.setAttribute("data-employee-id", emp.id);
    ajouterDiv.innerHTML = `
      <img src="${emp.photo || placeholderPhoto()}" alt="${fullName(emp)}"
           class="w-12 h-12 rounded-full object-cover cursor-pointer preview-trigger" data-id="${emp.id}">
      <span class="text-xs">${fullName(emp)}</span>
      <button class="unassign-btn mt-1 text-xs text-red-600">X</button>
    `;
    
    roomEl.appendChild(ajouterDiv);
  });
}
/* affiche modal mn preview */
function showModal(emp){
  const modal = document.querySelector(".info-popup");
  if(!modal) return;
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-4 w-80">
      <div class="flex justify-end"><button id="closePreview" class="text-xl">×</button></div>
      <div class="flex flex-col items-center gap-3">
        <img src="${emp.photo || placeholderPhoto()}" class="w-24 h-24 rounded-full object-cover">
        <h3 class="font-bold">${fullName(emp)}</h3>
        <div class="text-sm text-gray-600">${emp.role}</div>
        <div class="text-sm">${emp.email || ""}</div>
        <div class="text-sm">${emp.tele || ""}</div>
      </div>
      <hr class="my-3">
      <div>
        <h4 class="text-sm font-semibold mb-2">Experiences</h4>
        ${ (emp.experiences || []).map(x=>`<div class="mb-2 text-sm"><strong>${x.company||""}</strong> — ${x.role||""} <br><small>${x.duration||""}</small></div>`).join("") || "<div class='text-xs text-gray-500'>No experiences</div>"}
      </div>
      <div class="mt-3 flex gap-2">
        <button id="closePreview2" class="flex-1 py-2 bg-indigo-600 text-black rounded">Fermer</button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

/*  show modal dial employes f kola room */
function openAssignModalFor(roomKey){
  currentAssignRoom = roomKey;
  const modal = document.querySelector(".section-workers");
  const container = modal.querySelector(".workers");
  container.innerHTML = "";

  // find wach emp egligable l hadek room
  const admis= employees.filter(e => !e.zone && isAdmisForRoom(e.role, roomKey));

  if(admis.length === 0){
    container.innerHTML = `<div class="p-4 text-sm text-gray-600">No admis unassigned workers</div>`;
  } else {
    admis.forEach(emp => {
      const div = document.createElement("div");
      div.className = "p-3 border-b flex items-center justify-between";
      div.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-cover" style="background-image:url('${emp.photo || placeholderPhoto()}')"></div>
          <div>
            <div class="text-sm font-medium">${fullName(emp)}</div>
            <div class="text-xs text-black-500">${emp.role}</div>
          </div>
        </div>
        <div>
          <button class="assign-btn px-3 py-1 bg-green-600 text-white rounded text-sm" data-id="${emp.id}">Assign</button>
        </div>
      `;
      container.appendChild(div);
    });
  }

  modal.classList.remove("hidden");
}

function isAdmisForRoom(role, roomKey){
  // normalise role  bach matchi rols
  const r = (role || "").toLowerCase();
  const ruleKey = {
    "techniciens it": "it",
    "it": "it",
    "technicien": "it",
    "agents de securite": "securite",
    "agent": "securite",
    "securite": "securite",
    "receptionnistes": "reception",
    "receptionniste": "reception",
    "reception": "reception",
    "manager": "manager",
    "nettoyage": "nettoyage",
    "autres": "autres",
    "autre": "autres"
  }[r] || r;

  const allowed = roleZones[ruleKey];
  if(!allowed) return false;
  return allowed.includes(roomKey);
}

/* button aded 3la work form*/
const addNewWorkerBtn = document.getElementById("add-new-worker");
const formAffichageEmploye = document.querySelector(".form-worker");
const staffForm = document.getElementById("staffForm");
const imageUrlInput = document.getElementById("imageUrl");
const imagePreview = document.getElementById("imagePreview");
const placeholderText = document.getElementById("placeholderText");

if(addNewWorkerBtn){
  addNewWorkerBtn.addEventListener("click", ()=> {
    formAffichageEmploye.classList.remove("hidden");
    formAffichageEmploye.classList.add("flex");
  });
}


staffForm.addEventListener("reset", ()=> {
  formAffichageEmploye.classList.add("hidden");
  formAffichageEmploye.classList.remove("flex");
//cleari img
  imagePreview.src = "";
  imagePreview.classList.add("hidden");
  placeholderText.classList.remove("hidden");
 // clear exp
  document.querySelector(".form-experience").innerHTML = "";
});


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

/* Assign b id*/
function assignToRoomById(empId, roomKey){
  const emp = employees.find(x => x.id === empId);
  if(!emp) return;

  // filt
  if(!isAdmisForRoom(emp.role, roomKey)){
    alert("This employee role is not allowed in this room.");
    return;
  }
