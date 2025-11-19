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


function displayUnassignedEmployeesList(assignedEmployee) {
    return`    
        <div class="d-flex gap-5 g-5 assignedEmployeesCheckbox">
            <input type="checkbox" class="checkbox" name="${assignedEmployee.name}" room="${currentRoomName}">${assignedEmployee.name}
        </div>
    `
}