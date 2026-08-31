/* =========================================================
   FERME ASHER ERP
   MODULE : ÉLEVAGE
   FICHIER : js/elevage.js

   CHAÎNE DES DONNÉES :

   ANIMAUX & LOTS
        ↓ lotId
   PRODUCTION D'ŒUFS
        ↓ productionId + lotId
   STOCK ŒUFS POUR INCUBATION
        ↓ lotId
   INCUBATION
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE

   IMPORTANT :
   L'INTERFACE INCUBATION EST DANS incubation.js
========================================================= */

"use strict";


/* =========================================================
   1. OUTILS GÉNÉRAUX
========================================================= */

function getDataLocale(cle) {

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

    } catch (erreur) {

        console.error(
            "Erreur lecture localStorage :",
            cle,
            erreur
        );

        return [];

    }

}


function sauvegarderDataLocale(
    cle,
    donnees
) {

    try {

        localStorage.setItem(
            cle,
            JSON.stringify(donnees)
        );

        return true;

    } catch (erreur) {

        console.error(
            "Erreur sauvegarde localStorage :",
            cle,
            erreur
        );

        alert(
            "Impossible d'enregistrer les données."
        );

        return false;

    }

}


/* =========================================================
   ID UNIQUE
========================================================= */

function genererId(prefixe) {

    return (
        prefixe +
        "-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 100000
        )
    );

}


/* =========================================================
   DATES
========================================================= */

