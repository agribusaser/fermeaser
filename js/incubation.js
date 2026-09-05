/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : js/incubation.js

   CHAÎNE DE TRAÇABILITÉ

   ANIMAUX & LOTS
          ↓
   PRODUCTION DES ŒUFS
          ↓
   INCUBATION
          ↓
   ÉCLOSION
          ↓
   POUSSINIÈRE
          ↓
   NOUVEAU LOT

   SOURCE DE DONNÉES :
   SUPABASE
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
   VÉRIFIER SUPABASE
============================================================ */

function incubationSupabaseDisponible() {

    return (
        typeof supabaseClient !==
        "undefined"
    );

}


/* ============================================================
   DATE DU JOUR
============================================================ */

function incubationAujourdHui() {

    const date =
        new Date();

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


/* ============================================================
   FORMATER DATE
============================================================ */

function formaterDateIncubation(
    date
) {

    if (!date) {

        return "-";

    }

    const parties =
        String(date).split("-");

    if (
        parties.length !== 3
    ) {

        return date;

    }

    return (
        parties[2] +
        "/" +
        parties[1] +
        "/" +
        parties[0]
    );

}


/* ============================================================
   GÉNÉRER ID
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
   CALCUL DATE ÉCLOSION
============================================================ */

function calculerDateEclosionIncubation(
    dateEntree,
    duree
) {

    if (
        !dateEntree ||
        !duree
    ) {

        return "";

    }

    const date =
        new Date(
            dateEntree +
            "T00:00:00"
        );

    date.setDate(
        date.getDate() +
        Number(duree)
    );

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


/* ============================================================
   OBTENIR UN LOT PAR SON ID
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
                `
                id,
                code,
                espece,
                race_type,
                nom_lot,
                date_entree,
                quantite_initiale,
                quantite_actuelle,
                origine,
                cout_acquisition,
                statut,
                notes
                `
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
   CHARGER LES LOTS
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


    const ancienneValeur =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Chargement des lots...
        </option>
        `;


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_LOTS_INCUBATION
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
                "id",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erreur chargement lots :",
            error
        );

        select.innerHTML =
            `
            <option value="">
                Impossible de charger les lots
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

        select.innerHTML =
            `
            <option value="">
                Aucun lot disponible
            </option>
            `;

        return;

    }


    data
        .filter(
            function (lot) {

                return (
                    lot.statut === "Actif" ||
                    !lot.statut
                );

            }
        )
        .forEach(
            function (lot) {

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

                const quantite =
                    Number(
                        lot.quantite_actuelle ||
                        0
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(lot.id);


                option.textContent =
                    nom +
                    " — " +
                    espece +
                    (
                        race
                            ? " — " + race
                            : ""
                    ) +
                    " (" +
                    quantite +
                    " animaux)";


                option.dataset.espece =
                    espece;


                option.dataset.race =
                    race;


                option.dataset.nom =
                    nom;


                select.appendChild(
                    option
                );

            }
        );


    if (ancienneValeur) {

        select.value =
            ancienneValeur;

    }


    afficherInformationsLotOrigine();

}


/* ============================================================
   INFORMATIONS DU LOT D'ORIGINE
============================================================ */

function afficherInformationsLotOrigine() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    if (!select) {

        return;

    }


    const option =
        select.options[
            select.selectedIndex
        ];


    let zone =
        document.getElementById(
            "informationsLotOrigine"
        );


    if (!zone) {

        zone =
            document.getElementById(
                "infoLotOrigine"
            );

    }


    if (!zone) {

        return;

    }


    if (
        !option ||
        !select.value
    ) {

        zone.innerHTML =
            "";

        return;

    }


    const espece =
        option.dataset.espece ||
        "";


    const race =
        option.dataset.race ||
        "";


    const nom =
        option.dataset.nom ||
        option.textContent;


    zone.innerHTML =

        `
        <div class="alert alert-light border mt-2">

            <strong>Lot d'origine :</strong>
            ${nom}

            <br>

            <strong>Espèce :</strong>
            ${espece}

            ${
                race
                    ? `
                        <br>
                        <strong>Race / Type :</strong>
                        ${race}
                      `
                    : ""
            }

            <br>

            <strong>ID du lot :</strong>
            ${select.value}

        </div>
        `;

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
        DUREES_INCUBATION[
            espece.value
        ];


    if (!valeur) {

        return;

    }


    duree.innerHTML =
        `
        <option value="${valeur}">
            ${valeur} jours
        </option>
        `;


    duree.value =
        String(valeur);


    afficherEclosionIncubation();

}


/* ============================================================
   DATE D'ÉCLOSION PRÉVUE
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
            Number(duree.value)
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


    if (
        !zone
    ) {

        return;

    }


    zone.innerHTML =
        dateEclosion

            ? `
                Éclosion prévue :
                <strong>
                    ${formaterDateIncubation(
                        dateEclosion
                    )}
                </strong>
              `

            : "";

}


/* ============================================================
   CAPACITÉ DE LA COUVEUSE
============================================================ */

function obtenirCapaciteCouveuse(
    valeur
) {

    if (!valeur) {

        return 0;

    }


    const texte =
        String(valeur)
            .toLowerCase();


    const correspondance =
        texte.match(
            /(\d[\d\s]*)/
        );


    if (!correspondance) {

        return 0;

    }


    return Number(
        correspondance[1]
            .replace(/\s/g, "")
    );

}


/* ============================================================
   VÉRIFIER CAPACITÉ
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
            oeufs.value || 0
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

        return false;

    }


    oeufs.setCustomValidity("");

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
   TROUVER LA DERNIÈRE PRODUCTION DU LOT
============================================================ */

async function trouverProductionLiee(
    lotId
) {

    if (!lotId) {

        return null;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TABLE_PRODUCTIONS_INCUBATION
            )

            .select(
                `
                id,
                date,
                lot_id,
                lot_nom,
                espece,
                produit,
                quantite,
                unite
                `
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
            "Aucune production liée :",
            error
        );

        return null;

    }


    return (
        data &&
        data.length > 0
    )
        ? data[0]
        : null;

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


    if (
        !incubationSupabaseDisponible()
    ) {

        alert(
            "Supabase n'est pas initialisé."
        );

        return false;

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
            oeufsElement.value || 0
        );


    const couveuse =
        couveuseElement
            ? couveuseElement.value.trim()
            : "";


    const dateEntree =
        dateElement.value;


    const duree =
        Number(
            dureeElement.value || 0
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
        !Number.isFinite(duree)
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
       RÉCUPÉRER LE LOT D'ORIGINE
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
       RÉCUPÉRER LA PRODUCTION LIÉE
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
       OBJET SUPABASE
    -------------------------------------------------------- */

    const nouvelleIncubation = {

        id:
            idIncubation,

        lot_id:
            Number(lot.id),

        lot_nom:
            lot.nom_lot ||
            lot.code ||
            "",

        espece:
            lot.espece ||
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
            Number(lot.id),

        brooder_cree:
            false,

        notes:
            document.getElementById(
                "incubationNotes"
            )?.value.trim()
            ||
            null,

        utilisateur:
            utilisateur

    };


    console.log(
        "Données incubation à envoyer :",
        nouvelleIncubation
    );


    /* --------------------------------------------------------
       INSERTION SUPABASE
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
        "✓ Incubation enregistrée :",
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
                    colspan="10"
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
                colspan="10"
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
                    colspan="10"
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
                    colspan="10"
                    class="text-center text-muted py-4">

                    Aucune incubation enregistrée.

                </td>

            </tr>
            `;

        return;

    }


    data.forEach(
        function (incubation) {

            let classe =
                "bg-success";


            if (
                incubation.statut ===
                "Terminée"
            ) {

                classe =
                    "bg-secondary";

            }


            if (
                incubation.statut ===
                "Éclosion"
            ) {

                classe =
                    "bg-warning text-dark";

            }


            if (
                incubation.statut ===
                "Annulée"
            ) {

                classe =
                    "bg-danger";

            }


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
                    ).toLocaleString("fr-FR")}
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

                <td>
                    ${Number(
                        incubation.poussins_eclos || 0
                    ).toLocaleString("fr-FR")}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-info"
                        title="Voir les détails"
                        onclick="voirDetailsIncubation('${incubation.id}')">

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
                "statut, oeufs_initial, poussins_eclos"
            );


    if (error) {

        console.error(
            "Erreur statistiques incubation :",
            error
        );

        return;

    }


    const incubations =
        data || [];


    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        );


    const ecloses =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "Éclos"
                    ||
                    item.statut ===
                    "Terminée"
                );

            }
        );


    const totalOeufs =
        incubations.reduce(
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


   async function actualiserStatistiquesIncubation() {

    if (
        typeof supabaseClient ===
        "undefined"
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


    /*
     * INCUBATIONS ACTIVES
     */

    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        );


    /*
     * ŒUFS ACTUELLEMENT EN INCUBATION
     *
     * On additionne uniquement
     * les œufs des incubations actives.
     */

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


    /*
     * DATE D'AUJOURD'HUI
     */

    const aujourdHui =
        new Date()
            .toISOString()
            .split("T")[0];


    /*
     * ÉCLOSIONS PRÉVUES
     *
     * Incubations actives dont
     * la date d'éclosion est aujourd'hui
     * ou dans le futur.
     */

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


    /*
     * POUSSINS ÉCLOS
     *
     * Total réel enregistré.
     */

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


    /*
     * AFFICHAGE
     */

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

}


    Object.keys(
        valeurs
    ).forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    Number(
                        valeurs[id]
                    ).toLocaleString(
                        "fr-FR"
                    );

            }

        }
    );

}


