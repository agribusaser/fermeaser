/* =========================================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   Fichier : js/elevage.js

   ARCHITECTURE :

   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS POUR INCUBATION
        ↓
   incubation.js
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE

   IMPORTANT :
   - AUCUNE INTERFACE D'INCUBATION ICI
   - incubation.js gère l'incubation
   - elevage.js fournit les lots et le stock d'œufs
========================================================= */

"use strict";


/* =========================================================
   1. OUTILS GÉNÉRAUX
========================================================= */

function genererId(prefixe) {

    return (
        prefixe +
        "-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 10000
        )
    );

}


function obtenirDateAujourdHui() {

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


function obtenirDonnees(nom) {

    try {

        const donnees =
            localStorage.getItem(nom);

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
            nom,
            erreur
        );

        return [];

    }

}


function sauvegarderDonnees(
    nom,
    donnees
) {

    try {

        localStorage.setItem(
            nom,
            JSON.stringify(donnees)
        );

        return true;

    } catch (erreur) {

        console.error(
            "Erreur sauvegarde localStorage :",
            nom,
            erreur
        );

        alert(
            "Impossible d'enregistrer les données."
        );

        return false;

    }

}


function formaterNombre(nombre) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


function formaterDate(date) {

    if (!date) {

        return "";

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

        "poussiniere"

    ];


    bases.forEach(
        function (base) {

            if (
                localStorage.getItem(base)
                ===
                null
            ) {

                localStorage.setItem(
                    base,
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

    return obtenirDonnees(
        "animaux"
    );

}


function sauvegarderAnimaux(
    animaux
) {

    return sauvegarderDonnees(
        "animaux",
        animaux
    );

}


function ajouterAnimal(event) {

    if (event) {

        event.preventDefault();

    }


    const typeElement =
        document.getElementById(
            "typeAnimal"
        );

    const raceElement =
        document.getElementById(
            "raceAnimal"
        );

    const quantiteElement =
        document.getElementById(
            "quantiteAnimal"
        );

    const dateElement =
        document.getElementById(
            "dateAnimal"
        );

    const statutElement =
        document.getElementById(
            "statutAnimal"
        );


    const type =
        typeElement
        ? typeElement.value.trim()
        : "";


    const race =
        raceElement
        ? raceElement.value.trim()
        : "";


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const date =
        dateElement
        && dateElement.value
        ? dateElement.value
        : obtenirDateAujourdHui();


    const statut =
        statutElement
        && statutElement.value
        ? statutElement.value
        : "Actif";


    if (!type) {

        alert(
            "Veuillez sélectionner le type d'animal."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        )
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
            genererId(
                "ANI"
            ),

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


    const formulaire =
        document.getElementById(
            "formAnimal"
        );

    if (formulaire) {

        formulaire.reset();

    }


    chargerAnimaux();


    alert(
        "Animal enregistré avec succès."
    );


    return true;

}


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


    animaux
        .slice()
        .reverse()
        .forEach(
            function (animal) {

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
                                animal.quantite
                            )}
                        </td>

                        <td>
                            ${formaterDate(
                                animal.date
                            )}
                        </td>

                        <td>
                            ${animal.statut || "-"}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   4. LOTS D'ÉLEVAGE
========================================================= */

function obtenirLotsElevage() {

    return obtenirDonnees(
        "lotsElevage"
    );

}


function sauvegarderLotsElevage(
    lots
) {

    return sauvegarderDonnees(
        "lotsElevage",
        lots
    );

}


function genererCodeLot() {

    const maintenant =
        new Date();

    const annee =
        maintenant.getFullYear();

    const mois =
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            maintenant.getDate()
        ).padStart(2, "0");

    const heure =
        String(
            maintenant.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            maintenant.getMinutes()
        ).padStart(2, "0");

    const seconde =
        String(
            maintenant.getSeconds()
        ).padStart(2, "0");

    const aleatoire =
        Math.floor(
            Math.random() * 900 + 100
        );


    return (
        "LOT-" +
        annee +
        mois +
        jour +
        "-" +
        heure +
        minute +
        seconde +
        "-" +
        aleatoire
    );

}


function obtenirNomLot(lot) {

    if (!lot) {

        return "";

    }

    return (
        lot.nom
        ||
        lot.nomLot
        ||
        ""
    );

}


function obtenirEspeceLot(lot) {

    if (!lot) {

        return "";

    }

    return (
        lot.espece
        ||
        lot.type
        ||
        ""
    );

}


function obtenirQuantiteLot(lot) {

    if (!lot) {

        return 0;

    }

    return Number(
        lot.quantiteActuelle
        ??
        lot.quantite
        ??
        lot.quantiteInitiale
        ??
        0
    );

}


function enregistrerLot(event) {

    if (event) {

        event.preventDefault();

    }


    const especeElement =
        document.getElementById(
            "lotEspece"
        )
        ||
        document.getElementById(
            "especeLot"
        );


    const raceElement =
        document.getElementById(
            "lotRace"
        )
        ||
        document.getElementById(
            "raceLot"
        );


    const nomElement =
        document.getElementById(
            "lotNom"
        )
        ||
        document.getElementById(
            "nomLot"
        );


    const dateElement =
        document.getElementById(
            "lotDateEntree"
        )
        ||
        document.getElementById(
            "dateEntreeLot"
        );


    const quantiteElement =
        document.getElementById(
            "lotQuantite"
        )
        ||
        document.getElementById(
            "quantiteLot"
        );


    const origineElement =
        document.getElementById(
            "lotOrigine"
        )
        ||
        document.getElementById(
            "origineLot"
        );


    const coutElement =
        document.getElementById(
            "lotCout"
        )
        ||
        document.getElementById(
            "coutLot"
        );


    const statutElement =
        document.getElementById(
            "lotStatut"
        )
        ||
        document.getElementById(
            "statutLot"
        );


    const notesElement =
        document.getElementById(
            "lotNotes"
        )
        ||
        document.getElementById(
            "notesLot"
        );


    const espece =
        especeElement
        ? especeElement.value.trim()
        : "";


    const race =
        raceElement
        ? raceElement.value.trim()
        : "";


    const nom =
        nomElement
        ? nomElement.value.trim()
        : "";


    const dateEntree =
        dateElement
        ? dateElement.value
        : obtenirDateAujourdHui();


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const origine =
        origineElement
        ? origineElement.value
        : "Achat";


    const cout =
        coutElement
        ? Number(
            coutElement.value || 0
        )
        : 0;


    const statut =
        statutElement
        && statutElement.value
        ? statutElement.value
        : "Actif";


    const notes =
        notesElement
        ? notesElement.value.trim()
        : "";


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
        !Number.isFinite(
            quantite
        )
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité initiale doit être supérieure à zéro."
        );

        return false;

    }


    const lots =
        obtenirLotsElevage();


    const doublon =
        lots.some(
            function (lot) {

                return (
                    String(
                        obtenirNomLot(lot)
                    ).toLowerCase()
                    ===
                    nom.toLowerCase()
                );

            }
        );


    if (doublon) {

        const continuer =
            confirm(

                `Un lot nommé "${nom}" existe déjà.

Voulez-vous quand même créer ce nouveau lot ?`

            );


        if (!continuer) {

            return false;

        }

    }


    const code =
        genererCodeLot();


    const nouveauLot = {

        id:
            code,

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

        mortalite:
            0,

        transferes:
            0,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    lots.push(
        nouveauLot
    );


    if (
        !sauvegarderLotsElevage(
            lots
        )
    ) {

        return false;

    }


    const formulaire =
        document.getElementById(
            "formLot"
        );


    if (formulaire) {

        formulaire.reset();

    }


    const modalElement =
        document.getElementById(
            "modalLot"
        );


    if (
        modalElement
        &&
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


    chargerLots();


    chargerLotsProduction();


    alert(

        `Le lot "${nom}" a été enregistré avec succès.`

    );


    return true;

}


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

                let couleur =
                    "success";


                if (
                    lot.statut ===
                    "Terminé"
                ) {

                    couleur =
                        "secondary";

                }


                if (
                    lot.statut ===
                    "Transféré"
                ) {

                    couleur =
                        "warning";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>
                            <strong>
                                ${
                                    lot.code ||
                                    lot.id ||
                                    "-"
                                }
                            </strong>
                        </td>

                        <td>
                            ${
                                obtenirEspeceLot(
                                    lot
                                )
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.race ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                obtenirNomLot(
                                    lot
                                )
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterDate(
                                    lot.dateEntree ||
                                    lot.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteInitiale
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    obtenirQuantiteLot(
                                        lot
                                    )
                                )
                            }
                        </td>

                        <td>

                            <span
                                class="badge bg-${couleur}">

                                ${
                                    lot.statut ||
                                    "Actif"
                                }

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="supprimerLot('${lot.id}')">

                                <i
                                    class="fa-solid fa-trash">
                                </i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


    mettreAJourStatistiquesLots();

}


function supprimerLot(id) {

    const confirmer =
        confirm(

            "Voulez-vous vraiment supprimer ce lot ?\n\n" +
            "Cette opération ne supprime pas les productions déjà enregistrées."

        );


    if (!confirmer) {

        return;

    }


    let lots =
        obtenirLotsElevage();


    lots =
        lots.filter(
            function (lot) {

                return (
                    String(lot.id)
                    !==
                    String(id)
                );

            }
        );


    sauvegarderLotsElevage(
        lots
    );


    chargerLots();


    chargerLotsProduction();


    alert(
        "Lot supprimé."
    );

}


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
                    obtenirQuantiteLot(
                        lot
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
            "totalLots"
        )
        ||
        document.getElementById(
            "lotsActifs"
        );


    const elementActifs =
        document.getElementById(
            "animauxActifs"
        );


    const elementMortalite =
        document.getElementById(
            "totalMortalite"
        )
        ||
        document.getElementById(
            "mortalite"
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
                lots.length
            );

    }


    if (elementActifs) {

        elementActifs.textContent =
            formaterNombre(
                actifs.length
            );

    }


    if (elementMortalite) {

        const mortalite =
            lots.reduce(
                function (
                    total,
                    lot
                ) {

                    return (
                        total +
                        Number(
                            lot.mortalite ||
                            0
                        )
                    );

                },
                0
            );


        elementMortalite.textContent =
            formaterNombre(
                mortalite
            );

    }

}


/* =========================================================
   5. LOTS CONNECTÉS À LA PRODUCTION
========================================================= */

function obtenirLotsConnectes() {

    return obtenirLotsElevage();

}


function trouverLotParId(
    lotId
) {

    const lots =
        obtenirLotsConnectes();


    return (
        lots.find(
            function (lot) {

                return (
                    String(lot.id)
                    ===
                    String(lotId)
                );

            }
        )
        ||
        null
    );

}


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
        obtenirLotsConnectes();


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

                const nom =
                    obtenirNomLot(
                        lot
                    );


                const espece =
                    obtenirEspeceLot(
                        lot
                    );


                const quantite =
                    obtenirQuantiteLot(
                        lot
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lot.id;


                option.dataset.espece =
                    espece;


                option.dataset.nom =
                    nom;


                option.dataset.race =
                    lot.race ||
                    "";


                option.textContent =

                    nom
                    +
                    " — "
                    +
                    espece
                    +
                    " ("
                    +
                    formaterNombre(
                        quantite
                    )
                    +
                    " animaux)";


                select.appendChild(
                    option
                );

            }
        );


    if (ancienneValeur) {

        select.value =
            ancienneValeur;

    }

}


