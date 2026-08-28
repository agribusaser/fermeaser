/*==================================================
FERME ASHER ERP
VENTES.JS
VERSION 2.0
==================================================*/


/*==================================================
CONFIGURATION
==================================================*/

const CLE_VENTES = "ventes";
const CLE_PRODUITS_VENTES = "produits";


/*==================================================
LECTURE DES VENTES
==================================================*/

function obtenirVentes() {

    return JSON.parse(
        localStorage.getItem(
            CLE_VENTES
        )
    ) || [];

}


/*==================================================
ENREGISTRER LES VENTES
==================================================*/

function enregistrerVentes(ventes) {

    localStorage.setItem(
        CLE_VENTES,
        JSON.stringify(ventes)
    );

}


/*==================================================
LECTURE DES PRODUITS
==================================================*/

function obtenirProduitsVente() {

    return JSON.parse(
        localStorage.getItem(
            CLE_PRODUITS_VENTES
        )
    ) || [];

}


/*==================================================
DATE DU JOUR
==================================================*/

function obtenirDateVente() {

    const maintenant = new Date();

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

    return annee + "-" + mois + "-" + jour;

}


/*==================================================
FORMAT MONNAIE
==================================================*/

function formatMonnaie(montant) {

    return (
        Number(montant) || 0
    ).toLocaleString("fr-FR") + " FC";

}


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerProduitsVente();

        initialiserFormulaireVente();

        chargerVentes();

        initialiserRechercheVentes();

        initialiserFiltreDate();

    }
);


/*==================================================
CHARGER PRODUITS DANS LE FORMULAIRE
==================================================*/

function chargerProduitsVente() {

    const select =
        document.getElementById(
            "produit"
        );

    if (!select) {

        return;

    }

    const produits =
        obtenirProduitsVente();

    select.innerHTML = `
        <option value="">
            Sélectionner un produit
        </option>
    `;

    produits.forEach(
        produit => {

            const stock =
                Number(produit.stock) || 0;

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                produit.id;

            option.textContent =
                `${produit.nom} — Stock : ${stock} ${produit.unite || ""}`;

            option.dataset.prix =
                Number(
                    produit.prixVente ||
                    produit.prix ||
                    0
                );

            option.dataset.stock =
                stock;

            select.appendChild(
                option
            );

        }
    );

}


/*==================================================
INITIALISER FORMULAIRE VENTE
==================================================*/

