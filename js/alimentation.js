// ============================================================
// ALIMENTATION ELEVAGE - FERME ASER ERP
// Connexion avec Supabase
// ============================================================

// Vérification de la connexion Supabase
if (typeof supabaseClient === "undefined") {
    console.error("Supabase n'est pas chargé.");
    alert("Erreur : Supabase n'est pas correctement chargé.");
}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("Module Alimentation démarré.");

    // Date du jour
    const dateInput = document.getElementById("alimentDate");

    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Charger les données
    await chargerLotsAlimentation();
    await chargerAlimentation();

});


// ============================================================
// CHARGER LES LOTS DEPUIS SUPABASE
// ============================================================

async function chargerLotsAlimentation() {

    const select = document.getElementById("alimentLot");

    if (!select) {
        console.error("Champ alimentLot introuvable.");
        return;
    }

    // Message temporaire
    select.innerHTML = `
        <option value="">Chargement des lots...</option>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("lots_elevage")
            .select(`
                id,
                code,
                espece,
                race_type,
                nom_lot,
                quantite_actuelle,
                statut
            `)
            .order("id", { ascending: false });

        if (error) {
            console.error("Erreur chargement lots :", error);

            select.innerHTML = `
                <option value="">
                    Erreur de chargement des lots
                </option>
            `;

            return;
        }

        // Aucun lot
        if (!data || data.length === 0) {

            select.innerHTML = `
                <option value="">
                    Aucun lot disponible
                </option>
            `;

            console.log("Aucun lot trouvé dans lots_elevage.");

            return;
        }


        // Réinitialiser
        select.innerHTML = `
            <option value="">
                Sélectionner un lot
            </option>
        `;


        // Ajouter les lots
        data.forEach(function (lot) {

            const option = document.createElement("option");

            option.value = lot.id;

            // Nom affiché
            let nom = lot.nom_lot || lot.code || "Lot sans nom";

            // Informations complémentaires
            let informations = [];

            if (lot.espece) {
                informations.push(lot.espece);
            }

            if (lot.race_type) {
                informations.push(lot.race_type);
            }

            if (lot.quantite_actuelle !== null &&
                lot.quantite_actuelle !== undefined) {

                informations.push(
                    lot.quantite_actuelle + " animaux"
                );
            }

            option.textContent =
                nom +
                (informations.length
                    ? " — " + informations.join(" | ")
                    : "");

            // Sauvegarder le nom du lot
            option.dataset.nomLot = nom;

            select.appendChild(option);

        });


        console.log(
            data.length + " lot(s) chargé(s) depuis Supabase."
        );


    } catch (error) {

        console.error(
            "Erreur inattendue lors du chargement des lots :",
            error
        );

        select.innerHTML = `
            <option value="">
                Erreur de connexion
            </option>
        `;
    }
}


// ============================================================
// CHARGER LES CONSOMMATIONS
// ============================================================

async function chargerAlimentation() {

    try {

        const { data, error } = await supabaseClient
            .from("alimentation_elevage")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            console.error(
                "Erreur chargement alimentation :",
                error
            );

            return;
        }


        afficherAlimentation(data || []);

        calculerStatistiquesAlimentation(data || []);

    } catch (error) {

        console.error(
            "Erreur inattendue alimentation :",
            error
        );

    }
}


// ============================================================
// AFFICHER LES CONSOMMATIONS
// ============================================================

function afficherAlimentation(data) {

    const tbody =
        document.getElementById("listeAlimentation");

    if (!tbody) {
        return;
    }


    // Aucune donnée
    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-4">

                    Aucune consommation enregistrée.

                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = "";


    data.forEach(function (item) {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${formaterDate(item.date)}
            </td>

            <td>
                <strong>
                    ${echapperHTML(item.lot_nom || "-")}
                </strong>
            </td>

            <td>
                ${echapperHTML(item.produit || "-")}
            </td>

            <td>
                ${item.quantite ?? 0}
            </td>

            <td>
                ${echapperHTML(item.unite || "Kg")}
            </td>

            <td>
                ${echapperHTML(item.notes || "-")}
            </td>

            <td>

                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="supprimerAlimentation('${item.id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>
        `;


        tbody.appendChild(tr);

    });
}


// ============================================================
// ENREGISTRER UNE CONSOMMATION
// ============================================================

