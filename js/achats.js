/*====================================================
 FERME ASHER ERP
 ACHATS.JS
 VERSION 1.0
====================================================*/


/*====================================================
 INITIALISATION
====================================================*/

document.addEventListener("DOMContentLoaded", function () {

    initialiserAchats();

});


/*====================================================
 INITIALISER MODULE ACHATS
====================================================*/

function initialiserAchats() {

    const achats =
        obtenirAchats();

    afficherStatistiquesAchats(
        achats
    );

    afficherAchats(
        achats
    );

    chargerFournisseursFiltre();

    initialiserRecherche();

    initialiserFiltres();

    initialiserBoutonActualiser();

}


/*====================================================
 OBTENIR ACHATS
====================================================*/

function obtenirAchats() {

    try {

        return JSON.parse(
            localStorage.getItem("achats")
        ) || [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture achats :",
            erreur
        );

        return [];

    }

}


/*====================================================
 SAUVEGARDER ACHATS
====================================================*/

function sauvegarderAchats(
    achats
) {

    localStorage.setItem(
        "achats",
        JSON.stringify(achats)
    );

}


/*====================================================
 GENERER REFERENCE ACHAT
====================================================*/

function genererReferenceAchat() {

    const achats =
        obtenirAchats();

    let numero =
        achats.length + 1;

    let reference =
        "ACH-" +
        String(numero).padStart(
            6,
            "0"
        );


    while (
        achats.some(
            achat =>
            achat.reference === reference
        )
    ) {

        numero++;

        reference =
            "ACH-" +
            String(numero).padStart(
                6,
                "0"
            );

    }


    return reference;

}


/*====================================================
 AFFICHER STATISTIQUES
====================================================*/

function afficherStatistiquesAchats(
    achats
) {

    const total =
        achats.length;


    const montantTotal =
        achats.reduce(
            (
                somme,
                achat
            ) => {

                return somme +
                    Number(
                        achat.montant || 0
                    );

            },
            0
        );


    const maintenant =
        new Date();


    const moisActuel =
        maintenant.getMonth();


    const anneeActuelle =
        maintenant.getFullYear();


    const achatsMois =
        achats.filter(
            achat => {

                if (!achat.date) {
                    return false;
                }


                const date =
                    new Date(
                        achat.date
                    );


                return (

                    date.getMonth() ===
                    moisActuel

                    &&

                    date.getFullYear() ===
                    anneeActuelle

                );

            }
        ).length;


    const quantiteAchetee =
        achats.reduce(
            (
                somme,
                achat
            ) => {

                return somme +
                    Number(
                        achat.quantite || 0
                    );

            },
            0
        );


    const elementTotal =
        document.getElementById(
            "totalAchats"
        );


    const elementMontant =
        document.getElementById(
            "montantTotalAchats"
        );


    const elementMois =
        document.getElementById(
            "achatsMois"
        );


    const elementQuantite =
        document.getElementById(
            "quantiteAchetee"
        );


    if (elementTotal) {

        elementTotal.textContent =
            total;

    }


    if (elementMontant) {

        elementMontant.textContent =
            montantTotal.toLocaleString(
                "fr-FR"
            ) + " FC";

    }


    if (elementMois) {

        elementMois.textContent =
            achatsMois;

    }


    if (elementQuantite) {

        elementQuantite.textContent =
            quantiteAchetee.toLocaleString(
                "fr-FR"
            );

    }

}


/*====================================================
 CHARGER FOURNISSEURS DANS LE FILTRE
====================================================*/

function chargerFournisseursFiltre() {

    const select =
        document.getElementById(
            "filtreFournisseur"
        );


    if (!select) return;


    const fournisseurs =
        JSON.parse(
            localStorage.getItem(
                "fournisseurs"
            )
        ) || [];


    select.innerHTML = `

        <option value="">

            Tous les fournisseurs

        </option>

    `;


    fournisseurs.forEach(
        fournisseur => {

            select.innerHTML += `

                <option
                    value="${fournisseur.id}"
                >

                    ${
                        fournisseur.numeroFournisseur
                        || ""
                    }

                    -

                    ${
                        fournisseur.nom
                        || ""
                    }

                </option>

            `;

        }
    );

}


/*====================================================
 AFFICHER ACHATS
====================================================*/

