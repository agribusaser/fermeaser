/* =========================================================
   FERME ASHER ERP
   MODULE : ALIMENTATION
   FICHIER : alimentation.js

   Fonctionnement :
   - Les lots viennent de "lotsElevage"
   - Chaque consommation est liée à un lot
   - Les consommations sont enregistrées dans
     "alimentationElevage"
========================================================= */


/* =========================================================
   1. OUTILS DE DONNÉES
========================================================= */

function lireDonneesAlimentation(cle) {

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
            erreur
        );

        return [];

    }

}


function sauvegarderDonneesAlimentation(
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
            erreur
        );

        return false;

    }

}


/* =========================================================
   2. LOTS D'ÉLEVAGE
========================================================= */

function obtenirLotsAlimentation() {

    return lireDonneesAlimentation(
        "lotsElevage"
    );

}


/* =========================================================
   3. ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return lireDonneesAlimentation(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(
    alimentation
) {

    return sauvegarderDonneesAlimentation(
        "alimentationElevage",
        alimentation
    );

}


/* =========================================================
   4. UTILISATEUR
========================================================= */

function obtenirUtilisateurAlimentation() {

    return (

        localStorage.getItem(
            "utilisateurConnecte"
        )

        ||

        localStorage.getItem(
            "utilisateur"
        )

        ||

        "Administrateur"

    );

}


/* =========================================================
   5. DATE DU JOUR
========================================================= */

