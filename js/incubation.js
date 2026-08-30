/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : /js/incubation.js

   CHAINE DE GESTION :

   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS DESTINÉS À L'INCUBATION
        ↓
   INCUBATION
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE
        ↓
   NOUVEAU LOT

   IMPORTANT :
   Les lots sont lus depuis :
       lotsElevage

   Le stock d'œufs est lu depuis :
       stockOeufsIncubation

   Les incubations sont enregistrées dans :
       incubations
============================================================ */

"use strict";


/* ============================================================
   CONFIGURATION
============================================================ */

const INCUBATION_STORAGE = {

    LOTS:
        "lotsElevage",

    STOCK_OEUFS:
        "stockOeufsIncubation",

    INCUBATIONS:
        "incubations"

};


/* ============================================================
   DURÉES D'INCUBATION PAR ESPÈCE
============================================================ */

const DUREES_INCUBATION = {

    "Cailles": 17,

    "Poules": 21,

    "Poulets": 21,

    "Canards": 28,

    "Pintades": 28,

    "Dindes": 28

};


/* ============================================================
   OUTILS LOCALSTORAGE
============================================================ */

function lireIncubationData(cle) {

    try {

        const donnees =
            localStorage.getItem(cle);

        if (!donnees) {

            return [];

        }

        const resultat =
            JSON.parse(donnees);

        return Array.isArray(resultat)
            ? resultat
            : [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture localStorage :",
            cle,
            erreur
        );

        return [];

    }

}


function sauvegarderIncubationData(
    cle,
    donnees
) {

    try {

        localStorage.setItem(
            cle,
            JSON.stringify(donnees)
        );

        return true;

    }

    catch (erreur) {

        console.error(
            "Erreur sauvegarde localStorage :",
            cle,
            erreur
        );

        alert(
            "Erreur lors de la sauvegarde des données."
        );

        return false;

    }

}


/* ============================================================
   DATE DU JOUR
============================================================ */