function afficherAchats(
    achats
) {

    const tableau =
        document.getElementById(
            "achatsTable"
        );


    if (!tableau) return;


    tableau.innerHTML = "";


    if (achats.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center py-5"
                >

                    <i
                        class="fa-solid fa-cart-flatbed"
                        style="
                            font-size:40px;
                            color:#94A3B8;
                        "
                    ></i>

                    <div class="mt-3">

                        <strong>
                            Aucun achat enregistré
                        </strong>

                    </div>

                    <div class="text-muted">

                        Commencez par enregistrer
                        votre premier achat.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    achats.forEach(
        achat => {

            const ligne =
                document.createElement(
                    "tr"
                );


            const statut =
                achat.statut ||
                "Validé";


            let badge =
                "success";


            if (
                statut === "Brouillon"
            ) {

                badge =
                    "warning";

            }


            if (
                statut === "Annulé"
            ) {

                badge =
                    "danger";

            }


            ligne.innerHTML = `

                <td>

                    ${
                        achat.date

                        ? new Date(
                            achat.date
                        ).toLocaleDateString(
                            "fr-FR"
                        )

                        : "-"
                    }

                </td>


                <td>

                    <strong>

                        ${
                            achat.reference
                            || "-"
                        }

                    </strong>

                </td>


                <td>

                    ${
                        achat.fournisseurNom
                        || "-"
                    }

                </td>


                <td>

                    ${
                        achat.produitNom
                        || "-"
                    }

                </td>


                <td>

                    <span class="quantite">

                        ${
                            Number(
                                achat.quantite || 0
                            ).toLocaleString(
                                "fr-FR"
                            )
                        }

                    </span>

                </td>


                <td>

                    ${
                        Number(
                            achat.prixUnitaire || 0
                        ).toLocaleString(
                            "fr-FR"
                        )
                    }

                    FC

                </td>


                <td>

                    <span class="montant">

                        ${
                            Number(
                                achat.montant || 0
                            ).toLocaleString(
                                "fr-FR"
                            )
                        }

                        FC

                    </span>

                </td>


                <td>

                    <span
                        class="badge bg-${badge}"
                    >

                        ${statut}

                    </span>

                </td>


                <td>

                    <button
                        class="btn btn-primary"
                        title="Voir"
                        onclick="
                            voirAchat(
                                ${achat.id}
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                    </button>


                    <button
                        class="btn btn-warning"
                        title="Modifier"
                        onclick="
                            modifierAchat(
                                ${achat.id}
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                    </button>


                    <button
                        class="btn btn-danger"
                        title="Annuler"
                        onclick="
                            annulerAchat(
                                ${achat.id}
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-ban"
                        ></i>

                    </button>

                </td>

            `;


            tableau.appendChild(
                ligne
            );

        }
    );

}


/*====================================================
 RECHERCHE
====================================================*/

function initialiserRecherche() {

    const champ =
        document.getElementById(
            "rechercheAchat"
        );


    if (!champ) return;


    champ.addEventListener(
        "input",
        appliquerFiltresAchats
    );

}


/*====================================================
 FILTRES
====================================================*/

function initialiserFiltres() {

    const fournisseur =
        document.getElementById(
            "filtreFournisseur"
        );


    const dateDebut =
        document.getElementById(
            "dateDebut"
        );


    const dateFin =
        document.getElementById(
            "dateFin"
        );


    if (fournisseur) {

        fournisseur.addEventListener(
            "change",
            appliquerFiltresAchats
        );

    }


    if (dateDebut) {

        dateDebut.addEventListener(
            "change",
            appliquerFiltresAchats
        );

    }


    if (dateFin) {

        dateFin.addEventListener(
            "change",
            appliquerFiltresAchats
        );

    }

}


/*====================================================
 APPLIQUER FILTRES
====================================================*/

function appliquerFiltresAchats() {

    const recherche =
        document.getElementById(
            "rechercheAchat"
        );


    const fournisseur =
        document.getElementById(
            "filtreFournisseur"
        );


    const dateDebut =
        document.getElementById(
            "dateDebut"
        );


    const dateFin =
        document.getElementById(
            "dateFin"
        );


    const texte =
        recherche
        ? recherche.value
            .trim()
            .toLowerCase()
        : "";


    const fournisseurId =
        fournisseur
        ? fournisseur.value
        : "";


    const debut =
        dateDebut
        ? dateDebut.value
        : "";


    const fin =
        dateFin
        ? dateFin.value
        : "";


    const achats =
        obtenirAchats();


    const resultats =
        achats.filter(
            achat => {

                const rechercheOK =

                    !texte

                    ||

                    String(
                        achat.reference || ""
                    )
                    .toLowerCase()
                    .includes(texte)

                    ||

                    String(
                        achat.produitNom || ""
                    )
                    .toLowerCase()
                    .includes(texte)

                    ||

                    String(
                        achat.fournisseurNom || ""
                    )
                    .toLowerCase()
                    .includes(texte);


                const fournisseurOK =

                    !fournisseurId

                    ||

                    String(
                        achat.fournisseurId
                    ) ===
                    String(
                        fournisseurId
                    );


                let dateOK = true;


                if (achat.date) {

                    const dateAchat =
                        achat.date.substring(
                            0,
                            10
                        );


                    if (
                        debut &&
                        dateAchat < debut
                    ) {

                        dateOK = false;

                    }


                    if (
                        fin &&
                        dateAchat > fin
                    ) {

                        dateOK = false;

                    }

                }


                return (

                    rechercheOK &&

                    fournisseurOK &&

                    dateOK

                );

            }
        );


    afficherAchats(
        resultats
    );

}


/*====================================================
 ACTUALISER
====================================================*/

function initialiserBoutonActualiser() {

    const bouton =
        document.getElementById(
            "btnActualiser"
        );


    if (!bouton) return;


    bouton.addEventListener(
        "click",
        function () {

            initialiserAchats();

        }
    );

}


/*====================================================
 VOIR ACHAT
====================================================*/

function voirAchat(id) {

    window.location.href =
        "detail.html?id=" + id;

}


/*====================================================
 MODIFIER ACHAT
====================================================*/

function modifierAchat(id) {

    const achats =
        obtenirAchats();


    const achat =
        achats.find(
            a => a.id === id
        );


    if (!achat) {

        alert(
            "Achat introuvable."
        );

        return;

    }


    if (
        achat.statut ===
        "Annulé"
    ) {

        alert(
            "Un achat annulé ne peut pas être modifié."
        );

        return;

    }


    window.location.href =
        "modifier.html?id=" + id;

}


/*====================================================
 ANNULER ACHAT
====================================================*/

function annulerAchat(id) {

    const achats =
        obtenirAchats();


    const index =
        achats.findIndex(
            achat =>
            achat.id === id
        );


    if (index === -1) {

        alert(
            "Achat introuvable."
        );

        return;

    }


    const achat =
        achats[index];


    if (
        achat.statut ===
        "Annulé"
    ) {

        alert(
            "Cet achat est déjà annulé."
        );

        return;

    }


    const confirmation =
        confirm(

            "Voulez-vous vraiment annuler " +

            achat.reference +

            " ?\n\n" +

            "Cette opération annulera " +
            "l'entrée en stock correspondante."

        );


    if (!confirmation) return;


    /*
    ================================================
    RETIRER LA QUANTITE DU STOCK
    ================================================
    */

    retirerStockApresAnnulation(
        achat
    );


    /*
    ================================================
    STATUT
    ================================================
    */

    achats[index].statut =
        "Annulé";


    achats[index].dateAnnulation =
        new Date().toISOString();


    sauvegarderAchats(
        achats
    );


    alert(
        "Achat annulé avec succès."
    );


    initialiserAchats();

}


/*====================================================
 RETIRER STOCK APRES ANNULATION
====================================================*/

function retirerStockApresAnnulation(
    achat
) {

    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];


    const index =
        produits.findIndex(
            produit =>
            produit.id ===
            achat.produitId
        );


    if (index === -1) {

        console.warn(
            "Produit introuvable pour " +
            "l'annulation de l'achat."
        );

        return;

    }


    const quantite =
        Number(
            achat.quantite || 0
        );


    const stockActuel =
        Number(
            produits[index].stock || 0
        );


    /*
    ================================================
    PROTECTION
    ================================================
    */

    if (
        stockActuel < quantite
    ) {

        alert(

            "Attention : le stock actuel " +

            "est inférieur à la quantité " +

            "de cet achat.\n\n" +

            "Le stock sera ramené à zéro."

        );


        produits[index].stock =
            0;

    }

    else {

        produits[index].stock =
            stockActuel -
            quantite;

    }


    localStorage.setItem(

        "produits",

        JSON.stringify(
            produits
        )

    );

}