async function enregistrerAlimentation() {

    const date =
        document.getElementById("alimentDate").value;

    const lotSelect =
        document.getElementById("alimentLot");

    const produit =
        document.getElementById("alimentProduit").value.trim();

    const quantite =
        parseFloat(
            document.getElementById("alimentQuantite").value
        );

    const unite =
        document.getElementById("alimentUnite").value;

    const notes =
        document.getElementById("alimentNotes").value.trim();


    // Vérifications
    if (!date) {
        alert("Veuillez sélectionner une date.");
        return;
    }

    if (!lotSelect.value) {
        alert("Veuillez sélectionner un lot.");
        return;
    }

    if (!produit) {
        alert("Veuillez indiquer le nom de l'aliment.");
        return;
    }

    if (!quantite || quantite <= 0) {
        alert("Veuillez entrer une quantité valide.");
        return;
    }


    // Lot sélectionné
    const lotId = lotSelect.value;

    const selectedOption =
        lotSelect.options[lotSelect.selectedIndex];

    const lotNom =
        selectedOption.dataset.nomLot ||
        selectedOption.textContent;


    console.log("Enregistrement alimentation :", {
        date,
        lotId,
        lotNom,
        produit,
        quantite,
        unite,
        notes
    });


    try {

        const { data, error } = await supabaseClient
            .from("alimentation_elevage")
            .insert([
                {
                    date: date,
                    lot_id: lotId,
                    lot_nom: lotNom,
                    produit: produit,
                    quantite: quantite,
                    unite: unite,
                    notes: notes
                }
            ])
            .select();


        if (error) {

            console.error(
                "Erreur insertion alimentation :",
                error
            );

            alert(
                "Erreur lors de l'enregistrement :\n" +
                error.message
            );

            return;
        }


        console.log(
            "Consommation enregistrée :",
            data
        );


        // Fermer le modal
        const modalElement =
            document.getElementById("modalAlimentation");

        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }
        }


        // Réinitialiser formulaire
        document
            .getElementById("formAlimentation")
            .reset();


        // Remettre date
        document
            .getElementById("alimentDate")
            .value =
            new Date().toISOString().split("T")[0];


        // Actualiser
        await chargerAlimentation();


        alert("Consommation enregistrée avec succès.");


    } catch (error) {

        console.error(
            "Erreur inattendue :",
            error
        );

        alert(
            "Une erreur inattendue est survenue."
        );
    }
}


// ============================================================
// SUPPRIMER UNE CONSOMMATION
// ============================================================

async function supprimerAlimentation(id) {

    if (!confirm(
        "Voulez-vous vraiment supprimer cette consommation ?"
    )) {
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
                "Erreur lors de la suppression :\n" +
                error.message
            );

            return;
        }


        await chargerAlimentation();

        alert("Consommation supprimée.");


    } catch (error) {

        console.error(error);

        alert(
            "Erreur inattendue lors de la suppression."
        );
    }
}


// ============================================================
// STATISTIQUES
// ============================================================

function calculerStatistiquesAlimentation(data) {

    const aujourdHui =
        new Date().toISOString().split("T")[0];

    const maintenant =
        new Date();

    const mois =
        maintenant.getMonth();

    const annee =
        maintenant.getFullYear();


    let totalJour = 0;
    let totalMois = 0;
    let totalGeneral = 0;

    const lots = new Set();


    data.forEach(function (item) {

        const quantite =
            convertirEnKg(
                parseFloat(item.quantite) || 0,
                item.unite
            );


        totalGeneral += quantite;


        if (item.date === aujourdHui) {
            totalJour += quantite;
        }


        if (item.date) {

            const d =
                new Date(item.date + "T00:00:00");

            if (
                d.getMonth() === mois &&
                d.getFullYear() === annee
            ) {
                totalMois += quantite;
            }
        }


        if (item.lot_id) {
            lots.add(String(item.lot_id));
        }

    });


    const alimentJour =
        document.getElementById("alimentJour");

    const alimentMois =
        document.getElementById("alimentMois");

    const alimentTotal =
        document.getElementById("alimentTotal");

    const lotsNourris =
        document.getElementById("lotsNourris");


    if (alimentJour) {
        alimentJour.textContent =
            formatKg(totalJour);
    }

    if (alimentMois) {
        alimentMois.textContent =
            formatKg(totalMois);
    }

    if (alimentTotal) {
        alimentTotal.textContent =
            formatKg(totalGeneral);
    }

    if (lotsNourris) {
        lotsNourris.textContent =
            lots.size;
    }
}


// ============================================================
// CONVERSION EN KG
// ============================================================

function convertirEnKg(quantite, unite) {

    if (!unite) {
        return quantite;
    }


    const u =
        String(unite).toLowerCase();


    if (u === "g" || u === "gramme" || u === "grammes") {
        return quantite / 1000;
    }


    if (u === "sac") {

        // Pour l'instant, un sac est traité comme
        // la quantité saisie.
        //
        // Nous améliorerons cette partie lorsque
        // le module STOCKS sera connecté.

        return quantite;
    }


    // Kg
    return quantite;
}


// ============================================================
// FORMAT KG
// ============================================================

function formatKg(value) {

    return (
        Number(value).toLocaleString("fr-FR", {
            maximumFractionDigits: 2
        }) + " Kg"
    );
}


// ============================================================
// FORMAT DATE
// ============================================================

function formaterDate(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date + "T00:00:00");


    if (isNaN(d.getTime())) {
        return date;
    }


    return d.toLocaleDateString("fr-FR");
}


// ============================================================
// PROTECTION AFFICHAGE HTML
// ============================================================

function echapperHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