function obtenirDateIncubationAujourdhui() {

    const date =
        new Date();

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
   FORMATER DATE
============================================================ */

function formaterDateIncubation(date) {

    if (!date) {

        return "-";

    }

    const parties =
        String(date).split("-");

    if (
        parties.length === 3
    ) {

        return (
            parties[2] +
            "/" +
            parties[1] +
            "/" +
            parties[0]
        );

    }

    return date;

}


/* ============================================================
   CALCUL DATE ÉCLOSION
============================================================ */

function calculerDateEclosion(
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

    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

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
   GÉNÉRER ID INCUBATION
============================================================ */

function genererIdIncubation() {

    const incubations =
        lireIncubationData(
            INCUBATION_STORAGE.INCUBATIONS
        );

    let numero =
        incubations.length + 1;

    let id;

    do {

        id =
            "INC-" +
            String(numero).padStart(
                5,
                "0"
            );

        numero++;

    }
    while (
        incubations.some(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        )
    );

    return id;

}


/* ============================================================
   RÉCUPÉRER LES LOTS
============================================================ */

function obtenirLotsIncubation() {

    /*
     * Nous essayons d'abord d'utiliser
     * la fonction centrale d'elevage.js.
     */

    if (
        typeof obtenirLotsElevage ===
        "function"
    ) {

        const lots =
            obtenirLotsElevage();

        if (
            Array.isArray(lots)
        ) {

            return lots;

        }

    }


    /*
     * Secours direct localStorage.
     */

    return lireIncubationData(
        INCUBATION_STORAGE.LOTS
    );

}


/* ============================================================
   RÉCUPÉRER STOCK ŒUFS INCUBATION
============================================================ */

function obtenirStockOeufsIncubationModule() {

    /*
     * Utiliser la fonction centrale
     * si elle existe déjà dans elevage.js.
     */

    if (
        typeof obtenirStockOeufsIncubation ===
        "function"
    ) {

        const stock =
            obtenirStockOeufsIncubation();

        if (
            Array.isArray(stock)
        ) {

            return stock;

        }

    }


    return lireIncubationData(
        INCUBATION_STORAGE.STOCK_OEUFS
    );

}


/* ============================================================
   SAUVEGARDER STOCK ŒUFS
============================================================ */

function sauvegarderStockOeufsIncubationModule(
    stock
) {

    if (
        typeof sauvegarderStockOeufsIncubation ===
        "function"
    ) {

        sauvegarderStockOeufsIncubation(
            stock
        );

        return true;

    }


    return sauvegarderIncubationData(
        INCUBATION_STORAGE.STOCK_OEUFS,
        stock
    );

}


/* ============================================================
   RÉCUPÉRER INCUBATIONS
============================================================ */

function obtenirIncubations() {

    return lireIncubationData(
        INCUBATION_STORAGE.INCUBATIONS
    );

}


/* ============================================================
   SAUVEGARDER INCUBATIONS
============================================================ */

function sauvegarderIncubations(
    incubations
) {

    return sauvegarderIncubationData(
        INCUBATION_STORAGE.INCUBATIONS,
        incubations
    );

}


/* ============================================================
   TROUVER LOT PAR ID
============================================================ */

function trouverLotIncubation(
    lotId
) {

    const lots =
        obtenirLotsIncubation();

    return lots.find(
        function (lot) {

            return (
                String(lot.id) ===
                String(lotId)
            );

        }
    );

}


/* ============================================================
   NOM DU LOT
============================================================ */

function obtenirNomLotIncubation(
    lot
) {

    if (!lot) {

        return "-";

    }

    return (
        lot.nom ||
        lot.nomLot ||
        lot.code ||
        lot.id ||
        "-"
    );

}


/* ============================================================
   ESPÈCE D'UN LOT
============================================================ */

function obtenirEspeceLotIncubation(
    lot
) {

    if (!lot) {

        return "";

    }

    return (
        lot.espece ||
        lot.type ||
        ""
    );

}


/* ============================================================
   STOCK DISPONIBLE POUR UN LOT
============================================================ */

function obtenirOeufsDisponiblesPourLotIncubation(
    lotId
) {

    const stock =
        obtenirStockOeufsIncubationModule();

    return stock
        .filter(
            function (ligne) {

                return (

                    String(ligne.lotId) ===
                    String(lotId)

                    &&

                    Number(
                        ligne.quantiteDisponible ||
                        0
                    ) > 0

                );

            }
        )
        .reduce(
            function (
                total,
                ligne
            ) {

                return (
                    total +
                    Number(
                        ligne.quantiteDisponible ||
                        0
                    )
                );

            },
            0
        );

}


/* ============================================================
   CHARGER LES LOTS DANS LE FORMULAIRE
============================================================ */

function chargerLotsIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );

    if (!select) {

        return;

    }


    const especeSelect =
        document.getElementById(
            "incubationEspece"
        );

    const especeSelectionnee =
        especeSelect
            ? especeSelect.value
            : "";


    const ancienneValeur =
        select.value;


    const lots =
        obtenirLotsIncubation();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    let nombreLots =
        0;


    lots
        .filter(
            function (lot) {

                const espece =
                    obtenirEspeceLotIncubation(
                        lot
                    );

                const statut =
                    lot.statut ||
                    "Actif";


                /*
                 * Le lot doit être actif.
                 */

                if (
                    statut !== "Actif"
                ) {

                    return false;

                }


                /*
                 * Filtrer selon l'espèce.
                 */

                if (
                    especeSelectionnee &&
                    espece !==
                    especeSelectionnee
                ) {

                    return false;

                }


                /*
                 * IMPORTANT :
                 * Seuls les lots ayant
                 * réellement des œufs disponibles
                 * sont proposés.
                 */

                const oeufs =
                    obtenirOeufsDisponiblesPourLotIncubation(
                        lot.id
                    );


                return (
                    oeufs > 0
                );

            }
        )
        .forEach(
            function (lot) {

                const oeufs =
                    obtenirOeufsDisponiblesPourLotIncubation(
                        lot.id
                    );


                const nom =
                    obtenirNomLotIncubation(
                        lot
                    );


                const espece =
                    obtenirEspeceLotIncubation(
                        lot
                    );


                const race =
                    lot.race ||
                    "";


                const animaux =
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        0
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lot.id;


                option.dataset.stock =
                    oeufs;


                option.textContent =
                    nom +
                    " — " +
                    espece +
                    (
                        race
                            ? " / " + race
                            : ""
                    ) +
                    " — " +
                    animaux +
                    " animaux — " +
                    oeufs +
                    " œufs disponibles";


                select.appendChild(
                    option
                );


                nombreLots++;

            }
        );


    /*
     * Restaurer la sélection si
     * elle existe toujours.
     */

    if (
        ancienneValeur &&
        Array.from(
            select.options
        ).some(
            function (option) {

                return (
                    option.value ===
                    ancienneValeur
                );

            }
        )
    ) {

        select.value =
            ancienneValeur;

    }


    afficherStockDisponible();


    console.log(
        "Lots disponibles pour incubation :",
        nombreLots
    );

}