function initialiserFormulaireVente() {

    const formulaire =
        document.getElementById(
            "venteForm"
        );

    if (!formulaire) {

        return;

    }


    const client =
        document.getElementById(
            "client"
        );

    const telephone =
        document.getElementById(
            "telephone"
        );

    const produit =
        document.getElementById(
            "produit"
        );

    const quantite =
        document.getElementById(
            "quantite"
        );

    const prix =
        document.getElementById(
            "prix"
        );

    const remise =
        document.getElementById(
            "remise"
        );

    const paiement =
        document.getElementById(
            "paiement"
        );

    const date =
        document.getElementById(
            "date"
        );

    const total =
        document.getElementById(
            "total"
        );


    /*------------------------------------------
    DATE PAR DEFAUT
    ------------------------------------------*/

    if (date && !date.value) {

        date.value =
            obtenirDateVente();

    }


    /*------------------------------------------
    CALCUL TOTAL
    ------------------------------------------*/

    function calculerTotal() {

        const qte =
            Number(
                quantite.value
            ) || 0;

        const prixUnitaire =
            Number(
                prix.value
            ) || 0;

        const montantRemise =
            Number(
                remise.value
            ) || 0;

        let montant =
            qte *
            prixUnitaire;

        montant =
            montant -
            montantRemise;

        if (montant < 0) {

            montant = 0;

        }

        total.textContent =
            formatMonnaie(
                montant
            );

        return montant;

    }


    /*------------------------------------------
    PRODUIT CHANGE
    ------------------------------------------*/

    produit.addEventListener(
        "change",
        function () {

            const option =
                produit.options[
                    produit.selectedIndex
                ];

            if (!option.value) {

                prix.value = "";

                calculerTotal();

                return;

            }

            prix.value =
                option.dataset.prix || 0;

            calculerTotal();

        }
    );


    quantite.addEventListener(
        "input",
        calculerTotal
    );


    prix.addEventListener(
        "input",
        calculerTotal
    );


    remise.addEventListener(
        "input",
        calculerTotal
    );


    /*------------------------------------------
    ENREGISTRER LA VENTE
    ------------------------------------------*/

    formulaire.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const idProduit =
                produit.value;

            const quantiteVendue =
                Number(
                    quantite.value
                );

            const prixUnitaire =
                Number(
                    prix.value
                );

            const montantRemise =
                Number(
                    remise.value
                ) || 0;


            /* VALIDATION PRODUIT */

            if (!idProduit) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                produit.focus();

                return;

            }


            /* VALIDATION QUANTITE */

            if (
                !Number.isFinite(
                    quantiteVendue
                ) ||
                quantiteVendue <= 0
            ) {

                alert(
                    "La quantité doit être supérieure à zéro."
                );

                quantite.focus();

                return;

            }


            /* VALIDATION PRIX */

            if (
                !Number.isFinite(
                    prixUnitaire
                ) ||
                prixUnitaire < 0
            ) {

                alert(
                    "Le prix est invalide."
                );

                prix.focus();

                return;

            }


            /* RECHERCHER PRODUIT */

            const produits =
                obtenirProduitsVente();

            const produitSelectionne =
                produits.find(
                    p =>
                        String(p.id) ===
                        String(idProduit)
                );


            if (!produitSelectionne) {

                alert(
                    "Produit introuvable."
                );

                return;

            }


            /* VERIFIER STOCK */

            const stockDisponible =
                Number(
                    produitSelectionne.stock
                ) || 0;


            if (
                quantiteVendue >
                stockDisponible
            ) {

                alert(
                    "Stock insuffisant.\n\n" +
                    "Produit : " +
                    produitSelectionne.nom +
                    "\nStock disponible : " +
                    stockDisponible +
                    " " +
                    (
                        produitSelectionne.unite ||
                        ""
                    )
                );

                return;

            }


            /* CALCUL TOTAL */

            let montantTotal =
                quantiteVendue *
                prixUnitaire;

            montantTotal =
                montantTotal -
                montantRemise;

            if (montantTotal < 0) {

                montantTotal = 0;

            }


            /* CREATION VENTE */

            const vente = {

                id:
                    "VTE-" +
                    Date.now(),

                date:
                    date.value ||
                    obtenirDateVente(),

                client:
                    client.value.trim(),

                telephone:
                    telephone.value.trim(),

                produitId:
                    produitSelectionne.id,

                produit:
                    produitSelectionne.nom,

                quantite:
                    quantiteVendue,

                unite:
                    produitSelectionne.unite || "",

                prix:
                    prixUnitaire,

                remise:
                    montantRemise,

                total:
                    montantTotal,

                paiement:
                    paiement.value,

                statut:
                    "Validée",

                dateCreation:
                    new Date().toISOString()

            };


            /*--------------------------------------
            DIMINUER LE STOCK
            --------------------------------------*/

            if (
                typeof retirerStockApresVente !==
                "function"
            ) {

                alert(
                    "Erreur : la fonction de gestion du stock est introuvable.\n\n" +
                    "Vérifie que stocks.js est chargé avant ventes.js."
                );

                return;

            }


            const stockRetire =
                retirerStockApresVente(
                    vente
                );


            if (!stockRetire) {

                /*

                IMPORTANT :

                Le stock n'a pas été modifié
                ou la quantité est insuffisante.

                Donc la vente ne doit PAS
                être enregistrée.

                */

                return;

            }


            /*--------------------------------------
            ENREGISTRER LA VENTE
            --------------------------------------*/

            const ventes =
                obtenirVentes();

            ventes.push(
                vente
            );

            enregistrerVentes(
                ventes
            );


            alert(
                "Vente enregistrée avec succès."
            );


            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
