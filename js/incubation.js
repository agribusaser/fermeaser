/* =========================================================
   FERME ASHER ERP
   MODULE INCUBATION
   VERSION PROPRE
   ---------------------------------------------------------
   CHAINE :
   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS
        ↓
   INCUBATION
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE
        ↓
   NOUVEAU LOT
========================================================= */

"use strict";


/* =========================================================
   OUTILS
========================================================= */

function incubationLire(cle) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(cle)
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (erreur) {

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

    localStorage.setItem(
        cle,
        JSON.stringify(donnees)
    );

}


function incubationId(prefix = "INC") {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


function incubationDateAujourdhui() {

    const d = new Date();

    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


function incubationAjouterJours(
    date,
    jours
) {

    if (!date || !jours) {

        return "";

    }

    const d =
        new Date(
            date + "T00:00:00"
        );

    d.setDate(
        d.getDate() +
        Number(jours)
    );

    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


/* =========================================================
   DURÉES D'INCUBATION
========================================================= */

const DUREES_INCUBATION = {

    "Cailles": 17,

    "Poules": 21,

    "Poulets": 21,

    "Canards": 28,

    "Pintades": 28

};


/* =========================================================
   LOTS D'ÉLEVAGE
========================================================= */

function incubationObtenirLots() {

    /*
     * SOURCE PRINCIPALE :
     * lotsElevage
     */

    const lots =
        incubationLire(
            "lotsElevage"
        );

    return lots;

}


/* =========================================================
   ANIMAUX
========================================================= */

function incubationObtenirAnimaux() {

    /*
     * SOURCE :
     * animauxElevage
     */

    return incubationLire(
        "animauxElevage"
    );

}


/* =========================================================
   TROUVER UN LOT
========================================================= */

function incubationTrouverLot(
    lotId
) {

    const lots =
        incubationObtenirLots();

    return lots.find(
        function (lot) {

            return (
                String(lot.id) ===
                String(lotId)
            );

        }
    ) || null;

}


/* =========================================================
   TROUVER LES ANIMAUX DU LOT
========================================================= */

function incubationAnimauxDuLot(
    lotId
) {

    const animaux =
        incubationObtenirAnimaux();

    return animaux.filter(
        function (animal) {

            /*
             * Plusieurs anciennes structures
             * sont acceptées.
             */

            const animalLotId =
                animal.lotId ??
                animal.lot ??
                animal.lotOrigineId ??
                animal.lotIdOrigine ??
                "";

            return (
                String(animalLotId) ===
                String(lotId)
            );

        }
    );

}


/* =========================================================
   TROUVER ANIMAL D'ORIGINE
========================================================= */

function incubationTrouverAnimalOrigine(
    lot
) {

    if (!lot) {

        return null;

    }


    /*
     * Si le lot possède déjà
     * un animalId explicite.
     */

    const animalId =
        lot.animalId ??
        lot.animalOrigineId ??
        "";


    const animaux =
        incubationObtenirAnimaux();


    if (animalId) {

        const animal =
            animaux.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(animalId)
                    );

                }
            );

        if (animal) {

            return animal;

        }

    }


    /*
     * Sinon rechercher les animaux
     * appartenant au lot.
     */

    const animauxLot =
        incubationAnimauxDuLot(
            lot.id
        );


    if (animauxLot.length > 0) {

        return animauxLot[0];

    }


    return null;

}


/* =========================================================
   NOM DU LOT
========================================================= */

