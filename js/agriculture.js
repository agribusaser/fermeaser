/*====================================================
 FERME ASHER ERP
 AGRICULTURE.JS
 Gestion Planning + Matériels Agricoles
 SUPABASE
====================================================*/

/*====================================================
 ATTENDRE LE CHARGEMENT DE LA PAGE
====================================================*/
document.addEventListener("DOMContentLoaded", () => {

    // Planning
    if (document.getElementById("listePlanning")) {
        chargerPlanning();
    }

    // Matériels
    if (document.getElementById("listeMateriels")) {
        chargerMateriels();
    }

});


/*====================================================
 OUTIL : ÉCHAPPER HTML
====================================================*/
function echapperHTML(texte) {
    if (texte === null || texte === undefined) return "";

    return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*====================================================
 ==================== PLANNING =======================
====================================================*/

/*----------------------------------------------------
 CHARGER LE PLANNING DEPUIS SUPABASE
----------------------------------------------------*/
async function chargerPlanning() {

    const liste = document.getElementById("listePlanning");

    if (!liste) return;

    liste.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                Chargement...
            </td>
        </tr>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("planning_agricole")
            .select("*")
            .order("date", { ascending: true });

        if (error) throw error;

        liste.innerHTML = "";

        if (!data || data.length === 0) {

            liste.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        Aucun planning enregistré.
                    </td>
                </tr>
            `;

            mettreAJourStatsPlanning([]);

            return;
        }

        data.forEach(planning => {

            const ligne = document.createElement("tr");

            ligne.innerHTML = `
                <td>${echapperHTML(formatDate(planning.date))}</td>

                <td>${echapperHTML(planning.activite)}</td>

                <td>${echapperHTML(planning.culture || "-")}</td>

                <td>${echapperHTML(planning.parcelle || "-")}</td>

                <td>${echapperHTML(planning.responsable || "-")}</td>

                <td>
                    ${afficherStatut(planning.statut)}
                </td>

                <td>
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerPlanning('${planning.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            liste.appendChild(ligne);

        });

        mettreAJourStatsPlanning(data);

    } catch (error) {

        console.error("Erreur chargement planning :", error);

        liste.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Erreur lors du chargement du planning.
                </td>
            </tr>
        `;

    }

}


/*----------------------------------------------------
 AJOUTER UN PLANNING
----------------------------------------------------*/
async function ajouterPlanning() {

    const date = document.getElementById("datePlanning")?.value;
    const activite = document.getElementById("activitePlanning")?.value.trim();
    const culture = document.getElementById("culturePlanning")?.value.trim();
    const parcelle = document.getElementById("parcellePlanning")?.value.trim();
    const responsable = document.getElementById("responsablePlanning")?.value.trim();
    const statut = document.getElementById("statutPlanning")?.value;

    if (!date) {
        alert("Veuillez sélectionner une date.");
        return;
    }

    if (!activite) {
        alert("Veuillez saisir l'activité.");
        return;
    }

    if (!statut) {
        alert("Veuillez sélectionner le statut.");
        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("planning_agricole")
            .insert([
                {
                    date: date,
                    activite: activite,
                    culture: culture || null,
                    parcelle: parcelle || null,
                    responsable: responsable || null,
                    statut: statut
                }
            ])
            .select();

        if (error) throw error;

        alert("Planning enregistré avec succès.");

        document.getElementById("formPlanning")?.reset();

        const modalElement = document.getElementById("modalPlanning");

        if (modalElement && typeof bootstrap !== "undefined") {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

        }

        await chargerPlanning();

    } catch (error) {

        console.error("Erreur enregistrement planning :", error);

        alert(
            "Erreur lors de l'enregistrement :\n\n" +
            error.message
        );

    }

}


/*----------------------------------------------------
 SUPPRIMER UN PLANNING
----------------------------------------------------*/
async function supprimerPlanning(id) {

    if (!confirm("Voulez-vous vraiment supprimer ce planning ?")) {
        return;
    }

    try {

        const { error } = await supabaseClient
            .from("planning_agricole")
            .delete()
            .eq("id", id);

        if (error) throw error;

        alert("Planning supprimé.");

        await chargerPlanning();

    } catch (error) {

        console.error("Erreur suppression planning :", error);

        alert(
            "Erreur lors de la suppression :\n\n" +
            error.message
        );

    }

}


/*----------------------------------------------------
 AFFICHER LE STATUT
----------------------------------------------------*/
function afficherStatut(statut) {

    if (!statut) return "-";

    const valeur = statut.toLowerCase();

    let classe = "bg-secondary";

    if (
        valeur.includes("termin") ||
        valeur.includes("réalis")
    ) {
        classe = "bg-success";
    }

    else if (
        valeur.includes("cours") ||
        valeur.includes("progress")
    ) {
        classe = "bg-warning text-dark";
    }

    else if (
        valeur.includes("annul")
    ) {
        classe = "bg-danger";
    }

    return `
        <span class="badge ${classe}">
            ${echapperHTML(statut)}
        </span>
    `;
}


/*----------------------------------------------------
 STATISTIQUES PLANNING
----------------------------------------------------*/
function mettreAJourStatsPlanning(data) {

    const total = document.getElementById("totalPlanning");
    const enCours = document.getElementById("planningEnCours");
    const termines = document.getElementById("planningTermines");

    if (total) {
        total.textContent = data.length;
    }

    if (enCours) {

        enCours.textContent =
            data.filter(item => {

                const statut =
                    (item.statut || "").toLowerCase();

                return (
                    statut.includes("cours") ||
                    statut.includes("progress")
                );

            }).length;

    }

    if (termines) {

        termines.textContent =
            data.filter(item => {

                const statut =
                    (item.statut || "").toLowerCase();

                return (
                    statut.includes("termin") ||
                    statut.includes("réalis")
                );

            }).length;

    }

}


/*====================================================
 ================= MATÉRIELS AGRICOLES ==============
====================================================*/

/*----------------------------------------------------
 CHARGER LES MATÉRIELS
----------------------------------------------------*/
async function chargerMateriels() {

    const liste =
        document.getElementById("listeMateriels");

    if (!liste) return;

    liste.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Chargement...
            </td>
        </tr>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("materiels_agricoles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        liste.innerHTML = "";

        if (!data || data.length === 0) {

            liste.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-muted">
                        Aucun matériel enregistré.
                    </td>
                </tr>
            `;

            mettreAJourStatsMateriels([]);

            return;
        }

        data.forEach(materiel => {

            const ligne = document.createElement("tr");

            ligne.innerHTML = `
                <td>
                    <strong>
                        ${echapperHTML(materiel.nom)}
                    </strong>
                </td>

                <td>
                    ${echapperHTML(materiel.categorie)}
                </td>

                <td>
                    ${echapperHTML(materiel.marque || "-")}
                </td>

                <td>
                    ${afficherEtatMateriel(materiel.etat)}
                </td>

                <td>
                    ${echapperHTML(
                        materiel.responsable || "-"
                    )}
                </td>

                <td>
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerMateriel('${materiel.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            liste.appendChild(ligne);

        });

        mettreAJourStatsMateriels(data);

    } catch (error) {

        console.error(
            "Erreur chargement matériels :",
            error
        );

        liste.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger">
                    Erreur lors du chargement.
                </td>
            </tr>
        `;

    }

}


/*----------------------------------------------------
 AJOUTER UN MATÉRIEL
----------------------------------------------------*/
async function ajouterMateriel() {

    const nom =
        document.getElementById("nomMateriel")?.value.trim();

    const categorie =
        document.getElementById("categorieMateriel")?.value;

    const marque =
        document.getElementById("marqueMateriel")?.value.trim();

    const etat =
        document.getElementById("etatMateriel")?.value;

    const responsable =
        document.getElementById("responsableMateriel")
        ?.value.trim();

    if (!nom) {
        alert("Veuillez saisir le nom du matériel.");
        return;
    }

    if (!categorie) {
        alert("Veuillez sélectionner une catégorie.");
        return;
    }

    if (!etat) {
        alert("Veuillez sélectionner l'état du matériel.");
        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("materiels_agricoles")
            .insert([
                {
                    nom: nom,
                    categorie: categorie,
                    marque: marque || null,
                    etat: etat,
                    responsable: responsable || null
                }
            ])
            .select();

        if (error) throw error;

        alert("Matériel enregistré avec succès.");

        document.getElementById("formMateriel")?.reset();

        const modalElement =
            document.getElementById("modalMateriel");

        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

        }

        await chargerMateriels();

    } catch (error) {

        console.error(
            "Erreur enregistrement matériel :",
            error
        );

        alert(
            "Erreur lors de l'enregistrement :\n\n" +
            error.message
        );

    }

}