function obtenirDateAujourdhui() {

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


/* Compatibilité avec ancien code */

function obtenirDateAujourdHui() {

    return obtenirDateAujourdhui();

}


function formaterDate(date) {

    if (!date) {
        return "";
    }

    const texte =
        String(date);

    const parties =
        texte.split("-");

    if (
        parties.length !== 3
    ) {

        return texte;

    }

    return (
        parties[2] +
        "/" +
        parties[1] +
        "/" +
        parties[0]
    );

}


/* =========================================================
   UTILISATEUR
========================================================= */

function obtenirUtilisateur() {

    return (
        localStorage.getItem(
            "utilisateur"
        )
        ||
        localStorage.getItem(
            "utilisateurConnecte"
        )
        ||
        "Administrateur"
    );

}


/* =========================================================
   NOMBRE
========================================================= */

function formaterNombre(nombre) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


/* =========================================================
   2. INITIALISATION DES BASES
========================================================= */

function initialiserElevage() {

    const bases = [

        "animaux",

        "lotsElevage",

        "productionsElevage",

        "stockOeufsIncubation",

        "santeElevage",

        "alimentationElevage",

        "reproductionElevage",

        "croissanceElevage",

        "poussiniereElevage"

    ];


    bases.forEach(
        function (cle) {

            if (
                localStorage.getItem(cle) === null
            ) {

                localStorage.setItem(
                    cle,
                    JSON.stringify([])
                );

            }

        }
    );

}


initialiserElevage();


/* =========================================================
   3. ANIMAUX
========================================================= */

function obtenirAnimaux() {

    return getDataLocale(
        "animaux"
    );

}


function sauvegarderAnimaux(
    animaux
) {

    return sauvegarderDataLocale(
        "animaux",
        animaux
    );

}


function ajouterAnimal(event) {

    if (event) {

        event.preventDefault();

    }


    const type =
        document.getElementById(
            "typeAnimal"
        )?.value
        ?.trim()
        || "";


    const race =
        document.getElementById(
            "raceAnimal"
        )?.value
        ?.trim()
        || "";


    const quantite =
        Number(
            document.getElementById(
                "quantiteAnimal"
            )?.value
        );


    const date =
        document.getElementById(
            "dateAnimal"
        )?.value
        ||
        obtenirDateAujourdhui();


    const statut =
        document.getElementById(
            "statutAnimal"
        )?.value
        ||
        "Actif";


    if (!type) {

        alert(
            "Veuillez sélectionner le type d'animal."
        );

        return false;

    }


    if (
        !Number.isFinite(quantite)
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return false;

    }


    const animaux =
        obtenirAnimaux();


    const animal = {

        id:
            genererId("ANI"),

        type:
            type,

        race:
            race ||
            "Non précisée",

        quantite:
            quantite,

        quantiteInitiale:
            quantite,

        date:
            date,

        statut:
            statut,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    animaux.push(
        animal
    );


    sauvegarderAnimaux(
        animaux
    );


    alert(
        "Animal enregistré avec succès."
    );


    chargerAnimaux();


    return true;

}


/* =========================================================
   CHARGER ANIMAUX
========================================================= */

function chargerAnimaux() {

    const tableau =
        document.getElementById(
            "listeAnimaux"
        );


    if (!tableau) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    tableau.innerHTML =
        "";


    if (
        animaux.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted">

                    Aucun animal enregistré.

                </td>

            </tr>

        `;

        return;

    }


    animaux.forEach(
        function (animal) {

            const statut =
                animal.statut ||
                "Actif";


            let classe =
                "success";


            if (
                statut === "Malade"
            ) {

                classe =
                    "danger";

            }


            if (
                statut === "Vendu"
                ||
                statut === "Inactif"
            ) {

                classe =
                    "secondary";

            }


            tableau.innerHTML += `

                <tr>

                    <td>
                        ${animal.id || "-"}
                    </td>

                    <td>
                        ${animal.type || "-"}
                    </td>

                    <td>
                        ${animal.race || "-"}
                    </td>

                    <td>
                        ${formaterNombre(
                            animal.quantiteInitiale ||
                            animal.quantite ||
                            0
                        )}
                    </td>

                    <td>
                        ${formaterNombre(
                            animal.quantite ||
                            0
                        )}
                    </td>

                    <td>
                        ${formaterDate(
                            animal.date
                        )}
                    </td>

                    <td>

                        <span
                            class="badge bg-${classe}">

                            ${statut}

                        </span>

                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   4. LOTS D'ÉLEVAGE
========================================================= */

/*
   C'EST CETTE BASE QUI EST UTILISÉE PAR incubation.js.

   Clé localStorage :

   lotsElevage
*/


function obtenirLotsElevage() {

    return getDataLocale(
        "lotsElevage"
    );

}


function sauvegarderLotsElevage(
    lots
) {

    return sauvegarderDataLocale(
        "lotsElevage",
        lots
    );

}


/*
   Alias utilisé par la production.
*/

function obtenirLotsConnectes() {

    return obtenirLotsElevage();

}


/* =========================================================
   GÉNÉRER CODE LOT
========================================================= */

function genererCodeLot() {

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


    const heure =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const aleatoire =
        Math.floor(
            Math.random() * 1000
        );


    return (
        "LOT-" +
        annee +
        mois +
        jour +
        "-" +
        heure +
        minute +
        "-" +
        aleatoire
    );

}


/* =========================================================
   ENREGISTRER UN LOT
========================================================= */

function enregistrerLot(event) {

    if (event) {

        event.preventDefault();

    }


    const espece =
        document.getElementById(
            "especeLot"
        )?.value
        ?.trim()
        || "";


    const race =
        document.getElementById(
            "raceLot"
        )?.value
        ?.trim()
        || "";


    const nom =
        document.getElementById(
            "nomLot"
        )?.value
        ?.trim()
        || "";


    const dateEntree =
        document.getElementById(
            "dateEntreeLot"
        )?.value
        ||
        obtenirDateAujourdhui();


    const quantite =
        Number(
            document.getElementById(
                "quantiteLot"
            )?.value
        );


    const origine =
        document.getElementById(
            "origineLot"
        )?.value
        ||
        "Achat";


    const cout =
        Number(
            document.getElementById(
                "coutLot"
            )?.value
        )
        || 0;


    const statut =
        document.getElementById(
            "statutLot"
        )?.value
        ||
        "Actif";


    const notes =
        document.getElementById(
            "notesLot"
        )?.value
        ?.trim()
        || "";


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!espece) {

        alert(
            "Veuillez sélectionner l'espèce."
        );

        return false;

    }


    if (!nom) {

        alert(
            "Veuillez saisir le nom du lot."
        );

        return false;

    }


    if (
        !Number.isFinite(quantite)
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité initiale doit être supérieure à zéro."
        );

        return false;

    }


    /* -----------------------------------------
       CHARGER LES LOTS EXISTANTS
    ----------------------------------------- */

    const lots =
        obtenirLotsElevage();


    /* -----------------------------------------
       ID UNIQUE
    ----------------------------------------- */

    const id =
        genererId("LOT");


    const code =
        genererCodeLot();


    /* -----------------------------------------
       CRÉER LE LOT
    ----------------------------------------- */

    const nouveauLot = {

        id:
            id,

        code:
            code,

        espece:
            espece,

        type:
            espece,

        race:
            race ||
            "Non précisée",

        nom:
            nom,

        nomLot:
            nom,

        dateEntree:
            dateEntree,

        date:
            dateEntree,

        quantiteInitiale:
            quantite,

        quantiteActuelle:
            quantite,

        quantite:
            quantite,

        origine:
            origine,

        cout:
            cout,

        statut:
            statut,

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    /* -----------------------------------------
       ENREGISTRER
    ----------------------------------------- */

    lots.push(
        nouveauLot
    );


    const sauvegarde =
        sauvegarderLotsElevage(
            lots
        );


    if (!sauvegarde) {

        return false;

    }


    console.log(
        "LOT ENREGISTRÉ :",
        nouveauLot
    );


    /* -----------------------------------------
       FERMER MODAL BOOTSTRAP
    ----------------------------------------- */

    const modalElement =
        document.getElementById(
            "modalLot"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }

    }


    /* -----------------------------------------
       RÉINITIALISER
    ----------------------------------------- */

    const formulaire =
        document.getElementById(
            "formLot"
        );


    if (formulaire) {

        formulaire.reset();

    }


    /* -----------------------------------------
       ACTUALISER
    ----------------------------------------- */

    chargerLots();

    chargerLotsProduction();


    alert(
        'Le lot "' +
        nom +
        '" a été enregistré avec succès.'
    );


    return true;

}


/* =========================================================
   CHARGER LES LOTS
========================================================= */

function chargerLots() {

    const tableau =
        document.getElementById(
            "listeLots"
        );


    if (!tableau) {

        return;

    }


    const lots =
        obtenirLotsElevage();


    tableau.innerHTML =
        "";


    if (
        lots.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    Aucun lot enregistré.

                </td>

            </tr>

        `;


        mettreAJourStatistiquesLots();


        return;

    }


    lots
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                const statut =
                    lot.statut ||
                    "Actif";


                const quantiteInitiale =
                    Number(
                        lot.quantiteInitiale ??
                        lot.quantite ??
                        0
                    );


                const quantiteActuelle =
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        0
                    );


                let classe =
                    "success";


                if (
                    statut !== "Actif"
                ) {

                    classe =
                        "secondary";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>
                            <strong>
                                ${lot.code || lot.id}
                            </strong>
                        </td>

                        <td>
                            ${lot.espece || lot.type || "-"}
                        </td>

                        <td>
                            ${lot.race || "-"}
                        </td>

                        <td>
                            ${lot.nom || lot.nomLot || "-"}
                        </td>

                        <td>
                            ${formaterDate(
                                lot.dateEntree ||
                                lot.date
                            )}
                        </td>

                        <td>
                            ${formaterNombre(
                                quantiteInitiale
                            )}
                        </td>

                        <td>
                            ${formaterNombre(
                                quantiteActuelle
                            )}
                        </td>

                        <td>

                            <span
                                class="badge bg-${classe}">

                                ${statut}

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                onclick="voirLot('${lot.id}')">

                                <i class="fa-solid fa-eye"></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


    mettreAJourStatistiquesLots();

}


/* =========================================================
   STATISTIQUES LOTS
========================================================= */

function mettreAJourStatistiquesLots() {

    const lots =
        obtenirLotsElevage();


    const actifs =
        lots.filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        );


    const totalAnimaux =
        actifs.reduce(
            function (
                total,
                lot
            ) {

                return (
                    total +
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        0
                    )
                );

            },
            0
        );


    const totalLots =
        document.getElementById(
            "totalLots"
        );


    const totalAnimauxElement =
        document.getElementById(
            "totalAnimaux"
        );


    const animauxActifs =
        document.getElementById(
            "animauxActifs"
        );


    if (totalLots) {

        totalLots.textContent =
            formaterNombre(
                lots.length
            );

    }


    if (totalAnimauxElement) {

        totalAnimauxElement.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    if (animauxActifs) {

        animauxActifs.textContent =
            formaterNombre(
                totalAnimaux
            );

    }

}


/* =========================================================
   VOIR LOT
========================================================= */

function voirLot(id) {

    const lot =
        obtenirLotsElevage()
            .find(
                function (element) {

                    return (
                        String(
                            element.id
                        ) ===
                        String(id)
                    );

                }
            );


    if (!lot) {

        alert(
            "Lot introuvable."
        );

        return;

    }


    alert(

        "LOT\n\n" +

        "Code : " +
        (lot.code || lot.id) +

        "\nNom : " +
        (lot.nom || lot.nomLot || "-") +

        "\nEspèce : " +
        (lot.espece || lot.type || "-") +

        "\nRace : " +
        (lot.race || "-") +

        "\nQuantité actuelle : " +
        (
            lot.quantiteActuelle ??
            lot.quantite ??
            0
        )

    );

}


/* =========================================================
   5. PRODUCTION
========================================================= */

/*
   LA PRODUCTION EST OBLIGATOIREMENT LIÉE À UN LOT.

   Chaque production contient :

   production.id
   production.lotId
   production.lotNom
   production.espece

   Cela permet à incubation.js de remonter
   jusqu'au lot d'origine.
*/


function obtenirProductions() {

    return getDataLocale(
        "productionsElevage"
    );

}


function obtenirProductionsConnectees() {

    return obtenirProductions();

}


function sauvegarderProductions(
    productions
) {

    return sauvegarderDataLocale(
        "productionsElevage",
        productions
    );

}


/* =========================================================
   CHARGER LOTS DANS PRODUCTION
========================================================= */

function chargerLotsProduction() {

    const select =
        document.getElementById(
            "productionLot"
        );


    if (!select) {

        return;

    }


    const ancienneValeur =
        select.value;


    const lots =
        obtenirLotsElevage();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    lots
        .filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        )
        .forEach(
            function (lot) {

                const quantite =
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
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


                select.innerHTML += `

                    <option
                        value="${lot.id}"
                        data-espece="${espece}"
                        data-nom="${nom}">

                        ${nom}
                        —
                        ${espece}
                        —
                        ${formaterNombre(
                            quantite
                        )} animaux

                    </option>

                `;

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

}


/* =========================================================
   TROUVER UN LOT
========================================================= */

function trouverLotParId(
    lotId
) {

    return obtenirLotsElevage()
        .find(
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
        )
        || null;

}


/* =========================================================
   CALCUL RESTE
========================================================= */

function calculerResteProduction(
    quantite,
    incubation,
    vente,
    consommation,
    autre
) {

    return (
        Number(quantite || 0)
        -
        (
            Number(incubation || 0)
            +
            Number(vente || 0)
            +
            Number(consommation || 0)
            +
            Number(autre || 0)
        )
    );

}


/* =========================================================
   ENREGISTRER PRODUCTION
========================================================= */

function enregistrerProduction(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const date =
        document.getElementById(
            "productionDate"
        )?.value
        ||
        obtenirDateAujourdhui();


    const lotId =
        document.getElementById(
            "productionLot"
        )?.value
        || "";


    const type =
        document.getElementById(
            "productionType"
        )?.value
        ?.trim()
        || "";


    const produit =
        document.getElementById(
            "productionProduit"
        )?.value
        ?.trim()
        || "";


    const quantite =
        Number(
            document.getElementById(
                "productionQuantite"
            )?.value
        );


    const unite =
        document.getElementById(
            "productionUnite"
        )?.value
        ||
        "Unité";


    const notes =
        document.getElementById(
            "productionNotes"
        )?.value
        ?.trim()
        || "";


    const incubation =
        Number(
            document.getElementById(
                "productionIncubation"
            )?.value
        )
        || 0;


    const vente =
        Number(
            document.getElementById(
                "productionVente"
            )?.value
        )
        || 0;


    const consommation =
        Number(
            document.getElementById(
                "productionConsommation"
            )?.value
        )
        || 0;


    const autre =
        Number(
            document.getElementById(
                "productionAutre"
            )?.value
        )
        || 0;


    /* -----------------------------------------
       VALIDATIONS
    ----------------------------------------- */

    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot producteur."
        );

        return false;

    }


    const lot =
        trouverLotParId(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot sélectionné est introuvable."
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
        !Number.isFinite(quantite)
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité produite doit être supérieure à zéro."
        );

        return false;

    }


    const reste =
        calculerResteProduction(
            quantite,
            incubation,
            vente,
            consommation,
            autre
        );


    if (reste < 0) {

        alert(
            "Erreur : la répartition dépasse la quantité totale produite."
        );

        return false;

    }


    /* -----------------------------------------
       CRÉER PRODUCTION
    ----------------------------------------- */

    const productions =
        obtenirProductions();


    const productionId =
        genererId(
            "PROD"
        );


    const nomLot =
        lot.nom ||
        lot.nomLot ||
        lot.code ||
        lot.id;


    const espece =
        lot.espece ||
        lot.type ||
        "";


    const nouvelleProduction = {

        id:
            productionId,

        date:
            date,

        lotId:
            lot.id,

        lotNom:
            nomLot,

        espece:
            espece,

        race:
            lot.race ||
            "",

        type:
            type,

        produit:
            produit,

        quantite:
            quantite,

        unite:
            unite,

        repartition: {

            incubation:
                incubation,

            vente:
                vente,

            consommation:
                consommation,

            autre:
                autre,

            reste:
                reste

        },

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    productions.push(
        nouvelleProduction
    );


    sauvegarderProductions(
        productions
    );


    /* =====================================================
       STOCK ŒUFS POUR INCUBATION
    ===================================================== */

    if (
        incubation > 0
    ) {

        ajouterOeufsAuStockIncubation(

            nouvelleProduction,

            lot,

            incubation

        );

    }


    /* -----------------------------------------
       ACTUALISER
    ----------------------------------------- */

    chargerProductions();


    chargerLotsProduction();


    const formulaire =
        document.getElementById(
            "formProduction"
        );


    if (formulaire) {

        formulaire.reset();

    }


    alert(
        "Production enregistrée avec succès."
    );


    return true;

}


/* =========================================================
   6. STOCK ŒUFS POUR INCUBATION
========================================================= */

/*
   CETTE BASE EST LUE PAR incubation.js.

   Clé :

   stockOeufsIncubation

   Chaque ligne possède :

   id
   productionId
   lotId
   lotNom
   espece
   produit
   quantiteInitiale
   quantiteDisponible
   quantiteUtilisee
   dateProduction
   statut
*/


function obtenirStockOeufsIncubation() {

    return getDataLocale(
        "stockOeufsIncubation"
    );

}


function sauvegarderStockOeufsIncubation(
    stock
) {

    return sauvegarderDataLocale(
        "stockOeufsIncubation",
        stock
    );

}


/* =========================================================
   AJOUTER ŒUFS AU STOCK INCUBATION
========================================================= */

function ajouterOeufsAuStockIncubation(
    production,
    lot,
    quantite
) {

    const stock =
        obtenirStockOeufsIncubation();


    const ligne = {

        id:
            genererId(
                "STKINC"
            ),

        productionId:
            production.id,

        lotId:
            lot.id,

        lotNom:
            lot.nom ||
            lot.nomLot ||
            lot.code ||
            lot.id,

        espece:
            lot.espece ||
            lot.type ||
            "",

        race:
            lot.race ||
            "",

        produit:
            production.produit,

        quantiteInitiale:
            Number(
                quantite
            ),

        quantiteDisponible:
            Number(
                quantite
            ),

        quantiteUtilisee:
            0,

        dateProduction:
            production.date,

        statut:
            "Disponible",

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    stock.push(
        ligne
    );


    sauvegarderStockOeufsIncubation(
        stock
    );


    console.log(
        "Œufs ajoutés au stock incubation :",
        ligne
    );


    return ligne;

}


/* =========================================================
   ŒUFS DISPONIBLES POUR UN LOT
========================================================= */

function obtenirOeufsDisponiblesPourLot(
    lotId
) {

    const stock =
        obtenirStockOeufsIncubation();


    return stock
        .filter(
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


/*
   Alias utilisé par incubation.js
*/

function obtenirOeufsDisponiblesPourLotIncubation(
    lotId
) {

    return obtenirOeufsDisponiblesPourLot(
        lotId
    );

}


/* =========================================================
   RETIRER ŒUFS DU STOCK
========================================================= */

function retirerOeufsDuStockIncubation(
    lotId,
    quantite
) {

    let reste =
        Number(
            quantite
        );


    if (
        !Number.isFinite(reste)
        ||
        reste <= 0
    ) {

        return false;

    }


    const stock =
        obtenirStockOeufsIncubation();


    for (
        let i = 0;
        i < stock.length && reste > 0;
        i++
    ) {

        const ligne =
            stock[i];


        if (
            String(
                ligne.lotId
            ) !==
            String(
                lotId
            )
        ) {

            continue;

        }


        const disponible =
            Number(
                ligne.quantiteDisponible ||
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


        ligne.quantiteDisponible =
            disponible -
            retrait;


        ligne.quantiteUtilisee =
            Number(
                ligne.quantiteUtilisee ||
                0
            ) +
            retrait;


        if (
            ligne.quantiteDisponible <= 0
        ) {

            ligne.quantiteDisponible =
                0;

            ligne.statut =
                "Épuisé";

        }


        reste -=
            retrait;

    }


    sauvegarderStockOeufsIncubation(
        stock
    );


    if (
        reste > 0
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   7. SANTÉ
========================================================= */

function obtenirSante() {

    return getDataLocale(
        "santeElevage"
    );

}


function sauvegarderSante(
    donnees
) {

    return sauvegarderDataLocale(
        "santeElevage",
        donnees
    );

}


function chargerSante() {

    const tableau =
        document.getElementById(
            "listeSante"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirSante();


    tableau.innerHTML =
        "";


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${formaterDate(
                                item.date
                            )}
                        </td>

                        <td>
                            ${item.animal ||
                            item.lot ||
                            "-"}
                        </td>

                        <td>
                            ${item.type ||
                            "-"}
                        </td>

                        <td>
                            ${item.description ||
                            item.traitement ||
                            "-"}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   8. ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return getDataLocale(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(
    donnees
) {

    return sauvegarderDataLocale(
        "alimentationElevage",
        donnees
    );

}


function chargerAlimentation() {

    const tableau =
        document.getElementById(
            "listeAlimentation"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirAlimentation();


    tableau.innerHTML =
        "";


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${formaterDate(
                                item.date
                            )}
                        </td>

                        <td>
                            ${item.lot ||
                            item.lotNom ||
                            "-"}
                        </td>

                        <td>
                            ${item.produit ||
                            "-"}
                        </td>

                        <td>
                            ${formaterNombre(
                                item.quantite
                            )}
                            ${item.unite || ""}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   9. REPRODUCTION
========================================================= */

function obtenirReproduction() {

    return getDataLocale(
        "reproductionElevage"
    );

}


function sauvegarderReproduction(
    donnees
) {

    return sauvegarderDataLocale(
        "reproductionElevage",
        donnees
    );

}


function chargerReproduction() {

    const tableau =
        document.getElementById(
            "listeReproduction"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirReproduction();


    tableau.innerHTML =
        "";


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${formaterDate(
                                item.date
                            )}
                        </td>

                        <td>
                            ${item.lot ||
                            "-"}
                        </td>

                        <td>
                            ${item.espece ||
                            "-"}
                        </td>

                        <td>
                            ${formaterNombre(
                                item.oeufs ||
                                0
                            )}
                        </td>

                        <td>
                            ${formaterNombre(
                                item.eclos ||
                                0
                            )}
                        </td>

                        <td>
                            ${item.statut ||
                            "-"}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   10. CROISSANCE
========================================================= */

function obtenirCroissance() {

    return getDataLocale(
        "croissanceElevage"
    );

}


function sauvegarderCroissance(
    donnees
) {

    return sauvegarderDataLocale(
        "croissanceElevage",
        donnees
    );

}


function chargerCroissance() {

    const tableau =
        document.getElementById(
            "listeCroissance"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirCroissance();


    tableau.innerHTML =
        "";


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${formaterDate(
                                item.date
                            )}
                        </td>

                        <td>
                            ${item.lot ||
                            item.lotNom ||
                            "-"}
                        </td>

                        <td>
                            ${item.espece ||
                            "-"}
                        </td>

                        <td>
                            ${item.poids ||
                            0}
                            kg
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   11. POUSSINIÈRE
========================================================= */

function obtenirPoussiniere() {

    return getDataLocale(
        "poussiniereElevage"
    );

}


function sauvegarderPoussiniere(
    donnees
) {

    return sauvegarderDataLocale(
        "poussiniereElevage",
        donnees
    );

}


function chargerPoussiniere() {

    const tableau =
        document.getElementById(
            "listePoussiniere"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirPoussiniere();


    tableau.innerHTML =
        "";


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${formaterDate(
                                item.date
                            )}
                        </td>

                        <td>
                            ${item.lotNom ||
                            item.lot ||
                            "-"}
                        </td>

                        <td>
                            ${item.espece ||
                            "-"}
                        </td>

                        <td>
                            ${formaterNombre(
                                item.presents ||
                                item.quantite ||
                                0
                            )}
                        </td>

                        <td>
                            ${formaterNombre(
                                item.mortalite ||
                                0
                            )}
                        </td>

                        <td>
                            ${item.statut ||
                            "-"}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   12. DASHBOARD ÉLEVAGE
========================================================= */

function chargerDashboardElevage() {

    const lots =
        obtenirLotsElevage();


    const productions =
        obtenirProductions();


    const sante =
        obtenirSante();


    const actifs =
        lots.filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        );


    const totalAnimaux =
        actifs.reduce(
            function (
                total,
                lot
            ) {

                return (
                    total +
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        0
                    )
                );

            },
            0
        );


    const aujourdHui =
        obtenirDateAujourdhui();


    const productionJour =
        productions
            .filter(
                function (item) {

                    return (
                        String(
                            item.date
                        )
                        .substring(
                            0,
                            10
                        )
                        ===
                        aujourdHui
                    );

                }
            )
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        Number(
                            item.quantite ||
                            0
                        )
                    );

                },
                0
            );


    const maintenant =
        new Date();


    const mois =
        maintenant.getMonth();


    const annee =
        maintenant.getFullYear();


    const mortaliteMois =
        sante
            .filter(
                function (item) {

                    if (!item.date) {

                        return false;

                    }


                    const date =
                        new Date(
                            item.date
                        );


                    return (

                        date.getMonth() ===
                        mois

                        &&

                        date.getFullYear() ===
                        annee

                        &&

                        (
                            item.type ===
                            "Mortalité"

                            ||

                            item.nature ===
                            "Mortalité"
                        )

                    );

                }
            )
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        Number(
                            item.quantite ||
                            1
                        )
                    );

                },
                0
            );


    const elementAnimaux =
        document.getElementById(
            "totalAnimaux"
        );


    const elementLots =
        document.getElementById(
            "lotsActifs"
        );


    const elementProduction =
        document.getElementById(
            "productionJour"
        );


    const elementMortalite =
        document.getElementById(
            "mortaliteMois"
        );


    if (elementAnimaux) {

        elementAnimaux.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    if (elementLots) {

        elementLots.textContent =
            formaterNombre(
                actifs.length
            );

    }


    if (elementProduction) {

        elementProduction.textContent =
            formaterNombre(
                productionJour
            );

    }


    if (elementMortalite) {

        elementMortalite.textContent =
            formaterNombre(
                mortaliteMois
            );

    }

}


/* =========================================================
   13. ACTIVITÉS RÉCENTES
========================================================= */

function chargerActivitesRecentes() {

    const conteneur =
        document.getElementById(
            "listeActivites"
        );


    if (!conteneur) {

        return;

    }


    const activites =
        [];


    obtenirAnimaux()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:
                        `${item.quantite || 0} ${item.type || "animaux"} ajoutés`

                });

            }
        );


    obtenirProductions()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:
                        `Production : ${item.quantite || 0} ${item.unite || ""} de ${item.produit || item.type || ""} — ${item.lotNom || ""}`

                });

            }
        );


    obtenirAlimentation()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:
                        `Alimentation : ${item.quantite || 0} ${item.unite || ""} de ${item.produit || ""}`

                });

            }
        );


    obtenirSante()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:
                        `Santé : ${item.type || ""} — ${item.animal || item.lot || ""}`

                });

            }
        );


    activites.sort(
        function (a, b) {

            return (
                new Date(
                    b.date
                )
                -
                new Date(
                    a.date
                )
            );

        }
    );


    conteneur.innerHTML =
        "";


    if (
        activites.length === 0
    ) {

        conteneur.innerHTML = `

            <div
                class="text-center text-muted">

                Aucune activité enregistrée.

            </div>

        `;

        return;

    }


    activites
        .slice(
            0,
            10
        )
        .forEach(
            function (activite) {

                conteneur.innerHTML += `

                    <div
                        class="list-group-item
                        d-flex
                        justify-content-between
                        align-items-center">

                        <span>

                            ${activite.texte}

                        </span>

                        <small
                            class="text-muted">

                            ${formaterDate(
                                activite.date
                            )}

                        </small>

                    </div>

                `;

            }
        );

}


/* =========================================================
   14. INITIALISATION DES PAGES
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerAnimaux();

        chargerLots();

        chargerLotsProduction();

        chargerProductions();

        chargerSante();

        chargerAlimentation();

        chargerReproduction();

        chargerCroissance();

        chargerPoussiniere();

        chargerDashboardElevage();

        chargerActivitesRecentes();

    }
);


/* =========================================================
   FIN ELEVAGE.JS
========================================================= */
