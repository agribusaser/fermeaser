/*====================================================
 FERME ASHER ERP
 MODULE : VENTES
 FICHIER : ventes.js
====================================================*/

const CLE_VENTES = "ventes";

/*====================================================
 FORMAT MONNAIE
====================================================*/

function formatFC(montant) {

    return Number(montant || 0).toLocaleString("fr-FR") + " FC";

}


/*====================================================
 RECUPERER LES VENTES
====================================================*/

function obtenirVentes() {

    try {

        const donnees = localStorage.getItem(CLE_VENTES);

        return donnees ? JSON.parse(donnees) : [];

    } catch (erreur) {

        console.error(
            "Erreur lors de la lecture des ventes :",
            erreur
        );

        return [];

    }

}


/*====================================================
 SAUVEGARDER LES VENTES
====================================================*/

function sauvegarderVentes(ventes) {

    localStorage.setItem(
        CLE_VENTES,
        JSON.stringify(ventes)
    );

}


/*====================================================
 RECHERCHER UNE VENTE PAR ID
====================================================*/

function trouverVente(id) {

    const ventes = obtenirVentes();

    return ventes.find(
        vente => String(vente.id) === String(id)
    );

}
