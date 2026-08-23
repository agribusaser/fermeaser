/*==================================================
FERME ASHER ERP
STOCKS.JS
VERSION 2.0
==================================================*/


/*==================================================
CONFIGURATION
==================================================*/

const CLE_PRODUITS =
    "produits";

const CLE_MOUVEMENTS =
    "mouvementsStock";


/*==================================================
LECTURE DES PRODUITS
==================================================*/

function obtenirProduits() {

    return JSON.parse(
        localStorage.getItem(
            CLE_PRODUITS
        )
    ) || [];

}


/*==================================================
ENREGISTRER LES PRODUITS
==================================================*/

function enregistrerProduits(
    produits
) {

    localStorage.setItem(
        CLE_PRODUITS,
        JSON.stringify(
            produits
        )
    );

}


/*==================================================
LECTURE DES MOUVEMENTS
==================================================*/

function obtenirMouvements() {

    return JSON.parse(
        localStorage.getItem(
            CLE_MOUVEMENTS
        )
    ) || [];

}


/*==================================================
ENREGISTRER LES MOUVEMENTS
==================================================*/

function enregistrerMouvements(
    mouvements
) {

    localStorage.setItem(
        CLE_MOUVEMENTS,
        JSON.stringify(
            mouvements
        )
    );

}


/*==================================================
RECHERCHER UN PRODUIT
==================================================*/

function trouverProduit(
    idProduit,
    produits = null
) {

    const liste =
        produits ||
        obtenirProduits();


    return liste.find(
        produit =>
            String(produit.id) ===
            String(idProduit)
    );

}


/*==================================================
DATE D'AUJOURD'HUI
==================================================*/

function obtenirDateAujourdhui() {

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


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerStocks();

        initialiserRecherche();

        initialiserFiltres();

        chargerListeProduits();

        initialiserPageEntree();

        initialiserPageSortie();

        initialiserInventaire();

    }
);


/*==================================================
CHARGER LES STOCKS
==================================================*/

function chargerStocks() {

    const produits =
        obtenirProduits();


    const table =
        document.getElementById(
            "stocksTable"
        );


    if (!table) {

        return;

    }


    const filtreCategorie =
        document.getElementById(
            "filtreCategorie"
        );


    const filtreEtat =
        document.getElementById(
            "filtreEtat"
        );


    const categorieSelectionnee =
        filtreCategorie
            ? filtreCategorie.value
            : "";


    const etatSelectionne =
        filtreEtat
            ? filtreEtat.value
            : "";


    table.innerHTML = "";


    let valeurTotale = 0;

    let stockFaible = 0;

    let rupture = 0;


    produits.forEach(
        produit => {

            const stock =
                Number(
                    produit.stock
                ) || 0;


            const minimum =
                Number(
                    produit.stockMinimum ??
                    produit.minimum ??
                    0
                );


            const prixAchat =
                Number(
                    produit.prixAchat ||
                    produit.prix ||
                    0
                );


            const valeur =
                stock *
                prixAchat;


            valeurTotale +=
                valeur;


            let etat =
                "Disponible";

            let badge =
                "success";


            if (stock <= 0) {

                etat =
                    "Rupture";

                badge =
                    "danger";

                rupture++;

            }

            else if (
                stock <= minimum
            ) {

                etat =
                    "Stock faible";

                badge =
                    "warning";

                stockFaible++;

            }


            if (
                categorieSelectionnee &&
                produit.categorie !==
                categorieSelectionnee
            ) {

                return;

            }


            if (
                etatSelectionne &&
                etat !==
                etatSelectionne
            ) {

                return;

            }


            const code =
                produit.code ||
                produit.id ||
                "";


            table.innerHTML += `

<tr>

<td>
${code}
</td>

<td>
${produit.nom || ""}
</td>

<td>
${produit.categorie || ""}
</td>

<td>
${stock}
</td>

<td>
${minimum}
</td>

<td>
${produit.unite || ""}
</td>

<td>
${valeur.toLocaleString("fr-FR")} FC
</td>

<td>

<span class="badge bg-${badge}">

${etat}

</span>

</td>

<td>

<button
type="button"
class="btn btn-success btn-sm"
onclick="entreeStock('${produit.id}')"
title="Entrée de stock">

<i class="fa fa-plus"></i>

</button>

<button
type="button"
class="btn btn-danger btn-sm"
onclick="sortieStock('${produit.id}')"
title="Sortie de stock">

<i class="fa fa-minus"></i>

</button>

</td>

</tr>

`;

        }
    );


    mettreAJourStatistiques(
        produits,
        valeurTotale,
        stockFaible,
        rupture
    );


    afficherAlertes(
        produits
    );


    chargerHistorique();

    chargerStatistiquesMensuelles();

}


