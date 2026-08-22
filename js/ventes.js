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

/*====================================================
 DIMINUER LE STOCK APRES UNE VENTE
====================================================*/

function retirerStockApresVente(vente) {

    const produits =
        obtenirProduits();


    const indexProduit =
        trouverIndexProduit(
            produits,
            vente
        );


    if (indexProduit === -1) {

        alert(
            "Produit introuvable dans le stock.\n\n" +
            "La vente ne peut pas être enregistrée."
        );

        return false;

    }


    const quantiteVendue =
        Number(vente.quantite);


    const stockActuel =
        Number(
            produits[indexProduit].stock
        ) || 0;


    /*--------------------------------------------
     VERIFICATION DU STOCK
    --------------------------------------------*/

    if (
        !Number.isFinite(quantiteVendue) ||
        quantiteVendue <= 0
    ) {

        alert(
            "La quantité de vente est invalide."
        );

        return false;

    }


    if (
        stockActuel < quantiteVendue
    ) {

        alert(
            "Stock insuffisant.\n\n" +
            "Stock disponible : " +
            stockActuel +
            "\nQuantité demandée : " +
            quantiteVendue
        );

        return false;

    }


    /*--------------------------------------------
     DIMINUTION DU STOCK
    --------------------------------------------*/

    produits[indexProduit].stock =
        stockActuel -
        quantiteVendue;


    const sauvegarde =
        enregistrerDonnees(
            CLE_PRODUITS,
            produits
        );


    if (!sauvegarde) {

        return false;

    }


    /*--------------------------------------------
     CREATION DU MOUVEMENT DE STOCK
    --------------------------------------------*/

    enregistrerMouvementStock({

        id:
            genererId(),

        date:
            new Date()
                .toISOString(),

        produitId:
            produits[indexProduit].id,

        produit:
            produits[indexProduit].nom ||
            vente.produit,

        type:
            "Sortie",

        nature:
            "Vente",

        quantite:
            quantiteVendue,

        prix:
            Number(vente.prix) || 0,

        montant:
            Number(vente.total) || 0,

        reference:
            "VENTE-" +
            vente.id,

        observation:
            "Sortie de stock suite à une vente.",

        utilisateur:
            "Administrateur"

    });


    return true;

}


/*====================================================
 CALCULER LE TOTAL DE LA VENTE
====================================================*/

function calculerTotalVente() {

    const champQuantite =
        document.getElementById(
            "quantite"
        );

    const champPrix =
        document.getElementById(
            "prix"
        );

    const champRemise =
        document.getElementById(
            "remise"
        );

    const affichageTotal =
        document.getElementById(
            "total"
        );


    if (
        !champQuantite ||
        !champPrix ||
        !champRemise ||
        !affichageTotal
    ) {

        return;

    }


    const quantite =
        Number(
            champQuantite.value
        ) || 0;

    const prix =
        Number(
            champPrix.value
        ) || 0;

    const remise =
        Number(
            champRemise.value
        ) || 0;


    let total =
        (quantite * prix) -
        remise;


    if (total < 0) {

        total = 0;

    }


    affichageTotal.textContent =
        formatFC(total);

}


/*====================================================
 INITIALISER LE FORMULAIRE
 DE NOUVELLE VENTE
====================================================*/