/* ============================================================
   AFFICHER STOCK DISPONIBLE
============================================================ */

function afficherStockDisponible() {

    const lotSelect =
        document.getElementById(
            "incubationLot"
        );


    const oeufsInput =
        document.getElementById(
            "incubationOeufs"
        );


    if (!lotSelect) {

        return;

    }


    const lotId =
        lotSelect.value;


    let stock =
        0;


    if (lotId) {

        stock =
            obtenirOeufsDisponiblesPourLotIncubation(
                lotId
            );

    }


    /*
     * Chercher le texte "Stock disponible"
     * déjà présent dans le formulaire.
     */

    let indicateur =
        document.getElementById(
            "stockOeufsDisponible"
        );


    /*
     * Si l'indicateur n'existe pas,
     * on le crée automatiquement sous
     * le champ nombre d'œufs.
     */

    if (
        !indicateur &&
        oeufsInput
    ) {

        indicateur =
            document.createElement(
                "div"
            );

        indicateur.id =
            "stockOeufsDisponible";

        indicateur.className =
            "form-text";


        oeufsInput.parentNode
            .appendChild(
                indicateur
            );

    }


    if (indicateur) {

        indicateur.innerHTML =

            "Stock disponible : " +

            "<strong>" +

            stock +

            " œuf" +

            (
                stock > 1
                    ? "s"
                    : ""
            ) +

            "</strong>";

    }


    /*
     * Mettre automatiquement la quantité
     * maximale disponible lorsque le champ
     * est vide.
     */

    if (
        oeufsInput &&
        stock > 0 &&
        (
            !oeufsInput.value ||
            Number(
                oeufsInput.value
            ) > stock
        )
    ) {

        oeufsInput.value =
            stock;

    }


    if (
        oeufsInput &&
        stock === 0
    ) {

        oeufsInput.value =
            "";

        oeufsInput.placeholder =
            "Aucun œuf disponible";

    }
    else if (oeufsInput) {

        oeufsInput.placeholder =
            "Exemple : " +
            stock;

    }

}


/* ============================================================
   CHARGER DURÉE SELON ESPÈCE
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

        duree.innerHTML = `

            <option value="">

                Sélectionner la durée

            </option>

        `;

        afficherEclosionIncubation();

        return;

    }


    duree.innerHTML = `

        <option value="${valeur}">

            ${espece.value}
            — ${valeur} jours

        </option>

    `;


    duree.value =
        String(valeur);


    afficherEclosionIncubation();

}


/* ============================================================
   AFFICHER ÉCLOSION PRÉVUE
============================================================ */

function afficherEclosionIncubation() {

    const dateElement =
        document.getElementById(
            "incubationDateEntree"
        );


    const dureeElement =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !dateElement ||
        !dureeElement
    ) {

        return;

    }


    const dateEclosion =
        calculerDateEclosion(
            dateElement.value,
            Number(
                dureeElement.value
            )
        );


    /*
     * Chercher le bloc existant.
     */

    let bloc =
        document.getElementById(
            "incubationEclosionPrevue"
        );


    /*
     * S'il n'existe pas,
     * créer un bloc sous la durée.
     */

    if (
        !bloc
    ) {

        bloc =
            document.createElement(
                "div"
            );

        bloc.id =
            "incubationEclosionPrevue";

        bloc.className =
            "alert alert-success mt-2";


        dureeElement.parentNode
            .appendChild(
                bloc
            );

    }


    if (dateEclosion) {

        bloc.innerHTML =

            "📅 <strong>Éclosion prévue :</strong> " +

            formaterDateIncubation(
                dateEclosion
            );

    }
    else {

        bloc.innerHTML =
            "📅 Éclosion prévue : -";

    }

}