function incubationNomLot(
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


/* =========================================================
   ESPÈCE DU LOT
========================================================= */

function incubationEspeceLot(
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


/* =========================================================
   RACE DU LOT
========================================================= */

function incubationRaceLot(
    lot
) {

    if (!lot) {

        return "";

    }

    return (
        lot.race ||
        ""
    );

}


/* =========================================================
   STOCK DES ŒUFS
========================================================= */

function incubationObtenirStockOeufs() {

    /*
     * Première possibilité :
     * stockOeufsIncubation
     */

    let stock =
        incubationLire(
            "stockOeufsIncubation"
        );

    if (stock.length > 0) {

        return stock;

    }


    /*
     * Deuxième possibilité :
     * stockOeufs
     */

    stock =
        incubationLire(
            "stockOeufs"
        );

    if (stock.length > 0) {

        return stock;

    }


    return [];

}


/* =========================================================
   STOCK DISPONIBLE POUR UN LOT
========================================================= */

function obtenirOeufsDisponiblesPourLotIncubation(
    lotId
) {

    const stock =
        incubationObtenirStockOeufs();

    let total = 0;


    stock.forEach(
        function (ligne) {

            const ligneLotId =
                ligne.lotId ??
                ligne.lotOrigineId ??
                ligne.lot ??
                "";


            if (
                String(ligneLotId) !==
                String(lotId)
            ) {

                return;

            }


            const quantite =
                Number(
                    ligne.quantiteDisponible ??
                    ligne.stockDisponible ??
                    ligne.quantite ??
                    ligne.oeufsDisponibles ??
                    0
                );


            total += quantite;

        }
    );


    return total;

}


/* ============================================================
   CHARGER LES LOTS D'ORIGINE POUR INCUBATION
========================================================= */

   CHAÎNE :
   ANIMAUX & LOTS
        ↓
   PRODUCTION ŒUFS
        ↓
   STOCK ŒUFS INCUBATION
        ↓
   INCUBATION

   IMPORTANT :
   On affiche uniquement les lots qui possèdent
   réellement des œufs disponibles pour incubation.
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


    /*
     * Récupérer les lots d'élevage.
     */

    const lots =
        obtenirLotsElevage();


    /*
     * Récupérer le stock d'œufs.
     */

    const stock =
        obtenirStockOeufsIncubation();


    /*
     * Mémoriser le lot actuellement sélectionné.
     */

    const ancienneValeur =
        select.value;


    /*
     * Réinitialiser la liste.
     */

    select.innerHTML = `

        <option value="">
            Sélectionner un lot
        </option>

    `;


    /*
     * Construire la liste.
     */

    lots
        .filter(function (lot) {

            const espece =
                lot.espece ||
                lot.type ||
                "";


            const statut =
                lot.statut ||
                "Actif";


            /*
             * Stock disponible appartenant
             * à ce lot.
             */

            const stockLot =
                stock.filter(
                    function (ligne) {

                        return (

                            String(
                                ligne.lotId
                            ) ===
                            String(
                                lot.id
                            )

                            &&

                            Number(
                                ligne.quantiteDisponible ||
                                0
                            ) > 0

                        );

                    }
                );


            /*
             * Quantité totale disponible.
             */

            const disponible =
                stockLot.reduce(
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
             * Le lot doit :
             *
             * 1. être actif
             * 2. correspondre à l'espèce
             * 3. avoir des œufs disponibles
             */

            return (

                statut === "Actif"

                &&

                (
                    !especeSelectionnee ||
                    espece === especeSelectionnee
                )

                &&

                disponible > 0

            );

        })


        .forEach(function (lot) {


            const stockLot =
                stock.filter(
                    function (ligne) {

                        return (

                            String(
                                ligne.lotId
                            ) ===
                            String(
                                lot.id
                            )

                            &&

                            Number(
                                ligne.quantiteDisponible ||
                                0
                            ) > 0

                        );

                    }
                );


            const disponible =
                stockLot.reduce(
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


            const nom =
                lot.nom ||
                lot.nomLot ||
                lot.code ||
                lot.id;


            const espece =
                lot.espece ||
                lot.type ||
                "";


            const race =
                lot.race ||
                "";


            /*
             * Affichage du lot.
             */

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lot.id;


            option.dataset.espece =
                espece;


            option.dataset.lotId =
                lot.id;


            option.dataset.nom =
                nom;


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
                disponible +
                " œufs disponibles";


            select.appendChild(
                option
            );

        });


    /*
     * Restaurer la sélection précédente
     * si elle existe encore.
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


    /*
     * Actualiser les informations
     * du lot sélectionné.
     */

    if (
        typeof afficherStockDisponible ===
        "function"
    ) {

        afficherStockDisponible();

    }


    if (
        typeof afficherInformationsLotOrigine ===
        "function"
    ) {

        afficherInformationsLotOrigine();

    }

}

/* =========================================================
   AFFICHER LES INFORMATIONS DU LOT
========================================================= */

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


    let zone =
        document.getElementById(
            "informationsLotOrigine"
        );


    /*
     * Créer automatiquement la zone
     * si elle n'existe pas.
     */

    if (!zone) {

        zone =
            document.createElement(
                "div"
            );

        zone.id =
            "informationsLotOrigine";

        zone.className =
            "alert alert-light border mt-2";


        select.parentNode
            .appendChild(
                zone
            );

    }


    if (!lotId) {

        zone.innerHTML =
            "Sélectionnez un lot d'origine.";

        return;

    }


    const lot =
        incubationTrouverLot(
            lotId
        );


    if (!lot) {

        zone.innerHTML =
            "Lot introuvable.";

        return;

    }


    const animal =
        incubationTrouverAnimalOrigine(
            lot
        );


    const stock =
        obtenirOeufsDisponiblesPourLotIncubation(
            lotId
        );


    const quantite =
        Number(
            lot.quantiteActuelle ??
            lot.quantite ??
            lot.quantiteInitiale ??
            0
        );


    zone.innerHTML = `

        <strong>
            Lot d'origine
        </strong>

        <br>

        Lot :
        ${incubationNomLot(lot)}

        <br>

        Espèce :
        ${incubationEspeceLot(lot)}

        <br>

        Race :
        ${incubationRaceLot(lot) || "-"}

        <br>

        Animaux dans le lot :
        ${quantite}

        <br>

        Animal lié :
        ${
            animal
                ? (
                    animal.nom ||
                    animal.type ||
                    animal.race ||
                    animal.id
                  )
                : "Liaison directe au lot"
        }

        <br>

        Œufs disponibles :
        <strong>
            ${stock}
        </strong>

    `;


    /*
     * Mettre automatiquement l'espèce
     * si elle existe.
     */

    const espece =
        document.getElementById(
            "incubationEspece"
        );


    if (
        espece &&
        !espece.value
    ) {

        espece.value =
            incubationEspeceLot(
                lot
            );

        chargerDureeIncubation();

    }

}


/* =========================================================
   AFFICHER STOCK DISPONIBLE
========================================================= */

function afficherStockDisponible() {

    const select =
        document.getElementById(
            "incubationLot"
        );


    const input =
        document.getElementById(
            "incubationOeufs"
        );


    if (!select) {

        return;

    }


    const lotId =
        select.value;


    const stock =
        lotId
            ? obtenirOeufsDisponiblesPourLotIncubation(
                lotId
              )
            : 0;


    let indicateur =
        document.getElementById(
            "stockOeufsDisponible"
        );


    if (
        !indicateur &&
        input
    ) {

        indicateur =
            document.createElement(
                "div"
            );

        indicateur.id =
            "stockOeufsDisponible";

        indicateur.className =
            "form-text";


        input.parentNode
            .appendChild(
                indicateur
            );

    }


    if (indicateur) {

        indicateur.innerHTML =

            "Œufs disponibles pour ce lot : " +

            "<strong>" +

            stock +

            "</strong>";

    }


    if (input) {

        input.max =
            stock > 0
                ? stock
                : "";


        if (
            stock === 0
        ) {

            input.placeholder =
                "Aucun stock disponible";

        }
        else {

            input.placeholder =
                "Maximum : " +
                stock;

        }

    }


    afficherInformationsLotOrigine();

}


/* =========================================================
   DURÉE INCUBATION
========================================================= */

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


    /*
     * Ne pas écraser une liste
     * personnalisée inutilement.
     */

    duree.innerHTML = `

        <option value="${valeur}">

            ${valeur} jours

        </option>

    `;


    duree.value =
        String(valeur);


    afficherEclosionIncubation();

}


/* =========================================================
   DATE D'ÉCLOSION
========================================================= */

function afficherEclosionIncubation() {

    const date =
        document.getElementById(
            "incubationDateEntree"
        ) ||
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
        incubationAjouterJours(
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


    if (
        zone &&
        zone.tagName !== "INPUT"
    ) {

        zone.innerHTML =

            dateEclosion

                ? "Éclosion prévue : " +
                  "<strong>" +
                  dateEclosion +
                  "</strong>"

                : "";

    }

}


/* =========================================================
   VÉRIFIER QUANTITÉ
========================================================= */

function verifierStockIncubation() {

    const lot =
        document.getElementById(
            "incubationLot"
        );


    const oeufs =
        document.getElementById(
            "incubationOeufs"
        );


    if (
        !lot ||
        !oeufs ||
        !lot.value
    ) {

        return true;

    }


    const stock =
        obtenirOeufsDisponiblesPourLotIncubation(
            lot.value
        );


    const quantite =
        Number(
            oeufs.value
        );


    if (
        quantite > stock &&
        stock > 0
    ) {

        oeufs.setCustomValidity(
            "La quantité dépasse le stock disponible."
        );

        return false;

    }


    oeufs.setCustomValidity("");

    return true;

}


/* =========================================================
   DÉDUIRE LES ŒUFS DU STOCK
========================================================= */

function retirerOeufsDuStockIncubation(
    lotId,
    quantite
) {

    const stock =
        incubationObtenirStockOeufs();


    let reste =
        Number(
            quantite
        );


    if (
        reste <= 0
    ) {

        return true;

    }


    for (
        let i = 0;
        i < stock.length && reste > 0;
        i++
    ) {

        const ligne =
            stock[i];


        const ligneLotId =
            ligne.lotId ??
            ligne.lotOrigineId ??
            ligne.lot ??
            "";


        if (
            String(ligneLotId) !==
            String(lotId)
        ) {

            continue;

        }


        const disponible =
            Number(
                ligne.quantiteDisponible ??
                ligne.stockDisponible ??
                ligne.quantite ??
                ligne.oeufsDisponibles ??
                0
            );


        if (
            disponible <= 0
        ) {

            continue;

        }


        const retrait =
            Math.min(
                disponible,
                reste
            );


        /*
         * Si le champ existe,
         * le modifier.
         */

        if (
            ligne.quantiteDisponible !==
            undefined
        ) {

            ligne.quantiteDisponible =
                disponible -
                retrait;

        }

        else if (
            ligne.stockDisponible !==
            undefined
        ) {

            ligne.stockDisponible =
                disponible -
                retrait;

        }

        else if (
            ligne.oeufsDisponibles !==
            undefined
        ) {

            ligne.oeufsDisponibles =
                disponible -
                retrait;

        }

        else {

            ligne.quantite =
                disponible -
                retrait;

        }


        reste -=
            retrait;

    }


    incubationSauver(
        "stockOeufsIncubation",
        stock
    );


    /*
     * Synchronisation éventuelle
     * avec stockOeufs.
     */

    const autreStock =
        incubationLire(
            "stockOeufs"
        );


    if (
        autreStock.length > 0
    ) {

        let resteAutre =
            Number(
                quantite
            );


        autreStock.forEach(
            function (ligne) {

                if (
                    resteAutre <= 0
                ) {

                    return;

                }


                const ligneLotId =
                    ligne.lotId ??
                    ligne.lotOrigineId ??
                    ligne.lot ??
                    "";


                if (
                    String(ligneLotId) !==
                    String(lotId)
                ) {

                    return;

                }


                const disponible =
                    Number(
                        ligne.quantiteDisponible ??
                        ligne.stockDisponible ??
                        ligne.quantite ??
                        ligne.oeufsDisponibles ??
                        0
                    );


                if (
                    disponible <= 0
                ) {

                    return;

                }


                const retrait =
                    Math.min(
                        disponible,
                        resteAutre
                    );


                if (
                    ligne.quantiteDisponible !==
                    undefined
                ) {

                    ligne.quantiteDisponible =
                        disponible -
                        retrait;

                }
                else if (
                    ligne.stockDisponible !==
                    undefined
                ) {

                    ligne.stockDisponible =
                        disponible -
                        retrait;

                }
                else if (
                    ligne.oeufsDisponibles !==
                    undefined
                ) {

                    ligne.oeufsDisponibles =
                        disponible -
                        retrait;

                }
                else {

                    ligne.quantite =
                        disponible -
                        retrait;

                }


                resteAutre -=
                    retrait;

            }
        );


        incubationSauver(
            "stockOeufs",
            autreStock
        );

    }


    return true;

}


/* =========================================================
   ENREGISTRER UNE INCUBATION
========================================================= */

function enregistrerIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const espece =
        document.getElementById(
            "incubationEspece"
        )?.value ||
        "";


    const lotId =
        document.getElementById(
            "incubationLot"
        )?.value ||
        "";


    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        )?.value ||
        "";


    const oeufs =
        Number(
            document.getElementById(
                "incubationOeufs"
            )?.value ||
            0
        );


    const dateEntree =
        (
            document.getElementById(
                "incubationDateEntree"
            ) ||
            document.getElementById(
                "incubationDate"
            )
        )?.value ||
        incubationDateAujourdhui();


    const duree =
        Number(
            document.getElementById(
                "incubationDuree"
            )?.value ||
            DUREES_INCUBATION[espece] ||
            0
        );


    /* -----------------------------------------------------
       VALIDATIONS
    ----------------------------------------------------- */

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


    const lot =
        incubationTrouverLot(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot d'origine est introuvable."
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
        !oeufs ||
        oeufs <= 0
    ) {

        alert(
            "Le nombre d'œufs doit être supérieur à zéro."
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
        !duree ||
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est incorrecte."
        );

        return false;

    }


    /*
     * Vérification du stock.
     */

    const stock =
        obtenirOeufsDisponiblesPourLotIncubation(
            lotId
        );


    /*
     * Si un stock est réellement enregistré,
     * empêcher de dépasser le stock.
     */

    if (
        stock > 0 &&
        oeufs > stock
    ) {

        alert(
            "Impossible d'enregistrer : " +
            oeufs +
            " œufs demandés, mais seulement " +
            stock +
            " œufs disponibles pour ce lot."
        );

        return false;

    }


    /*
     * Animal lié au lot.
     */

    const animal =
        incubationTrouverAnimalOrigine(
            lot
        );


    /*
     * Date d'éclosion.
     */

    const dateEclosion =
        incubationAjouterJours(
            dateEntree,
            duree
        );


    /*
     * Charger les incubations.
     */

    const incubations =
        incubationLire(
            "incubations"
        );


    /*
     * Créer l'enregistrement.
     */

    const nouvelleIncubation = {

        id:
            incubationId("INC"),


        /*
         * ORIGINE
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
                    animal.id
                  )
                : "",


        /*
         * IDENTITÉ
         */

        espece:
            espece,


        race:
            incubationRaceLot(
                lot
            ),


        /*
         * INCUBATION
         */

        couveuse:
            couveuse,


        oeufsInitial:
            oeufs,


        nombreOeufs:
            oeufs,


        oeufsIncubes:
            oeufs,


        oeufsRestants:
            oeufs,


        oeufsRetires:
            0,


        oeufsNonFecondes:
            0,


        embryonsMorts:
            0,


        poussinsEclos:
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


        brooderCree:
            false,


        poussiniereCree:
            false,


        /*
         * TRAÇABILITÉ
         */

        dateCreation:
            new Date()
                .toISOString(),


        utilisateur:
            localStorage.getItem(
                "utilisateur"
            ) ||
            localStorage.getItem(
                "utilisateurConnecte"
            ) ||
            "Administrateur",


        notes:
            document.getElementById(
                "incubationNotes"
            )?.value ||
            ""

    };


    /*
     * AJOUT
     */

    incubations.push(
        nouvelleIncubation
    );


    /*
     * SAUVEGARDE
     */

    incubationSauver(
        "incubations",
        incubations
    );


    /*
     * DÉDUCTION DU STOCK
     *
     * On ne déduit que si un stock
     * existe réellement.
     */

    if (
        stock > 0
    ) {

        retirerOeufsDuStockIncubation(
            lotId,
            oeufs
        );

    }


    /*
     * Fermer modal Bootstrap.
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
            bootstrap.Modal
                .getInstance(
                    modal
                );


        if (instance) {

            instance.hide();

        }

    }


    /*
     * Réinitialiser formulaire.
     */

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    /*
     * Actualiser.
     */

    chargerLotsIncubation();

    chargerIncubations();

    actualiserStatistiquesIncubation();


    alert(
        "Incubation enregistrée avec succès.\n\n" +

        "Lot d'origine : " +
        incubationNomLot(lot) +

        "\n" +

        "Espèce : " +
        espece +

        "\n" +

        "Œufs incubés : " +
        oeufs +

        "\n" +

        "Éclosion prévue : " +
        dateEclosion
    );


    return true;

}