CHARGER LES VENTES
==================================================*/

function chargerVentes() {

    const table =
        document.getElementById(
            "tableVentes"
        );

    if (!table) {

        return;

    }

    const ventes =
        obtenirVentes();

    const recherche =
        document.getElementById(
            "recherche"
        );

    const filtreDate =
        document.getElementById(
            "filtreDate"
        );


    const texteRecherche =
        recherche
            ? recherche.value
                .trim()
                .toLowerCase()
            : "";

    const dateRecherche =
        filtreDate
            ? filtreDate.value
            : "";


    const ventesFiltrees =
        ventes.filter(
            vente => {

                const correspondRecherche =
                    !texteRecherche ||

                    String(
                        vente.client || ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    ) ||

                    String(
                        vente.produit || ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    );


                const correspondDate =
                    !dateRecherche ||
                    vente.date ===
                    dateRecherche;


                return (
                    correspondRecherche &&
                    correspondDate
                );

            }
        );


    table.innerHTML = "";


    if (
        ventesFiltrees.length === 0
    ) {

        table.innerHTML = `

<tr>

<td
colspan="9"
class="text-center text-muted py-4">

Aucune vente trouvée.

</td>

</tr>

`;

    }


    ventesFiltrees
        .slice()
        .reverse()
        .forEach(
            vente => {

                let badgeStatut =
                    "success";

                if (
                    vente.statut ===
                    "Annulée"
                ) {

                    badgeStatut =
                        "danger";

                }


                table.innerHTML += `

<tr>

<td>
${vente.id}
</td>

<td>
${vente.date || ""}
</td>

<td>
${vente.client || ""}
</td>

<td>
${vente.produit || ""}
</td>

<td>
${Number(
    vente.quantite
) || 0}
</td>

<td>
${formatMonnaie(
    vente.total
)}
</td>

<td>
${vente.paiement || ""}
</td>

<td>

<span class="badge bg-${badgeStatut}">

${vente.statut || ""}

</span>

</td>

<td>

<button
type="button"
class="btn btn-primary btn-sm"
onclick="voirVente('${vente.id}')"
title="Voir">

<i class="fa-solid fa-eye"></i>

</button>

<button
type="button"
class="btn btn-secondary btn-sm"
onclick="imprimerFacture('${vente.id}')"
title="Facture">

<i class="fa-solid fa-print"></i>

</button>

${
    vente.statut !== "Annulée"
    ? `
<button
type="button"
class="btn btn-danger btn-sm"
onclick="annulerVente('${vente.id}')"
title="Annuler">

<i class="fa-solid fa-ban"></i>

</button>
`
    : ""
}

</td>

</tr>

`;

            }
        );


    const nombreVentes =
        document.getElementById(
            "nombreVentes"
        );

    if (nombreVentes) {

        nombreVentes.textContent =
            ventesFiltrees.length;

    }

}


/*==================================================
RECHERCHE VENTES
==================================================*/

function initialiserRechercheVentes() {

    const recherche =
        document.getElementById(
            "recherche"
        );

    if (!recherche) {

        return;

    }

    recherche.addEventListener(
        "input",
        chargerVentes
    );

}


/*==================================================
FILTRE DATE
==================================================*/

function initialiserFiltreDate() {

    const filtreDate =
        document.getElementById(
            "filtreDate"
        );

    if (!filtreDate) {

        return;

    }

    filtreDate.addEventListener(
        "change",
        chargerVentes
    );

}


/*==================================================
VOIR UNE VENTE
==================================================*/

function voirVente(idVente) {

    const ventes =
        obtenirVentes();

    const vente =
        ventes.find(
            v =>
                String(v.id) ===
                String(idVente)
        );


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    alert(

        "DÉTAILS DE LA VENTE\n\n" +

        "ID : " +
        vente.id +

        "\nDate : " +
        vente.date +

        "\nClient : " +
        vente.client +

        "\nTéléphone : " +
        (
            vente.telephone ||
            "-"
        ) +

        "\nProduit : " +
        vente.produit +

        "\nQuantité : " +
        vente.quantite +
        " " +
        (
            vente.unite ||
            ""
        ) +

        "\nPrix unitaire : " +
        formatMonnaie(
            vente.prix
        ) +

        "\nRemise : " +
        formatMonnaie(
            vente.remise
        ) +

        "\nTotal : " +
        formatMonnaie(
            vente.total
        ) +

        "\nPaiement : " +
        vente.paiement +

        "\nStatut : " +
        vente.statut

    );

}


