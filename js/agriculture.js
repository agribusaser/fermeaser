// ==========================================
// PLANNING AGRICOLE - FERME ASHER ERP
// ==========================================

const CLE_PLANNING = "fermeAsherPlanning";

// ==========================================
// CHARGER LES ACTIVITÉS
// ==========================================

function chargerPlanning() {

    let planning = JSON.parse(
        localStorage.getItem(CLE_PLANNING)
    ) || [];

    const liste = document.getElementById("listePlanning");

    if (!liste) return;

    liste.innerHTML = "";

    // Si aucune activité
    if (planning.length === 0) {

        liste.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fa-solid fa-calendar-xmark me-2"></i>
                    Aucune activité planifiée
                </td>
            </tr>
        `;

        mettreAJourStatistiques(planning);

        return;
    }

    // Afficher les activités
    planning.forEach((activite, index) => {

        let badgeStatut = "";

        if (activite.statut === "Prévu") {
            badgeStatut = "bg-secondary";
        }

        else if (activite.statut === "En cours") {
            badgeStatut = "bg-warning text-dark";
        }

        else if (activite.statut === "Terminé") {
            badgeStatut = "bg-success";
        }

        liste.innerHTML += `
            <tr>

                <td>
                    ${formaterDate(activite.date)}
                </td>

                <td>
                    <strong>${activite.activite}</strong>
                </td>

                <td>
                    ${activite.culture || "-"}
                </td>

                <td>
                    ${activite.parcelle || "-"}
                </td>

                <td>
                    ${activite.responsable || "-"}
                </td>

                <td>
                    <span class="badge ${badgeStatut}">
                        ${activite.statut}
                    </span>
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerPlanning(${index})"
                        title="Supprimer">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>
        `;
    });

    mettreAJourStatistiques(planning);
}


// ==========================================
// AJOUTER UNE ACTIVITÉ
// ==========================================

function ajouterPlanning() {

    const date = document.getElementById("datePlanning").value;
    const activite = document.getElementById("activitePlanning").value;
    const culture = document.getElementById("culturePlanning").value.trim();
    const parcelle = document.getElementById("parcellePlanning").value.trim();
    const responsable = document.getElementById("responsablePlanning").value.trim();
    const statut = document.getElementById("statutPlanning").value;

    // Vérification de la date
    if (!date) {

        alert("Veuillez sélectionner une date.");

        return;
    }

    // Récupérer les activités existantes
    let planning = JSON.parse(
        localStorage.getItem(CLE_PLANNING)
    ) || [];

    // Nouvelle activité
    const nouvelleActivite = {

        id: Date.now(),

        date: date,

        activite: activite,

        culture: culture,

        parcelle: parcelle,

        responsable: responsable,

        statut: statut
    };

    // Ajouter au tableau
    planning.push(nouvelleActivite);

    // Enregistrer dans le navigateur
    localStorage.setItem(
        CLE_PLANNING,
        JSON.stringify(planning)
    );

    // Actualiser la liste
    chargerPlanning();

    // Réinitialiser le formulaire
    document.getElementById("formPlanning").reset();

    // Remettre la date du jour
    definirDateAujourdhui();

    // Fermer le modal
    const modalElement = document.getElementById("modalPlanning");

    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
        modal.hide();
    }

    // Message de confirmation
    alert("Activité agricole enregistrée avec succès.");
}


// ==========================================
// SUPPRIMER UNE ACTIVITÉ
// ==========================================

function supprimerPlanning(index) {

    if (!confirm("Voulez-vous vraiment supprimer cette activité ?")) {
        return;
    }

    let planning = JSON.parse(
        localStorage.getItem(CLE_PLANNING)
    ) || [];

    planning.splice(index, 1);

    localStorage.setItem(
        CLE_PLANNING,
        JSON.stringify(planning)
    );

    chargerPlanning();
}


// ==========================================
// STATISTIQUES
// ==========================================

function mettreAJourStatistiques(planning) {

    const total = planning.length;

    const aujourdHui = new Date()
        .toISOString()
        .split("T")[0];

    const nombreAujourdHui = planning.filter(
        activite => activite.date === aujourdHui
    ).length;

    const nombreEnCours = planning.filter(
        activite => activite.statut === "En cours"
    ).length;

    const totalElement = document.getElementById("totalActivites");

    const aujourdHuiElement = document.getElementById("activitesAujourdhui");

    const enCoursElement = document.getElementById("activitesEnCours");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (aujourdHuiElement) {
        aujourdHuiElement.textContent = nombreAujourdHui;
    }

    if (enCoursElement) {
        enCoursElement.textContent = nombreEnCours;
    }
}


// ==========================================
// FORMATER LA DATE
// ==========================================

function formaterDate(date) {

    if (!date) {
        return "-";
    }

    const parties = date.split("-");

    if (parties.length !== 3) {
        return date;
    }

    return `${parties[2]}/${parties[1]}/${parties[0]}`;
}


// ==========================================
// DATE DU JOUR
// ==========================================

function definirDateAujourdhui() {

    const champDate = document.getElementById("datePlanning");

    if (!champDate) {
        return;
    }

    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();

    const mois = String(
        aujourdHui.getMonth() + 1
    ).padStart(2, "0");

    const jour = String(
        aujourdHui.getDate()
    ).padStart(2, "0");

    champDate.value = `${annee}-${mois}-${jour}`;
}


// ==========================================
// INITIALISATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    definirDateAujourdhui();

    chargerPlanning();

});

// ==========================================
// MATÉRIELS AGRICOLES - FERME ASHER ERP
// ==========================================

const CLE_MATERIELS = "fermeAsherMateriels";


// ==========================================
// CHARGER LES MATÉRIELS
// ==========================================

function chargerMateriels() {

    let materiels = JSON.parse(
        localStorage.getItem(CLE_MATERIELS)
    ) || [];

    const liste = document.getElementById("listeMateriels");

    // Cette fonction peut être appelée sur une autre page
    if (!liste) {
        return;
    }

    liste.innerHTML = "";

    // Aucun matériel
    if (materiels.length === 0) {

        liste.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fa-solid fa-tractor me-2"></i>
                    Aucun matériel enregistré
                </td>
            </tr>
        `;

        mettreAJourStatsMateriels(materiels);

        return;
    }


    // Afficher les matériels
    materiels.forEach((materiel, index) => {

        let badgeEtat = "";

        switch (materiel.etat) {

            case "Disponible":
                badgeEtat = "bg-success";
                break;

            case "En utilisation":
                badgeEtat = "bg-primary";
                break;

            case "En panne":
                badgeEtat = "bg-danger";
                break;

            case "Maintenance":
                badgeEtat = "bg-warning text-dark";
                break;

            default:
                badgeEtat = "bg-secondary";
        }


        liste.innerHTML += `
            <tr>

                <td>
                    <strong>${echapperHTML(materiel.nom)}</strong>
                </td>

                <td>
                    ${echapperHTML(materiel.categorie)}
                </td>

                <td>
                    ${echapperHTML(materiel.marque || "-")}
                </td>

                <td>
                    <span class="badge ${badgeEtat}">
                        ${echapperHTML(materiel.etat)}
                    </span>
                </td>

                <td>
                    ${echapperHTML(materiel.responsable || "-")}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerMateriel(${index})"
                        title="Supprimer">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>
        `;
    });


    mettreAJourStatsMateriels(materiels);
}



