loadData();


function loadData() {
    let workerList = getDataFromLocalStorageIfExist("workers");

    renderCards(workerList);
}


function getDataFromLocalStorageIfExist(keyName) {
    let oldData = localStorage.getItem(keyName);

    if (oldData == null) {
        loadJson("workers.json"); // JSON file like apprenant.json
    }

    oldData = localStorage.getItem(keyName);

    return JSON.parse(oldData);
}


async function loadJson(file) {

    let response = await fetch(file);
    let data = await response.json();

    let workerList = [];

    if (data.length == undefined) {
        workerList.push(data);
    } else {
        data.forEach(worker => workerList.push(worker));
    }

    saveToLocalStorage("workers", workerList);
}


function saveToLocalStorage(keyName, dataList) {
    localStorage.setItem(keyName, JSON.stringify(dataList));
}


function renderCards(workerList) {
    document.getElementById("cards").innerHTML = renderListView(workerList);
}

function renderListView(workerList) {
    let cardList = "";
    workerList.forEach(worker => {
        cardList += renderCard(worker);
    });
    return cardList;
}

function renderCard(worker) {
    return `
        <div class="card border border-primary mb-3">
            <div class="card-body row">

                ${renderDetails(worker)}

            </div>
        </div>`;
}

function renderDetails(worker) {
    return `
        <div class="col-3">
            <img src="${worker.photo}" class="img-thumbnail" alt="photo">
        </div>

        <div class="col-9">
            <h5>${worker.name}</h5>
            <p>${worker.role}</p>
            <p>${worker.email}</p>

            <button email="${worker.email}" class="btn btn-primary w-100 mb-2 edit" 
                    data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>

            <button email="${worker.email}" class="btn btn-danger w-100 delete">Delete</button>
        </div>
    `;
}

document.forms["addWorkerForm"].addEventListener("submit", event => {
    event.preventDefault();

    let form = event.target;

    let worker = {
        name: form.name.value,
        role: form.role.value,
        email: form.email.value,
        phone: form.phone.value,
        photo: form.photo.value,
        experiences: []
    };

    for (let i = 0; i < form.expName.length; i++) {
        worker.experiences.push({
            name: form.expName[i].value,
            duration: form.expDuration[i].value
        });
    }

    addWorkerToLocalStorage(worker);
});

function addWorkerToLocalStorage(worker) {
    let workerList = getDataFromLocalStorageIfExist("workers");

    workerList.push(worker);

    saveToLocalStorage("workers", workerList);
}


document.addEventListener("click", event => {
    if (event.target.classList.contains("edit")) {
        let email = event.target.getAttribute("email");
        loadDataToModalEdit(email);
    }
});

function loadDataToModalEdit(email) {
    let workerList = getDataFromLocalStorageIfExist("workers");

    let worker = workerList.find(w => w.email == email);

    let form = document.forms["editWorkerForm"];

    form.name.value = worker.name;
    form.role.value = worker.role;
    form.email.value = worker.email;
}


document.forms["editWorkerForm"].addEventListener("submit", event => {
    event.preventDefault();

    let form = event.target;

    let workerList = getDataFromLocalStorageIfExist("workers");

    let worker = workerList.find(w => w.email == form.email.value);

    worker.name = form.name.value;
    worker.role = form.role.value;

    for (let i = 0; i < workerList.length; i++) {
        if (workerList[i].email == form.email.value) {
            workerList[i] = worker;
        }
    }

    saveToLocalStorage("workers", workerList);
});