/*----------------------------------------------------
 SUPPRIMER UN MATÉRIEL
----------------------------------------------------*/
async function supprimerMateriel(id) {

    if (!confirm(
        "Voulez-vous vraiment supprimer ce matériel ?"
    )) {
        return;
    }

    try {

        const { error } = await supabaseClient
            .from("materiels_agricoles")
            .delete()
            .eq("id", id);

        if (error) throw error;

        alert("Matériel supprimé.");

        await chargerMateriels();

    } catch (error) {

        console.error(
            "Erreur suppression matériel :",
            error
        );

        alert(
            "Erreur lors de la suppression :\n\n" +
            error.message
        );

    }

}


/*----------------------------------------------------
 AFFICHER L'ÉTAT DU MATÉRIEL
----------------------------------------------------*/
function afficherEtatMateriel(etat) {

    if (!etat) return "-";

    const valeur = etat.toLowerCase();

    let classe = "bg-secondary";

    if (
        valeur.includes("disponible") ||
        valeur.includes("utilisation")
    ) {
        classe = "bg-primary";
    }

    else if (
        valeur.includes("panne") ||
        valeur.includes("hors")
    ) {
        classe = "bg-danger";
    }

    else if (
        valeur.includes("maintenance") ||
        valeur.includes("réparation")
    ) {
        classe = "bg-warning text-dark";
    }

    return `
        <span class="badge ${classe}">
            ${echapperHTML(etat)}
        </span>
    `;

}


/*----------------------------------------------------
 STATISTIQUES MATÉRIELS
----------------------------------------------------*/
function mettreAJourStatsMateriels(data) {

    const total =
        document.getElementById("totalMateriels");

    const disponibles =
        document.getElementById("materielsDisponibles");

    const panne =
        document.getElementById("materielsPanne");

    if (total) {
        total.textContent = data.length;
    }

    if (disponibles) {

        disponibles.textContent =
            data.filter(item => {

                const etat =
                    (item.etat || "").toLowerCase();

                return (
                    etat.includes("disponible") ||
                    etat.includes("utilisation")
                );

            }).length;

    }

    if (panne) {

        panne.textContent =
            data.filter(item => {

                const etat =
                    (item.etat || "").toLowerCase();

                return (
                    etat.includes("panne") ||
                    etat.includes("hors")
                );

            }).length;

    }

}


/*====================================================
 OUTIL DATE
====================================================*/
function formatDate(date) {

    if (!date) return "";

    const d = new Date(date + "T00:00:00");

    if (isNaN(d.getTime())) {
        return date;
    }

    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}


/*====================================================
 FIN
====================================================*/
console.log(
    "Ferme Asher - agriculture.js chargé avec Supabase."
);
