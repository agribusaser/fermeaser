/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : /js/incubation.js

   BASE DE DONNÉES :
       Supabase

   CHAÎNE :
       LOT ÉLEVAGE
            ↓
       PRODUCTION ŒUFS
            ↓
       INCUBATION
            ↓
       ÉCLOSION
            ↓
       POUSSINIÈRE
            ↓
       NOUVEAU LOT
============================================================ */

"use strict";


/* =========================================================
   DURÉES D'INCUBATION
========================================================= */

const DUREES_INCUBATION = {

    "Caille": 17,
    "Cailles": 17,

    "Poule": 21,
    "Poules": 21,

    "Poulet": 21,
    "Poulets": 21,

    "Canard": 28,
    "Canards": 28,

    "Pintade": 28,
    "Pintades": 28,

    "Dinde": 28,
    "Dindes": 28

};


/* =========================================================
   UTILITAIRES
========================================================= */

function incubationAujourdHui() {

    const date = new Date();

    return date.toISOString().split("T")[0];

}


function incubationAjouterJours(dateTexte, jours) {

    if (!dateTexte || !jours) {

        return "";

    }

    const date = new Date(
        `${dateTexte}T00:00:00`
    );

    date.setDate(
        date.getDate() + Number(jours)
    );

    return date.toISOString().split("T")[0];

}


function incubationFormaterDate(date) {

    if (!date) {

        return "-";

    }

    const parties =
        String(date).split("-");

    if (parties.length !== 3) {

        return date;

    }

    return `${parties[2]}/${parties[1]}/${parties[0]}`;

}


