/* =========================================================
   FERME ASHER ERP
   MODULE : ALIMENTATION ÉLEVAGE
   Base de données : Supabase
   ========================================================= */

let alimentationEnCours = null;


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("Module Alimentation démarré");

    // Date du jour
    const dateInput = document.getElementById("alimentDate");

    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Charger les données
    await chargerLotsAlimentation();
    await chargerAlimentation();
    await actualiserStatistiques();

});


/* =========================================================
   CHARGER LES LOTS
   ========================================================= */

async function chargerLotsAlimentation() {

    try {

        const select = document.getElementById("alimentLot");

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Sélectionner un lot
            </option>
        `;

        const { data, error } = await supabaseClient
            .from("lots_elevage")
            .select("id, code, nom_lot, espece, race_type")
            .order("id", { ascending: false });

        if (error) {
            console.error("Erreur chargement lots :", error);
            return;
        }

        if (!data || data.length === 0) {

            select.innerHTML += `
                <option value="">
                    Aucun lot disponible
                </option>
            `;

            return;
        }

        data.forEach(lot => {

            const option = document.createElement("option");

            option.value = lot.id;

            option.textContent =
                `${lot.code || ""} - ${lot.nom_lot || "Lot sans nom"}`;

            // Informations supplémentaires disponibles
            option.dataset.nom = lot.nom_lot || "";
            option.dataset.code = lot.code || "";

            select.appendChild(option);

        });

    } catch (error) {

        console.error("Erreur générale chargement lots :", error);

    }

}


/* =========================================================
   ENREGISTRER UNE ALIMENTATION
   ========================================================= */

async function enregistrerAlimentation() {

    try {

        const date = document.getElementById("alimentDate").value;
        const lotSelect = document.getElementById("alimentLot");
        const produit = document.getElementById("alimentProduit").value.trim();
        const quantite = parseFloat(
            document.getElementById("alimentQuantite").value
        );
        const unite = document.getElementById("alimentUnite").value;
        const notes = document.getElementById("alimentNotes").value.trim();

        /* -----------------------------
           Vérification
        ----------------------------- */

        if (!date) {
            alert("Veuillez sélectionner une date.");
            return;
        }

        if (!lotSelect.value) {
            alert("Veuillez sélectionner un lot.");
            return;
        }

        if (!produit) {
            alert("Veuillez entrer le nom de l'aliment.");
            return;
        }

        if (!quantite || quantite <= 0) {
            alert("Veuillez entrer une quantité valide.");
            return;
        }


        /* -----------------------------
           Récupération du lot
        ----------------------------- */

        const lotId = lotSelect.value;

        const selectedOption =
            lotSelect.options[lotSelect.selectedIndex];

        const lotNom =
            selectedOption.dataset.nom ||
            selectedOption.textContent;


        /* -----------------------------
           Utilisateur connecté
        ----------------------------- */

        let utilisateur = "Utilisateur";

        try {

            const {
                data: {
                    user
                }
            } = await supabaseClient.auth.getUser();

            if (user && user.email) {
                utilisateur = user.email;
            }

        } catch (e) {

            console.log(
                "Utilisateur non récupéré, valeur par défaut utilisée."
            );

        }


        /* -----------------------------
           Enregistrement Supabase
        ----------------------------- */

        const nouvelleAlimentation = {

            id: crypto.randomUUID(),

            date: date,

            lot_id: lotId,

            lot_nom: lotNom,

            produit: produit,

            quantite: quantite,

            unite: unite,

            notes: notes,

            utilisateur: utilisateur

        };


        const { data, error } = await supabaseClient
            .from("alimentation_elevage")
            .insert([nouvelleAlimentation])
            .select()
            .single();


        if (error) {

            console.error(
                "Erreur Supabase :",
                error
            );

            alert(
                "Erreur lors de l'enregistrement :\n" +
                error.message
            );

            return;

        }


        console.log(
            "Alimentation enregistrée :",
            data
        );


        /* -----------------------------
           Nettoyage formulaire
        ----------------------------- */

        document.getElementById("formAlimentation").reset();

        document.getElementById("alimentDate").value =
            new Date().toISOString().split("T")[0];


        /* -----------------------------
           Fermer modal
        ----------------------------- */

        const modalElement =
            document.getElementById("modalAlimentation");

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }


        /* -----------------------------
           Actualiser affichage
        ----------------------------- */

        await chargerAlimentation();
        await actualiserStatistiques();


        alert(
            "✅ Consommation enregistrée avec succès."
        );

    } catch (error) {

        console.error(
            "Erreur enregistrement alimentation :",
            error
        );

        alert(
            "Une erreur est survenue pendant l'enregistrement."
        );

    }

}


/* =========================================================
   CHARGER LES CONSOMMATIONS
   ========================================================= */

async function chargerAlimentation() {

    try {

        const tbody =
            document.getElementById("listeAlimentation");

        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Chargement...
                </td>
            </tr>
        `;


        const { data, error } = await supabaseClient

            .from("alimentation_elevage")

            .select("*")

            .order("date", {
                ascending: false
            })

            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "Erreur chargement alimentation :",
                error
            );

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Erreur de chargement
                    </td>
                </tr>
            `;

            return;

        }


        if (!data || data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        Aucune consommation enregistrée.
                    </td>
                </tr>
            `;

            return;

        }


        tbody.innerHTML = "";


        data.forEach(aliment => {

            const tr = document.createElement("tr");

            tr.innerHTML = `

                <td>
                    ${formatDate(aliment.date)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(aliment.lot_nom || "-")}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(aliment.produit || "-")}
                </td>

                <td>
                    <strong>
                        ${formatNombre(aliment.quantite)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(aliment.unite || "-")}
                </td>

                <td>
                    ${escapeHtml(aliment.notes || "-")}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="supprimerAlimentation('${aliment.id}')"
                        title="Supprimer">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            `;

            tbody.appendChild(tr);

        });


    } catch (error) {

        console.error(
            "Erreur générale chargement alimentation :",
            error
        );

    }

}


