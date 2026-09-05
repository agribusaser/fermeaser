/* =========================================================
   FERME ASHER ERP
   PRODUCTION ÉLEVAGE - SUPABASE
   ========================================================= */

"use strict";

console.log("Production.js Supabase chargé.");


/* =========================================================
   VARIABLES
========================================================= */

let productionsCache = [];
let lotsProductionCache = [];


/* =========================================================
   UTILITAIRES
========================================================= */

function genererIdProduction() {

    return (
        "PROD-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );

}


function obtenirUtilisateurProduction() {

    return (
        localStorage.getItem("utilisateur") ||
        localStorage.getItem("utilisateurConnecte") ||
        "Administrateur"
    );

}


function formaterNombreProduction(nombre) {

    return Number(nombre || 0).toLocaleString("fr-FR", {
        maximumFractionDigits: 2
    });

}


function formaterDateProduction(date) {

    if (!date) return "-";

    const d = new Date(date + "T00:00:00");

    if (isNaN(d.getTime())) {
        return date;
    }

    return d.toLocaleDateString("fr-FR");

}


/* =========================================================
   VÉRIFIER SUPABASE
========================================================= */

function verifierSupabaseProduction() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient est introuvable."
        );

        alert(
            "Erreur : Supabase n'est pas correctement chargé."
        );

        return false;

    }

    return true;

}


/* =========================================================
   CHARGER LES LOTS DEPUIS SUPABASE
========================================================= */

async function chargerLotsProduction() {

    const select =
        document.getElementById(
            "productionLot"
        );

    if (!select) return;


    if (!verifierSupabaseProduction()) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Chargement des lots...
        </option>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("lots_elevage")
        .select(`
            id,
            code,
            espece,
            race_type,
            nom_lot,
            quantite_initiale,
            quantite_actuelle,
            statut
        `)
        .order("id", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erreur chargement lots :",
            error
        );

        select.innerHTML = `
            <option value="">
                Erreur de chargement des lots
            </option>
        `;

        return;

    }


    lotsProductionCache =
        data || [];


    select.innerHTML = `
        <option value="">
            Sélectionner un lot
        </option>
    `;


    const lotsActifs =
        lotsProductionCache.filter(
            function (lot) {

                return (
                    lot.statut === "Actif" ||
                    !lot.statut
                );

            }
        );


    if (lotsActifs.length === 0) {

        select.innerHTML = `
            <option value="">
                Aucun lot disponible
            </option>
        `;

        return;

    }


    lotsActifs.forEach(
        function (lot) {

            const quantite =
                Number(
                    lot.quantite_actuelle ??
                    lot.quantite_initiale ??
                    0
                );


            const nom =
                lot.nom_lot ||
                lot.code ||
                "Lot sans nom";


            const espece =
                lot.espece ||
                "";


            const race =
                lot.race_type ||
                "";


            select.innerHTML += `
                <option
                    value="${lot.id}"
                    data-nom="${nom}"
                    data-espece="${espece}"
                    data-race="${race}">

                    ${nom}
                    — ${espece}
                    ${race ? " | " + race : ""}
                    (${formaterNombreProduction(quantite)} animaux)

                </option>
            `;

        }
    );

}


/* =========================================================
   RÉCUPÉRER UN LOT PAR ID
========================================================= */