/* =========================================================
   CHARGER LES INCUBATIONS
========================================================= */

function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        );


    if (!tableau) {

        return;

    }


    const incubations =
        incubationLire(
            "incubations"
        );


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
            function (incubation) {

                const statut =
                    incubation.statut ||
                    "En incubation";


                let badge =
                    "primary";


                if (
                    statut === "Éclos"
                ) {

                    badge =
                        "success";

                }

                else if (
                    statut === "Terminé"
                ) {

                    badge =
                        "secondary";

                }

                else if (
                    statut === "Annulé"
                ) {

                    badge =
                        "danger";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>

                            <strong>

                                ${incubation.id}

                            </strong>

                        </td>


                        <td>

                            ${
                                incubation.lotOrigineNom ||
                                incubation.lotNom ||
                                incubation.lot ||
                                "-"
                            }

                        </td>


                        <td>

                            ${incubation.espece || "-"}

                        </td>


                        <td>

                            ${incubation.race || "-"}

                        </td>


                        <td>

                            ${incubation.oeufsInitial ??
                              incubation.nombreOeufs ??
                              0}

                        </td>


                        <td>

                            ${incubation.couveuse || "-"}

                        </td>


                        <td>

                            ${incubation.dateEntree || "-"}

                        </td>


                        <td>

                            ${incubation.dateEclosion || "-"}

                        </td>


                        <td>

                            <span
                                class="badge bg-${badge}"
                            >

                                ${statut}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary"
                                onclick="
                                    voirDetailsIncubation(
                                        '${incubation.id}'
                                    )
                                "
                            >

                                <i
                                    class="fa-solid fa-eye"
                                ></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   DÉTAILS INCUBATION
========================================================= */

function voirDetailsIncubation(
    id
) {

    const incubations =
        incubationLire(
            "incubations"
        );


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

        "\n\n" +

        "Lot d'origine : " +
        (
            incubation.lotOrigineNom ||
            incubation.lot ||
            "-"
        ) +

        "\n" +

        "Lot ID : " +
        (
            incubation.lotOrigineId ||
            incubation.lotId ||
            "-"
        ) +

        "\n" +

        "Animal d'origine : " +
        (
            incubation.animalOrigineNom ||
            "-"
        ) +

        "\n" +

        "Animal ID : " +
        (
            incubation.animalOrigineId ||
            "-"
        ) +

        "\n" +

        "Espèce : " +
        (
            incubation.espece ||
            "-"
        ) +

        "\n" +

        "Race : " +
        (
            incubation.race ||
            "-"
        ) +

        "\n" +

        "Œufs : " +
        (
            incubation.oeufsInitial ||
            0
        ) +

        "\n" +

        "Couveuse : " +
        (
            incubation.couveuse ||
            "-"
        ) +

        "\n" +

        "Éclosion prévue : " +
        (
            incubation.dateEclosion ||
            "-"
        )

    );

}


/* =========================================================
   STATISTIQUES
========================================================= */

function actualiserStatistiquesIncubation() {

    const incubations =
        incubationLire(
            "incubations"
        );


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
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.oeufsInitial ||
                        item.nombreOeufs ||
                        0
                    )
                );

            },
            0
        );


    const elements = {

        "totalIncubations":
            total,

        "incubationsActives":
            actives,

        "incubationsEcloses":
            ecloses,

        "totalOeufsIncubes":
            totalOeufs

    };


    Object.keys(
        elements
    ).forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    Number(
                        elements[id]
                    ).toLocaleString(
                        "fr-FR"
                    );

            }

        }
    );

}


