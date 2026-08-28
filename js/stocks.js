/*==================================================
FERME ASHER ERP
STOCKS.JS
VERSION 3.0
==================================================*/


/*==================================================
CONFIGURATION
==================================================*/

const CLE_PRODUITS = "produits";

const CLE_MOUVEMENTS = "mouvementsStock";


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

function enregistrerProduits(produits) {

    localStorage.setItem(
        CLE_PRODUITS,
        JSON.stringify(produits)
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

function enregistrerMouvements(mouvements) {

    localStorage.setItem(
        CLE_MOUVEMENTS,
        JSON.stringify(mouvements)
    );

}


/*==================================================
RECHERCHER UN PRODUIT
==================================================*/

function trouverProduit(idProduit, produits = null) {

    const liste =
        produits || obtenirProduits();

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

        chargerInventaire();

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
                Number(produit.stock) || 0;

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
                stock * prixAchat;

            valeurTotale += valeur;

            let etat =
                "Disponible";

            let badge =
                "success";


            if (stock <= 0) {

                etat = "Rupture";

                badge = "danger";

                rupture++;

            }

            else if (
                stock <= minimum
            ) {

                etat = "Stock faible";

                badge = "warning";

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
                etat !== etatSelectionne
            ) {

                return;

            }


            const code =
                produit.code ||
                produit.id ||
                "";


            table.innerHTML += `

<tr>

<td>${code}</td>

<td>${produit.nom || ""}</td>

<td>${produit.categorie || ""}</td>

<td>${stock}</td>

<td>${minimum}</td>

<td>${produit.unite || ""}</td>

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
            valeur.toLocaleString(
                "fr-FR"
            ) + " FC";

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

function afficherAlertes(produits) {

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
                Number(produit.stock) || 0;

            const minimum =
                Number(
                    produit.stockMinimum ??
                    produit.minimum ??
                    0
                );


            if (stock <= 0) {

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


    if (zone.innerHTML === "") {

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
                                .includes(valeur)
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
REDIRECTION ENTREE
==================================================*/

function entreeStock(id) {

    window.location.href =
        "entree.html?id=" +
        encodeURIComponent(id);

}


/*==================================================
REDIRECTION SORTIE
==================================================*/

function sortieStock(id) {

    window.location.href =
        "sortie.html?id=" +
        encodeURIComponent(id);

}


/*==================================================
CHARGER LA LISTE DES PRODUITS
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


    const params =
        new URLSearchParams(
            window.location.search
        );

    const idSelectionne =
        params.get("id");


    select.innerHTML = `

<option value="">

Sélectionner un produit

</option>

`;


    produits.forEach(
        produit => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                produit.id;

            option.textContent =
                (produit.nom || "Sans nom") +
                " — Stock : " +
                (Number(produit.stock) || 0) +
                " " +
                (produit.unite || "");


            if (
                String(produit.id) ===
                String(idSelectionne)
            ) {

                option.selected = true;

            }


            select.appendChild(
                option
            );

        }
    );

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

    const montant =
        document.getElementById(
            "montant"
        );

    const type =
        document.getElementById(
            "type"
        );

    const reference =
        document.getElementById(
            "reference"
        );

    const observation =
        document.getElementById(
            "observation"
        );


    if (date && !date.value) {

        date.value =
            obtenirDateAujourdhui();

    }


    function calculerMontant() {

        if (!montant) {

            return;

        }

        montant.value =
            (
                (Number(quantite?.value) || 0) *
                (Number(prix?.value) || 0)
            ).toFixed(2);

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
        function (event) {

            event.preventDefault();


            const idProduit =
                produit.value;

            const quantiteEntree =
                Number(
                    quantite.value
                );

            const prixUnitaire =
                Number(
                    prix?.value
                ) || 0;

            const natureEntree =
                type
                    ? type.value.trim()
                    : "";


            if (!idProduit) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                produit.focus();

                return;

            }


            if (
                !Number.isFinite(
                    quantiteEntree
                ) ||
                quantiteEntree <= 0
            ) {

                alert(
                    "La quantité doit être supérieure à zéro."
                );

                quantite.focus();

                return;

            }


            if (!natureEntree) {

                alert(
                    "Veuillez sélectionner la provenance de l'entrée."
                );

                if (type) {

                    type.focus();

                }

                return;

            }


            const produits =
                obtenirProduits();

            const index =
                produits.findIndex(
                    p =>
                        String(p.id) ===
                        String(idProduit)
                );


            if (index === -1) {

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


            enregistrerProduits(
                produits
            );


            const mouvements =
                obtenirMouvements();


            mouvements.push({

                id:
                    "MVT-ENT-" +
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
                    natureEntree,

                quantite:
                    quantiteEntree,

                prix:
                    prixUnitaire,

                montant:
                    quantiteEntree *
                    prixUnitaire,

                reference:
                    reference
                        ? reference.value.trim()
                        : "",

                observation:
                    observation
                        ? observation.value.trim()
                        : "",

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

    const select =
        document.getElementById(
            "produit"
        );

    const stockDisponible =
        document.getElementById(
            "stockDisponible"
        );

    const quantite =
        document.getElementById(
            "quantite"
        );

    const prix =
        document.getElementById(
            "prix"
        );

    const type =
        document.getElementById(
            "type"
        );

    const reference =
        document.getElementById(
            "reference"
        );

    const observation =
        document.getElementById(
            "observation"
        );


    if (date && !date.value) {

        date.value =
            obtenirDateAujourdhui();

    }


    function afficherInformationsProduit() {

        const produit =
            trouverProduit(
                select.value
            );


        if (!produit) {

            if (stockDisponible) {

                stockDisponible.value = "";

            }

            if (prix) {

                prix.value = "";

            }

            return;

        }


        if (stockDisponible) {

            stockDisponible.value =
                Number(produit.stock) || 0;

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


    select.addEventListener(
        "change",
        afficherInformationsProduit
    );


    afficherInformationsProduit();


    formulaire.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const idProduit =
                select.value;

            const quantiteSortie =
                Number(
                    quantite.value
                );

            const natureSortie =
                type
                    ? type.value.trim()
                    : "";


            if (!idProduit) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                select.focus();

                return;

            }


            if (
                !Number.isFinite(
                    quantiteSortie
                ) ||
                quantiteSortie <= 0
            ) {

                alert(
                    "La quantité doit être supérieure à zéro."
                );

                quantite.focus();

                return;

            }


            if (!natureSortie) {

                alert(
                    "Veuillez sélectionner le motif de sortie."
                );

                if (type) {

                    type.focus();

                }

                return;

            }


            const produits =
                obtenirProduits();

            const index =
                produits.findIndex(
                    p =>
                        String(p.id) ===
                        String(idProduit)
                );


            if (index === -1) {

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


            const prixUnitaire =
                Number(
                    prix?.value
                ) || 0;


            const mouvements =
                obtenirMouvements();


            mouvements.push({

                id:
                    "MVT-SOR-" +
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
                    natureSortie,

                quantite:
                    quantiteSortie,

                prix:
                    prixUnitaire,

                montant:
                    quantiteSortie *
                    prixUnitaire,

                reference:
                    reference
                        ? reference.value.trim()
                        : "",

                observation:
                    observation
                        ? observation.value.trim()
                        : "",

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


    table.innerHTML = "";


    produits.forEach(
        produit => {

            const stock =
                Number(
                    produit.stock
                ) || 0;


            table.innerHTML += `

<tr>

<td>
${produit.code || produit.id || ""}
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
class="form-control stock-physique"
data-id="${produit.id}"
data-stock="${stock}"
min="0"
step="0.01"
value="${stock}">

</td>

<td class="ecart">
0
</td>

</tr>

`;

        }
    );


    document
        .querySelectorAll(
            ".stock-physique"
        )
        .forEach(
            champ => {

                champ.addEventListener(
                    "input",
                    calculerEcartsInventaire
                );

            }
        );


    calculerEcartsInventaire();

}


/*==================================================
CALCULER ECARTS INVENTAIRE
==================================================*/

function calculerEcartsInventaire() {

    const champs =
        document.querySelectorAll(
            ".stock-physique"
        );


    let nbProduits = 0;

    let nbEcarts = 0;

    let nbConformes = 0;


    champs.forEach(
        champ => {

            nbProduits++;

            const stockSysteme =
                Number(
                    champ.dataset.stock
                ) || 0;

            const stockPhysique =
                Number(
                    champ.value
                ) || 0;

            const ecart =
                stockPhysique -
                stockSysteme;

            const cellule =
                champ
                    .closest("tr")
                    .querySelector(".ecart");


            if (cellule) {

                cellule.textContent =
                    ecart;

                cellule.className =
                    "ecart " +
                    (
                        ecart === 0
                            ? "text-success"
                            : "text-danger"
                    );

            }


            if (ecart === 0) {

                nbConformes++;

            }

            else {

                nbEcarts++;

            }

        }
    );


    const elementProduits =
        document.getElementById(
            "nbProduitsInventaire"
        );

    const elementEcarts =
        document.getElementById(
            "nbEcarts"
        );

    const elementConformes =
        document.getElementById(
            "nbConformes"
        );


    if (elementProduits) {

        elementProduits.textContent =
            nbProduits;

    }


    if (elementEcarts) {

        elementEcarts.textContent =
            nbEcarts;

    }


    if (elementConformes) {

        elementConformes.textContent =
            nbConformes;

    }

}


/*==================================================
INITIALISER INVENTAIRE
==================================================*/

function initialiserInventaire() {

    const bouton =
        document.getElementById(
            "btnEnregistrerInventaire"
        );

    if (!bouton) {

        return;

    }


    bouton.addEventListener(
        "click",
        function () {

            enregistrerInventaire();

        }
    );

}


/*==================================================
ENREGISTRER INVENTAIRE
==================================================*/

function enregistrerInventaire() {

    const champs =
        document.querySelectorAll(
            ".stock-physique"
        );

    if (!champs.length) {

        return;

    }


    const produits =
        obtenirProduits();

    const mouvements =
        obtenirMouvements();

    let modifications = 0;


    champs.forEach(
        champ => {

            const idProduit =
                champ.dataset.id;

            const stockPhysique =
                Number(
                    champ.value
                );

            const index =
                produits.findIndex(
                    produit =>
                        String(produit.id) ===
                        String(idProduit)
                );


            if (
                index === -1 ||
                !Number.isFinite(stockPhysique) ||
                stockPhysique < 0
            ) {

                return;

            }


            const stockSysteme =
                Number(
                    produits[index].stock
                ) || 0;

            const ecart =
                stockPhysique -
                stockSysteme;


            if (ecart === 0) {

                return;

            }


            produits[index].stock =
                stockPhysique;

            modifications++;


            mouvements.push({

                id:
                    "MVT-INV-" +
                    Date.now() +
                    "-" +
                    idProduit,

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
                    Math.abs(ecart),

                prix:
                    Number(
                        produits[index].prixAchat ||
                        produits[index].prix ||
                        0
                    ),

                montant:
                    Math.abs(ecart) *
                    Number(
                        produits[index].prixAchat ||
                        produits[index].prix ||
                        0
                    ),

                reference:
                    "INVENTAIRE-" +
                    Date.now(),

                observation:
                    "Ajustement après inventaire. " +
                    "Ancien stock : " +
                    stockSysteme +
                    " | Nouveau stock : " +
                    stockPhysique,

                utilisateur:
                    "Administrateur"

            });

        }
    );


    if (modifications === 0) {

        alert(
            "Aucun écart à enregistrer."
        );

        return;

    }


    enregistrerProduits(
        produits
    );

    enregistrerMouvements(
        mouvements
    );


    alert(
        "Inventaire enregistré avec succès."
    );


    chargerInventaire();

}


/*==================================================
CHARGER HISTORIQUE
==================================================*/

function chargerHistorique() {

    const table =
        document.getElementById(
            "historiqueTable"
        );

    if (!table) {

        return;

    }


    const mouvements =
        obtenirMouvements();

    table.innerHTML = "";


    mouvements
        .slice()
        .reverse()
        .forEach(
            mouvement => {

                table.innerHTML += `

<tr>

<td>
${mouvement.date || ""}
</td>

<td>
${mouvement.produit || ""}
</td>

<td>
${mouvement.type || ""}
</td>

<td>
${mouvement.nature || ""}
</td>

<td>
${Number(
    mouvement.quantite
) || 0}
</td>

<td>
${mouvement.reference || ""}
</td>

<td>
${mouvement.observation || ""}
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

    const mouvements =
        obtenirMouvements();

    const elementEntrees =
        document.getElementById(
            "entreesMois"
        );

    const elementSorties =
        document.getElementById(
            "sortiesMois"
        );

    if (
        !elementEntrees &&
        !elementSorties
    ) {

        return;

    }


    const moisActuel =
        obtenirDateAujourdhui()
            .slice(0, 7);

    let entrees = 0;

    let sorties = 0;


    mouvements.forEach(
        mouvement => {

            if (
                String(
                    mouvement.date || ""
                ).slice(0, 7) !==
                moisActuel
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

                entrees += quantite;

            }

            else if (
                mouvement.type ===
                "Sortie"
            ) {

                sorties += quantite;

            }

        }
    );


    if (elementEntrees) {

        elementEntrees.textContent =
            entrees;

    }


    if (elementSorties) {

        elementSorties.textContent =
            sorties;

    }

}


/*==================================================
RETIRER LE STOCK APRES UNE VENTE
==================================================*/

function retirerStockApresVente(
    vente
) {

    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return false;

    }


    const idProduit =
        vente.produitId;

    const quantiteVendue =
        Number(
            vente.quantite
        );


    if (!idProduit) {

        alert(
            "Produit de la vente introuvable."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantiteVendue
        ) ||
        quantiteVendue <= 0
    ) {

        alert(
            "Quantité de vente invalide."
        );

        return false;

    }


    const produits =
        obtenirProduits();

    const index =
        produits.findIndex(
            produit =>
                String(produit.id) ===
                String(idProduit)
        );


    if (index === -1) {

        alert(
            "Produit introuvable dans le stock."
        );

        return false;

    }


    const stockActuel =
        Number(
            produits[index].stock
        ) || 0;


    if (
        quantiteVendue >
        stockActuel
    ) {

        alert(

            "Stock insuffisant.\n\n" +

            "Produit : " +
            (
                produits[index].nom ||
                vente.produit ||
                ""
            ) +

            "\nDisponible : " +
            stockActuel +
            " " +
            (
                produits[index].unite ||
                ""
            )

        );

        return false;

    }


    produits[index].stock =
        stockActuel -
        quantiteVendue;


    enregistrerProduits(
        produits
    );


    const mouvements =
        obtenirMouvements();


    mouvements.push({

        id:
            "MVT-VTE-" +
            Date.now(),

        date:
            vente.date ||
            obtenirDateAujourdhui(),

        produitId:
            produits[index].id,

        produit:
            produits[index].nom,

        type:
            "Sortie",

        nature:
            "Vente",

        quantite:
            quantiteVendue,

        prix:
            Number(
                vente.prix ||
                produits[index].prixVente ||
                produits[index].prix ||
                0
            ),

        montant:
            Number(
                vente.total ||
                (
                    quantiteVendue *
                    Number(
                        vente.prix ||
                        produits[index].prixVente ||
                        produits[index].prix ||
                        0
                    )
                )
            ),

        reference:
            vente.facture ||
            vente.id ||
            "",

        observation:
            "Sortie automatique suite à une vente.",

        utilisateur:
            "Administrateur"

    });


    enregistrerMouvements(
        mouvements
    );


    return true;

}


/*==================================================
REMETTRE LE STOCK APRES ANNULATION D'UNE VENTE
==================================================*/

function remettreStockApresAnnulation(
    vente
) {

    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return false;

    }


    const idProduit =
        vente.produitId;

    const quantiteRetour =
        Number(
            vente.quantite
        );


    if (!idProduit) {

        alert(
            "Produit de la vente introuvable."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantiteRetour
        ) ||
        quantiteRetour <= 0
    ) {

        alert(
            "Quantité de retour invalide."
        );

        return false;

    }


    const produits =
        obtenirProduits();

    const index =
        produits.findIndex(
            produit =>
                String(produit.id) ===
                String(idProduit)
        );


    if (index === -1) {

        alert(
            "Produit introuvable dans le stock."
        );

        return false;

    }


    const stockActuel =
        Number(
            produits[index].stock
        ) || 0;


    produits[index].stock =
        stockActuel +
        quantiteRetour;


    enregistrerProduits(
        produits
    );


    const mouvements =
        obtenirMouvements();


    mouvements.push({

        id:
            "MVT-ANN-" +
            Date.now(),

        date:
            obtenirDateAujourdhui(),

        produitId:
            produits[index].id,

        produit:
            produits[index].nom,

        type:
            "Entrée",

        nature:
            "Annulation de vente",

        quantite:
            quantiteRetour,

        prix:
            Number(
                vente.prix ||
                produits[index].prixVente ||
                produits[index].prix ||
                0
            ),

        montant:
            quantiteRetour *
            Number(
                vente.prix ||
                produits[index].prixVente ||
                produits[index].prix ||
                0
            ),

        reference:
            vente.facture ||
            vente.id ||
            "",

        observation:
            "Retour automatique après annulation de la vente.",

        utilisateur:
            "Administrateur"

    });


    enregistrerMouvements(
        mouvements
    );


    return true;

}


/*==================================================
FIN MODULE
==================================================*/

console.log(
    "Ferme Asher ERP - Stocks.js Version 3.0 chargé."
);