/* =========================================================
   6. PRODUCTION
========================================================= */

function obtenirProductions() {

    return obtenirDonnees(
        "productionsElevage"
    );

}


function sauvegarderProductions(
    productions
) {

    return sauvegarderDonnees(
        "productionsElevage",
        productions
    );

}


/* =========================================================
   STOCK ŒUFS DESTINÉS À L'INCUBATION

   IMPORTANT :

   Cette partie est volontairement conservée ici.

   elevage.js = production crée le stock.

   incubation.js = consomme ce stock.

   Donc :

   production → stockOeufsIncubation
========================================================= */

function obtenirStockOeufsIncubation() {

    return obtenirDonnees(
        "stockOeufsIncubation"
    );

}


function sauvegarderStockOeufsIncubation(
    stock
) {

    return sauvegarderDonnees(
        "stockOeufsIncubation",
        stock
    );

}


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
                    )
                    ===
                    String(
                        lotId
                    )

                    &&

                    Number(
                        ligne.quantiteDisponible
                        ||
                        0
                    )
                    >
                    0

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
                        ligne.quantiteDisponible
                        ||
                        0
                    )
                );

            },
            0
        );

}


function calculerResteProduction(
    quantite,
    incubation,
    vente,
    consommation,
    autre
) {

    const total =
        Number(
            quantite || 0
        );


    const utilise =
        Number(
            incubation || 0
        )
        +
        Number(
            vente || 0
        )
        +
        Number(
            consommation || 0
        )
        +
        Number(
            autre || 0
        );


    return Math.max(
        0,
        total - utilise
    );

}


