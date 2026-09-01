// ============================================================
// FERME ASHER ERP
// MODULE : ALIMENTATION ÉLEVAGE
// Base de données : Supabase
// ============================================================


// ------------------------------------------------------------
// CHARGER LES LOTS DANS LE SELECT
// ------------------------------------------------------------

async function chargerLotsAlimentation() {

    const select = document.getElementById("alimentLot");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Sélectionner un lot
        </option>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("lots_elevage")
            .select("id, code, espece, race_type, nom_lot")
            .order("id", { ascending: false });

        if (error) {
            console.error("Erreur chargement lots :", error);
            alert("Impossible de charger les lots.");
            return;
        }

        if (!data || data.length === 0) {

            select.innerHTML = `
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
                `${lot.code || ""} - ${lot.nom_lot || lot.espece || "Lot"}`;

            option.dataset.nom =
                lot.nom_lot || lot.espece || "";

            select.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        alert("Erreur de connexion à Supabase.");

    }
}



// ------------------------------------------------------------
// CHARGER LES CONSOMMATIONS
// ------------------------------------------------------------

async function chargerAlimentation() {

    const tbody = document.getElementById("listeAlimentation");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                Chargement...
            </td>
        </tr>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("alimentation_elevage")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {

            console.error("Erreur chargement alimentation :", error);

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Erreur de chargement
                    </td>
                </tr>
            `;

            return;
        }

        afficherAlimentation(data || []);

        calculerStatistiquesAlimentation(data || []);

    } catch (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Erreur de connexion
                </td>
            </tr>
        `;
    }
}



// ------------------------------------------------------------
// AFFICHER LE TABLEAU
// ------------------------------------------------------------

function afficherAlimentation(data) {

    const tbody = document.getElementById("listeAlimentation");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    Aucune consommation enregistrée.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formaterDate(item.date)}</td>

            <td>
                <strong>${echapperHTML(item.lot_nom || "-")}</strong>
            </td>

            <td>
                ${echapperHTML(item.produit || "-")}
            </td>

            <td>
                ${item.quantite ?? 0}
            </td>

            <td>
                ${echapperHTML(item.unite || "-")}
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



// ------------------------------------------------------------
// ENREGISTRER UNE CONSOMMATION
// ------------------------------------------------------------

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


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // RÉCUPÉRER LE LOT
    // --------------------------------------------------------

    const lotId =
        parseInt(lotSelect.value);

    const option =
        lotSelect.options[lotSelect.selectedIndex];

    const lotNom =
        option.dataset.nom ||
        option.textContent;


    // --------------------------------------------------------
    // UTILISATEUR CONNECTÉ
    // --------------------------------------------------------

    let utilisateur = "Utilisateur";

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (user) {

            utilisateur =
                user.email || user.id;

        }

    } catch (error) {

        console.warn(
            "Utilisateur non récupéré :",
            error
        );

    }


    // --------------------------------------------------------
    // DÉSACTIVER LE BOUTON PENDANT L'ENREGISTREMENT
    // --------------------------------------------------------

    const bouton =
        document.querySelector(
            '#modalAlimentation .btn-success[onclick="enregistrerAlimentation()"]'
        );

    if (bouton) {

        bouton.disabled = true;

        bouton.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Enregistrement...
        `;
    }


    // --------------------------------------------------------
    // INSERTION SUPABASE
    // --------------------------------------------------------

    try {

        const { data, error } = await supabaseClient
            .from("alimentation_elevage")
            .insert([{

                date: date,

                lot_id: lotId,

                lot_nom: lotNom,

                produit: produit,

                quantite: quantite,

                unite: unite,

                notes: notes,

                utilisateur: utilisateur

            }])
            .select();


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


        // ----------------------------------------------------
        // SUCCÈS
        // ----------------------------------------------------

        alert("Consommation enregistrée avec succès !");


        // Réinitialiser le formulaire

        document.getElementById(
            "formAlimentation"
        ).reset();


        // Remettre la date du jour

        document.getElementById(
            "alimentDate"
        ).value =
            new Date()
                .toISOString()
                .split("T")[0];


        // Fermer le modal

        const modalElement =
            document.getElementById(
                "modalAlimentation"
            );

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        if (modal) {

            modal.hide();

        }


        // Actualiser le tableau

        await chargerAlimentation();


    } catch (error) {

        console.error(error);

        alert(
            "Erreur inattendue : " +
            error.message
        );

    } finally {

        if (bouton) {

            bouton.disabled = false;

            bouton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Enregistrer
            `;
        }

    }
}



// ------------------------------------------------------------
// SUPPRIMER UNE CONSOMMATION
// ------------------------------------------------------------

async function supprimerAlimentation(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cette consommation ?"
        );

    if (!confirmation) return;


    try {

        const { error } =
            await supabaseClient
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


        alert("Consommation supprimée.");

        await chargerAlimentation();


    } catch (error) {

        console.error(error);

        alert(
            "Erreur lors de la suppression."
        );

    }
}



// ------------------------------------------------------------
// STATISTIQUES
// ------------------------------------------------------------

function calculerStatistiquesAlimentation(data) {

    const maintenant =
        new Date();

    const annee =
        maintenant.getFullYear();

    const mois =
        maintenant.getMonth();

    const aujourdHui =
        maintenant
            .toISOString()
            .split("T")[0];


    let consommationJour = 0;

    let consommationMois = 0;

    let consommationTotale = 0;


    const lotsNourris =
        new Set();


    data.forEach(item => {

        const quantite =
            convertirEnKg(
                parseFloat(item.quantite) || 0,
                item.unite
            );


        consommationTotale += quantite;


        if (item.date === aujourdHui) {

            consommationJour += quantite;

        }


        const date =
            new Date(item.date + "T00:00:00");


        if (
            date.getFullYear() === annee &&
            date.getMonth() === mois
        ) {

            consommationMois += quantite;

        }


        if (item.lot_id) {

            lotsNourris.add(
                item.lot_id
            );

        }

    });


    // --------------------------------------------------------
    // AFFICHAGE
    // --------------------------------------------------------

    const jour =
        document.getElementById(
            "alimentJour"
        );

    const moisElement =
        document.getElementById(
            "alimentMois"
        );

    const total =
        document.getElementById(
            "alimentTotal"
        );

    const lots =
        document.getElementById(
            "lotsNourris"
        );


    if (jour) {

        jour.textContent =
            formaterQuantite(
                consommationJour
            ) + " Kg";

    }


    if (moisElement) {

        moisElement.textContent =
            formaterQuantite(
                consommationMois
            ) + " Kg";

    }


    if (total) {

        total.textContent =
            formaterQuantite(
                consommationTotale
            ) + " Kg";

    }


    if (lots) {

        lots.textContent =
            lotsNourris.size;

    }

}



// ------------------------------------------------------------
// CONVERSION EN KG
// ------------------------------------------------------------

function convertirEnKg(
    quantite,
    unite
) {

    if (!quantite) return 0;


    switch (
        String(unite || "")
            .toLowerCase()
    ) {

        case "g":

            return quantite / 1000;


        case "sac":

            // 1 sac = 50 Kg
            return quantite * 50;


        case "kg":

        default:

            return quantite;

    }

}



// ------------------------------------------------------------
// FORMATAGE DATE
// ------------------------------------------------------------

function formaterDate(date) {

    if (!date) return "-";

    const d =
        new Date(
            date + "T00:00:00"
        );

    return d.toLocaleDateString(
        "fr-FR"
    );

}



// ------------------------------------------------------------
// FORMATAGE QUANTITÉ
// ------------------------------------------------------------

function formaterQuantite(
    valeur
) {

    return Number(valeur)
        .toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}



// ------------------------------------------------------------
// PROTECTION AFFICHAGE HTML
// ------------------------------------------------------------

function echapperHTML(
    texte
) {

    if (texte === null ||
        texte === undefined) {

        return "";

    }

    return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