/* ============================================================
   VOIR DÉTAILS
============================================================ */

async function voirDetailsIncubation(
    id
) {

    if (
        !id ||
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
                "*"
            )

            .eq(
                "id",
                id
            )

            .maybeSingle();


    if (
        error ||
        !data
    ) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    alert(

        "DÉTAILS DE L'INCUBATION\n\n" +

        "ID : " +
        (data.id || "-") +

        "\nLot d'origine : " +
        (data.lot_nom || "-") +

        "\nID Lot : " +
        (data.lot_id || "-") +

        "\nEspèce : " +
        (data.espece || "-") +

        "\nRace / Type : " +
        (data.race || "-") +

        "\nCouveuse : " +
        (data.couveuse || "-") +

        "\nŒufs initiaux : " +
        (data.oeufs_initial || 0) +

        "\nŒufs retirés : " +
        (data.oeufs_retires || 0) +

        "\nŒufs non fécondés : " +
        (data.oeufs_non_fecondes || 0) +

        "\nEmbryons morts : " +
        (data.embryons_morts || 0) +

        "\nPoussins éclos : " +
        (data.poussins_eclos || 0) +

        "\nDate d'entrée : " +
        formaterDateIncubation(
            data.date_entree
        ) +

        "\nÉclosion prévue : " +
        formaterDateIncubation(
            data.date_eclosion
        ) +

        "\nStatut : " +
        (data.statut || "-") +

        "\nProduction liée : " +
        (data.production_id || "Aucune")

    );

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
           BOUTON NOUVELLE INCUBATION
        ---------------------------------------------------- */

        const bouton =
            document.getElementById(
                "btnNouvelleIncubation"
            );


        if (bouton) {

            bouton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    ouvrirModalIncubation();

                }
            );

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
                function () {

                    chargerDureeIncubation();

                    chargerLotsIncubation();

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
                function () {

                    afficherInformationsLotOrigine();

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
           CHARGEMENT
        ---------------------------------------------------- */

        await chargerLotsIncubation();

        chargerDureeIncubation();

        await chargerIncubations();

        await actualiserStatistiquesIncubation();


        console.log(
            "✓ Ferme Asher ERP — incubation.js connecté à Supabase."
        );

    }
);


/* ============================================================
   EXPORTS GLOBAUX
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


console.log(
    "✓ Ferme Asher ERP — incubation.js prêt."
);