async function obtenirLotProduction(lotId) {

    if (!verifierSupabaseProduction()) {
        return null;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("lots_elevage")
        .select(`
            id,
            code,
            espece,
            race_type,
            nom_lot,
            quantite_initiale,
            quantite_actuelle,
            statut
        `)
        .eq("id", lotId)
        .maybeSingle();


    if (error) {

        console.error(
            "Erreur récupération lot :",
            error
        );

        return null;

    }


    return data;

}


/* =========================================================
   CALCUL DE LA RÉPARTITION
========================================================= */

function calculerResteProduction(
    quantite,
    incubation,
    vente,
    consommation,
    autre
) {

    const total =
        Number(quantite || 0);


    const affecte =
        Number(incubation || 0) +
        Number(vente || 0) +
        Number(consommation || 0) +
        Number(autre || 0);


    return Math.max(
        0,
        total - affecte
    );

}


/* =========================================================
   AFFICHER LE CALCUL AUTOMATIQUE
========================================================= */

function actualiserRepartitionProduction() {

    const quantite =
        Number(
            document.getElementById(
                "productionQuantite"
            )?.value
        ) || 0;


    const incubation =
        Number(
            document.getElementById(
                "productionIncubation"
            )?.value
        ) || 0;


    const vente =
        Number(
            document.getElementById(
                "productionVente"
            )?.value
        ) || 0;


    const consommation =
        Number(
            document.getElementById(
                "productionConsommation"
            )?.value
        ) || 0;


    const autre =
        Number(
            document.getElementById(
                "productionAutre"
            )?.value
        ) || 0;


    const totalAffecte =
        incubation +
        vente +
        consommation +
        autre;


    const reste =
        calculerResteProduction(
            quantite,
            incubation,
            vente,
            consommation,
            autre
        );


    const elementTotal =
        document.getElementById(
            "totalRepartition"
        );


    const elementReste =
        document.getElementById(
            "resteProduction"
        );


    if (elementTotal) {

        elementTotal.textContent =
            formaterNombreProduction(
                totalAffecte
            );

    }


    if (elementReste) {

        elementReste.textContent =
            formaterNombreProduction(
                reste
            );

    }


    const message =
        document.getElementById(
            "messageRepartition"
        );


    if (message) {

        if (totalAffecte > quantite) {

            message.className =
                "alert alert-danger mt-3";

            message.innerHTML =
                "⚠️ La répartition dépasse la production totale.";

        } else {

            message.className =
                "alert alert-success mt-3";

            message.innerHTML =
                "✓ Répartition correcte.";

        }

    }

}


/* =========================================================
   ENREGISTRER UNE PRODUCTION
========================================================= */

async function enregistrerProduction(event) {

    if (event) {
        event.preventDefault();
    }


    if (!verifierSupabaseProduction()) {
        return false;
    }


    const date =
        document.getElementById(
            "productionDate"
        )?.value ||
        new Date().toISOString().split("T")[0];


    const lotId =
        document.getElementById(
            "productionLot"
        )?.value;


    const type =
        document.getElementById(
            "productionType"
        )?.value ||
        "";


    const produit =
        document.getElementById(
            "productionProduit"
        )?.value.trim() ||
        "";


    const quantite =
        Number(
            document.getElementById(
                "productionQuantite"
            )?.value
        );


    const unite =
        document.getElementById(
            "productionUnite"
        )?.value ||
        "Unité";


    const incubation =
        Number(
            document.getElementById(
                "productionIncubation"
            )?.value
        ) || 0;


    const vente =
        Number(
            document.getElementById(
                "productionVente"
            )?.value
        ) || 0;


    const consommation =
        Number(
            document.getElementById(
                "productionConsommation"
            )?.value
        ) || 0;


    const autre =
        Number(
            document.getElementById(
                "productionAutre"
            )?.value
        ) || 0;


    const notes =
        document.getElementById(
            "productionNotes"
        )?.value.trim() ||
        "";


/* =====================================================
   VALIDATIONS
===================================================== */

    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot producteur."
        );

        return false;

    }


    if (!type) {

        alert(
            "Veuillez sélectionner le type de production."
        );

        return false;

    }


    if (!produit) {

        alert(
            "Veuillez indiquer le produit."
        );

        return false;

    }


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité produite doit être supérieure à zéro."
        );

        return false;

    }


    if (
        incubation < 0 ||
        vente < 0 ||
        consommation < 0 ||
        autre < 0
    ) {

        alert(
            "Les quantités de répartition ne peuvent pas être négatives."
        );

        return false;

    }


    const totalRepartition =
        incubation +
        vente +
        consommation +
        autre;


    if (
        totalRepartition >
        quantite
    ) {

        alert(
            "Erreur : la répartition dépasse la quantité totale produite."
        );

        return false;

    }


    const reste =
        quantite -
        totalRepartition;