function enregistrerProduction(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const lotElement =
        document.getElementById(
            "productionLot"
        );


    const dateElement =
        document.getElementById(
            "productionDate"
        );


    const typeElement =
        document.getElementById(
            "productionType"
        );


    const produitElement =
        document.getElementById(
            "productionProduit"
        );


    const quantiteElement =
        document.getElementById(
            "productionQuantite"
        );


    const uniteElement =
        document.getElementById(
            "productionUnite"
        );


    const incubationElement =
        document.getElementById(
            "productionIncubation"
        );


    const venteElement =
        document.getElementById(
            "productionVente"
        );


    const consommationElement =
        document.getElementById(
            "productionConsommation"
        );


    const autreElement =
        document.getElementById(
            "productionAutre"
        );


    const notesElement =
        document.getElementById(
            "productionNotes"
        );


    const lotId =
        lotElement
        ? lotElement.value
        : "";


    const date =
        dateElement
        && dateElement.value
        ? dateElement.value
        : obtenirDateAujourdHui();


    const type =
        typeElement
        ? typeElement.value
        : "Œufs";


    const produit =
        produitElement
        ? produitElement.value.trim()
        : "";


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const unite =
        uniteElement
        ? uniteElement.value
        : "Unité";


    const incubation =
        incubationElement
        ? Number(
            incubationElement.value || 0
        )
        : 0;


    const vente =
        venteElement
        ? Number(
            venteElement.value || 0
        )
        : 0;


    const consommation =
        consommationElement
        ? Number(
            consommationElement.value || 0
        )
        : 0;


    const autre =
        autreElement
        ? Number(
            autreElement.value || 0
        )
        : 0;


    const notes =
        notesElement
        ? notesElement.value.trim()
        : "";


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
            "Le lot producteur sélectionné est introuvable."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        )
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return false;

    }


    if (!produit) {

        alert(
            "Veuillez saisir le produit."
        );

        return false;

    }


    if (
        incubation < 0
        ||
        vente < 0
        ||
        consommation < 0
        ||
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

            "Erreur de répartition.\n\n" +

            "Production totale : " +
            formaterNombre(
                quantite
            ) +

            "\nRépartition : " +

            formaterNombre(
                totalRepartition
            )

        );

        return false;

    }


    const productions =
        obtenirProductions();


    const idProduction =
        genererId(
            "PROD"
        );


    /* =====================================================
       ENREGISTREMENT DE LA PRODUCTION

       IMPORTANT :
       Le lot est enregistré par son ID.

       lotId
       lotNom
       espece
       race

       Ainsi la production reste liée au lot même si
       son nom est modifié plus tard.
    ===================================================== */

    const nouvelleProduction = {

        id:
            idProduction,

        date:
            date,

        lotId:
            lot.id,

        lotNom:
            obtenirNomLot(
                lot
            ),

        espece:
            obtenirEspeceLot(
                lot
            ),

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
                calculerResteProduction(
                    quantite,
                    incubation,
                    vente,
                    consommation,
                    autre
                )

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


    if (
        !sauvegarderProductions(
            productions
        )
    ) {

        return false;

    }


    /* =====================================================
       STOCK ŒUFS POUR INCUBATION

       Si par exemple :

       Production = 68 œufs
       Incubation = 40

       alors :

       stockOeufsIncubation
       = 40 œufs

       avec :

       lotId = lot.id
       lotNom = nom du lot
       espece = espèce
       race = race
       productionId = production.id

       incubation.js pourra ensuite retrouver
       exactement ce lot.
    ===================================================== */

    if (
        incubation > 0
    ) {

        const stock =
            obtenirStockOeufsIncubation();


        stock.push({

            id:
                genererId(
                    "STKINC"
                ),

            productionId:
                nouvelleProduction.id,

            lotId:
                lot.id,

            lotNom:
                obtenirNomLot(
                    lot
                ),

            espece:
                obtenirEspeceLot(
                    lot
                ),

            race:
                lot.race ||
                "",

            produit:
                produit,

            quantiteInitiale:
                incubation,

            quantiteDisponible:
                incubation,

            quantiteUtilisee:
                0,

            dateProduction:
                date,

            statut:
                "Disponible"

        });


        if (
            !sauvegarderStockOeufsIncubation(
                stock
            )
        ) {

            console.error(
                "La production a été enregistrée mais le stock d'incubation n'a pas pu être sauvegardé."
            );

        }

    }


    const formulaire =
        document.getElementById(
            "formProduction"
        );


    if (formulaire) {

        formulaire.reset();

    }


    const modalElement =
        document.getElementById(
            "modalProduction"
        );


    if (
        modalElement
        &&
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


    chargerProductions();


    alert(

        "Production enregistrée avec succès.\n\n" +

        "Lot : " +
        obtenirNomLot(
            lot
        ) +

        "\n" +

        "Production : " +
        formaterNombre(
            quantite
        ) +

        " " +
        unite +

        "\n" +

        "Œufs destinés à l'incubation : " +
        formaterNombre(
            incubation
        )

    );


    return true;

}


function chargerProductions() {

    const tableau =
        document.getElementById(
            "listeProductions"
        );


    if (!tableau) {

        return;

    }


    const productions =
        obtenirProductions();


    tableau.innerHTML =
        "";


    if (
        productions.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted">

                    Aucune production enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    productions
        .slice()
        .reverse()
        .forEach(
            function (production) {

                const repartition =
                    production.repartition
                    ||
                    {};


                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    production.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                production.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.type
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.produit
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    production.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                production.unite
                                ||
                                ""
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.incubation
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.vente
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.reste
                                )
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   7. SANTÉ
========================================================= */

function obtenirSante() {

    return obtenirDonnees(
        "santeElevage"
    );

}


function sauvegarderSante(
    sante
) {

    return sauvegarderDonnees(
        "santeElevage",
        sante
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


    const sante =
        obtenirSante();


    tableau.innerHTML =
        "";


    if (
        sante.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucun suivi sanitaire enregistré.

                </td>

            </tr>

        `;

        return;

    }


    sante
        .slice()
        .reverse()
        .forEach(
            function (item) {

                let couleur =
                    "success";


                if (
                    item.type ===
                    "Maladie"
                ) {

                    couleur =
                        "danger";

                }


                if (
                    item.type ===
                    "Traitement"
                ) {

                    couleur =
                        "warning";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.animal
                                ||
                                item.lot
                                ||
                                "-"
                            }
                        </td>

                        <td>

                            <span
                                class="badge bg-${couleur}">

                                ${
                                    item.type
                                    ||
                                    "-"
                                }

                            </span>

                        </td>

                        <td>
                            ${
                                item.description
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.traitement
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.utilisateur
                                ||
                                "-"
                            }
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="supprimerSante('${item.id}')">

                                <i
                                    class="fa-solid fa-trash">
                                </i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );

}


function supprimerSante(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cet enregistrement ?"
        )
    ) {

        return;

    }


    let sante =
        obtenirSante();


    sante =
        sante.filter(
            function (item) {

                return (
                    String(item.id)
                    !==
                    String(id)
                );

            }
        );


    sauvegarderSante(
        sante
    );


    chargerSante();

}


/* =========================================================
   8. ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return obtenirDonnees(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(
    alimentation
) {

    return sauvegarderDonnees(
        "alimentationElevage",
        alimentation
    );

}


function chargerLotsAlimentation() {

    const select =
        document.getElementById(
            "alimentLot"
        );


    if (!select) {

        return;

    }


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

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lot.id;


                option.textContent =

                    obtenirNomLot(
                        lot
                    )
                    +
                    " — "
                    +
                    obtenirEspeceLot(
                        lot
                    );


                select.appendChild(
                    option
                );

            }
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


    if (
        donnees.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune alimentation enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lotNom
                                ||
                                item.lot
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.produit
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.unite
                                ||
                                ""
                            }
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

    return obtenirDonnees(
        "reproductionElevage"
    );

}


function sauvegarderReproduction(
    donnees
) {

    return sauvegarderDonnees(
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


    const reproduction =
        obtenirReproduction();


    tableau.innerHTML =
        "";


    if (
        reproduction.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune reproduction enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    reproduction
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lot
                                ||
                                item.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.oeufs
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.eclos
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.statut
                                ||
                                "-"
                            }
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

    return obtenirDonnees(
        "croissanceElevage"
    );

}


function sauvegarderCroissance(
    donnees
) {

    return sauvegarderDonnees(
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


    if (
        donnees.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune donnée de croissance.

                </td>

            </tr>

        `;

        return;

    }


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lot
                                ||
                                item.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.poids
                                ||
                                0
                            }
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

    return obtenirDonnees(
        "poussiniere"
    );

}


function sauvegarderPoussiniere(
    donnees
) {

    return sauvegarderDonnees(
        "poussiniere",
        donnees
    );

}


function ouvrirFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    const date =
        document.getElementById(
            "brooderDate"
        );


    if (
        date
        &&
        !date.value
    ) {

        date.value =
            obtenirDateAujourdHui();

    }

}


function fermerFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";

}


function enregistrerPoussiniere(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const espece =
        document.getElementById(
            "brooderEspece"
        )?.value
        ||
        "";


    const origine =
        document.getElementById(
            "brooderOrigine"
        )?.value
        ?.trim()
        ||
        "";


    const nombre =
        Number(
            document.getElementById(
                "brooderNombre"
            )?.value
        );


    const dateEntree =
        document.getElementById(
            "brooderDate"
        )?.value
        ||
        obtenirDateAujourdHui();


    const emplacement =
        document.getElementById(
            "brooderEmplacement"
        )?.value
        ||
        "";


    const temperature =
        Number(
            document.getElementById(
                "brooderTemperature"
            )?.value
            ||
            0
        );


    if (
        !espece
        ||
        !origine
        ||
        !Number.isFinite(
            nombre
        )
        ||
        nombre <= 0
        ||
        !emplacement
    ) {

        alert(
            "Veuillez remplir correctement tous les champs."
        );

        return false;

    }


    const poussiniere =
        obtenirPoussiniere();


    const nouveauLot = {

        id:
            genererId(
                "BRD"
            ),

        espece:
            espece,

        origine:
            origine,

        emplacement:
            emplacement,

        dateEntree:
            dateEntree,

        nombreInitial:
            nombre,

        presents:
            nombre,

        mortalite:
            0,

        transferes:
            0,

        temperature:
            temperature,

        alimentTotal:
            0,

        statut:
            "Actif",

        suivi:
            [],

        dateCreation:
            new Date().toISOString()

    };


    poussiniere.push(
        nouveauLot
    );


    sauvegarderPoussiniere(
        poussiniere
    );


    const formulaire =
        document.getElementById(
            "formPoussiniere"
        );


    if (formulaire) {

        formulaire.reset();

    }


    fermerFormulairePoussiniere();


    chargerPoussiniere();


    alert(
        `Lot ${nouveauLot.id} créé avec succès.`
    );


    return true;

}


function chargerPoussiniere() {

    const tableau =
        document.getElementById(
            "listePoussiniere"
        );


    if (!tableau) {

        return;

    }


    const poussiniere =
        obtenirPoussiniere();


    tableau.innerHTML =
        "";


    if (
        poussiniere.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted">

                    Aucun lot en poussinière.

                </td>

            </tr>

        `;

        return;

    }


    poussiniere
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                lot.id
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.origine
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterDate(
                                    lot.dateEntree
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.nombreInitial
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.presents
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.mortalite
                                )
                            }
                        </td>

                        <td>
                            ${
                                lot.emplacement
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.statut
                                ||
                                "-"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   12. TABLEAU DE BORD ÉLEVAGE
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
                    obtenirQuantiteLot(
                        lot
                    )
                );

            },
            0
        );


    const aujourdHui =
        obtenirDateAujourdHui();


    const productionJour =
        productions
            .filter(
                function (item) {

                    return (
                        item.date
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
                            item.quantite
                            ||
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

                    const date =
                        new Date(
                            item.date
                        );


                    return (

                        date.getMonth()
                        ===
                        mois

                        &&

                        date.getFullYear()
                        ===
                        annee

                        &&

                        (
                            item.type
                            ===
                            "Mortalité"

                            ||

                            item.nature
                            ===
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
                            item.quantite
                            ||
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
                        `${item.quantite || 0} ${
                            item.type ||
                            "animaux"
                        } ajoutés`

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

                        `Production : ${
                            item.quantite ||
                            0
                        } ${
                            item.unite ||
                            ""
                        } de ${
                            item.produit ||
                            item.type ||
                            ""
                        } — ${
                            item.lotNom ||
                            ""
                        }`

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

                        `Alimentation : ${
                            item.quantite ||
                            0
                        } ${
                            item.unite ||
                            ""
                        } de ${
                            item.produit ||
                            ""
                        }`

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

                        `Santé : ${
                            item.type ||
                            ""
                        } — ${
                            item.animal ||
                            item.lot ||
                            ""
                        }`

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

                            ${
                                activite.texte
                            }

                        </span>

                        <small
                            class="text-muted">

                            ${
                                formaterDate(
                                    activite.date
                                )
                            }

                        </small>

                    </div>

                `;

            }
        );

}


/* =========================================================
   14. SUIVI ÉLEVAGE
========================================================= */

function chargerSuiviElevage() {

    const tableau =
        document.getElementById(
            "listeSuiviElevage"
        );


    if (!tableau) {

        return;

    }


    tableau.innerHTML =
        "";


    const lots =
        obtenirLotsElevage();


    if (
        lots.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucun lot à suivre.

                </td>

            </tr>

        `;

        return;

    }


    lots
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                obtenirNomLot(
                                    lot
                                )
                            }
                        </td>

                        <td>
                            ${
                                obtenirEspeceLot(
                                    lot
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteInitiale
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    obtenirQuantiteLot(
                                        lot
                                    )
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.mortalite
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.transferes
                                )
                            }
                        </td>

                        <td>
                            ${
                                lot.statut ||
                                "Actif"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   15. COMPATIBILITÉ
========================================================= */

/*
 * Certaines anciennes pages de ton ERP utilisent
 * getDataLocale() et sauvegarderDataLocale().
 *
 * On conserve ces noms comme alias.
 */

function getDataLocale(
    cle
) {

    return obtenirDonnees(
        cle
    );

}


function sauvegarderDataLocale(
    cle,
    donnees
) {

    return sauvegarderDonnees(
        cle,
        donnees
    );

}


function obtenirDateAujourdhui() {

    return obtenirDateAujourdHui();

}


/* =========================================================
   16. EXPORTS GLOBAUX
   ---------------------------------------------------------
   Nécessaire pour les onclick présents dans tes pages HTML.
========================================================= */

window.genererId =
    genererId;

window.obtenirUtilisateur =
    obtenirUtilisateur;

window.obtenirDateAujourdHui =
    obtenirDateAujourdHui;

window.formaterNombre =
    formaterNombre;

window.formaterDate =
    formaterDate;


/* ANIMAUX */

window.obtenirAnimaux =
    obtenirAnimaux;

window.ajouterAnimal =
    ajouterAnimal;

window.chargerAnimaux =
    chargerAnimaux;


/* LOTS */

window.obtenirLotsElevage =
    obtenirLotsElevage;

window.obtenirLotsConnectes =
    obtenirLotsConnectes;

window.enregistrerLot =
    enregistrerLot;

window.chargerLots =
    chargerLots;

window.supprimerLot =
    supprimerLot;

window.chargerLotsProduction =
    chargerLotsProduction;


/* PRODUCTION */

window.obtenirProductions =
    obtenirProductions;

window.enregistrerProduction =
    enregistrerProduction;

window.chargerProductions =
    chargerProductions;

window.obtenirStockOeufsIncubation =
    obtenirStockOeufsIncubation;

window.sauvegarderStockOeufsIncubation =
    sauvegarderStockOeufsIncubation;

window.obtenirOeufsDisponiblesPourLot =
    obtenirOeufsDisponiblesPourLot;


/* SANTÉ */

window.obtenirSante =
    obtenirSante;

window.chargerSante =
    chargerSante;

window.supprimerSante =
    supprimerSante;


/* ALIMENTATION */

window.obtenirAlimentation =
    obtenirAlimentation;

window.chargerAlimentation =
    chargerAlimentation;

window.chargerLotsAlimentation =
    chargerLotsAlimentation;


/* REPRODUCTION */

window.obtenirReproduction =
    obtenirReproduction;

window.chargerReproduction =
    chargerReproduction;


/* CROISSANCE */

window.obtenirCroissance =
    obtenirCroissance;

window.chargerCroissance =
    chargerCroissance;


/* POUSSINIÈRE */

window.obtenirPoussiniere =
    obtenirPoussiniere;

window.enregistrerPoussiniere =
    enregistrerPoussiniere;

window.chargerPoussiniere =
    chargerPoussiniere;

window.ouvrirFormulairePoussiniere =
    ouvrirFormulairePoussiniere;

window.fermerFormulairePoussiniere =
    fermerFormulairePoussiniere;


/* TABLEAU DE BORD */

window.chargerDashboardElevage =
    chargerDashboardElevage;

window.chargerActivitesRecentes =
    chargerActivitesRecentes;

window.chargerSuiviElevage =
    chargerSuiviElevage;


/* COMPATIBILITÉ */

window.getDataLocale =
    getDataLocale;

window.sauvegarderDataLocale =
    sauvegarderDataLocale;

window.obtenirDateAujourdhui =
    obtenirDateAujourdhui;


/* =========================================================
   17. INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * ANIMAUX
         */

        chargerAnimaux();


        /*
         * LOTS
         */

        chargerLots();

        chargerLotsProduction();


        /*
         * PRODUCTION
         */

        chargerProductions();


        /*
         * AUTRES MODULES
         */

        chargerSante();

        chargerAlimentation();

        chargerLotsAlimentation();

        chargerReproduction();

        chargerCroissance();

        chargerPoussiniere();


        /*
         * TABLEAU DE BORD
         */

        chargerDashboardElevage();

        chargerActivitesRecentes();

        chargerSuiviElevage();


        console.log(
            "✓ Ferme Asher ERP — elevage.js chargé."
        );

        console.log(
            "✓ Incubation séparée dans incubation.js."
        );

    }
);


/* =========================================================
   FIN ELEVAGE.JS
========================================================= */