/* ============================================================
   VÉRIFIER CAPACITÉ DE LA COUVEUSE
============================================================ */

function obtenirCapaciteCouveuse(
    valeur
) {

    const texte =
        String(
            valeur ||
            ""
        );


    /*
     * Chercher un nombre dans
     * "Couveuse 1056 œufs"
     */

    const correspondance =
        texte.match(
            /(\d[\d\s]*)/
        );


    if (
        !correspondance
    ) {

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


function verifierCapaciteIncubation() {

    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        );


    const oeufs =
        document.getElementById(
            "incubationOeufs"
        );


    if (
        !couveuse ||
        !oeufs
    ) {

        return true;

    }


    const capacite =
        obtenirCapaciteCouveuse(
            couveuse.value
        );


    const quantite =
        Number(
            oeufs.value
        ) || 0;


    if (
        capacite > 0 &&
        quantite > capacite
    ) {

        oeufs.setCustomValidity(
            "La quantité dépasse la capacité de la couveuse."
        );

        return false;

    }


    oeufs.setCustomValidity(
        ""
    );


    return true;

}


/* ============================================================
   OUVRIR MODAL
============================================================ */

function ouvrirModalIncubation() {

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


    /*
     * Si Bootstrap est disponible,
     * utiliser Bootstrap.
     */

    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal.getOrCreateInstance(
                modal
            );

        instance.show();

    }
    else {

        /*
         * Secours sans Bootstrap.
         */

        modal.style.display =
            "block";

        modal.classList.add(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    initialiserFormulaireIncubation();

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
            bootstrap.Modal.getInstance(
                modal
            );


        if (instance) {

            instance.hide();

        }
        else {

            modal.style.display =
                "none";

            modal.classList.remove(
                "show"
            );

        }

    }
    else {

        modal.style.display =
            "none";

        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* ============================================================
   INITIALISER FORMULAIRE
============================================================ */

function initialiserFormulaireIncubation() {

    const espece =
        document.getElementById(
            "incubationEspece"
        );


    const lot =
        document.getElementById(
            "incubationLot"
        );


    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        );


    const date =
        document.getElementById(
            "incubationDateEntree"
        );


    const oeufs =
        document.getElementById(
            "incubationOeufs"
        );


    if (date) {

        date.value =
            obtenirDateIncubationAujourdhui();

    }


    /*
     * Charger les couveuses.
     *
     * Si le HTML contient déjà les options,
     * on ne les détruit pas.
     */

    if (
        couveuse &&
        couveuse.options.length <= 1
    ) {

        couveuse.innerHTML = `

            <option value="">

                Sélectionner une couveuse

            </option>

            <option value="Couveuse 1056 œufs">

                Couveuse 1056 œufs

            </option>

            <option value="Couveuse 01">

                Couveuse 01

            </option>

            <option value="Couveuse 02">

                Couveuse 02

            </option>

        `;

    }


    if (oeufs) {

        oeufs.value =
            "";

        oeufs.placeholder =
            "Sélectionner un lot";

    }


    if (espece) {

        chargerDureeIncubation();

    }


    chargerLotsIncubation();

    afficherEclosionIncubation();

}


/* ============================================================
   ENREGISTRER INCUBATION
============================================================ */

function enregistrerIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    console.log(
        "Enregistrement incubation..."
    );


    /* --------------------------------------------------------
       CHAMPS
    -------------------------------------------------------- */

    const especeElement =
        document.getElementById(
            "incubationEspece"
        );


    const lotElement =
        document.getElementById(
            "incubationLot"
        );


    const couveuseElement =
        document.getElementById(
            "incubationCouveuse"
        );


    const oeufsElement =
        document.getElementById(
            "incubationOeufs"
        );


    const dateElement =
        document.getElementById(
            "incubationDateEntree"
        );


    const dureeElement =
        document.getElementById(
            "incubationDuree"
        );


    const notesElement =
        document.getElementById(
            "incubationNotes"
        );


    /* --------------------------------------------------------
       VÉRIFICATION CHAMPS
    -------------------------------------------------------- */

    if (
        !especeElement ||
        !lotElement ||
        !couveuseElement ||
        !oeufsElement ||
        !dateElement ||
        !dureeElement
    ) {

        alert(
            "Erreur : certains champs du formulaire d'incubation sont introuvables."
        );

        console.error(
            {
                espece:
                    !!especeElement,

                lot:
                    !!lotElement,

                couveuse:
                    !!couveuseElement,

                oeufs:
                    !!oeufsElement,

                date:
                    !!dateElement,

                duree:
                    !!dureeElement

            }
        );

        return false;

    }


    /* --------------------------------------------------------
       VALEURS
    -------------------------------------------------------- */

    const espece =
        especeElement.value.trim();


    const lotId =
        lotElement.value;


    const couveuse =
        couveuseElement.value.trim();


    const nombreOeufs =
        Number(
            oeufsElement.value
        );


    const dateEntree =
        dateElement.value;


    const duree =
        Number(
            dureeElement.value
        );


    const notes =
        notesElement
            ? notesElement.value.trim()
            : "";


    /* --------------------------------------------------------
       VALIDATION ESPÈCE
    -------------------------------------------------------- */

    if (!espece) {

        alert(
            "Veuillez sélectionner l'espèce."
        );

        return false;

    }


    /* --------------------------------------------------------
       VALIDATION LOT
    -------------------------------------------------------- */

    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot d'origine."
        );

        return false;

    }


    /* --------------------------------------------------------
       RÉCUPÉRER LE LOT
    -------------------------------------------------------- */

    const lot =
        trouverLotIncubation(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot sélectionné est introuvable dans Animaux & Lots."
        );

        return false;

    }


    /* --------------------------------------------------------
       VÉRIFIER ESPÈCE DU LOT
    -------------------------------------------------------- */

    const especeLot =
        obtenirEspeceLotIncubation(
            lot
        );


    if (
        especeLot &&
        especeLot !== espece
    ) {

        alert(

            "Erreur : l'espèce sélectionnée (" +
            espece +
            ") ne correspond pas à l'espèce du lot (" +
            especeLot +
            ")."

        );

        return false;

    }


    /* --------------------------------------------------------
       VALIDATION COUVEUSE
    -------------------------------------------------------- */

    if (!couveuse) {

        alert(
            "Veuillez sélectionner la couveuse."
        );

        return false;

    }


    /* --------------------------------------------------------
       VALIDATION ŒUFS
    -------------------------------------------------------- */

    if (
        !Number.isFinite(
            nombreOeufs
        ) ||
        nombreOeufs <= 0
    ) {

        alert(
            "Veuillez indiquer un nombre d'œufs valide."
        );

        return false;

    }


    /* --------------------------------------------------------
       VALIDATION DATE
    -------------------------------------------------------- */

    if (!dateEntree) {

        alert(
            "Veuillez indiquer la date d'entrée."
        );

        return false;

    }


    /* --------------------------------------------------------
       VALIDATION DURÉE
    -------------------------------------------------------- */

    if (
        !Number.isFinite(
            duree
        ) ||
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est invalide."
        );

        return false;

    }


    /* --------------------------------------------------------
       CAPACITÉ COUVEUSE
    -------------------------------------------------------- */

    if (
        !verifierCapaciteIncubation()
    ) {

        alert(
            "Le nombre d'œufs dépasse la capacité de la couveuse."
        );

        return false;

    }


    /* --------------------------------------------------------
       STOCK ŒUFS
    -------------------------------------------------------- */

    const stock =
        obtenirStockOeufsIncubationModule();


    const stocksDisponibles =
        stock.filter(
            function (ligne) {

                return (

                    String(
                        ligne.lotId
                    ) ===
                    String(
                        lotId
                    )

                    &&

                    Number(
                        ligne.quantiteDisponible ||
                        0
                    ) > 0

                );

            }
        );


    if (
        stocksDisponibles.length === 0
    ) {

        alert(

            "Aucun œuf disponible pour l'incubation dans le lot sélectionné."

        );

        return false;

    }


    /* --------------------------------------------------------
       STOCK TOTAL
    -------------------------------------------------------- */

    const totalDisponible =
        stocksDisponibles.reduce(
            function (
                total,
                ligne
            ) {

                return (
                    total +
                    Number(
                        ligne.quantiteDisponible ||
                        0
                    )
                );

            },
            0
        );


    /* --------------------------------------------------------
       PROTECTION SUR-PRÉLÈVEMENT
    -------------------------------------------------------- */

    if (
        nombreOeufs >
        totalDisponible
    ) {

        alert(

            "Stock d'œufs insuffisant.\n\n" +

            "Lot : " +
            obtenirNomLotIncubation(
                lot
            ) +

            "\n" +

            "Disponible : " +
            totalDisponible +
            " œufs\n" +

            "Demandé : " +
            nombreOeufs +
            " œufs"

        );

        return false;

    }


    /* --------------------------------------------------------
       DATE ÉCLOSION
    -------------------------------------------------------- */

    const dateEclosion =
        calculerDateEclosion(
            dateEntree,
            duree
        );


    if (!dateEclosion) {

        alert(
            "Impossible de calculer la date d'éclosion."
        );

        return false;

    }


    /* --------------------------------------------------------
       INCUBATIONS EXISTANTES
    -------------------------------------------------------- */

    const incubations =
        obtenirIncubations();


    /* --------------------------------------------------------
       ID
    -------------------------------------------------------- */

    const idIncubation =
        genererIdIncubation();


    /* --------------------------------------------------------
       CRÉER INCUBATION
    -------------------------------------------------------- */

    const nouvelleIncubation = {

        id:
            idIncubation,


        /*
         * LIEN DIRECT VERS ANIMAUX & LOTS
         */

        lotId:
            lot.id,


        lot:
            obtenirNomLotIncubation(
                lot
            ),


        lotNom:
            obtenirNomLotIncubation(
                lot
            ),


        espece:
            espece,


        type:
            lot.type ||
            espece,


        race:
            lot.race ||
            "",


        /*
         * COUVEUSE
         */

        couveuse:
            couveuse,


        /*
         * ŒUFS
         */

        oeufsInitial:
            nombreOeufs,


        oeufs:
            nombreOeufs,


        oeufsRetires:
            0,


        oeufsNonFecondes:
            0,


        embryonsMorts:
            0,


        poussinsEclos:
            0,


        eclos:
            0,


        pertes:
            0,


        /*
         * DATES
         */

        dateEntree:
            dateEntree,


        duree:
            duree,


        dateEclosion:
            dateEclosion,


        dateEclosionPrevue:
            dateEclosion,


        /*
         * ÉTAT
         */

        statut:
            "En incubation",


        brooderCree:
            false,


        /*
         * LIENS STOCK
         */

        productionId:
            null,


        stockOeufsIds:
            [],


        /*
         * NOTES
         */

        notes:
            notes,


        utilisateur:
            localStorage.getItem(
                "utilisateur"
            )
            ||
            localStorage.getItem(
                "utilisateurConnecte"
            )
            ||
            "Administrateur",


        dateCreation:
            new Date().toISOString()

    };


    /* ========================================================
       CONSOMMER LES ŒUFS DU STOCK
    ======================================================== */

    let resteAUtiliser =
        nombreOeufs;


    stocksDisponibles.forEach(
        function (ligne) {

            if (
                resteAUtiliser <= 0
            ) {

                return;

            }


            const disponible =
                Number(
                    ligne.quantiteDisponible ||
                    0
                );


            const utilise =
                Math.min(
                    disponible,
                    resteAUtiliser
                );


            /*
             * DIMINUER STOCK DISPONIBLE
             */

            ligne.quantiteDisponible =
                disponible -
                utilise;


            /*
             * AUGMENTER STOCK UTILISÉ
             */

            ligne.quantiteUtilisee =
                Number(
                    ligne.quantiteUtilisee ||
                    0
                ) +
                utilise;


            /*
             * STATUT
             */

            if (
                ligne.quantiteDisponible <=
                0
            ) {

                ligne.quantiteDisponible =
                    0;

                ligne.statut =
                    "Utilisé";

            }
            else {

                ligne.statut =
                    "Disponible";

            }


            /*
             * CONSERVER LE LIEN
             */

            nouvelleIncubation
                .stockOeufsIds
                .push(
                    ligne.id
                );


            /*
             * CONSERVER LE PREMIER
             * ID DE PRODUCTION
             */

            if (
                !nouvelleIncubation.productionId
            ) {

                nouvelleIncubation.productionId =
                    ligne.productionId ||
                    null;

            }


            /*
             * RETIRER DE LA QUANTITÉ À UTILISER
             */

            resteAUtiliser -=
                utilise;

        }
    );


    /* --------------------------------------------------------
       CONTRÔLE FINAL
    -------------------------------------------------------- */

    if (
        resteAUtiliser > 0
    ) {

        alert(

            "Erreur interne : tous les œufs demandés n'ont pas pu être affectés."

        );

        return false;

    }


    /* --------------------------------------------------------
       SAUVEGARDER STOCK
    -------------------------------------------------------- */

    if (
        !sauvegarderStockOeufsIncubationModule(
            stock
        )
    ) {

        return false;

    }


    /* --------------------------------------------------------
       ENREGISTRER INCUBATION
    -------------------------------------------------------- */

    incubations.push(
        nouvelleIncubation
    );


    if (
        !sauvegarderIncubations(
            incubations
        )
    ) {

        return false;

    }


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

    chargerLotsIncubation();

    chargerIncubations();

    actualiserStatistiquesIncubation();


    /* --------------------------------------------------------
       CONFIRMATION
    -------------------------------------------------------- */

    alert(

        "Incubation enregistrée avec succès.\n\n" +

        "ID : " +
        idIncubation +

        "\nLot : " +
        obtenirNomLotIncubation(
            lot
        ) +

        "\nEspèce : " +
        espece +

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
   AFFICHER LES INCUBATIONS
============================================================ */

function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        );


    if (!tableau) {

        return;

    }


    const incubations =
        obtenirIncubations();


    tableau.innerHTML =
        "";


    if (
        incubations.length ===
        0
    ) {

        tableau.innerHTML = `

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


    incubations
        .slice()
        .reverse()
        .forEach(
            function (
                incubation
            ) {

                let classeStatut =
                    "bg-success";


                if (
                    incubation.statut ===
                    "Terminée"
                ) {

                    classeStatut =
                        "bg-secondary";

                }


                if (
                    incubation.statut ===
                    "Éclosion"
                ) {

                    classeStatut =
                        "bg-warning text-dark";

                }


                if (
                    incubation.statut ===
                    "Annulée"
                ) {

                    classeStatut =
                        "bg-danger";

                }


                const ligne =
                    document.createElement(
                        "tr"
                    );


                ligne.innerHTML = `

                    <td>

                        ${incubation.id || "-"}

                    </td>


                    <td>

                        ${incubation.espece || "-"}

                    </td>


                    <td>

                        ${incubation.lotNom ||
                          incubation.lot ||
                          "-"}

                    </td>


                    <td>

                        ${incubation.couveuse || "-"}

                    </td>


                    <td>

                        ${Number(
                            incubation.oeufsInitial ||
                            incubation.oeufs ||
                            0
                        ).toLocaleString(
                            "fr-FR"
                        )}

                    </td>


                    <td>

                        ${formaterDateIncubation(
                            incubation.dateEntree
                        )}

                    </td>


                    <td>

                        ${formaterDateIncubation(
                            incubation.dateEclosion ||
                            incubation.dateEclosionPrevue
                        )}

                    </td>


                    <td>

                        <span
                            class="badge ${classeStatut}"
                        >

                            ${incubation.statut ||
                              "En incubation"}

                        </span>

                    </td>


                    <td
                        class="text-center">

                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            onclick="voirDetailsIncubation('${incubation.id}')"
                            title="Détails">

                            <i
                                class="fa-solid fa-eye">
                            </i>

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
   DÉTAILS INCUBATION
============================================================ */

function voirDetailsIncubation(
    id
) {

    const incubations =
        obtenirIncubations();


    const incubation =
        incubations.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (!incubation) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    alert(

        "INCUBATION " +
        incubation.id +

        "\n\nLot : " +
        (
            incubation.lotNom ||
            incubation.lot ||
            "-"
        ) +

        "\nEspèce : " +
        (
            incubation.espece ||
            "-"
        ) +

        "\nCouveuse : " +
        (
            incubation.couveuse ||
            "-"
        ) +

        "\nŒufs : " +
        (
            incubation.oeufsInitial ||
            incubation.oeufs ||
            0
        ) +

        "\nDate entrée : " +
        formaterDateIncubation(
            incubation.dateEntree
        ) +

        "\nÉclosion prévue : " +
        formaterDateIncubation(
            incubation.dateEclosion ||
            incubation.dateEclosionPrevue
        ) +

        "\nStatut : " +
        (
            incubation.statut ||
            "-"
        )

    );

}


/* ============================================================
   STATISTIQUES
============================================================ */

function actualiserStatistiquesIncubation() {

    const incubations =
        obtenirIncubations();


    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        );


    const oeufs =
        actives.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.oeufs ||
                        item.oeufsInitial ||
                        0
                    )
                );

            },
            0
        );


    const eclosions =
        actives.filter(
            function (item) {

                return (
                    item.dateEclosion &&
                    item.dateEclosion >=
                    obtenirDateIncubationAujourdhui()
                );

            }
        ).length;


    const poussins =
        incubations.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.poussinsEclos ||
                        item.eclos ||
                        0
                    )
                );

            },
            0
        );


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
            oeufs;

    }


    if (
        elementEclosions
    ) {

        elementEclosions.textContent =
            eclosions;

    }


    if (
        elementPoussins
    ) {

        elementPoussins.textContent =
            poussins;

    }

}