/* =====================================================
   RÉCUPÉRER LE LOT
===================================================== */

    const lot =
        await obtenirLotProduction(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot sélectionné est introuvable dans Supabase."
        );

        return false;

    }


/* =====================================================
   INFORMATIONS DU LOT
===================================================== */

    const lotNom =
        lot.nom_lot ||
        lot.code ||
        "";


    const espece =
        lot.espece ||
        "";


/* =====================================================
   CRÉER L'ENREGISTREMENT SUPABASE
===================================================== */

    const nouvelleProduction = {

        id:
            genererIdProduction(),

        date:
            date,

        lot_id:
            lot.id,

        lot_nom:
            lotNom,

        espece:
            espece,

        type:
            type,

        produit:
            produit,

        quantite:
            quantite,

        unite:
            unite,

        incubation:
            incubation,

        vente:
            vente,

        consommation:
            consommation,

        autre:
            autre,

        reste:
            reste,

        notes:
            notes,

        utilisateur:
            obtenirUtilisateurProduction()

    };


    console.log(
        "Production à enregistrer :",
        nouvelleProduction
    );


/* =====================================================
   INSERTION SUPABASE
===================================================== */

    const {
        data,
        error
    } = await supabaseClient
        .from("productions_elevage")
        .insert(
            nouvelleProduction
        )
        .select()
        .single();


    if (error) {

        console.error(
            "Erreur Supabase production :",
            error
        );

        alert(
            "Erreur lors de l'enregistrement :\n\n" +
            error.message
        );

        return false;

    }


/* =====================================================
   SUCCÈS
===================================================== */

    console.log(
        "Production enregistrée :",
        data
    );


    const formulaire =
        document.getElementById(
            "formProduction"
        );


    if (formulaire) {
        formulaire.reset();
    }


    const dateElement =
        document.getElementById(
            "productionDate"
        );


    if (dateElement) {

        dateElement.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    actualiserRepartitionProduction();


    const modalElement =
        document.getElementById(
            "modalProduction"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );

        if (modal) {
            modal.hide();
        }

    }


    await chargerProductions();


    alert(
        "Production enregistrée avec succès.\n\n" +
        "Lot : " +
        lotNom +
        "\nProduction : " +
        formaterNombreProduction(
            quantite
        ) +
        " " +
        unite +
        "\nDestinés à l'incubation : " +
        formaterNombreProduction(
            incubation
        )
    );


    return true;

}


/* =========================================================
   CHARGER LES PRODUCTIONS DEPUIS SUPABASE
========================================================= */

