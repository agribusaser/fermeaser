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

