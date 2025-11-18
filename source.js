loadDataEmploye();

function loadDataEmploye(){

    let employerList = getDataEmployersFromLocalStorageIfExist("employers");

    renderCardsEmployers(employerList);
}

function getDataEmployesFromLocalStorageIfExist(keyData){
    
    let AncienData = localStorage.getItem(keyData); 

    if(AncienData == null || AncienData == undefined)
        loadDataJson("./data.json");

    oldData = localStorage.getItem(keyData);

    return JSON.parse(AncienData);
}