/*==================================================
STATISTIQUES
==================================================*/

function mettreAJourStatistiques(
    produits,
    valeur,
    stockFaible,
    rupture
) {

    const totalProduits =
        document.getElementById(
            "totalProduits"
        );


    const valeurStock =
        document.getElementById(
            "valeurStock"
        );


    const elementStockFaible =
        document.getElementById(
            "stockFaible"
        );


    const ruptureStock =
        document.getElementById(
            "ruptureStock"
        );


    if (totalProduits) {

        totalProduits.textContent =
            produits.length;

    }


    if (valeurStock) {

        valeurStock.textContent =
            valeur
                .toLocaleString(
                    "fr-FR"
                ) +
            " FC";

    }


    if (elementStockFaible) {

        elementStockFaible.textContent =
            stockFaible;

    }


    if (ruptureStock) {

        ruptureStock.textContent =
            rupture;

    }

}


/*==================================================
ALERTES STOCK
==================================================*/

function afficherAlertes(
    produits
) {

    const zone =
        document.getElementById(
            "alertesStock"
        );


    if (!zone) {

        return;

    }


    zone.innerHTML = "";


    produits.forEach(
        produit => {

            const stock =
                Number(
                    produit.stock
                ) || 0;


            const minimum =
                Number(
                    produit.stockMinimum ??
                    produit.minimum ??
                    0
                );


            if (
                stock <= 0
            ) {

                zone.innerHTML += `

<div class="alert alert-danger">

<strong>
${produit.nom}
</strong>

<br>

Rupture de stock.

</div>

`;

            }

            else if (
                stock <= minimum
            ) {

                zone.innerHTML += `

<div class="alert alert-warning">

<strong>
${produit.nom}
</strong>

<br>

Stock faible.

</div>

`;

            }

        }
    );


    if (
        zone.innerHTML === ""
    ) {

        zone.innerHTML = `

<div class="alert alert-success">

Tous les stocks sont corrects.

</div>

`;

    }

}


/*==================================================
RECHERCHE
==================================================*/

function initialiserRecherche() {

    const champ =
        document.getElementById(
            "rechercheStock"
        );


    if (!champ) {

        return;

    }


    champ.addEventListener(
        "input",
        function () {

            const valeur =
                champ.value
                    .toLowerCase();


            document
                .querySelectorAll(
                    "#stocksTable tr"
                )
                .forEach(
                    ligne => {

                        ligne.style.display =
                            ligne.innerText
                                .toLowerCase()
                                .includes(
                                    valeur
                                )
                            ? ""
                            : "none";

                    }
                );

        }
    );

}


/*==================================================
FILTRES
==================================================*/

function initialiserFiltres() {

    const categorie =
        document.getElementById(
            "filtreCategorie"
        );


    const etat =
        document.getElementById(
            "filtreEtat"
        );


    if (categorie) {

        categorie.addEventListener(
            "change",
            chargerStocks
        );

    }


    if (etat) {

        etat.addEventListener(
            "change",
            chargerStocks
        );

    }

}


/*==================================================
REDIRECTION ENTREE STOCK
==================================================*/

function entreeStock(
    id
) {

    window.location.href =
        "entree.html?id=" +
        encodeURIComponent(id);

}


/*==================================================
REDIRECTION SORTIE STOCK
==================================================*/

function sortieStock(
    id
) {

    window.location.href =
        "sortie.html?id=" +
        encodeURIComponent(id);

}


/*==================================================
CHARGER LISTE DES PRODUITS
==================================================*/

