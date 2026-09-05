/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : /js/incubation.js

   Chaîne de traçabilité :

   ANIMAUX & LOTS
          ↓
   PRODUCTION D'ŒUFS
          ↓
   INCUBATION
          ↓
   ÉCLOSION
          ↓
   POUSSINIÈRE
          ↓
   NOUVEAU LOT

   Version propre Supabase
============================================================ */

"use strict";


/* ============================================================
   TABLES SUPABASE
============================================================ */

const TABLE_LOTS_INCUBATION =
    "lots_elevage";

const TABLE_PRODUCTIONS_INCUBATION =
    "productions_elevage";

const TABLE_INCUBATIONS =
    "incubations";


/* ============================================================
   DURÉES D'INCUBATION
============================================================ */

const DUREES_INCUBATION = {

    "Caille": 17,
    "Cailles": 17,

    "Poulet": 21,
    "Poulets": 21,

    "Poule": 21,
    "Poules": 21,

    "Canard": 28,
    "Canards": 28,

    "Pintade": 28,
    "Pintades": 28,

    "Dinde": 28,
    "Dindes": 28

};


/* ============================================================
   CAPACITÉS CONNUES DES COUVEUSES
============================================================ */

const CAPACITES_COUVEUSES = {

    "Couveuse 1056 œufs": 1056,
    "Couveuse 1056 oeufs": 1056,

    "Couveuse 01": 1056,
    "Couveuse 02": 1056

};


/* ============================================================
   VÉRIFIER SUPABASE
============================================================ */

function incubationSupabaseDisponible() {

    return (
        typeof supabaseClient !==
        "undefined"
        &&
        supabaseClient !== null
    );

}


/* ============================================================
   DATE DU JOUR
   Utilise la date locale du navigateur.
============================================================ */