function initialiserNouvelleVente() {

    const formulaire =
        document.getElementById(
            "venteForm"
        );


    /*--------------------------------------------
     Cette page n'est pas nouvelle.html
    --------------------------------------------*/

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


    /*--------------------------------------------
     DATE DU JOUR
    --------------------------------------------*/

    if (date && !date.value) {

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


        date.value =
            annee +
            "-" +
            mois +
            "-" +
            jour;

    }


    /*--------------------------------------------
     CALCUL AUTOMATIQUE DU TOTAL
    --------------------------------------------*/

    if (quantite) {

        quantite.addEventListener(
            "input",
            calculerTotalVente
        );

    }


    if (prix) {

        prix.addEventListener(
            "input",
            calculerTotalVente
        );

    }


    if (remise) {

        remise.addEventListener(
            "input",
            calculerTotalVente
        );

    }


    calculerTotalVente();


    /*--------------------------------------------
     ENREGISTREMENT DE LA VENTE
    --------------------------------------------*/

    formulaire.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const nomClient =
                client.value.trim();

           const produitId =
    produit.value.trim();


const produits =
    obtenirProduits();


const produitSelectionne =
    produits.find(
        p =>
            String(p.id) ===
            String(produitId)
    );


const nomProduit =
    produitSelectionne
        ? (
            produitSelectionne.nom ||
            produitSelectionne.produit ||
            ""
        )
        : "";

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


            /*--------------------------------
             VALIDATION
            --------------------------------*/

            if (!nomClient) {

                alert(
                    "Veuillez saisir le nom du client."
                );

                client.focus();

                return;

            }


            if (!nomProduit) {

                alert(
                    "Veuillez sélectionner un produit."
                );

                produit.focus();

                return;

            }


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


            if (
                !Number.isFinite(
                    prixUnitaire
                ) ||
                prixUnitaire < 0
            ) {

                alert(
                    "Veuillez saisir un prix valide."
                );

                prix.focus();

                return;

            }


            if (montantRemise < 0) {

                alert(
                    "La remise ne peut pas être négative."
                );

                remise.focus();

                return;

            }


            let montantTotal =
                (quantiteVendue * prixUnitaire) -
                montantRemise;


            if (montantTotal < 0) {

                montantTotal = 0;

            }


            /*--------------------------------
             CREATION DE LA VENTE
            --------------------------------*/

            const nouvelleVente = {

                id:
                    genererId(),

                facture:
                    "VTE-" +
                    Date.now(),

                date:
                    date.value,

                client:
                    nomClient,

                telephone:
                    telephone.value.trim(),

             produitId:
    produitId,

                produit:
                    nomProduit,

                quantite:
                    quantiteVendue,

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
                    new Date()
                        .toISOString()

            };


            /*--------------------------------
             1. RETIRER LE STOCK

             Si cette opération échoue,
             la vente n'est PAS enregistrée.
            --------------------------------*/

            const stockRetire =
                retirerStockApresVente(
                    nouvelleVente
                );


            if (!stockRetire) {

                return;

            }


            /*--------------------------------
             2. ENREGISTRER LA VENTE
            --------------------------------*/

            const toutesLesVentes =
                obtenirVentes();


            toutesLesVentes.push(
                nouvelleVente
            );


            const venteSauvegardee =
                enregistrerDonnees(
                    CLE_VENTES,
                    toutesLesVentes
                );


            if (!venteSauvegardee) {

                alert(
                    "Erreur : le stock a été modifié, " +
                    "mais la vente n'a pas pu être sauvegardée."
                );

                return;

            }


            /*--------------------------------
             3. CONFIRMATION
            --------------------------------*/

            alert(

                "Vente enregistrée avec succès.\n\n" +

                "Facture : " +
                nouvelleVente.facture +

                "\nProduit : " +
                nouvelleVente.produit +

                "\nQuantité : " +
                nouvelleVente.quantite +

                "\nTotal : " +
                formatFC(
                    nouvelleVente.total
                )

            );


            /*--------------------------------
             4. REDIRECTION
            --------------------------------*/

            window.location.href =
                "index.html";

        }
    );

}

/*====================================================
 CHARGER LES PRODUITS DANS LE FORMULAIRE DE VENTE
====================================================*/

function chargerProduitsDansVente() {

    const selectProduit =
        document.getElementById(
            "produit"
        );


    if (!selectProduit) {

        return;

    }


    const produits =
        obtenirProduits();


    /*--------------------------------------------
     VIDER LA LISTE
    --------------------------------------------*/

    selectProduit.innerHTML =

        '<option value="">Sélectionner un produit</option>';


    /*--------------------------------------------
     AJOUTER LES PRODUITS
    --------------------------------------------*/

    produits.forEach(
        function(produit) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                produit.nom;


            option.textContent =
                produit.nom +
                " — Stock : " +
                (Number(produit.stock) || 0);


            option.dataset.id =
                produit.id;


            option.dataset.prix =
                produit.prix ||
                produit.prixVente ||
                0;


            selectProduit.appendChild(
                option
            );

        }
    );


    /*--------------------------------------------
     CHARGER LE PRIX DU PRODUIT
    --------------------------------------------*/

    selectProduit.addEventListener(
        "change",
        function() {

            const option =
                selectProduit.options[
                    selectProduit.selectedIndex
                ];


            const champPrix =
                document.getElementById(
                    "prix"
                );


            if (
                champPrix &&
                option.dataset.prix
            ) {

                champPrix.value =
                    option.dataset.prix;

            }


            calculerTotalVente();

        }
    );

}

/*====================================================
 CHARGER ET AFFICHER LES VENTES
====================================================*/

