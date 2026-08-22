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

/*====================================================
 NOUVELLE VENTE
====================================================*/

function initialiserNouvelleVente() {

    const formulaire =
        document.getElementById("venteForm");

    if (!formulaire) {

        return;

    }


    const client =
        document.getElementById("client");

    const telephone =
        document.getElementById("telephone");

    const produit =
        document.getElementById("produit");

    const quantite =
        document.getElementById("quantite");

    const prix =
        document.getElementById("prix");

    const remise =
        document.getElementById("remise");

    const paiement =
        document.getElementById("paiement");

    const date =
        document.getElementById("date");

    const total =
        document.getElementById("total");


    /*========================================
     DATE DU JOUR
    ========================================*/

    if (date && !date.value) {

        const aujourdHui = new Date();

        const annee =
            aujourdHui.getFullYear();

        const mois =
            String(
                aujourdHui.getMonth() + 1
            ).padStart(2, "0");

        const jour =
            String(
                aujourdHui.getDate()
            ).padStart(2, "0");

        date.value =
            `${annee}-${mois}-${jour}`;

    }


    /*========================================
     CALCUL DU TOTAL
    ========================================*/

    function calculerTotal() {

        const q =
            Number(quantite.value) || 0;

        const p =
            Number(prix.value) || 0;

        const r =
            Number(remise.value) || 0;

        let montant =
            (q * p) - r;


        if (montant < 0) {

            montant = 0;

        }


        total.textContent =
            formatFC(montant);

    }


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


    calculerTotal();


    /*========================================
     ENREGISTRER LA VENTE
    ========================================*/

    formulaire.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const nomClient =
                client.value.trim();

            const nomProduit =
                produit.value.trim();

            const q =
                Number(quantite.value);

            const p =
                Number(prix.value);

            const r =
                Number(remise.value) || 0;


            /*----------------------------
             VERIFICATIONS
            ----------------------------*/

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


            if (q <= 0) {

                alert(
                    "La quantité doit être supérieure à zéro."
                );

                quantite.focus();

                return;

            }


            if (p < 0 || !Number.isFinite(p)) {

                alert(
                    "Veuillez saisir un prix valide."
                );

                prix.focus();

                return;

            }


            if (r < 0) {

                alert(
                    "La remise ne peut pas être négative."
                );

                remise.focus();

                return;

            }


            let montantTotal =
                (q * p) - r;


            if (montantTotal < 0) {

                montantTotal = 0;

            }


            /*----------------------------
             CREATION DE LA VENTE
            ----------------------------*/

            const nouvelleVente = {

                id: Date.now(),

                facture:
                    "VTE-" + Date.now(),

                date:
                    date.value,

                client:
                    nomClient,

                telephone:
                    telephone.value.trim(),

                produit:
                    nomProduit,

                quantite:
                    q,

                prix:
                    p,

                remise:
                    r,

                total:
                    montantTotal,

                paiement:
                    paiement.value,

                statut:
                    "Payée"

            };


            /*----------------------------
             SAUVEGARDE
            ----------------------------*/

            const ventes =
                obtenirVentes();

            ventes.push(
                nouvelleVente
            );

            sauvegarderVentes(
                ventes
            );


            alert(
                "Vente enregistrée avec succès.\n\n" +
                "Facture : " +
                nouvelleVente.facture
            );


            /*----------------------------
             RETOUR A LA LISTE
            ----------------------------*/

            window.location.href =
                "index.html";

        }

    );

}

/*====================================================
 CHARGER ET AFFICHER LES VENTES
====================================================*/