function incubationAujourdHui() {

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


/* ============================================================
   FORMATER UNE DATE
============================================================ */

function formaterDateIncubation(
    valeur
) {

    if (!valeur) {

        return "-";

    }


    const morceaux =
        String(valeur)
            .split("-");


    if (
        morceaux.length === 3
    ) {

        return (
            morceaux[2] +
            "/" +
            morceaux[1] +
            "/" +
            morceaux[0]
        );

    }


    return valeur;

}


/* ============================================================
   GÉNÉRER ID INCUBATION
============================================================ */

function genererIdIncubation() {

    return (
        "INC-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


/* ============================================================
   CALCULER DATE D'ÉCLOSION
============================================================ */

function calculerDateEclosionIncubation(
    dateEntree,
    duree
) {

    if (
        !dateEntree ||
        !duree
    ) {

        return null;

    }


    const morceaux =
        String(dateEntree)
            .split("-");


    if (
        morceaux.length !== 3
    ) {

        return null;

    }


    const date =
        new Date(
            Number(morceaux[0]),
            Number(morceaux[1]) - 1,
            Number(morceaux[2])
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    date.setDate(
        date.getDate() +
        Number(duree)
    );


    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            date.getDate()
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


/* ============================================================
   OBTENIR LOT
============================================================ */

async function obtenirLotIncubation(
    lotId
) {

    if (
        !incubationSupabaseDisponible()
    ) {

        return null;

    }


    if (!lotId) {

        return null;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_LOTS_INCUBATION
            )

            .select(
                "*"
            )

            .eq(
                "id",
                Number(lotId)
            )

            .maybeSingle();


    if (error) {

        console.error(
            "Erreur récupération lot :",
            error
        );

        return null;

    }


    return data || null;

}


/* ============================================================
   CHERCHER PRODUCTION LIÉE
============================================================ */

async function trouverProductionLiee(
    lotId
) {

    if (
        !incubationSupabaseDisponible()
    ) {

        return null;

    }


    if (!lotId) {

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    TABLE_PRODUCTIONS_INCUBATION
                )

                .select(
                    "*"
                )

                .eq(
                    "lot_id",
                    Number(lotId)
                )

                .order(
                    "date",
                    {
                        ascending: false
                    }
                )

                .limit(1);


        if (error) {

            console.warn(
                "Production liée introuvable :",
                error.message
            );

            return null;

        }


        if (
            data &&
            data.length > 0
        ) {

            return data[0];

        }

    }

    catch (erreur) {

        console.warn(
            "Erreur recherche production liée :",
            erreur
        );

    }


    return null;

}


/* ============================================================
   CHARGER LES LOTS POUR LE FORMULAIRE
============================================================ */

async function chargerLotsIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    if (!select) {

        return;

    }


    if (
        !incubationSupabaseDisponible()
    ) {

        select.innerHTML =

            `
            <option value="">
                Supabase non initialisé
            </option>
            `;

        return;

    }


    const especeElement =
        document.getElementById(
            "incubationEspece"
        );


    const espece =
        especeElement
            ? especeElement.value.trim()
            : "";


    select.innerHTML =

        `
        <option value="">
            Chargement des lots...
        </option>
        `;


    let requete =
        supabaseClient

            .from(
                TABLE_LOTS_INCUBATION
            )

            .select(
                "id, code, espece, race_type, nom_lot, date_entree, quantite_initiale, quantite_actuelle, origine, statut"
            )

            .order(
                "date_entree",
                {
                    ascending: false
                }
            );


    if (espece) {

        requete =
            requete.eq(
                "espece",
                espece
            );

    }


    const {
        data,
        error
    } =
        await requete;


    if (error) {

        console.error(
            "Erreur chargement lots :",
            error
        );


        select.innerHTML =

            `
            <option value="">
                Erreur de chargement
            </option>
            `;

        return;

    }


    select.innerHTML =

        `
        <option value="">
            Sélectionner un lot
        </option>
        `;


    if (
        !data ||
        data.length === 0
    ) {

        select.innerHTML +=

            `
            <option value="">
                Aucun lot disponible
            </option>
            `;

        afficherInformationsLotOrigine();

        return;

    }


    data.forEach(
        function (lot) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lot.id;


            const nom =
                lot.nom_lot ||
                lot.code ||
                ("Lot #" + lot.id);


            const race =
                lot.race_type
                    ? " — " + lot.race_type
                    : "";


            const quantite =
                Number(
                    lot.quantite_actuelle ??
                    lot.quantite_initiale ??
                    0
                );


            option.textContent =
                nom +
                race +
                " — " +
                quantite +
                " animaux";


            select.appendChild(
                option
            );

        }
    );


    afficherInformationsLotOrigine();

}


/* ============================================================
   AFFICHER INFORMATIONS LOT D'ORIGINE
============================================================ */

async function afficherInformationsLotOrigine() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    const zone =
        document.getElementById(
            "informationsLotOrigine"
        );


    if (!select) {

        return;

    }


    if (!zone) {

        return;

    }


    const lotId =
        select.value;


    if (!lotId) {

        zone.innerHTML = "";

        return;

    }


    const lot =
        await obtenirLotIncubation(
            lotId
        );


    if (!lot) {

        zone.innerHTML =

            `
            <div class="alert alert-warning py-2">
                Lot introuvable.
            </div>
            `;

        return;

    }


    const quantite =
        Number(
            lot.quantite_actuelle ??
            lot.quantite_initiale ??
            0
        );


    zone.innerHTML =

        `
        <div class="alert alert-info py-2 mb-0">

            <strong>
                Lot d'origine :
            </strong>

            ${lot.nom_lot || lot.code || "-"}

            <br>

            <strong>
                Espèce :
            </strong>

            ${lot.espece || "-"}

            <br>

            <strong>
                Race :
            </strong>

            ${lot.race_type || "-"}

            <br>

            <strong>
                Animaux actuellement dans le lot :
            </strong>

            ${quantite.toLocaleString("fr-FR")}

        </div>
        `;


    await afficherStockDisponible();

}


/* ============================================================
   AFFICHER STOCK / INFORMATION ŒUFS
============================================================ */

async function afficherStockDisponible() {

    const lotSelect =
        document.getElementById(
            "incubationLot"
        );


    const zone =
        document.getElementById(
            "stockOeufsDisponible"
        );


    const message =
        document.getElementById(
            "messageStockIncubation"
        );


    if (!lotSelect) {

        return;

    }


    if (!zone) {

        return;

    }


    const lotId =
        lotSelect.value;


    if (!lotId) {

        zone.textContent =
            "Sélectionnez un lot pour connaître les informations disponibles.";

        if (message) {

            message.textContent =
                "Sélectionnez le lot d'origine.";

        }

        return;

    }


    /*
     * Nous ne déduisons pas artificiellement
     * un stock d'œufs à partir du nombre d'animaux.
     *
     * Le stock d'œufs sera géré avec le module
     * Production d'œufs.
     */

    const production =
        await trouverProductionLiee(
            lotId
        );


    if (production) {

        const quantite =
            Number(
                production.quantite ||
                production.quantite_oeufs ||
                production.nombre_oeufs ||
                0
            );


        if (quantite > 0) {

            zone.textContent =
                "Dernière production liée : " +
                quantite.toLocaleString(
                    "fr-FR"
                ) +
                " œufs.";

        }

        else {

            zone.textContent =
                "Une production d'œufs est liée à ce lot.";

        }

    }

    else {

        zone.textContent =
            "Aucune production d'œufs liée détectée pour ce lot.";

    }


    if (message) {

        message.textContent =
            "Lot sélectionné. Vérifiez la quantité d'œufs avant l'incubation.";

    }

}


/* ============================================================
   DURÉE D'INCUBATION
============================================================ */

function chargerDureeIncubation() {

    const espece =
        document.getElementById(
            "incubationEspece"
        );


    const duree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !espece ||
        !duree
    ) {

        return;

    }


    const valeur =
        espece.value;


    const nombreJours =
        DUREES_INCUBATION[
            valeur
        ];


    duree.innerHTML = "";


    if (
        !nombreJours
    ) {

        duree.innerHTML =

            `
            <option value="">
                Sélectionner l'espèce
            </option>
            `;

        afficherEclosionIncubation();

        return;

    }


    const option =
        document.createElement(
            "option"
        );


    option.value =
        nombreJours;


    option.textContent =
        nombreJours +
        " jours";


    option.selected =
        true;


    duree.appendChild(
        option
    );


    afficherEclosionIncubation();

}


