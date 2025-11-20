let dataEmployer = [];
let add_btn = document.getElementById("btn-add");


document.addEventListener("DOMContentLoaded", () => {

    fetch("./data.json")
        .then(res => res.json())
        .then(data => {
            dataEmployer = JSON.parse(localStorage.getItem("employer")) || data;
            renderDetails();
        });

    // Prévisualisation photo
    const input = document.getElementById("file");
    const photoModal = document.getElementById("photoModal");
    input.addEventListener("change", () => {
        photoModal.src = URL.createObjectURL(input.files[0]);
    });

    // Ouvrir Modal d'ajout
    add_btn.addEventListener('click', () => {
        modal.style.display = 'flex';
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    });

    // Ajouter experiences dynamiques
    const containerExp = document.getElementById("experiencesContainer");
    const addExpBtn = document.getElementById("addExperienceBtn");
    addExpBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.classList.add("experience");
        div.innerHTML = `
            <input type="text" name="poste[]" placeholder="Poste">
            <input type="text" name="duree[]" placeholder="Durée">
            <input type="text" name="description[]" placeholder="Description">
            <button type="button" class="removeExperience">Supprimer</button>
        `;
        containerExp.appendChild(div);
    });
    containerExp.addEventListener("click", e => {
        if (e.target.classList.contains("removeExperience")) e.target.parentElement.remove();
    });

    document.getElementById("addForm").addEventListener("submit", ajouterEmployer);
});

// === Rendu des cartes === //
function renderDetails() {
    const serviceLists = document.getElementById("listCard");
    serviceLists.innerHTML = "";

    dataEmployer.forEach((e, index) => {
        const div = document.createElement("div");
        div.classList.add("profil-card");
        div.dataset.index = index;
        div.dataset.assigned = "no"; // tracking

        div.innerHTML = `
            <div class="img-profil">
                <img src="${e.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
            </div>
            <div class="role">
                <p>${e.firstname}</p>
                <div class="role">${e.role}</div>
            </div>
            <button class="btn-remove">Remove</button>
        `;
        serviceLists.appendChild(div);
    });

    cardDetails();

}

//  function card details emoyer  //
function cardDetails() {
    const cards = document.querySelectorAll(".profil-card");
    const previewModal = document.getElementById("modalPreview");
    const closeBtn = document.getElementById("closePreview");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const index = card.dataset.index;
            const emp = dataEmployer[index];
            document.getElementById("previewPhoto").src = emp.photo;
            document.getElementById("previewName").innerText = emp.firstname;
            document.getElementById("previewRole").innerText = emp.role;
            document.getElementById("previewEmail").innerText = emp.email;
            document.getElementById("previewTele").innerText = emp.tele;
            previewModal.style.display = "flex";
        });
    });

    closeBtn.addEventListener("click", () => previewModal.style.display = "none");
    previewModal.addEventListener("click", e => { 
        if (e.target === previewModal) previewModal.style.display = "none"; 
    });
}