function incubationGenererId() {

    return (
        "INC-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


function incubationEchapperHTML(valeur) {

    return String(valeur ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   VÉRIFICATION SUPABASE
========================================================= */

function verifierSupabaseIncubation() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "supabaseClient est introuvable."
        );

        alert(
            "Erreur : Supabase n'est pas chargé."
        );

        return false;

    }

    return true;

}


/* =========================================================
   CHARGER LES LOTS DEPUIS SUPABASE
========================================================= */

async function chargerLotsIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );

    if (!select) {

        return;

    }

    select.innerHTML = `
        <option value="">
            Chargement des lots...
        </option>
    `;


    if (!verifierSupabaseIncubation()) {

        return;

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
            quantite_actuelle,
            statut
        `)

        .order(
            "nom_lot",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Erreur chargement lots :",
            error
        );

        select.innerHTML = `
            <option value="">
                Erreur de chargement
            </option>
        `;

        return;

    }


    const lots =
        Array.isArray(data)
            ? data
            : [];


    select.innerHTML = `
        <option value="">
            Sélectionner le lot d'origine
        </option>
    `;


    if (lots.length === 0) {

        select.innerHTML += `
            <option value="">
                Aucun lot disponible
            </option>
        `;

        return;

    }


    lots.forEach(function (lot) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            lot.id;


        const nom =
            lot.nom_lot ||
            lot.code ||
            `Lot ${lot.id}`;


        const espece =
            lot.espece ||
            "";


        const race =
            lot.race_type ||
            "";


        const quantite =
            Number(
                lot.quantite_actuelle || 0
            );


        option.textContent =
            `${nom} — ${espece}` +
            (
                race
                    ? ` — ${race}`
                    : ""
            ) +
            ` — ${quantite} animaux`;


        option.dataset.espece =
            espece;


        option.dataset.race =
            race;


        option.dataset.nom =
            nom;


        select.appendChild(
            option
        );

    });


}


/* =========================================================
   CHARGER L'ESPÈCE À PARTIR DU LOT
========================================================= */

function actualiserEspeceIncubation() {

    const selectLot =
        document.getElementById(
            "incubationLot"
        );

    const champEspece =
        document.getElementById(
            "incubationEspece"
        );


    if (
        !selectLot ||
        !champEspece
    ) {

        return;

    }


    const option =
        selectLot.options[
            selectLot.selectedIndex
        ];


    if (!option) {

        return;

    }


    champEspece.value =
        option.dataset.espece ||
        "";

}


/* =========================================================
   CHARGER LA DURÉE AUTOMATIQUEMENT
========================================================= */

function chargerDureeIncubation() {

    const champEspece =
        document.getElementById(
            "incubationEspece"
        );

    const champDuree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !champEspece ||
        !champDuree
    ) {

        return;

    }


    const espece =
        champEspece.value;


    const duree =
        DUREES_INCUBATION[
            espece
        ] || "";


    if (duree) {

        champDuree.value =
            duree;

    }


    afficherDateEclosionIncubation();

}


/* =========================================================
   DATE D'ÉCLOSION
========================================================= */

function afficherDateEclosionIncubation() {

    const champDate =
        document.getElementById(
            "incubationDate"
        );

    const champDuree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !champDate ||
        !champDuree
    ) {

        return;

    }


    const date =
        champDate.value;


    const duree =
        Number(
            champDuree.value
        );


    const dateEclosion =
        incubationAjouterJours(
            date,
            duree
        );


    let affichage =
        document.getElementById(
            "dateEclosionIncubation"
        );


    if (!affichage) {

        return;

    }


    affichage.textContent =
        dateEclosion
            ? incubationFormaterDate(
                dateEclosion
              )
            : "-";

}


/* =========================================================
   OUVRIR LE MODAL
========================================================= */

async function ouvrirModalIncubation() {

    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (!modal) {

        console.error(
            "modalIncubation introuvable."
        );

        return;

    }


    const champDate =
        document.getElementById(
            "incubationDate"
        );


    if (
        champDate &&
        !champDate.value
    ) {

        champDate.value =
            incubationAujourdHui();

    }


    await chargerLotsIncubation();

    chargerDureeIncubation();


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                );

        instance.show();

    }

}


/* =========================================================
   FERMER LE MODAL
========================================================= */

function fermerModalIncubation() {

    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (!modal) {

        return;

    }


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal
                .getInstance(
                    modal
                );


        if (instance) {

            instance.hide();

            return;

        }

    }


    modal.style.display =
        "none";

}


/* =========================================================
   ENREGISTRER UNE INCUBATION
========================================================= */

async function enregistrerIncubation(event) {

    if (event) {

        event.preventDefault();

    }


    if (
        !verifierSupabaseIncubation()
    ) {

        return false;

    }


    const champLot =
        document.getElementById(
            "incubationLot"
        );

    const champEspece =
        document.getElementById(
            "incubationEspece"
        );

    const champCouveuse =
        document.getElementById(
            "incubationCouveuse"
        );

    const champOeufs =
        document.getElementById(
            "incubationOeufs"
        );

    const champDate =
        document.getElementById(
            "incubationDate"
        );

    const champDuree =
        document.getElementById(
            "incubationDuree"
        );

    const champNotes =
        document.getElementById(
            "incubationNotes"
        );


    const lotId =
        champLot?.value;


    const espece =
        champEspece?.value ||
        "";


    const couveuse =
        champCouveuse?.value ||
        "";


    const oeufs =
        Number(
            champOeufs?.value
        );


    const dateEntree =
        champDate?.value ||
        "";


    const duree =
        Number(
            champDuree?.value
        );


    const notes =
        champNotes?.value ||
        "";


    /* -----------------------------------------------------
       VALIDATIONS
    ----------------------------------------------------- */

    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot d'origine."
        );

        return false;

    }


    if (!espece) {

        alert(
            "L'espèce est obligatoire."
        );

        return false;

    }


    if (!couveuse) {

        alert(
            "Veuillez sélectionner la couveuse."
        );

        return false;

    }


    if (
        !Number.isFinite(oeufs) ||
        oeufs <= 0
    ) {

        alert(
            "Le nombre d'œufs doit être supérieur à zéro."
        );

        return false;

    }


    if (!dateEntree) {

        alert(
            "Veuillez sélectionner la date d'entrée."
        );

        return false;

    }


    if (
        !Number.isFinite(duree) ||
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est incorrecte."
        );

        return false;

    }


    /* -----------------------------------------------------
       RÉCUPÉRER LE LOT
    ----------------------------------------------------- */

    const {
        data: lot,
        error: erreurLot
    } = await supabaseClient

        .from("lots_elevage")

        .select(`
            id,
            code,
            espece,
            race_type,
            nom_lot,
            quantite_actuelle
        `)

        .eq(
            "id",
            lotId
        )

        .single();


    if (erreurLot || !lot) {

        console.error(
            "Lot introuvable :",
            erreurLot
        );

        alert(
            "Impossible de retrouver le lot d'origine."
        );

        return false;

    }


    /* -----------------------------------------------------
       NOM DU LOT
    ----------------------------------------------------- */

    const lotNom =
        lot.nom_lot ||
        lot.code ||
        `Lot ${lot.id}`;


    const race =
        lot.race_type ||
        "";


    /* -----------------------------------------------------
       DATE D'ÉCLOSION
    ----------------------------------------------------- */

    const dateEclosion =
        incubationAjouterJours(
            dateEntree,
            duree
        );


    /* -----------------------------------------------------
       ID
    ----------------------------------------------------- */

    const id =
        incubationGenererId();


    /* -----------------------------------------------------
       DONNÉES SUPABASE
    ----------------------------------------------------- */

    const nouvelleIncubation = {

        id:

            id,

        lot_id:

            lot.id,

        lot_nom:

            lotNom,

        espece:

            espece,

        race:

            race,

        couveuse:

            couveuse,

        oeufs_initial:

            oeufs,

        oeufs:

            oeufs,

        oeufs_retire:

            0,

        oeufs_non_fecondes:

            0,

        embryons_morts:

            0,

        poussins_eclos:

            0,

        date_entree:

            dateEntree,

        duree:

            duree,

        date_eclosion:

            dateEclosion,

        statut:

            "En incubation",

        brooder_cree:

            false,

        poussiniere_creee:

            false,

        date_creation:

            new Date().toISOString(),

        notes:

            notes

    };


    /* -----------------------------------------------------
       INSERTION SUPABASE
    ----------------------------------------------------- */

    const {
        data,
        error
    } = await supabaseClient

        .from("incubations")

        .insert(
            nouvelleIncubation
        )

        .select();


    if (error) {

        console.error(
            "Erreur insertion incubation :",
            error
        );

        alert(
            "Erreur Supabase lors de l'enregistrement.\n\n" +
            error.message
        );

        return false;

    }


    console.log(
        "Incubation enregistrée :",
        data
    );


    /* -----------------------------------------------------
       RESET
    ----------------------------------------------------- */

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    /* -----------------------------------------------------
       FERMER MODAL
    ----------------------------------------------------- */

    fermerModalIncubation();


    /* -----------------------------------------------------
       ACTUALISER
    ----------------------------------------------------- */

    await chargerIncubations();

    actualiserStatistiquesIncubation();


    alert(
        "Incubation enregistrée avec succès.\n\n" +

        "Lot : " +
        lotNom +

        "\nEspèce : " +
        espece +

        "\nŒufs : " +
        oeufs +

        "\nÉclosion prévue : " +
        incubationFormaterDate(
            dateEclosion
        )
    );


    return true;

}


/* =========================================================
   CHARGER LES INCUBATIONS
========================================================= */

async function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        );


    if (!tableau) {

        return;

    }


    if (
        !verifierSupabaseIncubation()
    ) {

        return;

    }


    tableau.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="text-center text-muted">

                Chargement...

            </td>

        </tr>

    `;


    const {
        data,
        error
    } = await supabaseClient

        .from("incubations")

        .select("*")

        .order(
            "date_entree",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Erreur chargement incubations :",
            error
        );

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-danger">

                    Erreur de chargement des incubations.

                </td>

            </tr>

        `;

        return;

    }


    const incubations =
        Array.isArray(data)
            ? data
            : [];


    tableau.innerHTML =
        "";


    if (
        incubations.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted">

                    Aucune incubation enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    incubations.forEach(
        function (incubation) {

            const statut =
                incubation.statut ||
                "En incubation";


            let classe =
                "bg-success";


            if (
                statut === "Éclos" ||
                statut === "Terminée"
            ) {

                classe =
                    "bg-secondary";

            }


            if (
                statut === "Éclosion"
            ) {

                classe =
                    "bg-warning text-dark";

            }


            if (
                statut === "Annulée"
            ) {

                classe =
                    "bg-danger";

            }


            const id =
                incubation.id ||
                "-";


            const espece =
                incubation.espece ||
                "-";


            const lot =
                incubation.lot_nom ||
                incubation.lot ||
                "-";


            const couveuse =
                incubation.couveuse ||
                "-";


            const oeufs =
                incubation.oeufs_initial ??
                incubation.oeufs ??
                0;


            const dateEntree =
                incubation.date_entree ||
                incubation.date ||
                "";


            const dateEclosion =
                incubation.date_eclosion ||
                incubation.date_eclosion_prevue ||
                "";


            const ligne =
                document.createElement(
                    "tr"
                );


            ligne.innerHTML = `

                <td>
                    ${incubationEchapperHTML(id)}
                </td>

                <td>
                    ${incubationEchapperHTML(espece)}
                </td>

                <td>
                    ${incubationEchapperHTML(lot)}
                </td>

                <td>
                    ${incubationEchapperHTML(couveuse)}
                </td>

                <td>
                    ${Number(oeufs).toLocaleString("fr-FR")}
                </td>

                <td>
                    ${incubationFormaterDate(dateEntree)}
                </td>

                <td>
                    ${incubationFormaterDate(dateEclosion)}
                </td>

                <td>

                    <span
                        class="badge ${classe}">

                        ${incubationEchapperHTML(statut)}

                    </span>

                </td>

                <td
                    class="text-center">

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="ouvrirSuiviIncubation('${incubationEchapperHTML(id)}')">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            tableau.appendChild(
                ligne
            );

        }
    );

}