/* ============================================================
   AFFICHER DATE D'ÉCLOSION
============================================================ */

function afficherEclosionIncubation() {

    const date =
        document.getElementById(
            "incubationDateEntree"
        )
        ||
        document.getElementById(
            "incubationDate"
        );


    const duree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !date ||
        !duree
    ) {

        return;

    }


    const dateEclosion =
        calculerDateEclosionIncubation(
            date.value,
            Number(
                duree.value
            )
        );


    let zone =
        document.getElementById(
            "eclosionPrevue"
        );


    if (!zone) {

        zone =
            document.getElementById(
                "dateEclosion"
            );

    }


    if (!zone) {

        return;

    }


    if (!dateEclosion) {

        zone.innerHTML =
            "Éclosion prévue : -";

        return;

    }


    zone.innerHTML =

        `
        Éclosion prévue :
        <strong>
            ${formaterDateIncubation(
                dateEclosion
            )}
        </strong>
        `;

}


/* ============================================================
   OBTENIR CAPACITÉ COUVEUSE
============================================================ */

function obtenirCapaciteCouveuse(
    valeur
) {

    if (!valeur) {

        return 0;

    }


    const texte =
        String(
            valeur
        );


    if (
        CAPACITES_COUVEUSES[
            texte
        ]
    ) {

        return CAPACITES_COUVEUSES[
            texte
        ];

    }


    const correspondance =
        texte.match(
            /(\d[\d\s]*)/
        );


    if (!correspondance) {

        return 0;

    }


    return Number(
        correspondance[1]
            .replace(
                /\s/g,
                ""
            )
    );

}


/* ============================================================
   VÉRIFIER CAPACITÉ COUVEUSE
============================================================ */

function verifierCapaciteIncubation() {

    const oeufs =
        document.getElementById(
            "incubationOeufs"
        );


    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        );


    if (
        !oeufs ||
        !couveuse
    ) {

        return true;

    }


    const quantite =
        Number(
            oeufs.value ||
            0
        );


    const capacite =
        obtenirCapaciteCouveuse(
            couveuse.value
        );


    if (
        capacite > 0 &&
        quantite > capacite
    ) {

        oeufs.setCustomValidity(
            "La quantité dépasse la capacité de la couveuse."
        );


        oeufs.classList.add(
            "is-invalid"
        );


        return false;

    }


    oeufs.setCustomValidity(
        ""
    );


    oeufs.classList.remove(
        "is-invalid"
    );


    return true;

}


/* ============================================================
   OUVRIR MODAL
============================================================ */

