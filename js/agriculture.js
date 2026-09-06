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