/* =========================================================
   STATISTIQUES
========================================================= */

async function actualiserStatistiquesIncubation() {

    if (
        !verifierSupabaseIncubation()
    ) {

        return;

    }


    const {
        data,
        error
    } = await supabaseClient

        .from("incubations")

        .select(`
            id,
            statut,
            oeufs_initial,
            oeufs,
            poussins_eclos
        `);


    if (error) {

        console.error(
            "Erreur statistiques incubation :",
            error
        );

        return;

    }


    const incubations =
        Array.isArray(data)
            ? data
            : [];


    const total =
        incubations.length;


    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        ).length;


    const ecloses =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "Éclos"
                );

            }
        ).length;


    const totalOeufs =
        incubations.reduce(
            function (
                somme,
                item
            ) {

                return (
                    somme +
                    Number(
                        item.oeufs_initial ??
                        item.oeufs ??
                        0
                    )
                );

            },
            0
        );


    const totalPoussins =
        incubations.reduce(
            function (
                somme,
                item
            ) {

                return (
                    somme +
                    Number(
                        item.poussins_eclos ||
                        0
                    )
                );

            },
            0
        );


    const statistiques = {

        totalIncubations:
            total,

        incubationsActives:
            actives,

        incubationsEcloses:
            ecloses,

        totalOeufsIncubes:
            totalOeufs,

        poussinsEclos:
            totalPoussins

    };


    Object.keys(
        statistiques
    ).forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    Number(
                        statistiques[id]
                    ).toLocaleString(
                        "fr-FR"
                    );

            }

        }
    );

}