function chargerVentes() {

    const table =
        document.getElementById("tableVentes");

    const compteur =
        document.getElementById("nombreVentes");


    /*--------------------------------------------
     Cette fonction est uniquement utilisée
     sur la page index.html
    --------------------------------------------*/

    if (!table) {

        return;

    }


    const toutesLesVentes =
        obtenirVentes();


    /*--------------------------------------------
     RECUPERATION DES FILTRES
    --------------------------------------------*/

    const recherche =
        document.getElementById("recherche");

    const filtreDate =
        document.getElementById("filtreDate");


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


    /*--------------------------------------------
     APPLICATION DES FILTRES
    --------------------------------------------*/

    const ventesFiltrees =
        toutesLesVentes.filter(
            vente => {

                const correspondRecherche =

                    !texteRecherche ||

                    String(
                        vente.client || ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    )

                    ||

                    String(
                        vente.produit || ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    );


                const correspondDate =

                    !dateRecherche ||

                    vente.date === dateRecherche;


                return
                    correspondRecherche &&
                    correspondDate;

            }
        );


    /*--------------------------------------------
     COMPTEUR
    --------------------------------------------*/

    if (compteur) {

        compteur.textContent =
            ventesFiltrees.length;

    }


    /*--------------------------------------------
     TABLE VIDE
    --------------------------------------------*/

    table.innerHTML = "";


    if (ventesFiltrees.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4"
                >

                    Aucune vente trouvée.

                </td>

            </tr>

        `;

        return;

    }


    /*--------------------------------------------
     AFFICHAGE DES VENTES
    --------------------------------------------*/

    ventesFiltrees.forEach(
        (vente, index) => {

            const statutClasse =
                vente.statut === "Annulée"
                    ? "bg-danger"
                    : "bg-success";


            table.innerHTML += `

                <tr>

                    <td>

                        ${index + 1}

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

                        ${vente.paiement || ""}

                    </td>


                    <td>

                        <span
                            class="badge ${statutClasse}"
                        >

                            ${vente.statut || ""}

                        </span>

                    </td>


                    <td>

                        <button
                            class="btn btn-sm btn-primary"
                            title="Voir"
                            onclick="voirVente('${vente.id}')"
                        >

                            <i
                                class="fa-solid fa-eye"
                            ></i>

                        </button>


                        <button
                            class="btn btn-sm btn-warning"
                            title="Modifier"
                            onclick="modifierVente('${vente.id}')"
                        >

                            <i
                                class="fa-solid fa-pen"
                            ></i>

                        </button>


                        <button
                            class="btn btn-sm btn-info"
                            title="Imprimer"
                            onclick="imprimerFacture('${vente.id}')"
                        >

                            <i
                                class="fa-solid fa-print"
                            ></i>

                        </button>


                        <button
                            class="btn btn-sm btn-danger"
                            title="Supprimer"
                            onclick="supprimerVente('${vente.id}')"
                        >

                            <i
                                class="fa-solid fa-trash"
                            ></i>

                        </button>

                    </td>

                </tr>

            `;

        }

    );

}

/*====================================================
 INITIALISER LES FILTRES
====================================================*/

function initialiserFiltresVentes() {

    const recherche =
        document.getElementById("recherche");

    const filtreDate =
        document.getElementById("filtreDate");


    if (recherche) {

        recherche.addEventListener(
            "input",
            chargerVentes
        );

    }


    if (filtreDate) {

        filtreDate.addEventListener(
            "change",
            chargerVentes
        );

    }

}

/*====================================================
 VOIR UNE VENTE
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


    alert(

        "FACTURE\n\n" +

        "N° : " +
        (vente.facture || vente.id) +

        "\n\nDate : " +
        vente.date +

        "\nClient : " +
        vente.client +

        "\nTéléphone : " +
        (vente.telephone || "-") +

        "\nProduit : " +
        vente.produit +

        "\nQuantité : " +
        vente.quantite +

        "\nPrix unitaire : " +
        formatFC(vente.prix) +

        "\nRemise : " +
        formatFC(vente.remise) +

        "\nTOTAL : " +
        formatFC(vente.total) +

        "\nPaiement : " +
        vente.paiement +

        "\nStatut : " +
        vente.statut

    );

}

/*====================================================
 MODIFIER UNE VENTE
====================================================*/

function modifierVente(id) {

    const vente =
        trouverVente(id);


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    localStorage.setItem(
        "venteEnModification",
        JSON.stringify(vente)
    );


    window.location.href =
        "nouvelle.html?id=" +
        encodeURIComponent(id);

}

/*====================================================
 SUPPRIMER UNE VENTE
====================================================*/

function supprimerVente(id) {

    const vente =
        trouverVente(id);


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    const confirmation =
        confirm(

            "Voulez-vous vraiment supprimer " +
            "la vente du client : " +
            vente.client +
            " ?"

        );


    if (!confirmation) {

        return;

    }


    const ventes =
        obtenirVentes();


    const nouvellesVentes =
        ventes.filter(
            vente =>
                String(vente.id) !== String(id)
        );


    sauvegarderVentes(
        nouvellesVentes
    );


    chargerVentes();


    alert(
        "Vente supprimée avec succès."
    );

}

/*====================================================
 IMPRIMER FACTURE
====================================================*/

function imprimerFacture(id) {

    const vente =
        trouverVente(id);


    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;

    }


    const fenetre =
        window.open(
            "",
            "_blank"
        );


    if (!fenetre) {

        alert(
            "Impossible d'ouvrir la fenêtre d'impression."
        );

        return;

    }


    fenetre.document.write(`

        <!DOCTYPE html>

        <html lang="fr">

        <head>

            <meta charset="UTF-8">

            <title>Facture</title>

            <style>

                body {

                    font-family:
                        Arial, sans-serif;

                    padding: 40px;

                }

                h1 {

                    color: #198754;

                }

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top:
                        25px;

                }

                td {

                    padding:
                        10px;

                    border:
                        1px solid #ccc;

                }

                .total {

                    font-size:
                        22px;

                    font-weight:
                        bold;

                    margin-top:
                        25px;

                }

            </style>

        </head>

        <body>

            <h1>
                FERME ASHER
            </h1>

            <h2>
                FACTURE DE VENTE
            </h2>


            <p>

                <strong>Facture :</strong>

                ${vente.facture || vente.id}

            </p>


            <p>

                <strong>Date :</strong>

                ${vente.date}

            </p>


            <p>

                <strong>Client :</strong>

                ${vente.client}

            </p>


            <p>

                <strong>Téléphone :</strong>

                ${vente.telephone || "-"}

            </p>


            <table>

                <tr>

                    <td>
                        Produit
                    </td>

                    <td>
                        ${vente.produit}
                    </td>

                </tr>


                <tr>

                    <td>
                        Quantité
                    </td>

                    <td>
                        ${vente.quantite}
                    </td>

                </tr>


                <tr>

                    <td>
                        Prix unitaire
                    </td>

                    <td>
                        ${formatFC(vente.prix)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Remise
                    </td>

                    <td>
                        ${formatFC(vente.remise)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Paiement
                    </td>

                    <td>
                        ${vente.paiement}
                    </td>

                </tr>

            </table>


            <p class="total">

                TOTAL :
                ${formatFC(vente.total)}

            </p>


            <br>

            <p>
                Merci pour votre confiance.
            </p>


        </body>

        </html>

    `);


    fenetre.document.close();


    fenetre.onload =
        function() {

            fenetre.print();

        };

}

/*====================================================
 DEMARRAGE DU MODULE
====================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Ferme Asher ERP - Module Ventes chargé"
        );


        initialiserNouvelleVente();


        initialiserFiltresVentes();


        chargerVentes();

    }
);

