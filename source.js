

const ROOM_IDS = {
  reception: "salle-reseption",
  serveurs: "salle-serveurs",
  securite: "salle-securite",
  personnel: "salle-personnel",
  archives: "salle-archives",
  conference: "salle-conference"
};

// 
const ROLE_RULES = { //rroms m allowed
  it: ["serveurs"],
  securite: ["securite"],
  reseption: ["reception"],
  manager: ["reception","serveurs","securite","personnel","archives","conference"],
  nettoyage: ["reception","serveurs","securite","personnel","conference"], // not archives
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
  return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
}



/* Sidebar*/
function renderSidebarUnassigned(){
  const container = document.querySelector(".place-workers");
  if(!container) return;
  container.innerHTML = ""; 

  const unassigned = employees.filter(e => !e.zone);

  if(unassigned.length === 0){
    container.innerHTML = `<div class="p-4 text-center text-gray-500">No unassigned workers</div>`;
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
