/* ==========================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   Fichier : js/elevage.js
========================================== */


/* ==========================================
   INITIALISATION DES DONNÉES
========================================== */

function initialiserElevage() {

    if (!localStorage.getItem("animaux")) {
        localStorage.setItem("animaux", JSON.stringify([]));
    }

    if (!localStorage.getItem("productionsElevage")) {
        localStorage.setItem("productionsElevage", JSON.stringify([]));
    }

    if (!localStorage.getItem("santeElevage")) {
        localStorage.setItem("santeElevage", JSON.stringify([]));
    }

}

initialiserElevage();


/* ==========================================
   FONCTIONS UTILITAIRES
========================================== */

function genererId(prefix = "ID") {

    return prefix +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 1000);

}


function obtenirAnimaux() {

    return JSON.parse(
        localStorage.getItem("animaux")
    ) || [];

}


function sauvegarderAnimaux(animaux) {

    localStorage.setItem(
        "animaux",
        JSON.stringify(animaux)
    );

}


function obtenirProductions() {

    return JSON.parse(
        localStorage.getItem("productionsElevage")
    ) || [];

}


function sauvegarderProductions(productions) {

    localStorage.setItem(
        "productionsElevage",
        JSON.stringify(productions)
    );

}


function obtenirSante() {

    return JSON.parse(
        localStorage.getItem("santeElevage")
    ) || [];

}


function sauvegarderSante(sante) {

    localStorage.setItem(
        "santeElevage",
        JSON.stringify(sante)
    );

}


/* ==========================================
   MODULE ANIMAUX
========================================== */

function ajouterAnimal(event) {

    if (event) {
        event.preventDefault();
    }

    const type =
        document.getElementById("typeAnimal")?.value;

    const race =
        document.getElementById("raceAnimal")?.value;

    const quantite =
        parseInt(
            document.getElementById("quantiteAnimal")?.value
        );

    const date =
        document.getElementById("dateAnimal")?.value;

    const statut =
        document.getElementById("statutAnimal")?.value;

    if (!type || !quantite || quantite <= 0) {

        alert("Veuillez remplir correctement les informations.");

        return;
    }


    const animaux = obtenirAnimaux();


    animaux.push({

        id: genererId("ANI"),

        type: type,

        race: race || "Non précisée",

        quantite: quantite,

        date: date || new Date().toISOString().split("T")[0],

        statut: statut || "Actif",

        utilisateur:
            localStorage.getItem("utilisateur") ||
            "Administrateur"

    });


    sauvegarderAnimaux(animaux);


    alert("Animaux ajoutés avec succès.");

    window.location.reload();

}



/* ==========================================
   AFFICHER LES ANIMAUX
========================================== */

