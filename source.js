
const ROOM_IDS = {
  reception: "salle-reception",
  serveurs: "salle-serveurs",
  securite: "salle-securite",
  personnel: "salle-personnel",
  archives: "salle-archives",
  conference: "salle-conference"
};

 
const ROLE_RULES = { //rroms m allowed
  it: ["serveurs"],
  securite: ["securite"],
  reception: ["reception"],
  manager: ["reception","serveurs","securite","personnel","archives","conference"],
  nettoyage: ["reception","serveurs","securite","personnel","conference"], // noot allowed to archive
  autres: ["reception","serveurs","securite","personnel","conference","archives"]
};

const STORAGE_KEY = "employees";


let employees = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentAssignRoom = null; 

/* telecharger employes mn local storage */
function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

function fullName(obj){
  return `${obj.firstname || ""} ${obj.lastname || ""}`.trim();
}

function placeholderPhoto(){
  return "./assets/profile.png";
}



/* Sidebar*/
function renderSidebarUnassigned(){
  const container = document.querySelector(".place-workers");
  if(!container) return;
  container.innerHTML = ""; 

  const unassigned = employees.filter(e => !e.zone);

  if(unassigned.length === 0){
    container.innerHTML = `<div class="p-4 text-center text-gray-500">No unassigned Employees</div>`;
    return;
  }

  unassigned.forEach(emp => {
    const el = document.createElement("div");
    el.className = "profil-card mb-3 flex items-center gap-3 p-2 bg-white/80 rounded shadow";
    el.innerHTML = `
      <div class="img-profil w-12 h-12 rounded-full bg-cover bg-center" style="background-image:url('${emp.photo || placeholderPhoto()}')"></div>
      <div class="flex-1">
        <p class="font-semibold text-sm preview-trigger" data-id="${emp.id}">${fullName(emp)}</p>
        <div class="text-xs text-gray-500">${emp.role}</div>
      </div>
      <button class="btn-edit ml-2 px-2 py-1 text-xs bg-indigo-600 text-white rounded" data-id="${emp.id}">Preview</button>
    `;
    container.appendChild(el);
  });
}
/* Render emp
   Display  img +smia*/
function renderRooms(){
  // clear room children except the + button
  Object.values(ROOM_IDS).forEach(roomId => {
    const roomEl = document.getElementById(roomId);
    if(!roomEl) return;
    // Supprime les cartes de emp li kaynen mais garder les boutons
    
    Array.from(roomEl.querySelectorAll("[data-employee-id]")).forEach(n=>n.remove());
  });

  // place employes f rooms
  employees.filter(e => e.zone).forEach(emp => {
    const roomKey = emp.zone;
    const roomId = ROOM_IDS[roomKey];
    const roomEl = document.getElementById(roomId);
    if(!roomEl) return;

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
        <button id="closePreview2" class="flex-1 py-2 bg-indigo-600 text-white rounded">Close</button>
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
            <div class="text-xs text-gray-500">${emp.role}</div>
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

  const allowed = ROLE_RULES[ruleKey];
  if(!allowed) return false;
  return allowed.includes(roomKey);
}

/* button jded 3la work form*/
const addNewWorkerBtn = document.getElementById("add-new-worker");
const formOverlay = document.querySelector(".form-worker");
const staffForm = document.getElementById("staffForm");
const imageUrlInput = document.getElementById("imageUrl");
const imagePreview = document.getElementById("imagePreview");
const placeholderText = document.getElementById("placeholderText");

if(addNewWorkerBtn){
  addNewWorkerBtn.addEventListener("click", ()=> {
    formOverlay.classList.remove("hidden");
    formOverlay.classList.add("flex");
  });
}


staffForm.addEventListener("reset", ()=> {
  formOverlay.classList.add("hidden");
  formOverlay.classList.remove("flex");
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
      <label class="block text-sm mb-1">Entreprise</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-company" type="text">
      <label class="block text-sm mb-1">Role</label>
      <input class="w-full px-3 py-2 border rounded mb-2 exp-role" type="text">
      <label class="block text-sm mb-1">Durée</label>
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
    id:// crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
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
  formOverlay.classList.add("hidden");
  formOverlay.classList.remove("flex");
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

  emp.zone = roomKey;
  saveEmployees();
  renderSidebarUnassigned();
  renderRooms();
}


document.querySelectorAll(".section-workers, .info-popup").forEach(el=>{
  el.addEventListener("click", (e)=>{
    if(e.target === el){
      el.classList.add("hidden");
    }
  });
});

/*ini style */
(function init(){
  renderSidebarUnassigned();
  renderRooms();
})();