function obtenirDateAujourdHuiAlimentation() {

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

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


/* =========================================================
   6. GÉNÉRER UN ID
========================================================= */

function genererIdAlimentation() {

    return (

        "ALIM-" +

        Date.now() +

        "-" +

        Math.floor(
            Math.random() * 10000
        )

    );

}


/* =========================================================
   7. FORMATER UN NOMBRE
========================================================= */

function formaterNombreAlimentation(
    nombre
) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


/* =========================================================
   8. TROUVER LE NOM DU LOT
========================================================= */

function obtenirNomLotAlimentation(
    lot
) {

    if (!lot) {

        return "Lot inconnu";

    }


    return (

        lot.nomLot

        ||

        lot.nom

        ||

        lot.code

        ||

        lot.id

        ||

        "Lot sans nom"

    );

}


/* =========================================================
   9. CHARGER LES LOTS DANS LE FORMULAIRE
========================================================= */

function chargerLotsAlimentation() {

    const select =
        document.getElementById(
            "alimentLot"
        );


    if (!select) {

        console.warn(
            "Champ alimentLot introuvable."
        );

        return;

    }


    const lots =
        obtenirLotsAlimentation();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    /*
       Afficher uniquement les lots actifs.
    */

    const lotsActifs =
        lots.filter(function (lot) {

            return (

                !lot.statut

                ||

                lot.statut === "Actif"

            );

        });


    lotsActifs.forEach(
        function (lot) {

            const id =
                lot.id
                ||
                lot.code
                ||
                "";


            const nom =
                obtenirNomLotAlimentation(
                    lot
                );


            const espece =
                lot.espece
                ||
                lot.type
                ||
                "";


            const race =
                lot.race
                ||
                "";


            const quantite =
                lot.quantiteActuelle
                ??
                lot.quantite
                ??
                lot.quantiteInitiale
                ??
                0;


            let texte =
                nom;


            if (espece) {

                texte +=
                    " — " +
                    espece;

            }


            if (race) {

                texte +=
                    " — " +
                    race;

            }


            texte +=
                " (" +
                formaterNombreAlimentation(
                    quantite
                ) +
                " animaux)";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                id;


            option.textContent =
                texte;


            select.appendChild(
                option
            );

        }
    );


    console.log(
        "Lots disponibles pour alimentation :",
        lotsActifs
    );

}


/* =========================================================
   10. ENREGISTRER UNE CONSOMMATION
========================================================= */

function enregistrerAlimentation() {

    try {

        const champDate =
            document.getElementById(
                "alimentDate"
            );


        const champLot =
            document.getElementById(
                "alimentLot"
            );


        const champProduit =
            document.getElementById(
                "alimentProduit"
            );


        const champQuantite =
            document.getElementById(
                "alimentQuantite"
            );


        const champUnite =
            document.getElementById(
                "alimentUnite"
            );


        const champNotes =
            document.getElementById(
                "alimentNotes"
            );


        /*
           Vérification des champs.
        */

        if (
            !champDate ||
            !champLot ||
            !champProduit ||
            !champQuantite ||
            !champUnite ||
            !champNotes
        ) {

            alert(
                "Erreur : un ou plusieurs champs du formulaire sont introuvables."
            );

            console.error(
                "Champs alimentation manquants."
            );

            return false;

        }


        const date =
            champDate.value
            ||
            obtenirDateAujourdHuiAlimentation();


        const lotId =
            champLot.value;


        const produit =
            champProduit.value.trim();


        const quantite =
            Number(
                champQuantite.value
            );


        const unite =
            champUnite.value
            ||
            "Kg";


        const notes =
            champNotes.value.trim();


        /*
           Vérification.
        */

        if (!lotId) {

            alert(
                "Veuillez sélectionner un lot."
            );

            return false;

        }


        if (!produit) {

            alert(
                "Veuillez indiquer le nom de l'aliment."
            );

            champProduit.focus();

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

            champQuantite.focus();

            return false;

        }


        /*
           Rechercher le lot.
        */

        const lots =
            obtenirLotsAlimentation();


        const lot =
            lots.find(
                function (element) {

                    const idLot =
                        element.id
                        ||
                        element.code
                        ||
                        "";

                    return (
                        String(idLot)
                        ===
                        String(lotId)
                    );

                }
            );


        if (!lot) {

            alert(
                "Le lot sélectionné est introuvable."
            );

            console.error(
                "Lot introuvable :",
                lotId
            );

            return false;

        }


        /*
           Nom du lot.
        */

        const nomLot =
            obtenirNomLotAlimentation(
                lot
            );


        /*
           Créer l'enregistrement.
        */

        const alimentation =
            obtenirAlimentation();


        const nouvelEnregistrement = {

            id:
                genererIdAlimentation(),

            date:
                date,

            lotId:
                lotId,

            lot:
                lotId,

            lotNom:
                nomLot,

            espece:
                lot.espece
                ||
                lot.type
                ||
                "",

            race:
                lot.race
                ||
                "",

            produit:
                produit,

            quantite:
                quantite,

            unite:
                unite,

            notes:
                notes,

            utilisateur:
                obtenirUtilisateurAlimentation(),

            dateCreation:
                new Date().toISOString()

        };


        /*
           Ajouter.
        */

        alimentation.push(
            nouvelEnregistrement
        );


        /*
           Sauvegarder.
        */

        const sauvegarde =
            sauvegarderAlimentation(
                alimentation
            );


        if (!sauvegarde) {

            alert(
                "Impossible d'enregistrer la consommation."
            );

            return false;

        }


        console.log(
            "Consommation enregistrée :",
            nouvelEnregistrement
        );


        /*
           Réinitialiser le formulaire.
        */

        const formulaire =
            document.getElementById(
                "formAlimentation"
            );


        if (formulaire) {

            formulaire.reset();

        }


        /*
           Remettre la date du jour.
        */

        if (champDate) {

            champDate.value =
                obtenirDateAujourdHuiAlimentation();

        }


        /*
           Fermer le modal Bootstrap.
        */

        const modalElement =
            document.getElementById(
                "modalAlimentation"
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


        /*
           Actualiser l'affichage.
        */

        chargerAlimentation();


        alert(
            "Consommation enregistrée avec succès."
        );


        return true;


    } catch (erreur) {

        console.error(
            "Erreur enregistrerAlimentation :",
            erreur
        );


        alert(
            "Une erreur est survenue pendant l'enregistrement."
        );


        return false;

    }

}


/* =========================================================
   11. CHARGER LE TABLEAU
========================================================= */

function chargerAlimentation() {

    const tableau =
        document.getElementById(
            "listeAlimentation"
        );


    if (!tableau) {

        return;

    }


    const alimentation =
        obtenirAlimentation();


    tableau.innerHTML =
        "";


    if (
        alimentation.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-4">

                    Aucune consommation enregistrée.

                </td>

            </tr>

        `;

        chargerStatistiquesAlimentation();

        return;

    }


    alimentation
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${item.date || "-"}
                        </td>

                        <td>
                            ${item.lotNom || item.lot || "-"}
                        </td>

                        <td>
                            ${item.produit || "-"}
                        </td>

                        <td>
                            ${formaterNombreAlimentation(
                                item.quantite
                            )}
                        </td>

                        <td>
                            ${item.unite || "-"}
                        </td>

                        <td>
                            ${item.notes || "-"}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="supprimerAlimentation('${item.id}')">

                                <i
                                    class="fa-solid fa-trash">
                                </i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


    chargerStatistiquesAlimentation();

}


/* =========================================================
   12. STATISTIQUES
========================================================= */

function chargerStatistiquesAlimentation() {

    const alimentation =
        obtenirAlimentation();


    const aujourdHui =
        obtenirDateAujourdHuiAlimentation();


    const moisActuel =
        aujourdHui.substring(
            0,
            7
        );


    let consommationJour =
        0;


    let consommationMois =
        0;


    let consommationTotale =
        0;


    const lots =
        new Set();


    alimentation.forEach(
        function (item) {

            const quantite =
                Number(
                    item.quantite
                )
                ||
                0;


            consommationTotale +=
                quantite;


            if (item.lotId) {

                lots.add(
                    String(
                        item.lotId
                    )
                );

            }


            if (
                item.date
                ===
                aujourdHui
            ) {

                consommationJour +=
                    quantite;

            }


            if (
                item.date
                &&
                item.date.substring(
                    0,
                    7
                )
                ===
                moisActuel
            ) {

                consommationMois +=
                    quantite;

            }

        }
    );


    const elementJour =
        document.getElementById(
            "alimentJour"
        );


    const elementMois =
        document.getElementById(
            "alimentMois"
        );


    const elementTotal =
        document.getElementById(
            "alimentTotal"
        );


    const elementLots =
        document.getElementById(
            "lotsNourris"
        );


    if (elementJour) {

        elementJour.textContent =
            formaterNombreAlimentation(
                consommationJour
            );

    }


    if (elementMois) {

        elementMois.textContent =
            formaterNombreAlimentation(
                consommationMois
            );

    }


    if (elementTotal) {

        elementTotal.textContent =
            formaterNombreAlimentation(
                consommationTotale
            );

    }


    if (elementLots) {

        elementLots.textContent =
            lots.size;

    }

}


/* =========================================================
   13. SUPPRIMER UNE CONSOMMATION
========================================================= */

function supprimerAlimentation(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cette consommation ?"
        )
    ) {

        return;

    }


    let alimentation =
        obtenirAlimentation();


    alimentation =
        alimentation.filter(
            function (item) {

                return (
                    String(item.id)
                    !==
                    String(id)
                );

            }
        );


    sauvegarderAlimentation(
        alimentation
    );


    chargerAlimentation();


    alert(
        "Consommation supprimée."
    );

}


/* =========================================================
   14. INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Module alimentation.js chargé."
        );


        /*
           Date du jour.
        */

        const champDate =
            document.getElementById(
                "alimentDate"
            );


        if (champDate) {

            champDate.value =
                obtenirDateAujourdHuiAlimentation();

        }


        /*
           Charger les lots.
        */

        chargerLotsAlimentation();


        /*
           Charger le tableau.
        */

        chargerAlimentation();


    }
);
