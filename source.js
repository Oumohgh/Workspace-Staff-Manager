loadDataEmplyer();

function loadDataEmplyer() {
      let employerList = getDataEmployersFromLocalStorageIfExist("employers");
      console.log(employerList);
      renderCardsEmplyers(employerList);
}

function getDataEmployersFromLocalStorageIfExist(keyData) {
      let oldData = localStorage.getItem(keyData); 
      if (oldData == null || oldData == undefined)
      loadDataJson("../data/employe.json");
      oldData = localStorage.getItem(keyData);
      return JSON.parse(oldData);
}

async function loadDataJson(file) {
      let responce = await fetch(file);
      let newData = await responce.json();
      let employerList = [];
      if (newData.length == undefined) {
      
      employerList.push(newData);
      } else {
     
      newData.forEach((employer) => {
            employerList.push(employer);
      });
      }
      saveDataEmployerToLocalStorage("employers", employerList);
}

function saveDataEmployerToLocalStorage(keyData, dataList) {
      localStorage.setItem(keyData, JSON.stringify(dataList));
}

// renderCardsEmplyers(employes);
function renderCardsEmplyers(employerList) {
      document.getElementById("list-employe").innerHTML =
      renderListEmployers(employerList);
}

function renderListEmployers(employes) {
      cardListEmploye = "";
      employes.map((employe) => {
      cardListEmploye += renderCard(employe);
      });
      return cardListEmploye;
}

function renderCard(employe) {
      return `
            <div class="card">
            ${renderDetailCard(employe)}
            </div>
      `;
}

function renderDetailCard(employe) {
return `
      <div class="card-body">
            <div class="profile">
                  <img src=${employe.photo} alt="image profile">
            </div>
            <div class="content-profile">
                  <h4>${employe.nom}</h4>
                  <span>${employe.role}</span>
            </div>
            <div class="icons">
                  <i class="fa-solid fa-pen"></i>
                  <i class="fa-solid fa-trash"></i>
            </div>
      </div>
      `;
}