/* =========================================================
   SUIVI D'UNE INCUBATION
========================================================= */

async function ouvrirSuiviIncubation(id) {

    console.log(
        "Suivi incubation :",
        id
    );


    if (
        !verifierSupabaseIncubation()
    ) {

        return;

    }


    const {
        data,
        error
    } = await supabaseClient

        .from("incubations")

        .select("*")

        .eq(
            "id",
            id
        )

        .single();


    if (error || !data) {

        console.error(
            error
        );

        alert(
            "Incubation introuvable."
        );

        return;

    }


    alert(

        "INCUBATION\n\n" +

        "ID : " +
        (data.id || "-") +

        "\nLot : " +
        (data.lot_nom || "-") +

        "\nEspèce : " +
        (data.espece || "-") +

        "\nŒufs : " +
        (
            data.oeufs_initial ??
            data.oeufs ??
            0
        ) +

        "\nCouveuse : " +
        (data.couveuse || "-") +

        "\nÉclosion prévue : " +
        incubationFormaterDate(
            data.date_eclosion
        ) +

        "\nStatut : " +
        (data.statut || "-") +

        "\nPoussins éclos : " +
        (
            data.poussins_eclos ||
            0
        )

    );

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "✓ Module Incubation Ferme Asher chargé."
        );


        const champDate =
            document.getElementById(
                "incubationDate"
            );


        if (
            champDate &&
            !champDate.value
        ) {

            champDate.value =
                incubationAujourdHui();

        }


        const selectLot =
            document.getElementById(
                "incubationLot"
            );


        if (selectLot) {

            selectLot.addEventListener(
                "change",
                function () {

                    actualiserEspeceIncubation();

                    chargerDureeIncubation();

                }
            );

        }


        const champEspece =
            document.getElementById(
                "incubationEspece"
            );


        if (champEspece) {

            champEspece.addEventListener(
                "change",
                chargerDureeIncubation
            );

        }


        if (champDate) {

            champDate.addEventListener(
                "change",
                afficherDateEclosionIncubation
            );

        }


        const champDuree =
            document.getElementById(
                "incubationDuree"
            );


        if (champDuree) {

            champDuree.addEventListener(
                "input",
                afficherDateEclosionIncubation
            );

        }


        const formulaire =
            document.getElementById(
                "formIncubation"
            );


        if (formulaire) {

            formulaire.addEventListener(
                "submit",
                enregistrerIncubation
            );

        }


        await chargerLotsIncubation();

        await chargerIncubations();

        await actualiserStatistiquesIncubation();

    }
);