/* =========================================================
   STATISTIQUES
   ========================================================= */

async function actualiserStatistiques() {

    try {

        const { data, error } = await supabaseClient

            .from("alimentation_elevage")

            .select("date, quantite, unite, lot_id");


        if (error) {

            console.error(
                "Erreur statistiques :",
                error
            );

            return;

        }


        if (!data) return;


        const aujourdHui =
            new Date().toISOString().split("T")[0];


        const maintenant = new Date();

        const moisActuel =
            maintenant.getMonth();

        const anneeActuelle =
            maintenant.getFullYear();


        let consommationJour = 0;

        let consommationMois = 0;

        let consommationTotale = 0;


        const lots = new Set();


        data.forEach(item => {

            const quantite =
                parseFloat(item.quantite) || 0;


            /*
             * Pour l'instant les statistiques
             * utilisent directement la quantité.
             *
             * Une conversion Kg/g/Sac pourra être
             * ajoutée ensuite.
             */

            consommationTotale += quantite;


            if (item.date === aujourdHui) {

                consommationJour += quantite;

            }


            const dateItem =
                new Date(item.date + "T00:00:00");


            if (
                dateItem.getMonth() === moisActuel &&
                dateItem.getFullYear() === anneeActuelle
            ) {

                consommationMois += quantite;

            }


            if (item.lot_id) {

                lots.add(item.lot_id);

            }

        });


        /* -----------------------------
           Affichage
        ----------------------------- */

        const jour =
            document.getElementById("alimentJour");

        const mois =
            document.getElementById("alimentMois");

        const total =
            document.getElementById("alimentTotal");

        const lotsNourris =
            document.getElementById("lotsNourris");


        if (jour) {
            jour.textContent =
                formatNombre(consommationJour);
        }


        if (mois) {
            mois.textContent =
                formatNombre(consommationMois);
        }


        if (total) {
            total.textContent =
                formatNombre(consommationTotale);
        }


        if (lotsNourris) {
            lotsNourris.textContent =
                lots.size;
        }


    } catch (error) {

        console.error(
            "Erreur statistiques :",
            error
        );

    }

}


/* =========================================================
   SUPPRIMER UNE CONSOMMATION
   ========================================================= */

async function supprimerAlimentation(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cette consommation ?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const { error } = await supabaseClient

            .from("alimentation_elevage")

            .delete()

            .eq("id", id);


        if (error) {

            console.error(
                "Erreur suppression :",
                error
            );

            alert(
                "Impossible de supprimer :\n" +
                error.message
            );

            return;

        }


        await chargerAlimentation();

        await actualiserStatistiques();


        alert(
            "✅ Consommation supprimée."
        );


    } catch (error) {

        console.error(
            "Erreur générale suppression :",
            error
        );

    }

}


/* =========================================================
   OUTILS
   ========================================================= */

function formatDate(date) {

    if (!date) return "-";

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function formatNombre(nombre) {

    const valeur =
        parseFloat(nombre) || 0;

    return valeur.toLocaleString(
        "fr-FR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


/*
 * Protection contre l'injection HTML
 */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   EXPORTS
   ========================================================= */

window.chargerAlimentation =
    chargerAlimentation;

window.chargerLotsAlimentation =
    chargerLotsAlimentation;

window.enregistrerAlimentation =
    enregistrerAlimentation;

window.supprimerAlimentation =
    supprimerAlimentation;

window.actualiserStatistiques =
    actualiserStatistiques;