/* ============================================================
   INITIALISATION PAGE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Bouton Nouvelle incubation
         */

        const boutonNouvelle =
            document.querySelector(
                '[onclick="ouvrirModalIncubation()"]'
            );


        if (
            boutonNouvelle
        ) {

            /*
             * L'HTML possède déjà onclick.
             * Aucun remplacement nécessaire.
             */

            console.log(
                "Bouton Nouvelle incubation détecté."
            );

        }


        /*
         * Espèce
         */

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


        /*
         * Lot
         */

        const lot =
            document.getElementById(
                "incubationLot"
            );


        if (lot) {

            lot.addEventListener(
                "change",
                function () {

                    afficherStockDisponible();

                }
            );

        }


        /*
         * Date
         */

        const date =
            document.getElementById(
                "incubationDateEntree"
            );


        if (date) {

            date.addEventListener(
                "change",
                function () {

                    afficherEclosionIncubation();

                }
            );

        }


        /*
         * Durée
         */

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

        }


        /*
         * Œufs
         */

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


        /*
         * Couveuse
         */

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


        /*
         * Formulaire
         */

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


        /*
         * Chargement initial
         */

        chargerLotsIncubation();

        chargerIncubations();

        actualiserStatistiquesIncubation();


        console.log(
            "✓ incubation.js connecté à Animaux & Lots + Stock Œufs."
        );

    }
);


/* ============================================================
   EXPORT GLOBAL
   IMPORTANT POUR LES onclick DU HTML
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


window.afficherStockDisponible =
    afficherStockDisponible;


window.afficherEclosionIncubation =
    afficherEclosionIncubation;


window.chargerDureeIncubation =
    chargerDureeIncubation;


window.actualiserStatistiquesIncubation =
    actualiserStatistiquesIncubation;


window.voirDetailsIncubation =
    voirDetailsIncubation;


console.log(
    "✓ Ferme Asher ERP — incubation.js prêt."
);
