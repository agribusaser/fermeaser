/* =========================================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   VERSION PROPRE
   ---------------------------------------------------------
   Gestion :
   - Animaux & Lots
   - Production
   - Santé & Mortalité
   - Alimentation
   - Reproduction
   - Croissance
   - Poussinière
   - Suivi
   - Liaisons avec Incubation
   ========================================================= */

"use strict";


/* =========================================================
   OUTILS GÉNÉRAUX
========================================================= */

function getDataLocale(cle) {

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

    localStorage.setItem(
        cle,
        JSON.stringify(donnees)
    );

}


function obtenirDateAujourdhui() {

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


function formaterDate(date) {

    if (!date) {
        return "";
    }

    const texte =
        String(date);

    const parties =
        texte.split("-");

    if (parties.length === 3) {

        return (
            parties[2] +
            "/" +
            parties[1] +
            "/" +
            parties[0]
        );

    }

    return texte;

}


function formaterNombre(nombre) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


/* =========================================================
   LOTS D'ÉLEVAGE
========================================================= */

function obtenirLotsElevage() {

    return getDataLocale(
        "lotsElevage"
    );

}


function sauvegarderLotsElevage(
    lots
) {

    sauvegarderDataLocale(
        "lotsElevage",
        lots
    );

}


function obtenirLotElevage(
    id
) {

    const lots =
        obtenirLotsElevage();

    return lots.find(
        function (lot) {

            return String(
                lot.id
            ) === String(id);

        }
    );

}


/* =========================================================
   ANIMAUX
========================================================= */

function obtenirAnimaux() {

    return getDataLocale(
        "animauxElevage"
    );

}


function sauvegarderAnimaux(
    animaux
) {

    sauvegarderDataLocale(
        "animauxElevage",
        animaux
    );

}


function chargerAnimaux() {

    const tableau =
        document.getElementById(
            "listeAnimaux"
        );

    if (!tableau) {

        /*
         * Certaines pages n'utilisent
         * pas cette liste.
         */

        return;

    }


    const animaux =
        obtenirAnimaux();


    tableau.innerHTML = "";


    if (animaux.length === 0) {

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

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${animal.id || "-"}
                </td>

                <td>
                    ${animal.type || animal.espece || "-"}
                </td>

                <td>
                    ${animal.lotNom || animal.lot || "-"}
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
                        animal.quantiteActuelle ||
                        animal.quantite ||
                        0
                    )}
                </td>

                <td>
                    ${animal.statut || "Actif"}
                </td>

            `;


            tableau.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   LOTS : AFFICHAGE
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


    tableau.innerHTML = "";


    if (lots.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted">

                    Aucun lot enregistré.

                </td>

            </tr>

        `;

        mettreAJourStatistiquesLots();

        return;

    }


    lots.forEach(
        function (lot) {

            const quantite =
                Number(
                    lot.quantiteActuelle ??
                    lot.quantite ??
                    lot.quantiteInitiale ??
                    0
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${lot.id || "-"}
                </td>

                <td>
                    ${lot.nom || lot.nomLot || "-"}
                </td>

                <td>
                    ${lot.espece || lot.type || "-"}
                </td>

                <td>
                    ${formaterNombre(
                        lot.quantiteInitiale ??
                        lot.quantite ??
                        0
                    )}
                </td>

                <td>
                    ${formaterNombre(
                        quantite
                    )}
                </td>

                <td>
                    ${formaterDate(
                        lot.date ||
                        lot.dateCreation
                    )}
                </td>

                <td>

                    <span
                        class="badge ${
                            lot.statut === "Inactif"
                                ? "bg-secondary"
                                : "bg-success"
                        }">

                        ${lot.statut || "Actif"}

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

            `;


            tableau.appendChild(
                tr
            );

        }
    );


    mettreAJourStatistiquesLots();

}


/* =========================================================
   SUPPRIMER LOT
========================================================= */

function supprimerLot(
    id
) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce lot ?"
        );


    if (!confirmation) {

        return;

    }


    let lots =
        obtenirLotsElevage();


    lots =
        lots.filter(
            function (lot) {

                return String(
                    lot.id
                ) !== String(id);

            }
        );


    sauvegarderLotsElevage(
        lots
    );


    chargerLots();


    alert(
        "Le lot a été supprimé."
    );

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
                    lot.statut === "Actif" ||
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


    const elementAnimaux =
        document.getElementById(
            "totalAnimaux"
        );


    const elementLots =
        document.getElementById(
            "totalLots"
        );


    const elementLotsActifs =
        document.getElementById(
            "lotsActifs"
        );


    if (elementAnimaux) {

        elementAnimaux.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    if (elementLots) {

        elementLots.textContent =
            actifs.length;

    }


    if (elementLotsActifs) {

        elementLotsActifs.textContent =
            actifs.length;

    }

}


/* =========================================================
   LOTS CONNECTÉS À LA PRODUCTION
========================================================= */

function obtenirLotsConnectes() {

    return obtenirLotsElevage();

}


function chargerLotsProduction() {

    const select =
        document.getElementById(
            "productionLot"
        );


    if (!select) {

        return;

    }


    const valeurActuelle =
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
                    lot.statut === "Actif" ||
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


                select.innerHTML += `

                    <option
                        value="${lot.id}"
                        data-espece="${
                            lot.espece ||
                            lot.type ||
                            ""
                        }"
                        data-nom="${
                            lot.nom ||
                            lot.nomLot ||
                            ""
                        }">

                        ${
                            lot.nom ||
                            lot.nomLot ||
                            "Lot sans nom"
                        }

                        —

                        ${
                            lot.espece ||
                            lot.type ||
                            ""
                        }

                        (${quantite} animaux)

                    </option>

                `;

            }
        );


    if (valeurActuelle) {

        select.value =
            valeurActuelle;

    }

}


/* =========================================================
   PRODUCTIONS
========================================================= */

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

    sauvegarderDataLocale(
        "productionsElevage",
        productions
    );

}


/* =========================================================
   STOCK ŒUFS DESTINÉS À L'INCUBATION
   ---------------------------------------------------------
   IMPORTANT :
   Cette partie reste dans elevage.js parce que
   Production crée le stock destiné à incubation.
   
   L'INTERFACE de l'incubation est maintenant dans
   incubation.js.
========================================================= */

function obtenirStockOeufsIncubation() {

    return getDataLocale(
        "stockOeufsIncubation"
    );

}


function sauvegarderStockOeufsIncubation(
    stock
) {

    sauvegarderDataLocale(
        "stockOeufsIncubation",
        stock
    );

}


/* =========================================================
   CALCUL STOCK ŒUFS INCUBATION PAR LOT
========================================================= */

function obtenirOeufsDisponiblesPourLot(
    lotId
) {

    const stock =
        obtenirStockOeufsIncubation();


    return stock
        .filter(
            function (item) {

                return String(
                    item.lotId
                ) === String(
                    lotId
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
                        item.quantiteDisponible ||
                        0
                    )
                );

            },
            0
        );

}


/* =========================================================
   PRODUCTION : RÉPARTITION
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
   ENREGISTRER PRODUCTION
   ---------------------------------------------------------
   Cette fonction est compatible avec la logique actuelle :
   une partie des œufs peut être affectée à l'incubation.
========================================================= */

function enregistrerProduction(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const dateElement =
        document.getElementById(
            "productionDate"
        );


    const lotElement =
        document.getElementById(
            "productionLot"
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


    if (
        !lotElement ||
        !quantiteElement
    ) {

        alert(
            "Les champs de production sont introuvables."
        );

        return false;

    }


    const date =
        dateElement?.value ||
        obtenirDateAujourdhui();


    const lotId =
        lotElement.value;


    const quantite =
        Number(
            quantiteElement.value
        );


    const type =
        typeElement?.value ||
        "Œufs";


    const produit =
        produitElement?.value ||
        "Œufs";


    const unite =
        uniteElement?.value ||
        "Unité";


    const incubation =
        Number(
            document.getElementById(
                "productionIncubation"
            )?.value ||
            document.getElementById(
                "incubation"
            )?.value ||
            0
        );


    const vente =
        Number(
            document.getElementById(
                "productionVente"
            )?.value ||
            document.getElementById(
                "vente"
            )?.value ||
            0
        );


    const consommation =
        Number(
            document.getElementById(
                "productionConsommation"
            )?.value ||
            document.getElementById(
                "consommation"
            )?.value ||
            0
        );


    const autre =
        Number(
            document.getElementById(
                "productionAutre"
            )?.value ||
            document.getElementById(
                "autre"
            )?.value ||
            0
        );


    const notes =
        document.getElementById(
            "productionNotes"
        )?.value ||
        "";


    if (!lotId) {

        alert(
            "Veuillez sélectionner un lot."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        ) ||
        quantite <= 0
    ) {

        alert(
            "Veuillez saisir une quantité valide."
        );

        return false;

    }


    const totalAffecte =
        incubation +
        vente +
        consommation +
        autre;


    if (
        totalAffecte >
        quantite
    ) {

        alert(
            "La répartition dépasse la quantité produite."
        );

        return false;

    }


    const lot =
        obtenirLotElevage(
            lotId
        );


    if (!lot) {

        alert(
            "Lot introuvable."
        );

        return false;

    }


    const productions =
        obtenirProductions();


    const nouvelleProduction = {

        id:
            "PROD-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            ),

        date:
            date,

        lotId:
            lot.id,

        lotNom:
            lot.nom ||
            lot.nomLot ||
            "",

        espece:
            lot.espece ||
            lot.type ||
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
            localStorage.getItem(
                "utilisateur"
            ) ||
            localStorage.getItem(
                "utilisateurConnecte"
            ) ||
            "Administrateur",

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
       AJOUT AU STOCK ŒUFS POUR INCUBATION
       ===================================================== */

    if (
        incubation > 0
    ) {

        const stock =
            obtenirStockOeufsIncubation();


        stock.push({

            id:
                "STKINC-" +
                Date.now() +
                "-" +
                Math.floor(
                    Math.random() * 1000
                ),

            productionId:
                nouvelleProduction.id,

            lotId:
                lot.id,

            lotNom:
                lot.nom ||
                lot.nomLot ||
                "",

            espece:
                lot.espece ||
                lot.type ||
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


        sauvegarderStockOeufsIncubation(
            stock
        );

    }


    /*
     * Actualiser la liste de production.
     */

    if (
        typeof chargerProductions ===
        "function"
    ) {

        chargerProductions();

    }


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
   CHARGER PRODUCTIONS
========================================================= */

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


    tableau.innerHTML = "";


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
                    production.repartition ||
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
                                production.lotNom ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.espece ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.produit ||
                                production.type ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    production.quantite
                                )
                            }
                            ${
                                production.unite ||
                                ""
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.incubation ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.vente ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.consommation ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.autre ||
                                    0
                                )
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   SANTÉ
========================================================= */

function obtenirSante() {

    return getDataLocale(
        "santeElevage"
    );

}


function sauvegarderSante(
    donnees
) {

    sauvegarderDataLocale(
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


    tableau.innerHTML = "";


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
                                item.animal ||
                                item.lot ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.type ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.description ||
                                item.traitement ||
                                "-"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return getDataLocale(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(
    donnees
) {

    sauvegarderDataLocale(
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


    tableau.innerHTML = "";


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
                                item.lot ||
                                item.lotNom ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.produit ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.quantite
                                )
                            }
                            ${
                                item.unite ||
                                ""
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   REPRODUCTION
   ---------------------------------------------------------
   Ce bloc ne gère PAS la page Incubation.
   Il conserve uniquement le suivi reproduction existant.
========================================================= */

function obtenirReproduction() {

    return getDataLocale(
        "reproductionElevage"
    );

}


function sauvegarderReproduction(
    donnees
) {

    sauvegarderDataLocale(
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


    tableau.innerHTML = "";


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
                                formaterNombre(
                                    item.oeufs ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.eclos ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.statut ||
                                "-"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   CROISSANCE
========================================================= */

function obtenirCroissance() {

    return getDataLocale(
        "croissanceElevage"
    );

}


function sauvegarderCroissance(
    donnees
) {

    sauvegarderDataLocale(
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


    tableau.innerHTML = "";


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
                                item.lot ||
                                item.lotNom ||
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
                                item.poids ||
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
   POUSSINIÈRE
   ---------------------------------------------------------
   L'incubation est séparée.
   La poussinière reçoit les poussins issus de l'éclosion.
========================================================= */

function obtenirPoussiniere() {

    return getDataLocale(
        "poussiniereElevage"
    );

}


function sauvegarderPoussiniere(
    donnees
) {

    sauvegarderDataLocale(
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


    tableau.innerHTML = "";


    if (
        donnees.length === 0
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


    donnees
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                lot.id ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.espece ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.nom ||
                                lot.nomLot ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteInitiale ||
                                    lot.quantite ||
                                    0
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteActuelle ||
                                    lot.quantite ||
                                    0
                                )
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
                                lot.statut ||
                                "En poussinière"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   SUIVI ÉLEVAGE
========================================================= */

function chargerSuiviElevage() {

    const conteneur =
        document.getElementById(
            "suiviElevage"
        );


    if (!conteneur) {

        return;

    }


    const lots =
        obtenirLotsElevage();


    const productions =
        obtenirProductions();


    const alimentation =
        obtenirAlimentation();


    const sante =
        obtenirSante();


    conteneur.innerHTML = `

        <div class="row g-3">

            <div class="col-md-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <small class="text-muted">
                            Lots
                        </small>

                        <h3>
                            ${
                                lots.length
                            }
                        </h3>

                    </div>

                </div>

            </div>


            <div class="col-md-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <small class="text-muted">
                            Productions
                        </small>

                        <h3>
                            ${
                                productions.length
                            }
                        </h3>

                    </div>

                </div>

            </div>


            <div class="col-md-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <small class="text-muted">
                            Alimentation
                        </small>

                        <h3>
                            ${
                                alimentation.length
                            }
                        </h3>

                    </div>

                </div>

            </div>


            <div class="col-md-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <small class="text-muted">
                            Santé
                        </small>

                        <h3>
                            ${
                                sante.length
                            }
                        </h3>

                    </div>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   ACTIVITÉS RÉCENTES
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
                        item.date ||
                        item.dateCreation,

                    texte:
                        `${
                            item.quantite ||
                            item.quantiteInitiale ||
                            0
                        } ${
                            item.type ||
                            item.espece ||
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
                        } ${
                            item.produit ||
                            item.type ||
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
                        } ${
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
                        } - ${
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
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );


    conteneur.innerHTML = "";


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
        .slice(0, 10)
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
   DASHBOARD ÉLEVAGE
========================================================= */

function chargerDashboardElevage() {

    const lots =
        obtenirLotsElevage();


    const productions =
        obtenirProductions();


    const sante =
        obtenirSante();


    const aujourdHui =
        obtenirDateAujourdhui();


    const actifs =
        lots.filter(
            function (lot) {

                return (
                    lot.statut === "Actif" ||
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


    const productionJour =
        productions
            .filter(
                function (item) {

                    return (
                        item.date ===
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


    const mois =
        new Date()
            .getMonth();


    const annee =
        new Date()
            .getFullYear();


    const mortaliteMois =
        sante
            .filter(
                function (item) {

                    const date =
                        new Date(
                            item.date
                        );

                    return (
                        date.getMonth() === mois &&
                        date.getFullYear() === annee &&
                        (
                            item.type ===
                            "Mortalité" ||
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
            actifs.length;

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
   INITIALISATION
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

        chargerSuiviElevage();

    }
);

/* =========================================================
   FERME ASHER ERP
   LIAISON CENTRALE ÉLEVAGE
   ---------------------------------------------------------
   CHAÎNE :

   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS POUR INCUBATION
        ↓
   INCUBATION.JS

   IMPORTANT :
   - elevage.js gère les lots et les productions
   - incubation.js gère l'interface d'incubation
   - la liaison se fait toujours avec lotId
========================================================= */


/* =========================================================
   1. LOTS D'ÉLEVAGE
========================================================= */

function obtenirLotsElevage() {

    try {

        const donnees =
            localStorage.getItem(
                "lotsElevage"
            );

        if (!donnees) {

            return [];

        }

        const lots =
            JSON.parse(
                donnees
            );

        return Array.isArray(lots)
            ? lots
            : [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture lotsElevage :",
            erreur
        );

        return [];

    }

}


/* =========================================================
   2. SAUVEGARDER LES LOTS
========================================================= */

function sauvegarderLotsElevage(
    lots
) {

    localStorage.setItem(
        "lotsElevage",
        JSON.stringify(
            Array.isArray(lots)
                ? lots
                : []
        )
    );

}


/* =========================================================
   3. TROUVER UN LOT PAR SON ID
========================================================= */

function trouverLotElevage(
    lotId
) {

    if (!lotId) {

        return null;

    }

    const lots =
        obtenirLotsElevage();

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
   4. NOM DU LOT
========================================================= */

function obtenirNomLotElevage(
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
   5. ESPÈCE DU LOT
========================================================= */

function obtenirEspeceLotElevage(
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
   6. RACE DU LOT
========================================================= */

function obtenirRaceLotElevage(
    lot
) {

    if (!lot) {

        return "";

    }

    return (
        lot.race ||
        lot.type ||
        ""
    );

}


/* =========================================================
   7. LOTS DISPONIBLES POUR LA PRODUCTION
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
                    lot.statut === "Actif" ||
                    !lot.statut
                );

            }
        )
        .forEach(
            function (lot) {

                const nom =
                    obtenirNomLotElevage(
                        lot
                    );

                const espece =
                    obtenirEspeceLotElevage(
                        lot
                    );

                const quantite =
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        lot.quantiteInitiale ??
                        0
                    );


                select.innerHTML += `

                    <option
                        value="${lot.id}"
                    >

                        ${nom}

                        —

                        ${espece}

                        —

                        ${quantite} animaux

                    </option>

                `;

            }
        );


    if (ancienneValeur) {

        select.value =
            ancienneValeur;

    }

}


/* =========================================================
   8. PRODUCTIONS
========================================================= */

function obtenirProductions() {

    try {

        const donnees =
            localStorage.getItem(
                "productionsElevage"
            );

        if (!donnees) {

            return [];

        }

        const productions =
            JSON.parse(
                donnees
            );

        return Array.isArray(
            productions
        )
            ? productions
            : [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture productionsElevage :",
            erreur
        );

        return [];

    }

}


/* =========================================================
   9. SAUVEGARDER PRODUCTIONS
========================================================= */

function sauvegarderProductions(
    productions
) {

    localStorage.setItem(
        "productionsElevage",
        JSON.stringify(
            Array.isArray(productions)
                ? productions
                : []
        )
    );

}


/* =========================================================
   10. COMPATIBILITÉ
========================================================= */

function obtenirProductionsConnectees() {

    return obtenirProductions();

}


/* =========================================================
   11. STOCK ŒUFS POUR INCUBATION
========================================================= */

function obtenirStockOeufsIncubation() {

    try {

        const donnees =
            localStorage.getItem(
                "stockOeufsIncubation"
            );

        if (!donnees) {

            return [];

        }

        const stock =
            JSON.parse(
                donnees
            );

        return Array.isArray(stock)
            ? stock
            : [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture stockOeufsIncubation :",
            erreur
        );

        return [];

    }

}


/* =========================================================
   12. SAUVEGARDER STOCK ŒUFS
========================================================= */

function sauvegarderStockOeufsIncubation(
    stock
) {

    localStorage.setItem(
        "stockOeufsIncubation",
        JSON.stringify(
            Array.isArray(stock)
                ? stock
                : []
        )
    );

}


/* =========================================================
   13. CALCULER LE STOCK DISPONIBLE D'UN LOT
========================================================= */

function obtenirOeufsDisponiblesPourLot(
    lotId
) {

    if (!lotId) {

        return 0;

    }


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
                        ligne.quantiteDisponible ??
                        ligne.stockDisponible ??
                        0
                    )
                );

            },
            0
        );

}


/* =========================================================
   14. CALCUL DU RESTE
========================================================= */

function calculerResteProduction(
    quantite,
    incubation,
    vente,
    consommation,
    autre
) {

    return Math.max(
        0,
        Number(quantite || 0)
        -
        Number(incubation || 0)
        -
        Number(vente || 0)
        -
        Number(consommation || 0)
        -
        Number(autre || 0)
    );

}


/* =========================================================
   15. ENREGISTRER UNE PRODUCTION
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
        )?.value ||
        obtenirDateAujourdhui();


    const lotId =
        document.getElementById(
            "productionLot"
        )?.value ||
        "";


    const type =
        document.getElementById(
            "productionType"
        )?.value ||
        "";


    const produitElement =
        document.getElementById(
            "productionProduit"
        );


    const produit =
        produitElement
            ? produitElement.value.trim()
            : "";


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
        )?.value
        ?.trim() ||
        "";


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot producteur."
        );

        return false;

    }


    const lot =
        trouverLotElevage(
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
        !Number.isFinite(
            quantite
        )
        ||
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


    const totalReparti =
        incubation +
        vente +
        consommation +
        autre;


    if (
        totalReparti >
        quantite
    ) {

        alert(
            "Erreur : la répartition dépasse la quantité totale produite."
        );

        return false;

    }


    /* =====================================================
       CRÉER LA PRODUCTION
    ===================================================== */

    const productions =
        obtenirProductions();


    const idProduction =
        genererId(
            "PROD"
        );


    const nouvelleProduction = {

        id:
            idProduction,


        date:
            date,


        /* LIEN LOT */

        lotId:
            lot.id,


        lot:
            lot.id,


        lotNom:
            obtenirNomLotElevage(
                lot
            ),


        codeLot:
            lot.code ||
            lot.id,


        /* ANIMALITÉ */

        espece:
            obtenirEspeceLotElevage(
                lot
            ),


        race:
            obtenirRaceLotElevage(
                lot
            ),


        /* PRODUCTION */

        type:
            type,


        produit:
            produit,


        quantite:
            quantite,


        unite:
            unite,


        /* RÉPARTITION */

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
            new Date()
                .toISOString()

    };


    productions.push(
        nouvelleProduction
    );


    sauvegarderProductions(
        productions
    );


    /* =====================================================
       CRÉER LE STOCK POUR INCUBATION
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


            /* LIEN DIRECT AVEC LE LOT */

            lotId:
                lot.id,


            lot:
                lot.id,


            lotNom:
                obtenirNomLotElevage(
                    lot
                ),


            codeLot:
                lot.code ||
                lot.id,


            espece:
                obtenirEspeceLotElevage(
                    lot
                ),


            race:
                obtenirRaceLotElevage(
                    lot
                ),


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
                "Disponible",


            dateCreation:
                new Date()
                    .toISOString()

        });


        sauvegarderStockOeufsIncubation(
            stock
        );

    }


    /* =====================================================
       ACTUALISER
    ===================================================== */

    if (
        typeof chargerProductions ===
        "function"
    ) {

        chargerProductions();

    }


    if (
        typeof chargerLotsProduction ===
        "function"
    ) {

        chargerLotsProduction();

    }


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
   16. MIGRATION DES ANCIENNES PRODUCTIONS
   ---------------------------------------------------------
   TRÈS IMPORTANT POUR TON CAS :

   Si une ancienne production possède déjà :

       repartition.incubation = 68

   mais qu'elle n'a jamais créé stockOeufsIncubation,

   cette fonction crée automatiquement le stock.

   C'est ce qui permettra notamment de retrouver
   les 68 œufs du lot Jumbo sept 2025.
========================================================= */

function synchroniserStockOeufsIncubation() {

    const productions =
        obtenirProductions();


    let stock =
        obtenirStockOeufsIncubation();


    let modifications =
        false;


    productions.forEach(
        function (production) {

            const quantiteIncubation =
                Number(
                    production
                        ?.repartition
                        ?.incubation ||
                    0
                );


            if (
                quantiteIncubation <= 0
            ) {

                return;

            }


            const lotId =
                production.lotId ||
                production.lot ||
                "";


            if (!lotId) {

                return;

            }


            /*
             * Vérifier si le stock correspondant
             * existe déjà.
             */

            const stockExiste =
                stock.some(
                    function (ligne) {

                        return (

                            String(
                                ligne.productionId
                            ) ===
                            String(
                                production.id
                            )

                            &&

                            String(
                                ligne.lotId
                            ) ===
                            String(
                                lotId
                            )

                        );

                    }
                );


            if (
                stockExiste
            ) {

                return;

            }


            const lot =
                trouverLotElevage(
                    lotId
                );


            if (!lot) {

                console.warn(
                    "Lot introuvable pour production :",
                    production.id,
                    lotId
                );

                return;

            }


            stock.push({

                id:
                    genererId(
                        "STKINC"
                    ),


                productionId:
                    production.id,


                lotId:
                    lot.id,


                lot:
                    lot.id,


                lotNom:
                    production.lotNom ||
                    obtenirNomLotElevage(
                        lot
                    ),


                codeLot:
                    lot.code ||
                    lot.id,


                espece:
                    production.espece ||
                    obtenirEspeceLotElevage(
                        lot
                    ),


                race:
                    production.race ||
                    obtenirRaceLotElevage(
                        lot
                    ),


                produit:
                    production.produit ||
                    "Œufs",


                quantiteInitiale:
                    quantiteIncubation,


                quantiteDisponible:
                    quantiteIncubation,


                quantiteUtilisee:
                    0,


                dateProduction:
                    production.date,


                statut:
                    "Disponible",


                dateCreation:
                    new Date()
                        .toISOString()

            });


            modifications =
                true;

        }
    );


    if (
        modifications
    ) {

        sauvegarderStockOeufsIncubation(
            stock
        );


        console.log(
            "Stock œufs incubation synchronisé."
        );

    }

}


/* =========================================================
   17. INITIALISATION DE LA LIAISON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Synchroniser les anciennes productions
         * avant que incubation.js ne recherche
         * les œufs disponibles.
         */

        synchroniserStockOeufsIncubation();


        /*
         * Charger les lots dans Production.
         */

        chargerLotsProduction();

    }
);


/* =========================================================
   FIN DE LA LIAISON ÉLEVAGE
========================================================= */

/* =========================================================
   FIN ELEVAGE.JS
   ---------------------------------------------------------
   AUCUNE FONCTION D'INTERFACE INCUBATION ICI.
   
   L'incubation est maintenant entièrement gérée
   par /js/incubation.js
========================================================= */
