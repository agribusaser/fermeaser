/* =========================================================
   FERME ASHER ERP
   MODULE : ALIMENTATION
   FICHIER : alimentation.js

   VERSION SUPABASE
   ---------------------------------------------------------
   Source centrale :
       alimentation_elevage
       lots_elevage

   OBJECTIF :
       Tous les ordinateurs utilisent les mêmes données.
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const TABLE_ALIMENTATION =
    "alimentation_elevage";

const TABLE_LOTS =
    "lots_elevage";


/* =========================================================
   VERIFICATION SUPABASE
========================================================= */

function verifierSupabaseAlimentation() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "supabaseClient est introuvable."
        );

        alert(
            "Erreur : la connexion Supabase n'est pas chargée."
        );

        return false;

    }

    return true;

}


/* =========================================================
   DATE DU JOUR
========================================================= */

function obtenirDateAujourdHuiAlimentation() {

    const maintenant =
        new Date();

    const annee =
        maintenant.getFullYear();

    const mois =
        String(
            maintenant.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            maintenant.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


/* =========================================================
   FORMAT NOMBRE
========================================================= */

function formaterNombreAlimentation(
    nombre
) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


/* =========================================================
   UTILISATEUR CONNECTE
========================================================= */

function obtenirUtilisateurAlimentation() {

    return (

        localStorage.getItem(
            "utilisateurConnecte"
        )

        ||

        localStorage.getItem(
            "utilisateur"
        )

        ||

        "Administrateur"

    );

}


/* =========================================================
   GENERER ID
========================================================= */

function genererIdAlimentation() {

    return (

        "ALIM-" +

        Date.now() +

        "-" +

        Math.floor(
            Math.random() * 100000
        )

    );

}


/* =========================================================
   ECHAPPER HTML
========================================================= */

function echapperHTMLAlimentation(
    valeur
) {

    if (
        valeur === null ||
        valeur === undefined
    ) {

        return "";

    }

    return String(valeur)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CHARGER LES LOTS DEPUIS SUPABASE
========================================================= */

async function chargerLotsAlimentation() {

    const select =
        document.getElementById(
            "alimentLot"
        );

    if (!select) {

        return;

    }

    if (
        !verifierSupabaseAlimentation()
    ) {

        return;

    }


    const ancienneValeur =
        select.value;


    select.innerHTML = `

        <option value="">
            Chargement des lots...
        </option>

    `;


    try {

        const resultat =
            await supabaseClient
                .from(
                    TABLE_LOTS
                )
                .select(
                    `
                    id,
                    code,
                    espece,
                    race_type,
                    nom_lot,
                    quantite_actuelle,
                    statut
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (resultat.error) {

            throw resultat.error;

        }


        const lots =
            resultat.data || [];


        const lotsActifs =
            lots.filter(
                function (lot) {

                    return (
                        !lot.statut ||
                        lot.statut === "Actif"
                    );

                }
            );


        select.innerHTML = `

            <option value="">
                Sélectionner un lot
            </option>

        `;


        if (
            lotsActifs.length === 0
        ) {

            select.innerHTML += `

                <option
                    value=""
                    disabled
                >
                    Aucun lot actif disponible
                </option>

            `;

            return;

        }


        lotsActifs.forEach(
            function (lot) {

                const code =
                    lot.code ||
                    lot.id;

                const nom =
                    lot.nom_lot ||
                    "Lot sans nom";

                const espece =
                    lot.espece ||
                    "";

                const race =
                    lot.race_type ||
                    "";

                const quantite =
                    Number(
                        lot.quantite_actuelle ||
                        0
                    );


                let texte =
                    code +
                    " — " +
                    nom;


                if (espece) {

                    texte +=
                        " — " +
                        espece;

                }


                if (race) {

                    texte +=
                        " — " +
                        race;

                }


                texte +=
                    " (" +
                    formaterNombreAlimentation(
                        quantite
                    ) +
                    " animaux)";


                const option =
                    document.createElement(
                        "option"
                    );


                /*
                 * IMPORTANT :
                 * la valeur est l'ID
                 * numérique Supabase.
                 */

                option.value =
                    lot.id;


                option.textContent =
                    texte;


                select.appendChild(
                    option
                );

            }
        );


        if (ancienneValeur) {

            const existe =
                Array.from(
                    select.options
                ).some(
                    function (option) {

                        return (
                            String(
                                option.value
                            ) ===
                            String(
                                ancienneValeur
                            )
                        );

                    }
                );


            if (existe) {

                select.value =
                    ancienneValeur;

            }

        }


        console.log(
            "Lots alimentation chargés depuis Supabase :",
            lotsActifs.length
        );


    }
    catch (erreur) {

        console.error(
            "Erreur chargement lots alimentation :",
            erreur
        );


        select.innerHTML = `

            <option value="">
                Erreur de chargement des lots
            </option>

        `;


        alert(
            "Impossible de charger les lots depuis Supabase."
        );

    }

}


/* =========================================================
   ENREGISTRER UNE CONSOMMATION
========================================================= */

async function enregistrerAlimentation(
    evenement
) {

    if (
        evenement &&
        typeof evenement.preventDefault ===
        "function"
    ) {

        evenement.preventDefault();

    }


    if (
        !verifierSupabaseAlimentation()
    ) {

        return false;

    }


    try {

        const champDate =
            document.getElementById(
                "alimentDate"
            );

        const champLot =
            document.getElementById(
                "alimentLot"
            );

        const champProduit =
            document.getElementById(
                "alimentProduit"
            );

        const champQuantite =
            document.getElementById(
                "alimentQuantite"
            );

        const champUnite =
            document.getElementById(
                "alimentUnite"
            );

        const champNotes =
            document.getElementById(
                "alimentNotes"
            );


        if (
            !champDate ||
            !champLot ||
            !champProduit ||
            !champQuantite ||
            !champUnite ||
            !champNotes
        ) {

            alert(
                "Erreur : un ou plusieurs champs du formulaire sont introuvables."
            );

            return false;

        }


        const date =
            champDate.value ||
            obtenirDateAujourdHuiAlimentation();


        const lotId =
            champLot.value;


        const produit =
            champProduit.value.trim();


        const quantite =
            Number(
                champQuantite.value
            );


        const unite =
            champUnite.value ||
            "Kg";


        const notes =
            champNotes.value.trim();


        /* -----------------------------------------
           VALIDATION
        ----------------------------------------- */

        if (!lotId) {

            alert(
                "Veuillez sélectionner un lot."
            );

            champLot.focus();

            return false;

        }


        if (!produit) {

            alert(
                "Veuillez indiquer le nom de l'aliment."
            );

            champProduit.focus();

            return false;

        }


        if (
            !Number.isFinite(
                quantite
            ) ||
            quantite <= 0
        ) {

            alert(
                "La quantité doit être supérieure à zéro."
            );

            champQuantite.focus();

            return false;

        }


        /* -----------------------------------------
           RECUPERER LE LOT
        ----------------------------------------- */

        const resultatLot =
            await supabaseClient
                .from(
                    TABLE_LOTS
                )
                .select(
                    `
                    id,
                    code,
                    espece,
                    race_type,
                    nom_lot,
                    quantite_actuelle,
                    statut
                    `
                )
                .eq(
                    "id",
                    Number(lotId)
                )
                .single();


        if (resultatLot.error) {

            throw resultatLot.error;

        }


        const lot =
            resultatLot.data;


        if (!lot) {

            alert(
                "Le lot sélectionné est introuvable."
            );

            return false;

        }


        /* -----------------------------------------
           NOM DU LOT
        ----------------------------------------- */

        const nomLot =
            lot.nom_lot ||
            lot.code ||
            "Lot";


        /* -----------------------------------------
           ENREGISTREMENT SUPABASE
        ----------------------------------------- */

        const nouvelleAlimentation = {

            id:
                genererIdAlimentation(),

            date:
                date,

            lot_id:
                Number(lot.id),

            lot_nom:
                nomLot,

            produit:
                produit,

            quantite:
                quantite,

            unite:
                unite,

            notes:
                notes,

            utilisateur:
                obtenirUtilisateurAlimentation()

        };


        console.log(
            "Enregistrement alimentation :",
            nouvelleAlimentation
        );


        const resultat =
            await supabaseClient
                .from(
                    TABLE_ALIMENTATION
                )
                .insert(
                    nouvelleAlimentation
                );


        if (resultat.error) {

            throw resultat.error;

        }


        /* -----------------------------------------
           SUCCES
        ----------------------------------------- */

        alert(
            "Consommation enregistrée avec succès."
        );


        if (
            champProduit
        ) {

            champProduit.value =
                "";

        }


        if (
            champQuantite
        ) {

            champQuantite.value =
                "";

        }


        if (
            champNotes
        ) {

            champNotes.value =
                "";

        }


        await chargerAlimentation();

        await chargerStatistiquesAlimentation();


        return true;


    }
    catch (erreur) {

        console.error(
            "Erreur enregistrement alimentation :",
            erreur
        );


        alert(
            "Erreur lors de l'enregistrement de l'alimentation.\n\n" +
            (
                erreur.message ||
                erreur
            )
        );


        return false;

    }

}


/* =========================================================
   CHARGER LES ALIMENTATIONS
========================================================= */

async function chargerAlimentation() {

    const tableau =
        document.getElementById(
            "listeAlimentation"
        );


    if (!tableau) {

        return;

    }


    if (
        !verifierSupabaseAlimentation()
    ) {

        return;

    }


    try {

        const resultat =
            await supabaseClient
                .from(
                    TABLE_ALIMENTATION
                )
                .select(
                    "*"
                )
                .order(
                    "date",
                    {
                        ascending: false
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (resultat.error) {

            throw resultat.error;

        }


        const alimentation =
            resultat.data || [];


        tableau.innerHTML =
            "";


        if (
            alimentation.length === 0
        ) {

            tableau.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-muted py-4"
                    >

                        Aucune consommation enregistrée.

                    </td>

                </tr>

            `;

        }
        else {

            alimentation.forEach(
                function (item) {

                    const date =
                        echapperHTMLAlimentation(
                            item.date
                        );

                    const lot =
                        echapperHTMLAlimentation(
                            item.lot_nom
                        );

                    const produit =
                        echapperHTMLAlimentation(
                            item.produit
                        );

                    const quantite =
                        formaterNombreAlimentation(
                            item.quantite
                        );

                    const unite =
                        echapperHTMLAlimentation(
                            item.unite
                        );

                    const notes =
                        echapperHTMLAlimentation(
                            item.notes ||
                            "-"
                        );


                    tableau.innerHTML += `

                        <tr>

                            <td>
                                ${date}
                            </td>

                            <td>
                                ${lot}
                            </td>

                            <td>
                                ${produit}
                            </td>

                            <td>
                                ${quantite}
                            </td>

                            <td>
                                ${unite}
                            </td>

                            <td>
                                ${notes}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-danger"
                                    onclick="supprimerAlimentation('${item.id}')"
                                    title="Supprimer"
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                </button>

                            </td>

                        </tr>

                    `;

                }
            );

        }


        console.log(
            "Alimentations chargées depuis Supabase :",
            alimentation.length
        );


    }
    catch (erreur) {

        console.error(
            "Erreur chargement alimentation :",
            erreur
        );


        tableau.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-danger py-4"
                >

                    Impossible de charger les données.

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   STATISTIQUES
========================================================= */

async function chargerStatistiquesAlimentation() {

    if (
        !verifierSupabaseAlimentation()
    ) {

        return;

    }


    try {

        const resultat =
            await supabaseClient
                .from(
                    TABLE_ALIMENTATION
                )
                .select(
                    "date, lot_id, quantite"
                );


        if (resultat.error) {

            throw resultat.error;

        }


        const alimentation =
            resultat.data || [];


        const aujourdHui =
            obtenirDateAujourdHuiAlimentation();


        const moisActuel =
            aujourdHui.substring(
                0,
                7
            );


        let consommationJour =
            0;


        let consommationMois =
            0;


        let consommationTotale =
            0;


        const lots =
            new Set();


        alimentation.forEach(
            function (item) {

                const quantite =
                    Number(
                        item.quantite
                    ) || 0;


                consommationTotale +=
                    quantite;


                if (
                    item.lot_id !== null &&
                    item.lot_id !== undefined
                ) {

                    lots.add(
                        String(
                            item.lot_id
                        )
                    );

                }


                if (
                    item.date ===
                    aujourdHui
                ) {

                    consommationJour +=
                        quantite;

                }


                if (
                    String(
                        item.date || ""
                    ).substring(
                        0,
                        7
                    ) ===
                    moisActuel
                ) {

                    consommationMois +=
                        quantite;

                }

            }
        );


        const elementJour =
            document.getElementById(
                "alimentJour"
            );


        const elementMois =
            document.getElementById(
                "alimentMois"
            );


        const elementTotal =
            document.getElementById(
                "alimentTotal"
            );


        const elementLots =
            document.getElementById(
                "lotsNourris"
            );


        if (elementJour) {

            elementJour.textContent =
                formaterNombreAlimentation(
                    consommationJour
                );

        }


        if (elementMois) {

            elementMois.textContent =
                formaterNombreAlimentation(
                    consommationMois
                );

        }


        if (elementTotal) {

            elementTotal.textContent =
                formaterNombreAlimentation(
                    consommationTotale
                );

        }


        if (elementLots) {

            elementLots.textContent =
                lots.size;

        }


        console.log(
            "Statistiques alimentation actualisées."
        );


    }
    catch (erreur) {

        console.error(
            "Erreur statistiques alimentation :",
            erreur
        );

    }

}


/* =========================================================
   SUPPRIMER UNE CONSOMMATION
========================================================= */

async function supprimerAlimentation(
    id
) {

    if (
        !verifierSupabaseAlimentation()
    ) {

        return;

    }


    const confirmation =
        confirm(
            "Voulez-vous supprimer cette consommation ?"
        );


    if (!confirmation) {

        return;

    }


    try {

        const resultat =
            await supabaseClient
                .from(
                    TABLE_ALIMENTATION
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (resultat.error) {

            throw resultat.error;

        }


        alert(
            "Consommation supprimée."
        );


        await chargerAlimentation();

        await chargerStatistiquesAlimentation();


    }
    catch (erreur) {

        console.error(
            "Erreur suppression alimentation :",
            erreur
        );


        alert(
            "Impossible de supprimer cette consommation.\n\n" +
            (
                erreur.message ||
                erreur
            )
        );

    }

}


/* =========================================================
   ACTUALISATION MANUELLE
========================================================= */

async function actualiserAlimentation() {

    await chargerLotsAlimentation();

    await chargerAlimentation();

    await chargerStatistiquesAlimentation();

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "========================================"
        );

        console.log(
            "Ferme Asher ERP"
        );

        console.log(
            "Module alimentation.js"
        );

        console.log(
            "Version Supabase"
        );

        console.log(
            "========================================"
        );


        const champDate =
            document.getElementById(
                "alimentDate"
            );


        if (
            champDate &&
            !champDate.value
        ) {

            champDate.value =
                obtenirDateAujourdHuiAlimentation();

        }


        const formulaire =
            document.getElementById(
                "formAlimentation"
            );


        if (formulaire) {

            formulaire.addEventListener(
                "submit",
                enregistrerAlimentation
            );

        }


        await chargerLotsAlimentation();

        await chargerAlimentation();

        await chargerStatistiquesAlimentation();


        console.log(
            "✓ alimentation.js connecté à Supabase."
        );

    }
);


/* =========================================================
   EXPORTS GLOBAUX
========================================================= */

window.chargerLotsAlimentation =
    chargerLotsAlimentation;


window.enregistrerAlimentation =
    enregistrerAlimentation;


window.chargerAlimentation =
    chargerAlimentation;


window.chargerStatistiquesAlimentation =
    chargerStatistiquesAlimentation;


window.supprimerAlimentation =
    supprimerAlimentation;


window.actualiserAlimentation =
    actualiserAlimentation;


window.formaterNombreAlimentation =
    formaterNombreAlimentation;


console.log(
    "✓ Ferme Asher ERP — alimentation.js prêt."
);