/* =========================================================
   OUVRIR MODAL
========================================================= */

function ouvrirModalIncubation() {

    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (!modal) {

        console.error(
            "Modal incubation introuvable."
        );

        return;

    }


    /*
     * Date par défaut.
     */

    const date =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
        );


    if (
        date &&
        !date.value
    ) {

        date.value =
            incubationDateAujourdhui();

    }


    chargerLotsIncubation();

    chargerDureeIncubation();


    /*
     * Bootstrap.
     */

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
   FERMER MODAL
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
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Initialisation incubation.js..."
        );


        /*
         * Bouton Nouvelle incubation.
         */

        const btn =
            document.getElementById(
                "btnNouvelleIncubation"
            );


        if (btn) {

            btn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    ouvrirModalIncubation();

                }
            );

        }


        /*
         * Espèce.
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
         * Lot.
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
         * Date.
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
                afficherEclosionIncubation
            );

        }


        /*
         * Durée.
         */

        const duree =
            document.getElementById(
                "incubationDuree"
            );


        if (duree) {

            duree.addEventListener(
                "change",
                afficherEclosionIncubation
            );

        }


        /*
         * Nombre d'œufs.
         */

        const oeufs =
            document.getElementById(
                "incubationOeufs"
            );


        if (oeufs) {

            oeufs.addEventListener(
                "input",
                verifierStockIncubation
            );

        }


        /*
         * Formulaire.
         */

        const formulaire =
            document.getElementById(
                "formIncubation"
            );


        if (formulaire) {

            /*
             * Important :
             * éviter plusieurs listeners.
             */

            formulaire.addEventListener(
                "submit",
                enregistrerIncubation
            );

        }


        /*
         * Chargement initial.
         */

        chargerLotsIncubation();

        chargerIncubations();

        actualiserStatistiquesIncubation();


        console.log(
            "✓ incubation.js chargé."
        );

    }
);


/* =========================================================
   EXPORTS GLOBAUX
========================================================= */

window.chargerLotsIncubation =
    chargerLotsIncubation;


window.afficherStockDisponible =
    afficherStockDisponible;


window.afficherInformationsLotOrigine =
    afficherInformationsLotOrigine;


window.chargerDureeIncubation =
    chargerDureeIncubation;


window.afficherEclosionIncubation =
    afficherEclosionIncubation;


window.enregistrerIncubation =
    enregistrerIncubation;


window.chargerIncubations =
    chargerIncubations;


window.voirDetailsIncubation =
    voirDetailsIncubation;


window.actualiserStatistiquesIncubation =
    actualiserStatistiquesIncubation;


window.ouvrirModalIncubation =
    ouvrirModalIncubation;


window.fermerModalIncubation =
    fermerModalIncubation;


window.obtenirOeufsDisponiblesPourLotIncubation =
    obtenirOeufsDisponiblesPourLotIncubation;


console.log(
    "✓ Ferme Asher ERP — incubation.js prêt."
);