async function ouvrirModalIncubation() {

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    const date =
        document.getElementById(
            "incubationDateEntree"
        )
        ||
        document.getElementById(
            "incubationDate"
        );


    if (date) {

        date.value =
            incubationAujourdHui();

    }


    await chargerLotsIncubation();

    chargerDureeIncubation();

    afficherEclosionIncubation();


    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (
        modal &&
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


/* ============================================================
   FERMER MODAL
============================================================ */

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


/* ============================================================
   ENREGISTRER INCUBATION
============================================================ */

async function enregistrerIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const especeElement =
        document.getElementById(
            "incubationEspece"
        );


    const lotElement =
        document.getElementById(
            "incubationLot"
        );


    const oeufsElement =
        document.getElementById(
            "incubationOeufs"
        );


    const couveuseElement =
        document.getElementById(
            "incubationCouveuse"
        );


    const dateElement =
        document.getElementById(
            "incubationDateEntree"
        )
        ||
        document.getElementById(
            "incubationDate"
        );


    const dureeElement =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !especeElement ||
        !lotElement ||
        !oeufsElement ||
        !dateElement ||
        !dureeElement
    ) {

        alert(
            "Le formulaire d'incubation est incomplet."
        );

        return false;

    }


    const espece =
        especeElement.value.trim();


    const lotId =
        lotElement.value;


    const nombreOeufs =
        Number(
            oeufsElement.value ||
            0
        );


    const couveuse =
        couveuseElement
            ? couveuseElement.value.trim()
            : "";


    const dateEntree =
        dateElement.value;


    const duree =
        Number(
            dureeElement.value ||
            0
        );


    /* --------------------------------------------------------
       VALIDATIONS
    -------------------------------------------------------- */

    if (!espece) {

        alert(
            "Veuillez sélectionner l'espèce."
        );

        return false;

    }


    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot d'origine."
        );

        return false;

    }


    if (
        !Number.isFinite(
            nombreOeufs
        )
        ||
        nombreOeufs <= 0
    ) {

        alert(
            "Le nombre d'œufs doit être supérieur à zéro."
        );

        return false;

    }


    if (!couveuse) {

        alert(
            "Veuillez sélectionner la couveuse."
        );

        return false;

    }


    if (!dateEntree) {

        alert(
            "Veuillez indiquer la date d'entrée."
        );

        return false;

    }


    if (
        !Number.isFinite(
            duree
        )
        ||
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est invalide."
        );

        return false;

    }


    if (
        !verifierCapaciteIncubation()
    ) {

        alert(
            "La quantité d'œufs dépasse la capacité de la couveuse."
        );

        return false;

    }


    /* --------------------------------------------------------
       SUPABASE
    -------------------------------------------------------- */

    if (
        !incubationSupabaseDisponible()
    ) {

        alert(
            "Supabase n'est pas initialisé."
        );

        return false;

    }


    /* --------------------------------------------------------
       LOT D'ORIGINE
    -------------------------------------------------------- */

    const lot =
        await obtenirLotIncubation(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot sélectionné est introuvable dans Supabase."
        );

        return false;

    }


    /* --------------------------------------------------------
       DATE ÉCLOSION
    -------------------------------------------------------- */

    const dateEclosion =
        calculerDateEclosionIncubation(
            dateEntree,
            duree
        );


    /* --------------------------------------------------------
       ID
    -------------------------------------------------------- */

    const idIncubation =
        genererIdIncubation();


    /* --------------------------------------------------------
       UTILISATEUR
    -------------------------------------------------------- */

    const utilisateur =
        localStorage.getItem(
            "utilisateur"
        )
        ||
        localStorage.getItem(
            "utilisateurConnecte"
        )
        ||
        "Administrateur";


    /* --------------------------------------------------------
       PRODUCTION LIÉE
    -------------------------------------------------------- */

    const production =
        await trouverProductionLiee(
            lotId
        );


    const productionId =
        production
            ? production.id
            : null;


    /* --------------------------------------------------------
       NOTES
    -------------------------------------------------------- */

    const notesElement =
        document.getElementById(
            "incubationNotes"
        );


    const notes =
        notesElement
            ? (
                notesElement.value.trim()
                ||
                null
            )
            : null;


    /* --------------------------------------------------------
       OBJET SUPABASE
    -------------------------------------------------------- */

    const nouvelleIncubation = {

        id:
            idIncubation,

        lot_id:
            Number(lotId),

        lot_nom:
            lot.nom_lot ||
            lot.code ||
            "",

        espece:
            espece,

        race:
            lot.race_type ||
            "",

        couveuse:
            couveuse,

        oeufs_initial:
            nombreOeufs,

        oeufs_retires:
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

        production_id:
            productionId,

        lot_parent_id:
            Number(lotId),

        brooder_cree:
            false,

        notes:
            notes,

        utilisateur:
            utilisateur

    };


    /* --------------------------------------------------------
       INSERTION
    -------------------------------------------------------- */

    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_INCUBATIONS
            )

            .insert(
                nouvelleIncubation
            )

            .select()
            
            .single();


    if (error) {

        console.error(
            "Erreur insertion incubation :",
            error
        );


        alert(
            "Impossible d'enregistrer l'incubation.\n\n" +
            error.message
        );


        return false;

    }


    console.log(
        "Incubation enregistrée :",
        data
    );


    /* --------------------------------------------------------
       FERMER FORMULAIRE
    -------------------------------------------------------- */

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    fermerModalIncubation();


    /* --------------------------------------------------------
       ACTUALISER
    -------------------------------------------------------- */

    await chargerIncubations();

    await actualiserStatistiquesIncubation();


    /* --------------------------------------------------------
       CONFIRMATION
    -------------------------------------------------------- */

    alert(

        "Incubation enregistrée avec succès.\n\n" +

        "ID : " +
        idIncubation +

        "\nLot d'origine : " +
        (
            lot.nom_lot ||
            lot.code ||
            lot.id
        ) +

        "\nEspèce : " +
        (
            lot.espece ||
            espece
        ) +

        "\nŒufs incubés : " +
        nombreOeufs +

        "\nÉclosion prévue : " +
        formaterDateIncubation(
            dateEclosion
        )

    );


    return true;

}


