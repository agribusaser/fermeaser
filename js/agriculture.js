/* ====================================================
   FERME ASHER ERP
   AGRICULTURE.JS
   GESTION DES MATÉRIELS AGRICOLES - SUPABASE
   ==================================================== */

"use strict";

/* ====================================================
   INITIALISATION
   ==================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Si nous sommes sur la page des matériels
    if (document.getElementById("listeMateriels")) {
        chargerMateriels();
    }

});


/* ====================================================
   CHARGER LES MATÉRIELS DEPUIS SUPABASE
   ==================================================== */

async function chargerMateriels() {

    const liste = document.getElementById("listeMateriels");

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

        if (error) {
            console.error("Erreur chargement matériels :", error);
            afficherErreur("Impossible de charger les matériels.");
            return;
        }

        afficherMateriels(data || []);

        mettreAJourStatistiques(data || []);

    } catch (erreur) {

        console.error("Erreur :", erreur);

        afficherErreur("Erreur de connexion à Supabase.");

    }
}


/* ====================================================
   AFFICHER LES MATÉRIELS
   ==================================================== */

function afficherMateriels(materiels) {

    const liste = document.getElementById("listeMateriels");

    if (!liste) return;

    liste.innerHTML = "";

    if (materiels.length === 0) {

        liste.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    Aucun matériel enregistré.
                </td>
            </tr>
        `;

        return;
    }


    materiels.forEach(materiel => {

        const ligne = document.createElement("tr");

        ligne.innerHTML = `

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
                ${badgeEtat(materiel.etat)}
            </td>

            <td>
                ${echapperHTML(materiel.responsable || "-")}
            </td>

            <td>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="supprimerMateriel('${materiel.id}')"
                    title="Supprimer">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        liste.appendChild(ligne);

    });

}


/* ====================================================
   AJOUTER UN MATÉRIEL
   ==================================================== */

async function ajouterMateriel() {

    const nom = document.getElementById("nomMateriel").value.trim();

    const categorie =
        document.getElementById("categorieMateriel").value;

    const marque =
        document.getElementById("marqueMateriel").value.trim();

    const etat =
        document.getElementById("etatMateriel").value;

    const responsable =
        document.getElementById("responsableMateriel").value.trim();


    /* Vérification */

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


    /* Désactiver temporairement le bouton */

    const bouton =
        document.querySelector(
            '#modalMateriel button[onclick="ajouterMateriel()"]'
        );

    if (bouton) {

        bouton.disabled = true;

        bouton.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Enregistrement...
        `;

    }


    try {

        /* ====================================================
           INSERTION SUPABASE
           ==================================================== */

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
            .select()
            .single();


        /* Gestion erreur */

        if (error) {

            console.error("Erreur Supabase :", error);

            alert(
                "Erreur lors de l'enregistrement :\n\n" +
                error.message
            );

            return;

        }


        console.log("Matériel enregistré :", data);


        /* Réinitialiser le formulaire */

        const formulaire =
            document.getElementById("formMateriel");

        if (formulaire) {

            formulaire.reset();

        }


        /* Fermer la fenêtre */

        const modalElement =
            document.getElementById("modalMateriel");

        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {

                modal.hide();

            }

        }


        /* Recharger les données */

        await chargerMateriels();


        alert("Matériel enregistré avec succès !");


    } catch (erreur) {

        console.error("Erreur :", erreur);

        alert(
            "Une erreur est survenue pendant l'enregistrement."
        );


    } finally {

        /* Réactiver le bouton */

        if (bouton) {

            bouton.disabled = false;

            bouton.innerHTML = `
                Enregistrer
            `;

        }

    }

}


/* ====================================================
   SUPPRIMER UN MATÉRIEL
   ==================================================== */

async function supprimerMateriel(id) {

    if (!id) return;


    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce matériel ?"
        );


    if (!confirmation) return;


    try {

        const { error } = await supabaseClient
            .from("materiels_agricoles")
            .delete()
            .eq("id", id);


        if (error) {

            console.error(
                "Erreur suppression :",
                error
            );

            alert(
                "Impossible de supprimer le matériel :\n\n" +
                error.message
            );

            return;

        }


        await chargerMateriels();


        alert("Matériel supprimé avec succès !");


    } catch (erreur) {

        console.error("Erreur :", erreur);

        alert(
            "Une erreur est survenue lors de la suppression."
        );

    }

}


/* ====================================================
   STATISTIQUES
   ==================================================== */

function mettreAJourStatistiques(materiels) {

    const total =
        document.getElementById("totalMateriels");

    const disponibles =
        document.getElementById("materielsDisponibles");

    const panne =
        document.getElementById("materielsPanne");


    if (total) {

        total.textContent = materiels.length;

    }


    if (disponibles) {

        disponibles.textContent =
            materiels.filter(
                materiel =>
                    materiel.etat === "Disponible"
            ).length;

    }


    if (panne) {

        panne.textContent =
            materiels.filter(
                materiel =>
                    materiel.etat === "En panne"
            ).length;

    }

}


/* ====================================================
   BADGE ÉTAT
   ==================================================== */

function badgeEtat(etat) {

    let classe = "bg-secondary";

    if (etat === "Disponible") {

        classe = "bg-success";

    }

    else if (etat === "En utilisation") {

        classe = "bg-primary";

    }

    else if (etat === "En panne") {

        classe = "bg-danger";

    }

    else if (etat === "Maintenance") {

        classe = "bg-warning text-dark";

    }


    return `
        <span class="badge ${classe}">
            ${echapperHTML(etat)}
        </span>
    `;

}


/* ====================================================
   PROTECTION HTML
   ==================================================== */

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


/* ====================================================
   AFFICHER UNE ERREUR
   ==================================================== */

function afficherErreur(message) {

    const liste =
        document.getElementById("listeMateriels");

    if (!liste) return;


    liste.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger py-4">
                <i class="fa-solid fa-triangle-exclamation"></i>
                ${echapperHTML(message)}
            </td>
        </tr>
    `;

}


/* ====================================================
   FIN
   ==================================================== */

console.log(
    "Agriculture.js - Gestion matériels Supabase chargée."
);