function chargerAnimaux() {

    const tableau =
        document.getElementById("listeAnimaux");

    if (!tableau) {
        return;
    }


    const animaux = obtenirAnimaux();


    tableau.innerHTML = "";


    if (animaux.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center text-muted">

                    Aucun animal enregistré.

                </td>

            </tr>

        `;

        return;
    }


    animaux.forEach(animal => {

        let badge = "success";


        if (
            animal.statut === "Malade"
        ) {

            badge = "danger";

        }


        if (
            animal.statut === "Vendu"
        ) {

            badge = "secondary";

        }


        tableau.innerHTML += `

            <tr>

                <td>
                    ${animal.id}
                </td>

                <td>
                    ${animal.type}
                </td>

                <td>
                    ${animal.race}
                </td>

                <td>
                    ${animal.quantite}
                </td>

                <td>
                    ${animal.date}
                </td>

                <td>

                    <span class="badge bg-${badge}">

                        ${animal.statut}

                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerAnimal('${animal.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}



/* ==========================================
   SUPPRIMER UN ANIMAL
========================================== */

function supprimerAnimal(id) {

    if (
        !confirm(
            "Voulez-vous vraiment supprimer cet enregistrement ?"
        )
    ) {
        return;
    }


    let animaux = obtenirAnimaux();


    animaux =
        animaux.filter(
            animal => animal.id !== id
        );


    sauvegarderAnimaux(animaux);


    chargerAnimaux();

}



/* ==========================================
   PRODUCTION
========================================== */

function ajouterProduction(event) {

    if (event) {
        event.preventDefault();
    }


    const animal =
        document.getElementById("animalProduction")?.value;

    const type =
        document.getElementById("typeProduction")?.value;

    const quantite =
        parseFloat(
            document.getElementById("quantiteProduction")?.value
        );

    const unite =
        document.getElementById("uniteProduction")?.value;

    const date =
        document.getElementById("dateProduction")?.value;


    if (!animal || !type || !quantite || quantite <= 0) {

        alert("Veuillez remplir correctement les informations.");

        return;
    }


    const productions =
        obtenirProductions();


    productions.push({

        id: genererId("PROD"),

        animal: animal,

        type: type,

        quantite: quantite,

        unite: unite || "Unité",

        date:
            date ||
            new Date()
                .toISOString()
                .split("T")[0],

        utilisateur:
            localStorage.getItem("utilisateur") ||
            "Administrateur"

    });


    sauvegarderProductions(productions);


    alert("Production enregistrée avec succès.");

    window.location.reload();

}



/* ==========================================
   CHARGER LA PRODUCTION
========================================== */

function chargerProductions() {

    const tableau =
        document.getElementById("listeProductions");

    if (!tableau) {
        return;
    }


    const productions =
        obtenirProductions();


    tableau.innerHTML = "";


    if (productions.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center text-muted">

                    Aucune production enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    productions
        .slice()
        .reverse()
        .forEach(production => {

            tableau.innerHTML += `

                <tr>

                    <td>

                        ${production.date}

                    </td>

                    <td>

                        ${production.animal}

                    </td>

                    <td>

                        ${production.type}

                    </td>

                    <td>

                        ${production.quantite}

                    </td>

                    <td>

                        ${production.unite}

                    </td>

                    <td>

                        ${production.utilisateur}

                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-danger"
                            onclick="supprimerProduction('${production.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        });

}



/* ==========================================
   SUPPRIMER PRODUCTION
========================================== */

function supprimerProduction(id) {

    if (
        !confirm(
            "Supprimer cette production ?"
        )
    ) {
        return;
    }


    let productions =
        obtenirProductions();


    productions =
        productions.filter(
            production =>
                production.id !== id
        );


    sauvegarderProductions(productions);


    chargerProductions();

}



/* ==========================================
   SANTÉ DES ANIMAUX
========================================== */

function ajouterSante(event) {

    if (event) {
        event.preventDefault();
    }


    const animal =
        document.getElementById("animalSante")?.value;

    const type =
        document.getElementById("typeSoin")?.value;

    const description =
        document.getElementById("descriptionSante")?.value;

    const traitement =
        document.getElementById("traitementSante")?.value;

    const quantite =
        parseInt(
            document.getElementById("quantiteSante")?.value
        ) || 0;

    const date =
        document.getElementById("dateSante")?.value;


    if (!animal || !type) {

        alert(
            "Veuillez sélectionner l'animal et le type d'intervention."
        );

        return;
    }


    const sante =
        obtenirSante();


    sante.push({

        id: genererId("SANT"),

        animal: animal,

        type: type,

        description:
            description ||
            "Aucune description",

        traitement:
            traitement ||
            "Aucun traitement",

        quantite: quantite,

        date:
            date ||
            new Date()
                .toISOString()
                .split("T")[0],

        utilisateur:
            localStorage.getItem("utilisateur") ||
            "Administrateur"

    });


    sauvegarderSante(sante);


    alert(
        "Intervention sanitaire enregistrée avec succès."
    );


    window.location.reload();

}



/* ==========================================
   CHARGER LES DONNÉES SANTÉ
========================================== */

function chargerSante() {

    const tableau =
        document.getElementById("listeSante");

    if (!tableau) {
        return;
    }


    const sante =
        obtenirSante();


    tableau.innerHTML = "";


    if (sante.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center text-muted">

                    Aucun suivi sanitaire enregistré.

                </td>

            </tr>

        `;

        return;

    }


    sante
        .slice()
        .reverse()
        .forEach(enregistrement => {

            let couleur = "success";


            if (
                enregistrement.type === "Maladie"
            ) {

                couleur = "danger";

            }


            if (
                enregistrement.type === "Traitement"
            ) {

                couleur = "warning";

            }


            tableau.innerHTML += `

                <tr>

                    <td>

                        ${enregistrement.date}

                    </td>

                    <td>

                        ${enregistrement.animal}

                    </td>

                    <td>

                        <span class="badge bg-${couleur}">

                            ${enregistrement.type}

                        </span>

                    </td>

                    <td>

                        ${enregistrement.description}

                    </td>

                    <td>

                        ${enregistrement.traitement}

                    </td>

                    <td>

                        ${enregistrement.quantite}

                    </td>

                    <td>

                        ${enregistrement.utilisateur}

                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-danger"
                            onclick="supprimerSante('${enregistrement.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        });

}



/* ==========================================
   SUPPRIMER SUIVI SANITAIRE
========================================== */

function supprimerSante(id) {

    if (
        !confirm(
            "Supprimer cet enregistrement sanitaire ?"
        )
    ) {
        return;
    }


    let sante =
        obtenirSante();


    sante =
        sante.filter(
            enregistrement =>
                enregistrement.id !== id
        );


    sauvegarderSante(sante);


    chargerSante();

}



/* ==========================================
   TABLEAU DE BORD ÉLEVAGE
========================================== */

function chargerDashboardElevage() {

    const animaux =
        obtenirAnimaux();

    const productions =
        obtenirProductions();

    const sante =
        obtenirSante();


    const totalAnimaux =
        animaux.reduce(
            (total, animal) =>
                total + Number(animal.quantite),
            0
        );


    const animauxMalades =
        animaux
            .filter(
                animal =>
                    animal.statut === "Malade"
            )
            .reduce(
                (total, animal) =>
                    total + Number(animal.quantite),
                0
            );


    const aujourdHui =
        new Date()
            .toISOString()
            .split("T")[0];


    const productionJour =
        productions
            .filter(
                production =>
                    production.date === aujourdHui
            )
            .reduce(
                (total, production) =>
                    total +
                    Number(production.quantite),
                0
            );


    const totalElement =
        document.getElementById(
            "totalAnimaux"
        );

    const maladeElement =
        document.getElementById(
            "animauxMalades"
        );

    const productionElement =
        document.getElementById(
            "productionJour"
        );

    const suiviElement =
        document.getElementById(
            "nbSuiviSante"
        );


    if (totalElement) {

        totalElement.textContent =
            totalAnimaux;

    }


    if (maladeElement) {

        maladeElement.textContent =
            animauxMalades;

    }


    if (productionElement) {

        productionElement.textContent =
            productionJour;

    }


    if (suiviElement) {

        suiviElement.textContent =
            sante.length;

    }

}



/* ==========================================
   CHARGEMENT AUTOMATIQUE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerAnimaux();

        chargerProductions();

        chargerSante();

        chargerDashboardElevage();

    }
);