// ==========================================
// AJOUTER UN MATÉRIEL
// ==========================================

function ajouterMateriel() {

    const nom = document
        .getElementById("nomMateriel")
        .value
        .trim();

    const categorie = document
        .getElementById("categorieMateriel")
        .value;

    const marque = document
        .getElementById("marqueMateriel")
        .value
        .trim();

    const etat = document
        .getElementById("etatMateriel")
        .value;

    const responsable = document
        .getElementById("responsableMateriel")
        .value
        .trim();


    // Vérification du nom
    if (!nom) {

        alert("Veuillez saisir le nom du matériel.");

        document.getElementById("nomMateriel").focus();

        return;
    }


    // Récupérer les matériels existants
    let materiels = JSON.parse(
        localStorage.getItem(CLE_MATERIELS)
    ) || [];


    // Créer le nouveau matériel
    const nouveauMateriel = {

        id: Date.now(),

        nom: nom,

        categorie: categorie,

        marque: marque,

        etat: etat,

        responsable: responsable,

        dateCreation: new Date().toISOString()
    };


    // Ajouter au tableau
    materiels.push(nouveauMateriel);


    // Sauvegarder
    localStorage.setItem(
        CLE_MATERIELS,
        JSON.stringify(materiels)
    );


    // Actualiser le tableau
    chargerMateriels();


    // Réinitialiser le formulaire
    const formulaire = document.getElementById("formMateriel");

    if (formulaire) {
        formulaire.reset();
    }


    // Fermer le modal
    const modalElement = document.getElementById("modalMateriel");

    if (modalElement) {

        const modal = bootstrap.Modal.getInstance(
            modalElement
        );

        if (modal) {
            modal.hide();
        }
    }


    // Confirmation
    alert("Matériel enregistré avec succès.");
}



// ==========================================
// SUPPRIMER UN MATÉRIEL
// ==========================================

function supprimerMateriel(index) {

    if (
        !confirm(
            "Voulez-vous vraiment supprimer ce matériel ?"
        )
    ) {
        return;
    }


    let materiels = JSON.parse(
        localStorage.getItem(CLE_MATERIELS)
    ) || [];


    materiels.splice(index, 1);


    localStorage.setItem(
        CLE_MATERIELS,
        JSON.stringify(materiels)
    );


    chargerMateriels();
}



// ==========================================
// STATISTIQUES MATÉRIELS
// ==========================================

function mettreAJourStatsMateriels(materiels) {

    const total = materiels.length;


    const disponibles = materiels.filter(
        materiel =>
            materiel.etat === "Disponible"
    ).length;


    const enPanne = materiels.filter(
        materiel =>
            materiel.etat === "En panne"
    ).length;


    const totalElement =
        document.getElementById("totalMateriels");

    const disponiblesElement =
        document.getElementById("materielsDisponibles");

    const panneElement =
        document.getElementById("materielsPanne");


    if (totalElement) {
        totalElement.textContent = total;
    }


    if (disponiblesElement) {
        disponiblesElement.textContent = disponibles;
    }


    if (panneElement) {
        panneElement.textContent = enPanne;
    }
}



// ==========================================
// PROTECTION DU TEXTE AFFICHÉ
// ==========================================

function echapperHTML(texte) {

    if (texte === null || texte === undefined) {
        return "";
    }

    return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// ==========================================
// INITIALISATION MATÉRIELS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerMateriels();

    }
);