/* ============================================================
   CHARGER LES INCUBATIONS
============================================================ */

async function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        );


    if (!tableau) {

        return;

    }


    if (
        !incubationSupabaseDisponible()
    ) {

        tableau.innerHTML =

            `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-danger py-4">

                    Supabase non initialisé.

                </td>
            </tr>
            `;

        return;

    }


    tableau.innerHTML =

        `
        <tr>
            <td
                colspan="9"
                class="text-center text-muted py-4">

                Chargement...

            </td>
        </tr>
        `;


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_INCUBATIONS
            )

            .select(
                `
                id,
                lot_id,
                lot_nom,
                espece,
                race,
                couveuse,
                oeufs_initial,
                oeufs_retires,
                oeufs_non_fecondes,
                embryons_morts,
                poussins_eclos,
                date_entree,
                duree,
                date_eclosion,
                statut,
                production_id,
                lot_parent_id,
                brooder_cree,
                notes,
                utilisateur,
                created_at
                `
            )

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


        tableau.innerHTML =

            `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-danger py-4">

                    Erreur de chargement :
                    ${error.message}

                </td>
            </tr>
            `;

        return;

    }


    tableau.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        tableau.innerHTML =

            `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    Aucune incubation enregistrée.

                </td>
            </tr>
            `;

        return;

    }


    data.forEach(
        function (incubation) {


            /* ------------------------------------------------
               COULEUR DU STATUT
            ------------------------------------------------ */

            let classe =
                "bg-success";


            if (
                incubation.statut ===
                "Terminée"
            ) {

                classe =
                    "bg-secondary";

            }


            else if (
                incubation.statut ===
                "Éclosion"
            ) {

                classe =
                    "bg-warning text-dark";

            }


            else if (
                incubation.statut ===
                "Annulée"
            ) {

                classe =
                    "bg-danger";

            }


            else if (
                incubation.statut ===
                "Éclos"
            ) {

                classe =
                    "bg-info text-dark";

            }


            /* ------------------------------------------------
               LIGNE
            ------------------------------------------------ */

            const ligne =
                document.createElement(
                    "tr"
                );


            ligne.innerHTML =

                `
                <td>
                    ${incubation.id || "-"}
                </td>

                <td>
                    ${incubation.espece || "-"}
                </td>

                <td>
                    ${incubation.lot_nom || "-"}
                </td>

                <td>
                    ${incubation.couveuse || "-"}
                </td>

                <td>
                    ${Number(
                        incubation.oeufs_initial || 0
                    ).toLocaleString(
                        "fr-FR"
                    )}
                </td>

                <td>
                    ${formaterDateIncubation(
                        incubation.date_entree
                    )}
                </td>

                <td>
                    ${formaterDateIncubation(
                        incubation.date_eclosion
                    )}
                </td>

                <td>

                    <span
                        class="badge ${classe}">

                        ${incubation.statut || "-"}

                    </span>

                </td>

                <td class="text-center">

                    <button
                        type="button"
                        class="btn btn-sm btn-info"
                        onclick="voirDetailsIncubation('${incubation.id}')"
                        title="Voir les détails">

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


/* ============================================================
   STATISTIQUES
============================================================ */

async function actualiserStatistiquesIncubation() {

    if (
        !incubationSupabaseDisponible()
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_INCUBATIONS
            )

            .select(
                "statut, oeufs_initial, poussins_eclos, date_eclosion"
            );


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


    /* --------------------------------------------------------
       INCUBATIONS ACTIVES
    -------------------------------------------------------- */

    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        );


    /* --------------------------------------------------------
       ŒUFS ACTUELLEMENT EN INCUBATION
    -------------------------------------------------------- */

    const totalOeufs =
        actives.reduce(
            function (
                total,
                item
            ) {

                return (

                    total +

                    Number(
                        item.oeufs_initial ||
                        0
                    )

                );

            },
            0
        );


    /* --------------------------------------------------------
       DATE DU JOUR
    -------------------------------------------------------- */

    const aujourdHui =
        incubationAujourdHui();


    /* --------------------------------------------------------
       ÉCLOSIONS PRÉVUES
    -------------------------------------------------------- */

    const eclosionsPrevues =
        actives.filter(
            function (item) {

                return (

                    item.date_eclosion &&

                    item.date_eclosion >=
                    aujourdHui

                );

            }
        ).length;


    /* --------------------------------------------------------
       POUSSINS ÉCLOS
    -------------------------------------------------------- */

    const totalPoussins =
        incubations.reduce(
            function (
                total,
                item
            ) {

                return (

                    total +

                    Number(
                        item.poussins_eclos ||
                        0
                    )

                );

            },
            0
        );


    /* --------------------------------------------------------
       AFFICHAGE
    -------------------------------------------------------- */

    const elementActives =
        document.getElementById(
            "incubationsActives"
        );


    const elementOeufs =
        document.getElementById(
            "oeufsIncubation"
        );


    const elementEclosions =
        document.getElementById(
            "eclosionsPrevues"
        );


    const elementPoussins =
        document.getElementById(
            "poussinsEclos"
        );


    if (
        elementActives
    ) {

        elementActives.textContent =
            actives.length;

    }


    if (
        elementOeufs
    ) {

        elementOeufs.textContent =
            totalOeufs.toLocaleString(
                "fr-FR"
            );

    }


    if (
        elementEclosions
    ) {

        elementEclosions.textContent =
            eclosionsPrevues.toLocaleString(
                "fr-FR"
            );

    }


    if (
        elementPoussins
    ) {

        elementPoussins.textContent =
            totalPoussins.toLocaleString(
                "fr-FR"
            );

    }


    console.log(
        "Statistiques incubation :",
        {
            actives:
                actives.length,

            oeufs:
                totalOeufs,

            eclosionsPrevues:
                eclosionsPrevues,

            poussins:
                totalPoussins
        }
    );

}


/* ============================================================
   VOIR DÉTAILS D'UNE INCUBATION
============================================================ */

async function voirDetailsIncubation(
    id
) {

    if (
        !incubationSupabaseDisponible()
    ) {

        alert(
            "Supabase n'est pas initialisé."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_INCUBATIONS
            )

            .select(
                "*"
            )

            .eq(
                "id",
                id
            )

            .maybeSingle();


    if (error) {

        console.error(
            "Erreur détails incubation :",
            error
        );


        alert(
            "Impossible de charger les détails.\n\n" +
            error.message
        );


        return;

    }


    if (!data) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    const zone =
        document.getElementById(
            "detailsIncubation"
        );


    if (!zone) {

        alert(

            "ID : " +
            data.id +

            "\nLot : " +
            (
                data.lot_nom ||
                "-"
            ) +

            "\nEspèce : " +
            (
                data.espece ||
                "-"
            ) +

            "\nŒufs : " +
            (
                data.oeufs_initial ||
                0
            ) +

            "\nPoussins éclos : " +
            (
                data.poussins_eclos ||
                0
            )

        );

        return;

    }


    const taux =
        Number(
            data.oeufs_initial || 0
        ) > 0

            ? (

                Number(
                    data.poussins_eclos || 0
                )
                /
                Number(
                    data.oeufs_initial || 0
                )
                *
                100

            )

            : 0;


    zone.innerHTML =

        `
        <div class="row g-3">

            <div class="col-md-6">

                <div class="border rounded p-3 h-100">

                    <h6 class="text-success">
                        <i class="fa-solid fa-egg"></i>
                        Identification
                    </h6>

                    <p class="mb-1">
                        <strong>ID :</strong>
                        ${data.id || "-"}
                    </p>

                    <p class="mb-1">
                        <strong>Espèce :</strong>
                        ${data.espece || "-"}
                    </p>

                    <p class="mb-1">
                        <strong>Race :</strong>
                        ${data.race || "-"}
                    </p>

                    <p class="mb-1">
                        <strong>Lot d'origine :</strong>
                        ${data.lot_nom || "-"}
                    </p>

                    <p class="mb-0">
                        <strong>Lot parent :</strong>
                        ${data.lot_parent_id || "-"}
                    </p>

                </div>

            </div>


            <div class="col-md-6">

                <div class="border rounded p-3 h-100">

                    <h6 class="text-success">
                        <i class="fa-solid fa-calendar"></i>
                        Planification
                    </h6>

                    <p class="mb-1">
                        <strong>Couveuse :</strong>
                        ${data.couveuse || "-"}
                    </p>

                    <p class="mb-1">
                        <strong>Date entrée :</strong>
                        ${formaterDateIncubation(
                            data.date_entree
                        )}
                    </p>

                    <p class="mb-1">
                        <strong>Durée :</strong>
                        ${data.duree || 0} jours
                    </p>

                    <p class="mb-0">
                        <strong>Éclosion prévue :</strong>
                        ${formaterDateIncubation(
                            data.date_eclosion
                        )}
                    </p>

                </div>

            </div>


            <div class="col-md-6">

                <div class="border rounded p-3 h-100">

                    <h6 class="text-success">
                        <i class="fa-solid fa-chart-simple"></i>
                        Résultats
                    </h6>

                    <p class="mb-1">
                        <strong>Œufs initiaux :</strong>
                        ${Number(
                            data.oeufs_initial || 0
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </p>

                    <p class="mb-1">
                        <strong>Œufs retirés :</strong>
                        ${Number(
                            data.oeufs_retires || 0
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </p>

                    <p class="mb-1">
                        <strong>Non fécondés :</strong>
                        ${Number(
                            data.oeufs_non_fecondes || 0
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </p>

                    <p class="mb-1">
                        <strong>Embryons morts :</strong>
                        ${Number(
                            data.embryons_morts || 0
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </p>

                    <p class="mb-0">
                        <strong>Poussins éclos :</strong>
                        ${Number(
                            data.poussins_eclos || 0
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </p>

                </div>

            </div>


            <div class="col-md-6">

                <div class="border rounded p-3 h-100">

                    <h6 class="text-success">
                        <i class="fa-solid fa-chart-line"></i>
                        Suivi
                    </h6>

                    <p class="mb-1">

                        <strong>Statut :</strong>

                        <span class="badge bg-success">

                            ${data.statut || "-"}

                        </span>

                    </p>

                    <p class="mb-1">

                        <strong>Taux d'éclosion :</strong>

                        ${taux.toFixed(1)} %

                    </p>

                    <p class="mb-1">

                        <strong>Poussinière créée :</strong>

                        ${data.brooder_cree
                            ? "Oui"
                            : "Non"}

                    </p>

                    <p class="mb-0">

                        <strong>Production liée :</strong>

                        ${data.production_id || "Aucune"}

                    </p>

                </div>

            </div>


            <div class="col-12">

                <div class="alert alert-info mb-0">

                    <strong>
                        <i class="fa-solid fa-link"></i>
                        Traçabilité
                    </strong>

                    <br>

                    Cette incubation est rattachée au lot
                    d'origine
                    <strong>
                        ${data.lot_nom || "-"}
                    </strong>.

                    Le nouveau lot de poussins ne sera créé
                    qu'après l'enregistrement réel de
                    l'éclosion.

                </div>

            </div>


            ${
                data.notes
                    ? `
                        <div class="col-12">

                            <div class="border rounded p-3">

                                <strong>Notes :</strong>

                                <p class="mb-0 mt-2">

                                    ${data.notes}

                                </p>

                            </div>

                        </div>
                      `
                    : ""
            }

        </div>
        `;


    const modal =
        document.getElementById(
            "modalDetailsIncubation"
        );


    if (
        modal &&
        typeof bootstrap !==
        "undefined"
    ) {

        bootstrap.Modal
            .getOrCreateInstance(
                modal
            )
            .show();

    }

}


/* ============================================================
   INITIALISATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Initialisation incubation.js..."
        );


        /* ----------------------------------------------------
           DATE
        ---------------------------------------------------- */

        const date =
            document.getElementById(
                "incubationDateEntree"
            )
            ||
            document.getElementById(
                "incubationDate"
            );


        if (
            date &&
            !date.value
        ) {

            date.value =
                incubationAujourdHui();

        }


        /* ----------------------------------------------------
           ESPÈCE
        ---------------------------------------------------- */

        const espece =
            document.getElementById(
                "incubationEspece"
            );


        if (espece) {

            espece.addEventListener(
                "change",
                async function () {

                    chargerDureeIncubation();

                    await chargerLotsIncubation();

                    afficherEclosionIncubation();

                }
            );

        }


        /* ----------------------------------------------------
           LOT
        ---------------------------------------------------- */

        const lot =
            document.getElementById(
                "incubationLot"
            );


        if (lot) {

            lot.addEventListener(
                "change",
                async function () {

                    await afficherInformationsLotOrigine();

                    await afficherStockDisponible();

                }
            );

        }


        /* ----------------------------------------------------
           DATE
        ---------------------------------------------------- */

        if (date) {

            date.addEventListener(
                "change",
                function () {

                    afficherEclosionIncubation();

                }
            );

        }


        /* ----------------------------------------------------
           DURÉE
        ---------------------------------------------------- */

        const duree =
            document.getElementById(
                "incubationDuree"
            );


        if (duree) {

            duree.addEventListener(
                "change",
                function () {

                    afficherEclosionIncubation();

                }
            );


            duree.addEventListener(
                "input",
                function () {

                    afficherEclosionIncubation();

                }
            );

        }


        /* ----------------------------------------------------
           ŒUFS
        ---------------------------------------------------- */

        const oeufs =
            document.getElementById(
                "incubationOeufs"
            );


        if (oeufs) {

            oeufs.addEventListener(
                "input",
                function () {

                    verifierCapaciteIncubation();

                }
            );

        }


        /* ----------------------------------------------------
           COUVEUSE
        ---------------------------------------------------- */

        const couveuse =
            document.getElementById(
                "incubationCouveuse"
            );


        if (couveuse) {

            couveuse.addEventListener(
                "change",
                function () {

                    verifierCapaciteIncubation();

                }
            );

        }


        /* ----------------------------------------------------
           FORMULAIRE
        ---------------------------------------------------- */

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


        /* ----------------------------------------------------
           CHARGEMENT INITIAL
        ---------------------------------------------------- */

        if (
            incubationSupabaseDisponible()
        ) {

            await chargerLotsIncubation();

            chargerDureeIncubation();

            await chargerIncubations();

            await actualiserStatistiquesIncubation();

        }


        console.log(
            "✓ Ferme Asher ERP — incubation.js connecté à Supabase."
        );

    }
);


/* ============================================================
   EXPORTS GLOBAUX
   Nécessaires aux onclick du HTML
============================================================ */

window.ouvrirModalIncubation =
    ouvrirModalIncubation;


window.fermerModalIncubation =
    fermerModalIncubation;


window.enregistrerIncubation =
    enregistrerIncubation;


window.chargerLotsIncubation =
    chargerLotsIncubation;


window.chargerIncubations =
    chargerIncubations;


window.actualiserStatistiquesIncubation =
    actualiserStatistiquesIncubation;


window.afficherEclosionIncubation =
    afficherEclosionIncubation;


window.chargerDureeIncubation =
    chargerDureeIncubation;


window.afficherInformationsLotOrigine =
    afficherInformationsLotOrigine;


window.verifierCapaciteIncubation =
    verifierCapaciteIncubation;


window.voirDetailsIncubation =
    voirDetailsIncubation;


window.obtenirLotIncubation =
    obtenirLotIncubation;


window.trouverProductionLiee =
    trouverProductionLiee;


window.afficherStockDisponible =
    afficherStockDisponible;


window.calculerDateEclosionIncubation =
    calculerDateEclosionIncubation;


window.formaterDateIncubation =
    formaterDateIncubation;


window.incubationAujourdHui =
    incubationAujourdHui;


console.log(
    "✓ Ferme Asher ERP — incubation.js prêt."
);