function chargerVentes() {

    const table =
        document.getElementById(
            "tableVentes"
        );

    const compteur =
        document.getElementById(
            "nombreVentes"
        );


    /*--------------------------------------------
     Cette page n'est pas index.html
    --------------------------------------------*/

    if (!table) {

        return;

    }


    /*--------------------------------------------
     RECUPERER TOUTES LES VENTES
    --------------------------------------------*/

    const toutesLesVentes =
        obtenirVentes();


    /*--------------------------------------------
     RECUPERER LES FILTRES
    --------------------------------------------*/

    const champRecherche =
        document.getElementById(
            "recherche"
        );

    const champDate =
        document.getElementById(
            "filtreDate"
        );


    const recherche =
        champRecherche
            ? champRecherche.value
                .trim()
                .toLowerCase()
            : "";


    const dateFiltre =
        champDate
            ? champDate.value
            : "";


    /*--------------------------------------------
     FILTRER LES VENTES
    --------------------------------------------*/

    const ventesFiltrees =
        toutesLesVentes.filter(
            vente => {

                const client =
                    String(
                        vente.client || ""
                    ).toLowerCase();


                const produit =
                    String(
                        vente.produit || ""
                    ).toLowerCase();


                const correspondRecherche =

                    !recherche ||

                    client.includes(
                        recherche
                    ) ||

                    produit.includes(
                        recherche
                    );


                const correspondDate =

                    !dateFiltre ||

                    String(
                        vente.date || ""
                    ) === dateFiltre;


                return (

                    correspondRecherche &&

                    correspondDate

                );

            }
        );


    /*--------------------------------------------
     METTRE A JOUR LE COMPTEUR
    --------------------------------------------*/

    if (compteur) {

        compteur.textContent =
            ventesFiltrees.length;

    }


    /*--------------------------------------------
     VIDER LE TABLEAU
    --------------------------------------------*/

    table.innerHTML = "";


    /*--------------------------------------------
     AUCUNE VENTE
    --------------------------------------------*/

    if (
        ventesFiltrees.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4"
                >

                    <i class="fa-solid fa-circle-info"></i>

                    Aucune vente trouvée.

                </td>

            </tr>

        `;

        return;

    }


    /*--------------------------------------------
     TRIER LES VENTES
     Les plus récentes en premier
    --------------------------------------------*/

    ventesFiltrees.sort(
        function(a, b) {

            const dateA =
                new Date(
                    a.dateCreation ||
                    a.date ||
                    0
                );

            const dateB =
                new Date(
                    b.dateCreation ||
                    b.date ||
                    0
                );

            return dateB - dateA;

        }
    );


    /*--------------------------------------------
     AFFICHER CHAQUE VENTE
    --------------------------------------------*/

    ventesFiltrees.forEach(
        function(vente, index) {

            let classeStatut =
                "bg-success";


            if (
                vente.statut ===
                "Annulée"
            ) {

                classeStatut =
                    "bg-danger";

            }


            table.innerHTML += `

                <tr>

                    <td>

                        ${vente.facture || vente.id || index + 1}

                    </td>


                    <td>

                        ${formatDate(
                            vente.date
                        )}

                    </td>


                    <td>

                        ${vente.client || "-"}

                    </td>


                    <td>

                        ${vente.produit || "-"}

                    </td>


                    <td>

                        ${vente.quantite || 0}

                    </td>


                    <td>

                        <strong>

                            ${formatFC(
                                vente.total
                            )}

                        </strong>

                    </td>


                    <td>

                        ${vente.paiement || "-"}

                    </td>


                    <td>

                        <span
                            class="badge ${classeStatut}"
                        >

                            ${vente.statut ||
                            "Validée"}

                        </span>

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            title="Détails"
                            onclick="voirVente('${vente.id}')"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-success"
                            title="Facture"
                            onclick="ouvrirFacture('${vente.id}')"
                        >

                            <i class="fa-solid fa-file-invoice"></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-warning"
                            title="Annuler"
                            onclick="annulerVente('${vente.id}')"
                        >

                            <i class="fa-solid fa-ban"></i>

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


/*====================================================
 INITIALISER LA RECHERCHE
====================================================*/

function initialiserFiltresVentes() {

    const champRecherche =
        document.getElementById(
            "recherche"
        );

    const champDate =
        document.getElementById(
            "filtreDate"
        );


    /*--------------------------------------------
     RECHERCHE CLIENT / PRODUIT
    --------------------------------------------*/

    if (champRecherche) {

        champRecherche.addEventListener(
            "input",
            function() {

                chargerVentes();

            }
        );

    }


    /*--------------------------------------------
     FILTRE PAR DATE
    --------------------------------------------*/

    if (champDate) {

        champDate.addEventListener(
            "change",
            function() {

                chargerVentes();

            }
        );

    }

}


/*====================================================
 AFFICHER LES DETAILS D'UNE VENTE
====================================================*/

function voirVente(id) {

    const vente =
        trouverVente(id);


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    /*
     On mémorise l'ID de la vente,
     puis on ouvre detail.html.
    */

    localStorage.setItem(
        "venteSelectionnee",
        String(id)
    );


    window.location.href =
        "detail.html?id=" +
        encodeURIComponent(id);

}


/*====================================================
 OUVRIR LA FACTURE
====================================================*/

function ouvrirFacture(id) {

    const vente =
        trouverVente(id);


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    /*
     On mémorise l'ID,
     puis on ouvre facture.html.
    */

    localStorage.setItem(
        "venteSelectionnee",
        String(id)
    );


    window.location.href =
        "facture.html?id=" +
        encodeURIComponent(id);

}

/*====================================================
 ANNULER UNE VENTE
====================================================*/

function annulerVente(id) {

    const toutesLesVentes =
        obtenirVentes();


    const indexVente =
        toutesLesVentes.findIndex(
            vente =>
                String(vente.id) ===
                String(id)
        );


    /*--------------------------------------------
     VERIFIER SI LA VENTE EXISTE
    --------------------------------------------*/

    if (indexVente === -1) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    const vente =
        toutesLesVentes[indexVente];


    /*--------------------------------------------
     PROTECTION CONTRE DOUBLE ANNULATION
    --------------------------------------------*/

    if (
        vente.statut ===
        "Annulée"
    ) {

        alert(
            "Cette vente est déjà annulée."
        );

        return;

    }


    /*--------------------------------------------
     CONFIRMATION
    --------------------------------------------*/

    const confirmation =
        confirm(

            "Voulez-vous vraiment annuler cette vente ?\n\n" +

            "Client : " +
            vente.client +

            "\nProduit : " +
            vente.produit +

            "\nQuantité : " +
            vente.quantite +

            "\nTotal : " +
            formatFC(
                vente.total
            ) +

            "\n\nLe stock sera automatiquement remis."

        );


    if (!confirmation) {

        return;

    }


    /*--------------------------------------------
     REMETTRE LE PRODUIT EN STOCK
    --------------------------------------------*/

    const stockRemis =
        remettreStockApresAnnulation(
            vente
        );


    if (!stockRemis) {

        alert(
            "L'annulation a été arrêtée car " +
            "le stock n'a pas pu être remis."
        );

        return;

    }


    /*--------------------------------------------
     MODIFIER LE STATUT
    --------------------------------------------*/

    toutesLesVentes[
        indexVente
    ].statut =
        "Annulée";


    toutesLesVentes[
        indexVente
    ].dateAnnulation =
        new Date()
            .toISOString();


    /*--------------------------------------------
     SAUVEGARDER LA VENTE ANNULÉE
    --------------------------------------------*/

    const sauvegarde =
        enregistrerDonnees(
            CLE_VENTES,
            toutesLesVentes
        );


    if (!sauvegarde) {

        alert(
            "Attention : le stock a été remis, " +
            "mais le statut de la vente n'a pas pu être sauvegardé."
        );

        return;

    }


    /*--------------------------------------------
     ENREGISTRER L'HISTORIQUE
    --------------------------------------------*/

    enregistrerHistoriqueVente({

        id:
            genererId(),

        date:
            new Date()
                .toISOString(),

        action:
            "Annulation",

        venteId:
            vente.id,

        facture:
            vente.facture,

        client:
            vente.client,

        produit:
            vente.produit,

        quantite:
            vente.quantite,

        montant:
            vente.total,

        observation:
            "Vente annulée et stock remis automatiquement."

    });


    /*--------------------------------------------
     METTRE A JOUR LA LISTE
    --------------------------------------------*/

    chargerVentes();


    /*--------------------------------------------
     CONFIRMATION
    --------------------------------------------*/

    alert(

        "Vente annulée avec succès.\n\n" +

        "Le produit a été remis en stock."

    );

}


/*====================================================
 ENREGISTRER HISTORIQUE DES VENTES
====================================================*/

function enregistrerHistoriqueVente(
    historique
) {

    const CLE_HISTORIQUE_VENTES =
        "historiqueVentes";


    const historiqueVentes =
        lireDonnees(
            CLE_HISTORIQUE_VENTES
        );


    historiqueVentes.push(
        historique
    );


    return enregistrerDonnees(
        CLE_HISTORIQUE_VENTES,
        historiqueVentes
    );

}

/*====================================================
 DEMARRAGE AUTOMATIQUE DU MODULE
====================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*----------------------------------------
         CHARGER LES PRODUITS
        ----------------------------------------*/

        chargerProduitsDansVente();


        /*----------------------------------------
         PAGE : nouvelle.html
        ----------------------------------------*/

        initialiserNouvelleVente();


        /*----------------------------------------
         PAGE : index.html
        ----------------------------------------*/

        initialiserFiltresVentes();

        chargerVentes();

    }
);