/*====================================================
 CREER ACHAT
====================================================*/

function creerAchat(
    donnees
) {

    const achats =
        obtenirAchats();


    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];


    const fournisseurs =
        JSON.parse(
            localStorage.getItem(
                "fournisseurs"
            )
        ) || [];


    /*
    ================================================
    VERIFICATION FOURNISSEUR
    ================================================
    */

    const fournisseur =
        fournisseurs.find(
            f =>
            f.id ===
            Number(
                donnees.fournisseurId
            )
        );


    if (!fournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        return false;

    }


    /*
    ================================================
    VERIFICATION PRODUIT
    ================================================
    */

    const produit =
        produits.find(
            p =>
            p.id ===
            Number(
                donnees.produitId
            )
        );


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return false;

    }


    /*
    ================================================
    QUANTITE
    ================================================
    */

    const quantite =
        Number(
            donnees.quantite
        );


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

        return false;

    }


    /*
    ================================================
    PRIX
    ================================================
    */

    const prixUnitaire =
        Number(
            donnees.prixUnitaire
        );


    if (
        !Number.isFinite(
            prixUnitaire
        )
        ||
        prixUnitaire < 0
    ) {

        alert(
            "Le prix d'achat est invalide."
        );

        return false;

    }


    /*
    ================================================
    MONTANT
    ================================================
    */

    const montant =
        quantite *
        prixUnitaire;


    /*
    ================================================
    CREATION ACHAT
    ================================================
    */

    const achat = {

        id:
            Date.now(),

        reference:
            genererReferenceAchat(),

        date:
            donnees.date ||
            new Date().toISOString(),

        fournisseurId:
            fournisseur.id,

        fournisseurNom:
            fournisseur.nom,

        produitId:
            produit.id,

        produitNom:
            produit.nom,

        quantite:
            quantite,

        prixUnitaire:
            prixUnitaire,

        montant:
            montant,

        statut:
            "Validé",

        notes:
            donnees.notes || "",

        utilisateur:
            donnees.utilisateur ||
            "Administrateur",

        dateCreation:
            new Date().toISOString()

    };


    /*
    ================================================
    ENREGISTRER ACHAT
    ================================================
    */

    achats.push(
        achat
    );


    sauvegarderAchats(
        achats
    );


    /*
    ================================================
    AUGMENTER STOCK PRODUIT
    ================================================
    */

    const produitIndex =
        produits.findIndex(
            p =>
            p.id ===
            produit.id
        );


    if (
        produitIndex !== -1
    ) {

        const stockActuel =
            Number(
                produits[
                    produitIndex
                ].stock || 0
            );


        produits[
            produitIndex
        ].stock =
            stockActuel +
            quantite;


        localStorage.setItem(

            "produits",

            JSON.stringify(
                produits
            )

        );

    }


    /*
    ================================================
    METTRE A JOUR FOURNISSEUR
    ================================================
    */

    const fournisseurIndex =
        fournisseurs.findIndex(
            f =>
            f.id ===
            fournisseur.id
        );


    if (
        fournisseurIndex !== -1
    ) {

        fournisseurs[
            fournisseurIndex
        ].nombreAchats =

            Number(
                fournisseurs[
                    fournisseurIndex
                ].nombreAchats || 0
            ) + 1;


        fournisseurs[
            fournisseurIndex
        ].totalAchats =

            Number(
                fournisseurs[
                    fournisseurIndex
                ].totalAchats || 0
            ) + montant;


        fournisseurs[
            fournisseurIndex
        ].derniereCommande =
            achat.date;


        /*
        ============================================
        AJOUT PRODUIT AU FOURNISSEUR
        ============================================
        */

        if (
            !Array.isArray(
                fournisseurs[
                    fournisseurIndex
                ].produits
            )
        ) {

            fournisseurs[
                fournisseurIndex
            ].produits = [];

        }


        const produitExiste =
            fournisseurs[
                fournisseurIndex
            ].produits.some(
                p => {

                    if (
                        typeof p ===
                        "string"
                    ) {

                        return p ===
                            produit.nom;

                    }


                    return Number(
                        p.id
                    ) ===
                    Number(
                        produit.id
                    );

                }
            );


        if (
            !produitExiste
        ) {

            fournisseurs[
                fournisseurIndex
            ].produits.push({

                id:
                    produit.id,

                nom:
                    produit.nom

            });

        }


        fournisseurs[
            fournisseurIndex
        ].nombreProduits =

            fournisseurs[
                fournisseurIndex
            ].produits.length;


        localStorage.setItem(

            "fournisseurs",

            JSON.stringify(
                fournisseurs
            )

        );

    }


    return achat;

}


/*====================================================
 EXPORT
====================================================*/

window.initialiserAchats =
    initialiserAchats;

window.obtenirAchats =
    obtenirAchats;

window.sauvegarderAchats =
    sauvegarderAchats;

window.genererReferenceAchat =
    genererReferenceAchat;

window.creerAchat =
    creerAchat;

window.voirAchat =
    voirAchat;

window.modifierAchat =
    modifierAchat;

window.annulerAchat =
    annulerAchat;


/*====================================================
 FIN
====================================================*/

console.log(
    "Module Achats chargé."
);