/*==================================================
IMPRIMER FACTURE
==================================================*/

function imprimerFacture(idVente) {

    const ventes =
        obtenirVentes();

    const vente =
        ventes.find(
            v =>
                String(v.id) ===
                String(idVente)
        );


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    const facture =
        window.open(
            "",
            "_blank"
        );


    facture.document.write(`

<!DOCTYPE html>

<html lang="fr">

<head>

<meta charset="UTF-8">

<title>
Facture ${vente.id}
</title>

<style>

body{

font-family:Arial,sans-serif;

padding:40px;

}

h1{

margin-bottom:5px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:30px;

}

th,
td{

border:1px solid #000;

padding:10px;

text-align:left;

}

.total{

margin-top:20px;

font-size:20px;

font-weight:bold;

}

</style>

</head>

<body>

<h1>
FERME ASHER ERP
</h1>

<p>

<strong>Facture :</strong>

${vente.id}

</p>

<p>

<strong>Date :</strong>

${vente.date}

</p>

<p>

<strong>Client :</strong>

${vente.client}

</p>

<table>

<thead>

<tr>

<th>Produit</th>

<th>Quantité</th>

<th>Prix</th>

<th>Total</th>

</tr>

</thead>

<tbody>

<tr>

<td>
${vente.produit}
</td>

<td>
${vente.quantite}
${vente.unite || ""}
</td>

<td>
${formatMonnaie(
    vente.prix
)}
</td>

<td>
${formatMonnaie(
    vente.total
)}
</td>

</tr>

</tbody>

</table>

<p class="total">

TOTAL :

${formatMonnaie(
    vente.total
)}

</p>

<script>

window.onload = function(){

window.print();

};

<\/script>

</body>

</html>

`);


    facture.document.close();

}


/*==================================================
ANNULER UNE VENTE
==================================================*/

function annulerVente(idVente) {

    const ventes =
        obtenirVentes();

    const index =
        ventes.findIndex(
            vente =>
                String(vente.id) ===
                String(idVente)
        );


    if (index === -1) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    const vente =
        ventes[index];


    /*------------------------------------------
    PROTECTION DOUBLE ANNULATION
    ------------------------------------------*/

    if (
        vente.statut ===
        "Annulée"
    ) {

        alert(
            "Cette vente est déjà annulée."
        );

        return;

    }


    const confirmation =
        confirm(

            "Voulez-vous vraiment annuler cette vente ?\n\n" +

            "Le stock sera remis automatiquement."

        );


    if (!confirmation) {

        return;

    }


    /*------------------------------------------
    REMETTRE LE STOCK
    ------------------------------------------*/

    if (
        typeof remettreStockApresAnnulation !==
        "function"
    ) {

        alert(
            "Erreur : la fonction de remise du stock est introuvable.\n\n" +
            "Vérifie que stocks.js est chargé avant ventes.js."
        );

        return;

    }


    const stockRemis =
        remettreStockApresAnnulation(
            vente
        );


    if (!stockRemis) {

        alert(
            "Impossible de remettre le stock."
        );

        return;

    }


    /*------------------------------------------
    CHANGER LE STATUT
    ------------------------------------------*/

    ventes[index].statut =
        "Annulée";

    ventes[index].dateAnnulation =
        new Date()
            .toISOString();


    enregistrerVentes(
        ventes
    );


    alert(
        "Vente annulée.\n\n" +
        "Le stock a été remis."
    );


    chargerVentes();

}


/*==================================================
FIN
==================================================*/

console.log(
    "Ferme Asher ERP - Ventes.js Version 2.0 chargé."
);