async function chargerProductions() {

    const tableau =
        document.getElementById(
            "listeProductions"
        );


    if (!tableau) return;


    if (!verifierSupabaseProduction()) {
        return;
    }


    tableau.innerHTML = `
        <tr>
            <td colspan="10"
                class="text-center text-muted py-4">
                Chargement...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("productions_elevage")
        .select(`
            id,
            date,
            lot_id,
            lot_nom,
            espece,
            type,
            produit,
            quantite,
            unite,
            incubation,
            vente,
            consommation,
            autre,
            reste,
            notes,
            utilisateur,
            created_at
        `)
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


    if (error) {

        console.error(
            "Erreur chargement productions :",
            error
        );

        tableau.innerHTML = `
            <tr>
                <td colspan="10"
                    class="text-center text-danger py-4">
                    Erreur de connexion à Supabase.
                </td>
            </tr>
        `;

        return;

    }


    productionsCache =
        data || [];


    afficherProductions(
        productionsCache
    );


    afficherStatistiquesProduction(
        productionsCache
    );

}


/* =========================================================
   AFFICHER LES PRODUCTIONS
========================================================= */

function afficherProductions(
    productions
) {

    const tableau =
        document.getElementById(
            "listeProductions"
        );


    if (!tableau) return;


    tableau.innerHTML = "";


    if (!productions.length) {

        tableau.innerHTML = `
            <tr>
                <td colspan="10"
                    class="text-center text-muted py-4">

                    Aucune production enregistrée.

                </td>
            </tr>
        `;

        return;

    }


    productions.forEach(
        function (production) {

            tableau.innerHTML += `

                <tr>

                    <td>
                        ${formaterDateProduction(
                            production.date
                        )}
                    </td>

                    <td>
                        <strong>
                            ${production.lot_nom || "-"}
                        </strong>
                    </td>

                    <td>
                        ${production.espece || "-"}
                    </td>

                    <td>
                        ${production.type || "-"}
                    </td>

                    <td>
                        ${production.produit || "-"}
                    </td>

                    <td>
                        ${formaterNombreProduction(
                            production.quantite
                        )}
                    </td>

                    <td>
                        ${production.unite || "-"}
                    </td>

                    <td>
                        ${formaterNombreProduction(
                            production.incubation
                        )}
                    </td>

                    <td>
                        ${formaterNombreProduction(
                            production.vente
                        )}
                    </td>

                    <td>
                        ${formaterNombreProduction(
                            production.reste
                        )}
                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   STATISTIQUES
========================================================= */

function afficherStatistiquesProduction(
    productions
) {

    const maintenant =
        new Date();


    const aujourdHui =
        maintenant
            .toISOString()
            .split("T")[0];


    const mois =
        maintenant.getMonth();


    const annee =
        maintenant.getFullYear();


    const productionJour =
        productions
            .filter(
                function (production) {

                    return (
                        production.date ===
                        aujourdHui
                    );

                }
            )
            .reduce(
                function (total, production) {

                    return (
                        total +
                        Number(
                            production.quantite || 0
                        )
                    );

                },
                0
            );


    const productionMois =
        productions
            .filter(
                function (production) {

                    if (!production.date) {
                        return false;
                    }


                    const d =
                        new Date(
                            production.date +
                            "T00:00:00"
                        );


                    return (
                        d.getMonth() === mois &&
                        d.getFullYear() === annee
                    );

                }
            )
            .reduce(
                function (total, production) {

                    return (
                        total +
                        Number(
                            production.quantite || 0
                        )
                    );

                },
                0
            );


    const productionTotale =
        productions.reduce(
            function (total, production) {

                return (
                    total +
                    Number(
                        production.quantite || 0
                    )
                );

            },
            0
        );


    const lotsProductifs =
        new Set(
            productions
                .map(
                    function (production) {
                        return String(
                            production.lot_id
                        );
                    }
                )
        ).size;


    const elementJour =
        document.getElementById(
            "productionAujourdhui"
        );


    const elementMois =
        document.getElementById(
            "productionMois"
        );


    const elementTotal =
        document.getElementById(
            "productionTotale"
        );


    const elementLots =
        document.getElementById(
            "lotsProductifs"
        );


    if (elementJour) {

        elementJour.textContent =
            formaterNombreProduction(
                productionJour
            );

    }


    if (elementMois) {

        elementMois.textContent =
            formaterNombreProduction(
                productionMois
            );

    }


    if (elementTotal) {

        elementTotal.textContent =
            formaterNombreProduction(
                productionTotale
            );

    }


    if (elementLots) {

        elementLots.textContent =
            lotsProductifs;

    }

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const date =
            document.getElementById(
                "productionDate"
            );


        if (date) {

            date.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }


        await chargerLotsProduction();


        await chargerProductions();


        const champsRepartition = [

            "productionQuantite",

            "productionIncubation",

            "productionVente",

            "productionConsommation",

            "productionAutre"

        ];


        champsRepartition.forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.addEventListener(
                        "input",
                        actualiserRepartitionProduction
                    );

                }

            }
        );


        actualiserRepartitionProduction();

    }
);


/* =========================================================
   EXPORTS GLOBAUX
========================================================= */

window.chargerLotsProduction =
    chargerLotsProduction;

window.chargerProductions =
    chargerProductions;

window.enregistrerProduction =
    enregistrerProduction;

window.actualiserRepartitionProduction =
    actualiserRepartitionProduction;
