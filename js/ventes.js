/*====================================================
 FERME ASHER ERP
 MODULE : VENTES
 FICHIER : ventes.js

 Système unique :
 - ventes
 - produits
 - mouvementsStock

 Toutes les données sont stockées dans localStorage.
====================================================*/


/*====================================================
 CONFIGURATION
====================================================*/

const CLE_VENTES = "ventes";

const CLE_PRODUITS = "produits";

const CLE_MOUVEMENTS_STOCK = "mouvementsStock";


/*====================================================
 VARIABLES GLOBALES
====================================================*/

let ventes = [];


/*====================================================
 OUTIL : LIRE LOCALSTORAGE
====================================================*/

function lireDonnees(cle) {

    try {

        const donnees =
            localStorage.getItem(cle);

        if (!donnees) {

            return [];

        }

        const resultat =
            JSON.parse(donnees);

        if (!Array.isArray(resultat)) {

            return [];

        }

        return resultat;

    }

    catch (erreur) {

        console.error(
            "Erreur de lecture : " + cle,
            erreur
        );

        return [];

    }

}


/*====================================================
 OUTIL : ENREGISTRER LOCALSTORAGE
====================================================*/

function enregistrerDonnees(
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
            "Erreur de sauvegarde : " + cle,
            erreur
        );

        alert(
            "Erreur lors de la sauvegarde des données."
        );

        return false;

    }

}


/*====================================================
 FORMATER UN MONTANT
====================================================*/

function formatFC(montant) {

    const valeur =
        Number(montant) || 0;

    return valeur.toLocaleString(
        "fr-FR"
    ) + " FC";

}


/*====================================================
 FORMATER UNE DATE

 Accepte :
 2026-08-22

 Retourne :
 22/08/2026
====================================================*/

function formatDate(date) {

    if (!date) {

        return "-";

    }

    const morceaux =
        String(date).split("-");

    if (morceaux.length === 3) {

        return (
            morceaux[2] +
            "/" +
            morceaux[1] +
            "/" +
            morceaux[0]
        );

    }

    return date;

}


/*====================================================
 GENERER UN IDENTIFIANT UNIQUE
====================================================*/

function genererId() {

    return (
        Date.now() +
        Math.floor(
            Math.random() * 1000
        )
    );

}


/*====================================================
 CHARGER LES VENTES

 C'est l'unique fonction officielle
 pour récupérer les ventes.
====================================================*/

function obtenirVentes() {

    ventes =
        lireDonnees(
            CLE_VENTES
        );

    return ventes;

}


/*====================================================
 TROUVER UNE VENTE
====================================================*/

function trouverVente(id) {

    const toutesLesVentes =
        obtenirVentes();

    return toutesLesVentes.find(
        vente =>
            String(vente.id) ===
            String(id)
    );

}


/*====================================================
 CHARGER LES PRODUITS
====================================================*/

function obtenirProduits() {

    return lireDonnees(
        CLE_PRODUITS
    );

}


/*====================================================
 TROUVER UN PRODUIT

 La vente peut contenir :
 - produitId
 OU
 - produit = nom du produit

 Nous acceptons les deux systèmes
 pour rester compatible avec les
 données déjà enregistrées.
====================================================*/

function trouverIndexProduit(
    produits,
    vente
) {

    if (
        vente.produitId !== undefined &&
        vente.produitId !== null &&
        vente.produitId !== ""
    ) {

        const indexParId =
            produits.findIndex(
                produit =>
                    String(produit.id) ===
                    String(vente.produitId)
            );

        if (indexParId !== -1) {

            return indexParId;

        }

    }


    const nomProduit =
        String(
            vente.produit || ""
        )
        .trim()
        .toLowerCase();


    return produits.findIndex(
        produit => {

            const nom =
                String(
                    produit.nom ||
                    produit.produit ||
                    produit.name ||
                    ""
                )
                .trim()
                .toLowerCase();

            return nom === nomProduit;

        }
    );

}


/*====================================================
 AJOUTER UNE QUANTITE AU STOCK

 Utilisé uniquement lors de
 l'annulation d'une vente.

 Exemple :

 Stock avant vente : 20
 Vente : 4
 Stock après vente : 16

 Annulation :
 Stock revient à 20
====================================================*/

function remettreStockApresAnnulation(
    vente
) {

    const produits =
        obtenirProduits();


    const indexProduit =
        trouverIndexProduit(
            produits,
            vente
        );


    if (indexProduit === -1) {

        alert(
            "Produit introuvable.\n\n" +
            "Impossible de remettre le stock après l'annulation."
        );

        return false;

    }


    const quantite =
        Number(
            vente.quantite
        );


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "Quantité de vente invalide."
        );

        return false;

    }


    const stockActuel =
        Number(
            produits[indexProduit].stock
        ) || 0;


    produits[indexProduit].stock =
        stockActuel +
        quantite;


    const sauvegarde =
        enregistrerDonnees(
            CLE_PRODUITS,
            produits
        );


    if (!sauvegarde) {

        return false;

    }


    enregistrerMouvementStock({
        id: genererId(),

        date: new Date()
            .toISOString(),

        produitId:
            produits[indexProduit].id,

        produit:
            produits[indexProduit].nom ||
            vente.produit,

        type:
            "Entrée",

        nature:
            "Annulation vente",

        quantite:
            quantite,

        prix:
            Number(vente.prix) || 0,

        montant:
            Number(vente.total) || 0,

        reference:
            "VENTE-" +
            vente.id,

        observation:
            "Remise en stock suite à l'annulation de la vente.",

        utilisateur:
            "Administrateur"
    });


    return true;

}


/*====================================================
 ENREGISTRER UN MOUVEMENT DE STOCK
====================================================*/

function enregistrerMouvementStock(
    mouvement
) {

    const mouvements =
        lireDonnees(
            CLE_MOUVEMENTS_STOCK
        );


    mouvements.push(
        mouvement
    );


    return enregistrerDonnees(
        CLE_MOUVEMENTS_STOCK,
        mouvements
    );

}
