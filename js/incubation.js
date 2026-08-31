/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : /js/incubation.js

   CHAÎNE DE TRAÇABILITÉ :

   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS POUR INCUBATION
        ↓
   INCUBATION
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE
        ↓
   NOUVEAU LOT

   CLÉ PRINCIPALE DE LIAISON :
       lotId

   LIAISONS CONSERVÉES :
       lotId
       lotOrigineId
       productionId
       productionIds
       stockOeufsIds
============================================================ */

"use strict";


/* ============================================================
   CONFIGURATION
============================================================ */

const INCUBATION_STORAGE = {

    LOTS:
        "lotsElevage",

    STOCK:
        "stockOeufsIncubation",

    INCUBATIONS:
        "incubations"

};


/* ============================================================
   DURÉES D'INCUBATION
============================================================ */

const DUREES_INCUBATION = {

    "Cailles": 17,

    "Caille": 17,

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


/* ============================================================
   OUTILS LOCALSTORAGE
============================================================ */

function incubationLire(cle) {

    try {

        const valeur =
            localStorage.getItem(cle);


        if (!valeur) {

            return [];

        }


        const donnees =
            JSON.parse(valeur);


        return Array.isArray(donnees)
            ? donnees
            : [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture :",
            cle,
            erreur
        );

        return [];

    }

}


function incubationSauver(
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
            "Erreur sauvegarde :",
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
   COMPATIBILITÉ AVEC ELEVAGE.JS
============================================================ */

function obtenirLotsIncubation() {

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


    return incubationLire(
        INCUBATION_STORAGE.LOTS
    );

}


function obtenirStockIncubation() {

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


    return incubationLire(
        INCUBATION_STORAGE.STOCK
    );

}


function obtenirIncubations() {

    return incubationLire(
        INCUBATION_STORAGE.INCUBATIONS
    );

}


/* ============================================================
   UTILITAIRES
============================================================ */

function incubationGenererId(prefixe) {

    return (

        prefixe +

        "-" +

        Date.now().toString(36) +

        "-" +

        Math.random()
            .toString(36)
            .substring(2, 8)

    ).toUpperCase();

}


function incubationDateAujourdhui() {

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


function incubationFormaterDate(date) {

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


function incubationAjouterJours(
    dateTexte,
    jours
) {

    if (!dateTexte) {

        return "";

    }


    const date =
        new Date(
            dateTexte + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    date.setDate(
        date.getDate() +
        Number(jours)
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
   NOM DU LOT
============================================================ */

function incubationNomLot(lot) {

    if (!lot) {

        return "-";

    }


    return (

        lot.nom ||

        lot.nomLot ||

        lot.code ||

        lot.reference ||

        lot.id ||

        "-"

    );

}


/* ============================================================
   ESPÈCE DU LOT
============================================================ */

function incubationEspeceLot(lot) {

    if (!lot) {

        return "";

    }


    return (

        lot.espece ||

        lot.type ||

        lot.specie ||

        ""

    );

}


/* ============================================================
   RACE DU LOT
============================================================ */

function incubationRaceLot(lot) {

    if (!lot) {

        return "";

    }


    return (

        lot.race ||

        lot.variete ||

        ""

    );

}


/* ============================================================
   RECHERCHER UN LOT PAR ID
============================================================ */

function incubationTrouverLot(
    lotId
) {

    if (!lotId) {

        return null;

    }


    const lots =
        obtenirLotsIncubation();


    return (

        lots.find(
            function (lot) {

                return (

                    String(
                        lot.id
                    ) ===
                    String(
                        lotId
                    )

                );

            }
        ) ||

        null

    );

}


/* ============================================================
   TROUVER L'ANIMAL LIÉ AU LOT
============================================================ */

function incubationTrouverAnimalOrigine(
    lot
) {

    if (!lot) {

        return null;

    }


    /*
     * Si le lot contient déjà l'ID
     * de l'animal origine.
     */

    if (
        lot.animalId
    ) {

        if (
            typeof obtenirAnimaux ===
            "function"
        ) {

            const animaux =
                obtenirAnimaux();


            if (
                Array.isArray(animaux)
            ) {

                const animal =
                    animaux.find(
                        function (item) {

                            return (

                                String(
                                    item.id
                                ) ===
                                String(
                                    lot.animalId
                                )

                            );

                        }
                    );


                if (animal) {

                    return animal;

                }

            }

        }

    }


    /*
     * Sinon, chercher un animal
     * dont lotId correspond au lot.
     */

    if (
        typeof obtenirAnimaux ===
        "function"
    ) {

        const animaux =
            obtenirAnimaux();


        if (
            Array.isArray(animaux)
        ) {

            const animal =
                animaux.find(
                    function (item) {

                        return (

                            String(
                                item.lotId
                            ) ===
                            String(
                                lot.id
                            )

                        );

                    }
                );


            if (animal) {

                return animal;

            }

        }

    }


    return null;

}


/* ============================================================
   CALCUL DES ŒUFS DISPONIBLES POUR UN LOT

   IMPORTANT :
   On utilise lotId comme clé.

   Le stock peut contenir plusieurs productions
   provenant du même lot.
============================================================ */

function obtenirOeufsDisponiblesPourLotIncubation(
    lotId
) {

    if (!lotId) {

        return [];

    }


    const stock =
        obtenirStockIncubation();


    if (
        !Array.isArray(stock)
    ) {

        return [];

    }


    return stock.filter(
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

}


/* ============================================================
   QUANTITÉ DISPONIBLE POUR UN LOT
============================================================ */

function obtenirQuantiteDisponibleLotIncubation(
    lotId
) {

    const lignes =
        obtenirOeufsDisponiblesPourLotIncubation(
            lotId
        );


    return lignes.reduce(
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

   SEULS LES LOTS AYANT DES ŒUFS DESTINÉS
   À L'INCUBATION SONT AFFICHÉS.
============================================================ */

function chargerLotsIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    if (!select) {

        return;

    }


    const especeElement =
        document.getElementById(
            "incubationEspece"
        );


    const especeSelectionnee =
        especeElement
            ? especeElement.value
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


    lots.forEach(
        function (lot) {

            if (!lot || !lot.id) {

                return;

            }


            /*
             * Uniquement les lots actifs.
             */

            const statut =
                lot.statut ||
                "Actif";


            if (
                statut !== "Actif"
            ) {

                return;

            }


            const espece =
                incubationEspeceLot(
                    lot
                );


            /*
             * Filtre espèce.
             */

            if (
                especeSelectionnee
                &&
                espece !==
                especeSelectionnee
            ) {

                return;

            }


            /*
             * Œufs disponibles.
             */

            const disponible =
                obtenirQuantiteDisponibleLotIncubation(
                    lot.id
                );


            if (
                disponible <= 0
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lot.id;


            option.dataset.lotId =
                lot.id;


            option.dataset.espece =
                espece;


            option.dataset.race =
                incubationRaceLot(
                    lot
                );


            option.textContent =

                incubationNomLot(
                    lot
                ) +

                " — " +

                espece +

                (

                    incubationRaceLot(
                        lot
                    )
                        ? " / " +
                          incubationRaceLot(
                              lot
                          )
                        : ""

                ) +

                " — " +

                disponible +

                " œufs disponibles";


            select.appendChild(
                option
            );

        }
    );


    /*
     * Restaurer l'ancienne sélection
     * si elle existe toujours.
     */

    if (
        ancienneValeur
    ) {

        const existe =
            Array.from(
                select.options
            ).some(
                function (option) {

                    return (

                        option.value ===
                        ancienneValeur

                    );

                }
            );


        if (existe) {

            select.value =
                ancienneValeur;

        }

    }


    afficherStockDisponible();

    afficherInformationsLotOrigine();

}


/* ============================================================
   AFFICHER LES INFORMATIONS DU LOT
============================================================ */

function afficherInformationsLotOrigine() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    if (!select) {

        return;

    }


    const lotId =
        select.value;


    const lot =
        incubationTrouverLot(
            lotId
        );


    if (!lot) {

        return;

    }


    /*
     * Quelques ID possibles dans le HTML.
     * On ne plante pas si certains n'existent pas.
     */

    const nom =
        incubationNomLot(
            lot
        );


    const espece =
        incubationEspeceLot(
            lot
        );


    const race =
        incubationRaceLot(
            lot
        );


    const disponible =
        obtenirQuantiteDisponibleLotIncubation(
            lot.id
        );


    const elements = [

        "incubationLotNom",

        "lotOrigineNom",

        "incubationOrigine",

        "incubationInfoLot"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            element.textContent =

                nom +

                " — " +

                espece +

                (

                    race
                        ? " / " + race
                        : ""

                ) +

                " — " +

                disponible +

                " œufs disponibles";

        }
    );

}


/* ============================================================
   AFFICHER LE STOCK DISPONIBLE
============================================================ */

function afficherStockDisponible() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    const affichage =
        document.getElementById(
            "oeufsDisponibles"
        );


    if (!select) {

        return;

    }


    const lotId =
        select.value;


    if (!lotId) {

        if (affichage) {

            affichage.textContent =
                "0";

        }

        return;

    }


    const disponible =
        obtenirQuantiteDisponibleLotIncubation(
            lotId
        );


    /*
     * Mettre à jour plusieurs ID possibles
     * sans provoquer d'erreur.
     */

    const ids = [

        "oeufsDisponibles",

        "incubationStockDisponible",

        "stockDisponible",

        "incubationOeufsDisponibles"

    ];


    ids.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            element.textContent =
                disponible;

        }
    );


    /*
     * Mettre la quantité maximale
     * du champ œufs.
     */

    const input =
        document.getElementById(
            "incubationOeufs"
        );


    if (input) {

        input.max =
            disponible;

    }


    afficherInformationsLotOrigine();

    verifierStockIncubation();

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


    const nombreJours =
        DUREES_INCUBATION[
            espece.value
        ];


    if (
        nombreJours
    ) {

        duree.value =
            nombreJours;

    }


    afficherEclosionIncubation();

}


/* ============================================================
   DATE D'ÉCLOSION
============================================================ */

function afficherEclosionIncubation() {

    const dateElement =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
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
        incubationAjouterJours(
            dateElement.value,
            dureeElement.value
        );


    const elements = [

        "dateEclosion",

        "incubationDateEclosion",

        "incubationEclosion",

        "incubationDateEclosionPrevue"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            if (
                element.tagName ===
                "INPUT"
            ) {

                element.value =
                    dateEclosion;

            }

            else {

                element.textContent =
                    incubationFormaterDate(
                        dateEclosion
                    );

            }

        }
    );

}


/* ============================================================
   VÉRIFICATION DU STOCK
============================================================ */

function verifierStockIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    const input =
        document.getElementById(
            "incubationOeufs"
        );


    if (
        !select ||
        !input
    ) {

        return true;

    }


    const lotId =
        select.value;


    const nombre =
        Number(
            input.value || 0
        );


    const disponible =
        obtenirQuantiteDisponibleLotIncubation(
            lotId
        );


    const message =
        document.getElementById(
            "messageStockIncubation"
        );


    if (
        nombre > disponible
    ) {

        input.classList.add(
            "is-invalid"
        );


        if (message) {

            message.textContent =

                "Stock insuffisant : " +

                disponible +

                " œufs disponibles.";

            message.className =
                "text-danger";

        }


        return false;

    }


    input.classList.remove(
        "is-invalid"
    );


    if (message) {

        message.textContent =

            disponible +

            " œufs disponibles.";

        message.className =
            "text-success";

    }


    return true;

}


/* ============================================================
   OUVRIR LE MODAL
============================================================ */

function ouvrirModalIncubation() {

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    /*
     * Date du jour.
     */

    const date =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
        );


    if (date) {

        date.value =
            incubationDateAujourdhui();

    }


    /*
     * Recharger les lots.
     */

    chargerLotsIncubation();

    chargerDureeIncubation();

    afficherEclosionIncubation();


    /*
     * Bootstrap Modal.
     */

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
            bootstrap.Modal.getOrCreateInstance(
                modal
            );


        instance.show();

        return;

    }


    /*
     * Fallback sans Bootstrap.
     */

    if (modal) {

        modal.style.display =
            "block";

        modal.classList.add(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* ============================================================
   FERMER LE MODAL
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

            return;

        }

    }


    modal.style.display =
        "none";

    modal.classList.remove(
        "show"
    );

}


/* ============================================================
   ENREGISTRER UNE INCUBATION
============================================================ */

function enregistrerIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    /*
     * Récupérer les champs.
     */

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
        ) ||
        document.getElementById(
            "incubationDate"
        );


    const dureeElement =
        document.getElementById(
            "incubationDuree"
        );


    /*
     * Vérification.
     */

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
        especeElement.value;


    const lotId =
        lotElement.value;


    const nombreOeufs =
        Number(
            oeufsElement.value || 0
        );


    const couveuse =
        couveuseElement
            ? couveuseElement.value
            : "";


    const dateEntree =
        dateElement.value;


    const duree =
        Number(
            dureeElement.value || 0
        );


    /*
     * Validations.
     */

    if (!espece) {

        alert(
            "Sélectionnez l'espèce."
        );

        return false;

    }


    if (!lotId) {

        alert(
            "Sélectionnez le lot d'origine."
        );

        return false;

    }


    if (
        nombreOeufs <= 0
    ) {

        alert(
            "Entrez un nombre d'œufs supérieur à zéro."
        );

        return false;

    }


    if (!dateEntree) {

        alert(
            "Sélectionnez la date d'entrée en incubation."
        );

        return false;

    }


    if (
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est invalide."
        );

        return false;

    }


    /*
     * Récupérer le lot.
     */

    const lot =
        incubationTrouverLot(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot sélectionné est introuvable."
        );

        return false;

    }


    /*
     * Récupérer les stocks du lot.
     */

    const stock =
        obtenirStockIncubation();


    if (
        !Array.isArray(stock)
    ) {

        alert(
            "Impossible de lire le stock d'œufs."
        );

        return false;

    }


    /*
     * IMPORTANT :
     * On travaille uniquement avec
     * le lot sélectionné.
     */

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


    /*
     * Stock total disponible.
     */

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


    /*
     * Empêcher le prélèvement
     * supérieur au stock.
     */

    if (
        nombreOeufs >
        totalDisponible
    ) {

        alert(

            "Stock d'œufs insuffisant.\n\n" +

            "Lot : " +

            incubationNomLot(
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


    /*
     * Date d'éclosion.
     */

    const dateEclosion =
        incubationAjouterJours(
            dateEntree,
            duree
        );


    if (!dateEclosion) {

        alert(
            "Impossible de calculer la date d'éclosion."
        );

        return false;

    }


    /*
     * Trouver l'animal origine.
     */

    const animal =
        incubationTrouverAnimalOrigine(
            lot
        );


    /*
     * Incubations existantes.
     */

    const incubations =
        obtenirIncubations();


    /*
     * ID.
     */

    const idIncubation =
        incubationGenererId(
            "INC"
        );


    /*
     * Production(s) utilisée(s).
     *
     * Plusieurs productions peuvent
     * appartenir au même lot.
     */

    const productionIds = [];

    const stockOeufsIds = [];


    let resteAUtiliser =
        nombreOeufs;


    /*
     * Parcours des stocks dans l'ordre.
     */

    for (
        let i = 0;

        i < stocksDisponibles.length;

        i++
    ) {

        if (
            resteAUtiliser <= 0
        ) {

            break;

        }


        const ligne =
            stocksDisponibles[i];


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


        if (
            utilise <= 0
        ) {

            continue;

        }


        /*
         * CONSERVER LE LIEN
         * PRODUCTION → STOCK → INCUBATION
         */

        if (
            ligne.productionId
        ) {

            if (
                !productionIds.includes(
                    ligne.productionId
                )
            ) {

                productionIds.push(
                    ligne.productionId
                );

            }

        }


        /*
         * CONSERVER L'ID DU STOCK.
         */

        if (
            ligne.id
        ) {

            if (
                !stockOeufsIds.includes(
                    ligne.id
                )
            ) {

                stockOeufsIds.push(
                    ligne.id
                );

            }

        }


        /*
         * DÉDUCTION DU STOCK.
         */

        ligne.quantiteDisponible =
            disponible -
            utilise;


        /*
         * Quantité utilisée.
         */

        ligne.quantiteUtilisee =
            Number(
                ligne.quantiteUtilisee ||
                0
            ) +
            utilise;


        /*
         * Statut.
         */

        ligne.statut =

            ligne.quantiteDisponible > 0

                ? "Disponible"

                : "Utilisé";


        /*
         * Marquer la quantité utilisée
         * par cette incubation.
         */

        ligne.derniereIncubationId =
            idIncubation;


        resteAUtiliser -=
            utilise;

    }


    /*
     * Sécurité finale.
     */

    if (
        resteAUtiliser > 0
    ) {

        alert(
            "Impossible de prélever tous les œufs demandés."
        );

        return false;

    }


    /*
     * Production principale.
     *
     * Pour compatibilité avec les anciens
     * enregistrements, on garde un seul
     * productionId principal.
     */

    const productionId =
        productionIds.length > 0
            ? productionIds[0]
            : "";


    /*
     * Créer l'incubation.
     */

    const nouvelleIncubation = {

        /*
         * IDENTIFICATION
         */

        id:
            idIncubation,


        /*
         * LOT D'ORIGINE
         */

        lotOrigineId:
            lot.id,


        lotOrigineNom:
            incubationNomLot(
                lot
            ),


        lotId:
            lot.id,


        lot:
            incubationNomLot(
                lot
            ),


        lotNom:
            incubationNomLot(
                lot
            ),


        /*
         * ANIMAL D'ORIGINE
         */

        animalOrigineId:
            animal
                ? animal.id
                : "",


        animalOrigineNom:
            animal
                ? (

                    animal.nom ||

                    animal.type ||

                    animal.race ||

                    animal.id ||

                    ""

                )
                : "",


        /*
         * ESPÈCE
         */

        espece:
            espece,


        type:
            lot.type ||
            espece,


        race:
            incubationRaceLot(
                lot
            ),


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


        nombreOeufs:
            nombreOeufs,


        oeufsIncubes:
            nombreOeufs,


        oeufs:
            nombreOeufs,


        oeufsRestants:
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


        date:
            dateEntree,


        duree:
            duree,


        dateEclosion:
            dateEclosion,


        dateEclosionPrevue:
            dateEclosion,


        /*
         * STATUT
         */

        statut:
            "En incubation",


        /*
         * POUSSINIÈRE
         */

        brooderCree:
            false,


        poussiniereCree:
            false,


        /*
         * TRAÇABILITÉ PRODUCTION
         */

        productionId:
            productionId,


        productionIds:
            productionIds,


        /*
         * TRAÇABILITÉ STOCK
         */

        stockOeufsIds:
            stockOeufsIds,


        /*
         * DATES DE CRÉATION
         */

        dateCreation:
            new Date()
                .toISOString(),


        /*
         * UTILISATEUR
         */

        utilisateur:

            localStorage.getItem(
                "utilisateur"
            ) ||

            localStorage.getItem(
                "utilisateurConnecte"
            ) ||

            "Administrateur",


        /*
         * NOTES
         */

        notes:

            document.getElementById(
                "incubationNotes"
            )?.value ||

            ""

    };


    /*
     * Ajouter l'incubation.
     */

    incubations.push(
        nouvelleIncubation
    );


    /*
     * SAUVEGARDER L'INCUBATION
     */

    const sauvegardeIncubation =
        incubationSauver(
            INCUBATION_STORAGE.INCUBATIONS,
            incubations
        );


    if (
        !sauvegardeIncubation
    ) {

        return false;

    }


    /*
     * SAUVEGARDER LE STOCK MODIFIÉ.
     */

    const sauvegardeStock =
        incubationSauver(
            INCUBATION_STORAGE.STOCK,
            stock
        );


    if (
        !sauvegardeStock
    ) {

        return false;

    }


    /*
     * Si elevage.js possède une fonction
     * de sauvegarde du stock, l'utiliser
     * également pour garder la cohérence.
     */

    if (
        typeof sauvegarderStockOeufsIncubation ===
        "function"
    ) {

        try {

            sauvegarderStockOeufsIncubation(
                stock
            );

        }

        catch (erreur) {

            console.warn(
                "Sauvegarde stock via elevage.js impossible :",
                erreur
            );

        }

    }


    /*
     * Actualiser l'affichage.
     */

    chargerLotsIncubation();

    chargerIncubations();

    actualiserStatistiquesIncubation();


    /*
     * Fermer le formulaire.
     */

    fermerModalIncubation();


    /*
     * Message de confirmation.
     */

    alert(

        "Incubation enregistrée avec succès.\n\n" +

        "Lot : " +

        incubationNomLot(
            lot
        ) +

        "\n" +

        "Œufs incubés : " +

        nombreOeufs +

        "\n" +

        "Production(s) liée(s) : " +

        (

            productionIds.length > 0

                ? productionIds.join(", ")

                : "Aucune"

        ) +

        "\n\n" +

        "Éclosion prévue le : " +

        incubationFormaterDate(
            dateEclosion
        )

    );


    return true;

}


/* ============================================================
   CHARGER LES INCUBATIONS
============================================================ */

function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        ) ||
        document.getElementById(
            "tableauIncubations"
        );


    if (!tableau) {

        return;

    }


    const incubations =
        obtenirIncubations();


    tableau.innerHTML =
        "";


    if (
        incubations.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted py-4"
                >

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
            function (item) {

                const statut =
                    item.statut ||
                    "En incubation";


                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${item.id || "-"}
                        </td>

                        <td>
                            ${
                                incubationFormaterDate(
                                    item.dateEntree ||
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lotOrigineNom ||
                                item.lotNom ||
                                item.lot ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.espece ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.race ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.couveuse ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.oeufsInitial ||
                                item.nombreOeufs ||
                                item.oeufs ||
                                0
                            }
                        </td>

                        <td>
                            ${
                                item.poussinsEclos ||
                                item.eclos ||
                                0
                            }
                        </td>

                        <td>
                            ${
                                incubationFormaterDate(
                                    item.dateEclosion ||
                                    item.dateEclosionPrevue
                                )
                            }
                        </td>

                        <td>

                            <span
                                class="badge bg-success"
                            >

                                ${statut}

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary"
                                onclick="voirDetailsIncubation('${item.id}')"
                            >

                                <i class="fa-solid fa-eye"></i>

                                Voir

                            </button>

                        </td>

                    </tr>

                `;

            }
        );

}


/* ============================================================
   DÉTAILS D'UNE INCUBATION
============================================================ */

function voirDetailsIncubation(
    id
) {

    const incubations =
        obtenirIncubations();


    const item =
        incubations.find(
            function (incubation) {

                return (

                    String(
                        incubation.id
                    ) ===
                    String(
                        id
                    )

                );

            }
        );


    if (!item) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    const production =
        item.productionIds &&
        item.productionIds.length > 0

            ? item.productionIds.join(
                ", "
            )

            : (

                item.productionId ||
                "Aucune"

            );


    const stock =
        item.stockOeufsIds &&
        item.stockOeufsIds.length > 0

            ? item.stockOeufsIds.join(
                ", "
            )

            : "Aucun";


    alert(

        "DÉTAILS DE L'INCUBATION\n\n" +

        "ID : " +
        item.id +

        "\n\n" +

        "Lot d'origine : " +
        (
            item.lotOrigineNom ||
            item.lotNom ||
            item.lot ||
            "-"
        ) +

        "\n" +

        "Lot ID : " +
        (
            item.lotOrigineId ||
            item.lotId ||
            "-"
        ) +

        "\n\n" +

        "Espèce : " +
        (
            item.espece ||
            "-"
        ) +

        "\n" +

        "Race : " +
        (
            item.race ||
            "-"
        ) +

        "\n\n" +

        "Production liée : " +
        production +

        "\n\n" +

        "Stock utilisé : " +
        stock +

        "\n\n" +

        "Œufs incubés : " +
        (
            item.oeufsInitial ||
            item.nombreOeufs ||
            item.oeufs ||
            0
        ) +

        "\n\n" +

        "Date entrée : " +
        incubationFormaterDate(
            item.dateEntree ||
            item.date
        ) +

        "\n" +

        "Éclosion prévue : " +
        incubationFormaterDate(
            item.dateEclosion ||
            item.dateEclosionPrevue
        ) +

        "\n\n" +

        "Statut : " +
        (
            item.statut ||
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


    /*
     * Total incubations.
     */

    const total =
        incubations.length;


    /*
     * Incubations en cours.
     */

    const enCours =
        incubations.filter(
            function (item) {

                return (

                    item.statut ===
                    "En incubation"

                );

            }
        ).length;


    /*
     * Total œufs incubés.
     */

    const oeufs =
        incubations.reduce(
            function (
                total,
                item
            ) {

                return (

                    total +

                    Number(
                        item.oeufsInitial ||
                        item.nombreOeufs ||
                        item.oeufs ||
                        0
                    )

                );

            },
            0
        );


    /*
     * Total poussins éclos.
     */

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


    const statistiques = {

        "totalIncubations":
            total,

        "incubationsActives":
            enCours,

        "totalOeufsIncubes":
            oeufs,

        "totalPoussinsEclos":
            poussins,

        "incubationsTotal":
            total

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
                    statistiques[id];

            }

        }
    );

}


/* ============================================================
   INITIALISATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Initialisation incubation.js..."
        );


        /*
         * Bouton Nouvelle incubation.
         */

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


        /*
         * ESPÈCE
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
         * LOT
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

                    afficherInformationsLotOrigine();

                }
            );

        }


        /*
         * DATE
         */

        const date =
            document.getElementById(
                "incubationDateEntree"
            ) ||
            document.getElementById(
                "incubationDate"
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
         * DURÉE
         */

        const duree =
            document.getElementById(
                "incubationDuree"
            );


        if (duree) {

            duree.addEventListener(
                "input",
                function () {

                    afficherEclosionIncubation();

                }
            );


            duree.addEventListener(
                "change",
                function () {

                    afficherEclosionIncubation();

                }
            );

        }


        /*
         * ŒUFS
         */

        const oeufs =
            document.getElementById(
                "incubationOeufs"
            );


        if (oeufs) {

            oeufs.addEventListener(
                "input",
                function () {

                    verifierStockIncubation();

                }
            );

        }


        /*
         * FORMULAIRE
         */

        const formulaire =
            document.getElementById(
                "formIncubation"
            );


        if (formulaire) {

            formulaire.addEventListener(
                "submit",
                function (event) {

                    enregistrerIncubation(
                        event
                    );

                }
            );

        }


        /*
         * CHARGEMENT INITIAL
         */

        chargerDureeIncubation();

        chargerLotsIncubation();

        chargerIncubations();

        actualiserStatistiquesIncubation();


        console.log(
            "✓ incubation.js connecté."
        );

    }
);


/* ============================================================
   EXPORTS GLOBAUX
   Nécessaires aux onclick du HTML.
============================================================ */

window.ouvrirModalIncubation =
    ouvrirModalIncubation;


window.fermerModalIncubation =
    fermerModalIncubation;


window.enregistrerIncubation =
    enregistrerIncubation;


window.chargerLotsIncubation =
    chargerLotsIncubation;


window.afficherStockDisponible =
    afficherStockDisponible;


window.afficherInformationsLotOrigine =
    afficherInformationsLotOrigine;


window.verifierStockIncubation =
    verifierStockIncubation;


window.chargerDureeIncubation =
    chargerDureeIncubation;


window.afficherEclosionIncubation =
    afficherEclosionIncubation;


window.chargerIncubations =
    chargerIncubations;


window.actualiserStatistiquesIncubation =
    actualiserStatistiquesIncubation;


window.voirDetailsIncubation =
    voirDetailsIncubation;


window.obtenirOeufsDisponiblesPourLotIncubation =
    obtenirOeufsDisponiblesPourLotIncubation;


window.obtenirQuantiteDisponibleLotIncubation =
    obtenirQuantiteDisponibleLotIncubation;


console.log(
    "✓ Ferme Asher ERP — incubation.js prêt."
);