function chargerListeProduits() {

    const select =
        document.getElementById(
            "produit"
        );


    if (!select) {

        return;

    }


    const produits =
        obtenirProduits();


    select.innerHTML =
        '<option value="">Sélectionner un produit</option>';


    produits.forEach(
        produit => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                produit.id;


            option.textContent =
                (
                    produit.code ||
                    produit.id
                ) +
                " - " +
                produit.nom;


            select.appendChild(
                option
            );

        }
    );


    const parametres =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametres.get(
            "id"
        );


    if (id) {

        select.value =
            id;

        select.dispatchEvent(
            new Event(
                "change"
            )
        );

    }

}


/*==================================================
INITIALISER PAGE ENTREE
==================================================*/

function initialiserPageEntree() {

    const formulaire =
        document.getElementById(
            "entreeForm"
        );


    if (!formulaire) {

        return;

    }


    const date =
        document.getElementById(
            "date"
        );


    if (
        date &&
        !date.value
    ) {

        date.value =
            obtenirDateAujourdhui();

    }


    const quantite =
        document.getElementById(
            "quantite"
        );


    const prix =
        document.getElementById(
            "prix"
        );


    const montant =
        document.getElementById(
            "montant"
        );


    function calculerMontant() {

        if (!montant) {

            return;

        }


        const qte =
            Number(
                quantite?.value
            ) || 0;


        const prixUnitaire =
            Number(
                prix?.value
            ) || 0;


        montant.value =
            qte *
            prixUnitaire;

    }


    if (quantite) {

        quantite.addEventListener(
            "input",
            calculerMontant
        );

    }


    if (prix) {

        prix.addEventListener(
            "input",
            calculerMontant
        );

    }


    formulaire.addEventListener(
        "submit",
        function (
            event
        ) {

            event.preventDefault();


            const idProduit =
                document.getElementById(
                    "produit"
                ).value;


            const quantiteEntree =
                Number(
                    document.getElementById(
                        "quantite"
                    ).value
                );


            const prixEntree =
                Number(
                    document.getElementById(
                        "prix"
                    ).value
                ) || 0;


            if (
                !idProduit
            ) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                return;

            }


            if (
                !Number.isFinite(
                    quantiteEntree
                ) ||
                quantiteEntree <= 0
            ) {

                alert(
                    "Veuillez saisir une quantité valide."
                );

                return;

            }


            const produits =
                obtenirProduits();


            const index =
                produits.findIndex(
                    produit =>
                        String(
                            produit.id
                        ) ===
                        String(
                            idProduit
                        )
                );


            if (
                index === -1
            ) {

                alert(
                    "Produit introuvable."
                );

                return;

            }


            const stockActuel =
                Number(
                    produits[index].stock
                ) || 0;


            produits[index].stock =
                stockActuel +
                quantiteEntree;


            if (
                prixEntree > 0
            ) {

                produits[index].prixAchat =
                    prixEntree;

            }


            enregistrerProduits(
                produits
            );


            const mouvements =
                obtenirMouvements();


            mouvements.push({

                id:
                    "MVT-" +
                    Date.now(),

                date:
                    date?.value ||
                    obtenirDateAujourdhui(),

                produitId:
                    produits[index].id,

                produit:
                    produits[index].nom,

                type:
                    "Entrée",

                nature:
                    document.getElementById(
                        "type"
                    )?.value ||
                    "Entrée manuelle",

                quantite:
                    quantiteEntree,

                prix:
                    prixEntree,

                montant:
                    quantiteEntree *
                    prixEntree,

                reference:
                    document.getElementById(
                        "reference"
                    )?.value ||
                    "",

                observation:
                    document.getElementById(
                        "observation"
                    )?.value ||
                    "",

                utilisateur:
                    "Administrateur"

            });


            enregistrerMouvements(
                mouvements
            );


            alert(
                "Entrée de stock enregistrée avec succès."
            );


            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
INITIALISER PAGE SORTIE
==================================================*/

function initialiserPageSortie() {

    const formulaire =
        document.getElementById(
            "sortieForm"
        );


    if (!formulaire) {

        return;

    }


    const date =
        document.getElementById(
            "date"
        );


    if (
        date &&
        !date.value
    ) {

        date.value =
            obtenirDateAujourdhui();

    }


    const select =
        document.getElementById(
            "produit"
        );


    const stockDisponible =
        document.getElementById(
            "stockDisponible"
        );


    const prix =
        document.getElementById(
            "prix"
        );


    function mettreAJourProduit() {

        if (!select) {

            return;

        }


        const produit =
            trouverProduit(
                select.value
            );


        if (
            !produit
        ) {

            if (stockDisponible) {

                stockDisponible.value =
                    "";

            }


            if (prix) {

                prix.value =
                    "";

            }


            return;

        }


        if (stockDisponible) {

            stockDisponible.value =
                Number(
                    produit.stock
                ) || 0;

        }


        if (prix) {

            prix.value =
                Number(
                    produit.prixVente ||
                    produit.prix ||
                    0
                );

        }

    }


    if (select) {

        select.addEventListener(
            "change",
            mettreAJourProduit
        );

    }


    mettreAJourProduit();


    formulaire.addEventListener(
        "submit",
        function (
            event
        ) {

            event.preventDefault();


            const idProduit =
                select.value;


            const quantiteSortie =
                Number(
                    document.getElementById(
                        "quantite"
                    ).value
                );


            if (
                !idProduit
            ) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                return;

            }


            if (
                !Number.isFinite(
                    quantiteSortie
                ) ||
                quantiteSortie <= 0
            ) {

                alert(
                    "Veuillez saisir une quantité valide."
                );

                return;

            }


            const produits =
                obtenirProduits();


            const index =
                produits.findIndex(
                    produit =>
                        String(
                            produit.id
                        ) ===
                        String(
                            idProduit
                        )
                );


            if (
                index === -1
            ) {

                alert(
                    "Produit introuvable."
                );

                return;

            }


            const stockActuel =
                Number(
                    produits[index].stock
                ) || 0;


            if (
                quantiteSortie >
                stockActuel
            ) {

                alert(
                    "Stock insuffisant.\n\n" +
                    "Disponible : " +
                    stockActuel +
                    " " +
                    (
                        produits[index].unite ||
                        ""
                    )
                );

                return;

            }


            produits[index].stock =
                stockActuel -
                quantiteSortie;


            enregistrerProduits(
                produits
            );


            const mouvements =
                obtenirMouvements();


            const prixSortie =
                Number(
                    produits[index].prixVente ||
                    produits[index].prix ||
                    0
                );


            mouvements.push({

                id:
                    "MVT-" +
                    Date.now(),

                date:
                    date?.value ||
                    obtenirDateAujourdhui(),

                produitId:
                    produits[index].id,

                produit:
                    produits[index].nom,

                type:
                    "Sortie",

                nature:
                    document.getElementById(
                        "type"
                    )?.value ||
                    "Sortie manuelle",

                quantite:
                    quantiteSortie,

                prix:
                    prixSortie,

                montant:
                    quantiteSortie *
                    prixSortie,

                reference:
                    document.getElementById(
                        "reference"
                    )?.value ||
                    "",

                observation:
                    document.getElementById(
                        "observation"
                    )?.value ||
                    "",

                utilisateur:
                    "Administrateur"

            });


            enregistrerMouvements(
                mouvements
            );


            alert(
                "Sortie de stock enregistrée avec succès."
            );


            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
INITIALISER INVENTAIRE
==================================================*/

function initialiserInventaire() {

    const table =
        document.getElementById(
            "inventaireTable"
        );


    if (!table) {

        return;

    }


    chargerInventaire();


    const bouton =
        document.getElementById(
            "btnEnregistrerInventaire"
        );


    if (!bouton) {

        return;

    }


    bouton.addEventListener(
        "click",
        enregistrerInventaire
    );

}


/*==================================================
CHARGER INVENTAIRE
==================================================*/

function chargerInventaire() {

    const table =
        document.getElementById(
            "inventaireTable"
        );


    if (!table) {

        return;

    }


    const produits =
        obtenirProduits();


    table.innerHTML =
        "";


    let conformes =
        0;


    produits.forEach(
        produit => {

            const stock =
                Number(
                    produit.stock
                ) || 0;


            table.innerHTML += `

<tr>

<td>
${produit.code || produit.id}
</td>

<td>
${produit.nom || ""}
</td>

<td>
${produit.categorie || ""}
</td>

<td>
${stock}
</td>

<td>

<input
type="number"
class="form-control stockPhysique"
data-id="${produit.id}"
data-stock="${stock}"
value="${stock}"
min="0">

</td>

<td>

<span
class="badge bg-success"
id="ecart-${produit.id}">

0

</span>

</td>

</tr>

`;


            conformes++;

        }
    );


    const nbProduits =
        document.getElementById(
            "nbProduitsInventaire"
        );


    const nbEcarts =
        document.getElementById(
            "nbEcarts"
        );


    const nbConformes =
        document.getElementById(
            "nbConformes"
        );


    if (nbProduits) {

        nbProduits.textContent =
            produits.length;

    }


    if (nbEcarts) {

        nbEcarts.textContent =
            0;

    }


    if (nbConformes) {

        nbConformes.textContent =
            conformes;

    }


    document
        .querySelectorAll(
            ".stockPhysique"
        )
        .forEach(
            champ => {

                champ.addEventListener(
                    "input",
                    calculerEcartInventaire
                );

            }
        );

}


/*==================================================
CALCULER ECART INVENTAIRE
==================================================*/

function calculerEcartInventaire(
    event
) {

    const champ =
        event.target;


    const id =
        champ.dataset.id;


    const stockTheorique =
        Number(
            champ.dataset.stock
        ) || 0;


    const stockPhysique =
        Number(
            champ.value
        ) || 0;


    const ecart =
        stockPhysique -
        stockTheorique;


    const badge =
        document.getElementById(
            "ecart-" +
            id
        );


    if (badge) {

        badge.textContent =
            ecart;


        badge.className =
            ecart === 0
            ? "badge bg-success"
            : "badge bg-danger";

    }


    mettreAJourStatistiquesInventaire();

}


/*==================================================
STATISTIQUES INVENTAIRE
==================================================*/

function mettreAJourStatistiquesInventaire() {

    let ecarts =
        0;


    let conformes =
        0;


    document
        .querySelectorAll(
            ".stockPhysique"
        )
        .forEach(
            champ => {

                const stockTheorique =
                    Number(
                        champ.dataset.stock
                    ) || 0;


                const stockPhysique =
                    Number(
                        champ.value
                    ) || 0;


                if (
                    stockPhysique ===
                    stockTheorique
                ) {

                    conformes++;

                }

                else {

                    ecarts++;

                }

            }
        );


    const nbEcarts =
        document.getElementById(
            "nbEcarts"
        );


    const nbConformes =
        document.getElementById(
            "nbConformes"
        );


    if (nbEcarts) {

        nbEcarts.textContent =
            ecarts;

    }


    if (nbConformes) {

        nbConformes.textContent =
            conformes;

    }

}


/*==================================================
ENREGISTRER INVENTAIRE
==================================================*/

function enregistrerInventaire() {

    const produits =
        obtenirProduits();


    const mouvements =
        obtenirMouvements();


    document
        .querySelectorAll(
            ".stockPhysique"
        )
        .forEach(
            champ => {

                const id =
                    champ.dataset.id;


                const stockPhysique =
                    Number(
                        champ.value
                    ) || 0;


                const index =
                    produits.findIndex(
                        produit =>
                            String(
                                produit.id
                            ) ===
                            String(
                                id
                            )
                    );


                if (
                    index === -1
                ) {

                    return;

                }


                const stockTheorique =
                    Number(
                        produits[index].stock
                    ) || 0;


                const ecart =
                    stockPhysique -
                    stockTheorique;


                if (
                    ecart === 0
                ) {

                    return;

                }


                produits[index].stock =
                    stockPhysique;


                mouvements.push({

                    id:
                        "INV-" +
                        Date.now() +
                        "-" +
                        produits[index].id,

                    date:
                        obtenirDateAujourdhui(),

                    produitId:
                        produits[index].id,

                    produit:
                        produits[index].nom,

                    type:
                        ecart > 0
                        ? "Entrée"
                        : "Sortie",

                    nature:
                        "Ajustement inventaire",

                    quantite:
                        Math.abs(
                            ecart
                        ),

                    prix:
                        Number(
                            produits[index].prixAchat ||
                            produits[index].prix ||
                            0
                        ),

                    montant:
                        Math.abs(
                            ecart
                        ) *
                        Number(
                            produits[index].prixAchat ||
                            produits[index].prix ||
                            0
                        ),

                    reference:
                        "INVENTAIRE",

                    observation:
                        "Stock théorique : " +
                        stockTheorique +
                        " | Stock physique : " +
                        stockPhysique,

                    utilisateur:
                        "Administrateur"

                });

            }
        );


    enregistrerProduits(
        produits
    );


    enregistrerMouvements(
        mouvements
    );


    alert(
        "Inventaire enregistré avec succès."
    );


    window.location.href =
        "index.html";

}


/*==================================================
HISTORIQUE DES MOUVEMENTS
==================================================*/

function chargerHistorique() {

    const table =
        document.getElementById(
            "historiqueTable"
        ) ||
        document.getElementById(
            "historiqueMouvements"
        );


    if (!table) {

        return;

    }


    let mouvements =
        obtenirMouvements();


    const filtreProduit =
        document.getElementById(
            "filtreProduit"
        );


    const filtreType =
        document.getElementById(
            "filtreType"
        );


    if (
        filtreProduit &&
        filtreProduit.value
    ) {

        const recherche =
            filtreProduit.value
                .toLowerCase();


        mouvements =
            mouvements.filter(
                mouvement =>
                    String(
                        mouvement.produit ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        recherche
                    )
            );

    }


    if (
        filtreType &&
        filtreType.value
    ) {

        mouvements =
            mouvements.filter(
                mouvement =>
                    mouvement.type ===
                    filtreType.value
            );

    }


    table.innerHTML =
        "";


    const derniersMouvements =
        mouvements
            .slice()
            .reverse()
            .slice(
                0,
                100
            );


    if (
        derniersMouvements.length === 0
    ) {

        table.innerHTML = `

<tr>

<td
colspan="5"
class="text-center text-muted">

Aucun mouvement de stock.

</td>

</tr>

`;

        return;

    }


    derniersMouvements.forEach(
        mouvement => {

            const badge =
                mouvement.type ===
                "Entrée"
                ? "bg-success"
                : "bg-danger";


            table.innerHTML += `

<tr>

<td>
${mouvement.date || ""}
</td>

<td>
${mouvement.produit || ""}
</td>

<td>

<span class="badge ${badge}">

${mouvement.type || ""}

</span>

</td>

<td>
${Number(
    mouvement.quantite
).toLocaleString("fr-FR")}
</td>

<td>
${mouvement.utilisateur || ""}
</td>

</tr>

`;

        }
    );

}


/*==================================================
STATISTIQUES MENSUELLES
==================================================*/

function chargerStatistiquesMensuelles() {

    const entreesElement =
        document.getElementById(
            "entreesMois"
        );


    const sortiesElement =
        document.getElementById(
            "sortiesMois"
        );


    if (
        !entreesElement ||
        !sortiesElement
    ) {

        return;

    }


    const mouvements =
        obtenirMouvements();


    const maintenant =
        new Date();


    const moisActuel =
        maintenant.getMonth();


    const anneeActuelle =
        maintenant.getFullYear();


    let totalEntrees =
        0;


    let totalSorties =
        0;


    mouvements.forEach(
        mouvement => {

            if (
                !mouvement.date
            ) {

                return;

            }


            const date =
                new Date(
                    mouvement.date +
                    "T00:00:00"
                );


            if (
                date.getMonth() !==
                moisActuel ||
                date.getFullYear() !==
                anneeActuelle
            ) {

                return;

            }


            const quantite =
                Number(
                    mouvement.quantite
                ) || 0;


            if (
                mouvement.type ===
                "Entrée"
            ) {

                totalEntrees +=
                    quantite;

            }


            if (
                mouvement.type ===
                "Sortie"
            ) {

                totalSorties +=
                    quantite;

            }

        }
    );


    entreesElement.textContent =
        totalEntrees;


    sortiesElement.textContent =
        totalSorties;

}


/*==================================================
FILTRES HISTORIQUE
==================================================*/

function initialiserFiltresHistorique() {

    const produit =
        document.getElementById(
            "filtreProduit"
        );


    const type =
        document.getElementById(
            "filtreType"
        );


    if (produit) {

        produit.addEventListener(
            "input",
            chargerHistorique
        );

    }


    if (type) {

        type.addEventListener(
            "change",
            chargerHistorique
        );

    }

}


/*==================================================
INITIALISER HISTORIQUE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initialiserFiltresHistorique();

    }
);


/*==================================================
FIN MODULE
==================================================*/

console.log(
    "Ferme Asher ERP - Stocks.js Version 2.0 chargé."
);
