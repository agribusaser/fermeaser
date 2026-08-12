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

    const achatsValides =
        achats.filter(
            achat =>
                (achat.statut || "Validé") ===
                "Validé"
        );

    const totalAchats =
        achatsValides.length;

    const montantTotal =
        achatsValides.reduce(
            (total, achat) =>
                total +
                Number(
                    achat.montant || 0
                ),
            0
        );

    const maintenant =
        new Date();

    const moisActuel =
        maintenant.getMonth();

    const anneeActuelle =
        maintenant.getFullYear();

    const achatsMois =
        achatsValides.filter(
            achat => {

                if (!achat.date) {
                    return false;
                }

                const dateAchat =
                    new Date(
                        achat.date
                    );

                return (
                    dateAchat.getMonth() ===
                        moisActuel &&
                    dateAchat.getFullYear() ===
                        anneeActuelle
                );

            }
        ).length;

    const quantiteAchetee =
        achatsValides.reduce(
            (total, achat) =>
                total +
                Number(
                    achat.quantite || 0
                ),
            0
        );

    const elementTotal =
        document.getElementById(
            "totalAchats"
        );

    if (elementTotal) {

        elementTotal.textContent =
            totalAchats.toLocaleString(
                "fr-FR"
            );

    }

    const elementMontant =
        document.getElementById(
            "montantTotalAchats"
        );

    if (elementMontant) {

        elementMontant.textContent =
            montantTotal.toLocaleString(
                "fr-FR"
            ) + " FC";

    }

    const elementMois =
        document.getElementById(
            "achatsMois"
        );

    if (elementMois) {

        elementMois.textContent =
            achatsMois.toLocaleString(
                "fr-FR"
            );

    }

    const elementQuantite =
        document.getElementById(
            "quantiteAchetee"
        );

    if (elementQuantite) {

        elementQuantite.textContent =
            quantiteAchetee.toLocaleString(
                "fr-FR"
            );

    }

}
/*====================================================
 ANNULER L'IMPACT STOCK D'UN ACHAT
====================================================*/

function retirerStockApresAnnulation(achat) {

    // Un achat brouillon n'a jamais ajouté
    // de stock. Il ne faut donc rien retirer.
    if (achat.statut !== "Validé") {

        return true;

    }

    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];

    const index =
        produits.findIndex(
            produit =>
                Number(produit.id) ===
                Number(achat.produitId)
        );

    if (index === -1) {

        alert(
            "Produit introuvable. " +
            "L'annulation est impossible."
        );

        return false;

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
    PROTECTION STOCK
    ================================================
    */

    if (stockActuel < quantite) {

        alert(

            "Annulation impossible.\n\n" +

            "Stock actuel : " +
            stockActuel +

            "\nQuantité de l'achat : " +
            quantite +

            "\n\nUne partie de cet achat " +
            "a probablement déjà été vendue " +
            "ou sortie du stock."

        );

        return false;

    }

    /*
    ================================================
    RETIRER DU STOCK
    ================================================
    */

    produits[index].stock =
        stockActuel -
        quantite;

    localStorage.setItem(
        "produits",
        JSON.stringify(
            produits
        )
    );

    /*
    ================================================
    ENREGISTRER LE MOUVEMENT
    ================================================
    */

    enregistrerMouvementStock({

        achat: achat,

        type: "Sortie",

        nature: "Annulation achat",

        observation:
            "Annulation de l'achat " +
            achat.reference

    });

    return true;

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


   
    /*================================================
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

function retirerStockApresAnnulation(achat) {
 
    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    const index = produits.findIndex(
        produit =>
            produit.id === achat.productId
    );

    if (index === -1) {
        alert("Produit introuvable.");
        return;
    }

    const stockActuel =
        Number(produits[index].stock) || 0;

    const quantite =
        Number(achat.quantite) || 0;
 
    /*================================================
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

function creerAchat(donnees) {

    const achats =
        obtenirAchats();

    const produits =
        JSON.parse(
            localStorage.getItem("produits")
        ) || [];

    const fournisseurs =
        JSON.parse(
            localStorage.getItem("fournisseurs")
        ) || [];


    /*================================================
    VERIFICATION FOURNISSEUR
    =================================================*/

    const fournisseur =
        fournisseurs.find(
            f =>
                Number(f.id) ===
                Number(donnees.fournisseurId)
        );


    if (!fournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        return false;

    }


    /*================================================
    VERIFICATION PRODUIT
    =================================================*/

    const produit =
        produits.find(
            p =>
                Number(p.id) ===
                Number(donnees.produitId)
        );


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return false;

    }


    /*================================================
    QUANTITE
    =================================================*/

    const quantite =
        Number(
            donnees.quantite
        );


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return false;

    }


    /*================================================
    PRIX UNITAIRE
    =================================================*/

    const prixUnitaire =
        Number(
            donnees.prixUnitaire
        );


    if (
        !Number.isFinite(prixUnitaire) ||
        prixUnitaire < 0
    ) {

        alert(
            "Le prix d'achat est invalide."
        );

        return false;

    }


    /*================================================
    MONTANT
    =================================================*/

    const montant =
        quantite *
        prixUnitaire;


    /*================================================
    STATUT
    =================================================*/

    const statut =
        donnees.statut ||
        "Validé";


    /*================================================
    CREATION ACHAT
    =================================================*/

    const achat = {

        id:
            Date.now(),

        reference:
            genererReferenceAchat(),

        date:
            donnees.date ||
            new Date()
                .toISOString()
                .split("T")[0],

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
            statut,

        notes:
            donnees.notes || "",

        utilisateur:
            donnees.utilisateur ||
            "Administrateur",

        dateCreation:
            new Date().toISOString()

    };


    /*================================================
    ENREGISTRER ACHAT
    =================================================*/

    achats.push(
        achat
    );


    sauvegarderAchats(
        achats
    );


    /*================================================
    MISE A JOUR DU STOCK
    UNIQUEMENT SI ACHAT VALIDE
    =================================================*/

    if (
        statut === "Validé"
    ) {

        const produitIndex =
            produits.findIndex(
                p =>
                    Number(p.id) ===
                    Number(produit.id)
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

    }

/*================================================
ENREGISTRER MOUVEMENT DE STOCK
================================================*/

const mouvementsStock =
    JSON.parse(
        localStorage.getItem("mouvementsStock")
    ) || [];

mouvementsStock.push({

    id: Date.now(),

    date: achat.date,

    produitId: produit.id,

    produit: produit.nom,

    type: "Entrée",

    nature: "Achat",

    quantite: quantite,

    prix: prixUnitaire,

    montant: montant,

    reference: achat.reference,

    observation:
        "Entrée en stock suite à l'achat " +
        achat.reference,

    utilisateur:
        achat.utilisateur || "Administrateur"

});

localStorage.setItem(
    "mouvementsStock",
    JSON.stringify(
        mouvementsStock
    )
);
 
    /*================================================
    MISE A JOUR DU FOURNISSEUR
    UNIQUEMENT SI ACHAT VALIDE
    =================================================*/

    if (
        statut === "Validé"
    ) {

        const fournisseurIndex =
            fournisseurs.findIndex(
                f =>
                    Number(f.id) ===
                    Number(fournisseur.id)
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


            /*========================================
            PRODUITS DU FOURNISSEUR
            ========================================*/

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

                            return (
                                p ===
                                produit.nom
                            );

                        }


                        return (
                            Number(p.id) ===
                            Number(produit.id)
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

    }

 
    /*================================================
    RETOURNER ACHAT
    =================================================*/

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

/*====================================================
 FORMULAIRE NOUVEL ACHAT
====================================================*/

function initialiserFormulaireAchat() {

    const formulaire =
        document.getElementById("achatForm");

    if (!formulaire) return;


    /*==============================================
    DATE PAR DEFAUT
    ==============================================*/

    const champDate =
        document.getElementById("date");

    if (champDate && !champDate.value) {

        const aujourdHui =
            new Date();

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

        champDate.value =
            `${annee}-${mois}-${jour}`;

    }


    /*==============================================
    CHARGER FOURNISSEURS
    ==============================================*/

    chargerFournisseursAchat();


    /*==============================================
    CHARGER PRODUITS
    ==============================================*/

    chargerProduitsAchat();


    /*==============================================
    CALCUL MONTANT
    ==============================================*/

    const quantite =
        document.getElementById("quantite");

    const prix =
        document.getElementById(
            "prixUnitaire"
        );


    if (quantite) {

        quantite.addEventListener(
            "input",
            calculerMontantAchat
        );

    }


    if (prix) {

        prix.addEventListener(
            "input",
            calculerMontantAchat
        );

    }


    /*==============================================
    CHANGEMENT PRODUIT
    ==============================================*/

    const produit =
        document.getElementById("produitId");


    if (produit) {

        produit.addEventListener(
            "change",
            afficherStockProduitAchat
        );

    }


    /*==============================================
    ENREGISTREMENT
    ==============================================*/

    formulaire.addEventListener(
        "submit",
        enregistrerNouvelAchat
    );

}


/*====================================================
 CHARGER FOURNISSEURS
====================================================*/

function chargerFournisseursAchat() {

    const select =
        document.getElementById(
            "fournisseurId"
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

            Sélectionner un fournisseur

        </option>

    `;


    if (fournisseurs.length === 0) {

        select.innerHTML += `

            <option value="" disabled>

                Aucun fournisseur disponible

            </option>

        `;

        return;

    }


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
 CHARGER PRODUITS
====================================================*/

function chargerProduitsAchat() {

    const select =
        document.getElementById(
            "produitId"
        );

    if (!select) return;


    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];


    select.innerHTML = `

        <option value="">

            Sélectionner un produit

        </option>

    `;


    if (produits.length === 0) {

        select.innerHTML += `

            <option value="" disabled>

                Aucun produit disponible

            </option>

        `;

        return;

    }


    produits.forEach(
        produit => {

            select.innerHTML += `

                <option
                    value="${produit.id}"
                >

                    ${
                        produit.code
                        ? produit.code + " - "
                        : ""
                    }

                    ${
                        produit.nom
                        || "-"
                    }

                </option>

            `;

        }
    );

}


/*====================================================
 AFFICHER STOCK PRODUIT
====================================================*/

function afficherStockProduitAchat() {

    const select =
        document.getElementById(
            "produitId"
        );


    const affichage =
        document.getElementById(
            "stockActuel"
        );


    if (!select || !affichage) return;


    const produitId =
        Number(
            select.value
        );


    if (!produitId) {

        affichage.textContent =
            "-";

        return;

    }


    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];


    const produit =
        produits.find(
            p =>
            Number(p.id) ===
            produitId
        );


    if (!produit) {

        affichage.textContent =
            "-";

        return;

    }


    const stock =
        Number(
            produit.stock || 0
        );


    const unite =
        produit.unite ||
        "";


    affichage.textContent =
        stock.toLocaleString(
            "fr-FR"
        ) +
        (unite ? " " + unite : "");

}


/*====================================================
 CALCULER MONTANT
====================================================*/

function calculerMontantAchat() {

    const quantite =
        Number(
            document.getElementById(
                "quantite"
            )?.value || 0
        );


    const prix =
        Number(
            document.getElementById(
                "prixUnitaire"
            )?.value || 0
        );


    const montant =
        quantite *
        prix;


    const affichage =
        document.getElementById(
            "montantTotal"
        );


    if (!affichage) return;


    affichage.textContent =

        montant.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )

        + " FC";

}


/*====================================================
 ENREGISTRER NOUVEL ACHAT
====================================================*/

function enregistrerNouvelAchat(e) {

    e.preventDefault();


    /*==============================================
    RECUPERATION
    ==============================================*/

    const date =
        document.getElementById(
            "date"
        ).value;


    const fournisseurId =
        document.getElementById(
            "fournisseurId"
        ).value;


    const produitId =
        document.getElementById(
            "produitId"
        ).value;


    const quantite =
        Number(
            document.getElementById(
                "quantite"
            ).value
        );


    const prixUnitaire =
        Number(
            document.getElementById(
                "prixUnitaire"
            ).value
        );


    const statut =
        document.getElementById(
            "statut"
        ).value;


    const notes =
        document.getElementById(
            "notes"
        ).value.trim();


    /*==============================================
    VALIDATION
    ==============================================*/

    if (!date) {

        alert(
            "Veuillez sélectionner la date de l'achat."
        );

        return;

    }


    if (!fournisseurId) {

        alert(
            "Veuillez sélectionner un fournisseur."
        );

        return;

    }


    if (!produitId) {

        alert(
            "Veuillez sélectionner un produit."
        );

        return;

    }


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;

    }


    if (
        !Number.isFinite(prixUnitaire) ||
        prixUnitaire < 0
    ) {

        alert(
            "Le prix unitaire est invalide."
        );

        return;

    }


    /*==============================================
    CREER ACHAT
    ==============================================*/

    const achat =
        creerAchat({

            date:
                date,

            fournisseurId:
                fournisseurId,

            produitId:
                produitId,

            quantite:
                quantite,

            prixUnitaire:
                prixUnitaire,

            statut:
                statut,

            notes:
                notes,

            utilisateur:
                "Administrateur"

        });


    if (!achat) {

        return;

    }


    /*==============================================
    CONFIRMATION
    ==============================================*/

    alert(

        "Achat enregistré avec succès.\n\n" +

        "Référence : " +
        achat.reference +

        "\nMontant : " +

        Number(
            achat.montant
        ).toLocaleString(
            "fr-FR"
        ) +

        " FC"

    );


    /*==============================================
    RETOUR
    ==============================================*/

    window.location.href =
        "index.html";

}


/*====================================================
 EXPORT
====================================================*/

window.initialiserFormulaireAchat =
    initialiserFormulaireAchat;

window.chargerFournisseursAchat =
    chargerFournisseursAchat;

window.chargerProduitsAchat =
    chargerProduitsAchat;

window.afficherStockProduitAchat =
    afficherStockProduitAchat;

window.calculerMontantAchat =
    calculerMontantAchat;

window.enregistrerNouvelAchat =
    enregistrerNouvelAchat;


/*====================================================
 FIN
====================================================*/

console.log(
    "Formulaire nouvel achat prêt."
);

/*====================================================
 MODIFICATION D'UN ACHAT
====================================================*/

function initialiserFormulaireModificationAchat() {

    const formulaire =
        document.getElementById("achatForm");

    if (!formulaire) return;


    /*================================================
      RECUPERER ID
    =================================================*/

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        Number(
            params.get("id")
        );


    if (!id) {

        alert(
            "Identifiant de l'achat invalide."
        );

        window.location.href =
            "index.html";

        return;

    }


    /*================================================
      RECUPERER ACHAT
    =================================================*/

    const achats =
        obtenirAchats();

    const achat =
        achats.find(
            a =>
                Number(a.id) === id
        );


    if (!achat) {

        alert(
            "Achat introuvable."
        );

        window.location.href =
            "index.html";

        return;

    }


    /*================================================
      REFERENCE
    =================================================*/

    const reference =
        document.getElementById(
            "referenceAchatPreview"
        );

    if (reference) {

        reference.textContent =
            achat.reference || "-";

    }


    /*================================================
      DATE
    =================================================*/

    const date =
        document.getElementById("date");

    if (date) {

        date.value =
            achat.date || "";

    }


    /*================================================
      STATUT
    =================================================*/

    const statut =
        document.getElementById("statut");

    if (statut) {

        statut.value =
            achat.statut || "Validé";

    }


    /*================================================
      FOURNISSEURS
    =================================================*/

    chargerFournisseursAchat();

    const fournisseur =
        document.getElementById(
            "fournisseurId"
        );

    if (fournisseur) {

        fournisseur.value =
            String(
                achat.fournisseurId
            );

    }


    /*================================================
      PRODUITS
    =================================================*/

    chargerProduitsAchat();

    const produit =
        document.getElementById(
            "produitId"
        );

    if (produit) {

        produit.value =
            String(
                achat.produitId
            );

    }


    /*================================================
      STOCK
    =================================================*/

    afficherStockProduitAchat();


    /*================================================
      QUANTITE
    =================================================*/

    const quantite =
        document.getElementById(
            "quantite"
        );

    if (quantite) {

        quantite.value =
            achat.quantite || "";

    }


    /*================================================
      PRIX
    =================================================*/

    const prix =
        document.getElementById(
            "prixUnitaire"
        );

    if (prix) {

        prix.value =
            achat.prixUnitaire || "";

    }


    /*================================================
      NOTES
    =================================================*/

    const notes =
        document.getElementById(
            "notes"
        );

    if (notes) {

        notes.value =
            achat.notes || "";

    }


    /*================================================
      CALCUL INITIAL
    =================================================*/

    calculerMontantAchat();


    /*================================================
      EVENEMENTS
    =================================================*/

    if (quantite) {

        quantite.addEventListener(
            "input",
            calculerMontantAchat
        );

    }


    if (prix) {

        prix.addEventListener(
            "input",
            calculerMontantAchat
        );

    }


    if (produit) {

        produit.addEventListener(
            "change",
            afficherStockProduitAchat
        );

    }


    /*================================================
      ENREGISTREMENT
    =================================================*/

    formulaire.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            modifierAchatEnregistre(id);

        }
    );

}


/*====================================================
 ENREGISTRER MODIFICATION
====================================================*/

function modifierAchatEnregistre(id) {

    const achats =
        obtenirAchats();


    const index =
        achats.findIndex(
            a =>
                Number(a.id) ===
                Number(id)
        );


    if (index === -1) {

        alert(
            "Achat introuvable."
        );

        return;

    }


    const ancienAchat =
        achats[index];


    /*================================================
      RECUPERATION
    =================================================*/

    const date =
        document.getElementById(
            "date"
        ).value;


    const fournisseurId =
        document.getElementById(
            "fournisseurId"
        ).value;


    const produitId =
        document.getElementById(
            "produitId"
        ).value;


    const quantite =
        Number(
            document.getElementById(
                "quantite"
            ).value
        );


    const prixUnitaire =
        Number(
            document.getElementById(
                "prixUnitaire"
            ).value
        );


    const statut =
        document.getElementById(
            "statut"
        ).value;


    const notes =
        document.getElementById(
            "notes"
        ).value.trim();


    /*================================================
      VALIDATION
    =================================================*/

    if (!date) {

        alert(
            "Veuillez sélectionner la date."
        );

        return;

    }


    if (!fournisseurId) {

        alert(
            "Veuillez sélectionner un fournisseur."
        );

        return;

    }


    if (!produitId) {

        alert(
            "Veuillez sélectionner un produit."
        );

        return;

    }


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;

    }


    if (
        !Number.isFinite(prixUnitaire) ||
        prixUnitaire < 0
    ) {

        alert(
            "Le prix unitaire est invalide."
        );

        return;

    }


    /*================================================
      DONNEES
    =================================================*/

    const fournisseurs =
        JSON.parse(
            localStorage.getItem(
                "fournisseurs"
            )
        ) || [];


    const produits =
        JSON.parse(
            localStorage.getItem(
                "produits"
            )
        ) || [];


    const nouveauFournisseur =
        fournisseurs.find(
            f =>
                Number(f.id) ===
                Number(fournisseurId)
        );


    const nouveauProduit =
        produits.find(
            p =>
                Number(p.id) ===
                Number(produitId)
        );


    if (!nouveauFournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        return;

    }


    if (!nouveauProduit) {

        alert(
            "Produit introuvable."
        );

        return;

    }


    /*================================================
      CONFIRMATION
    =================================================*/

    const confirmation =
        confirm(

            "Voulez-vous enregistrer les modifications de " +
            ancienAchat.reference +
            " ?\n\n" +

            "Ancienne quantité : " +
            ancienAchat.quantite +
            "\n" +

            "Nouvelle quantité : " +
            quantite

        );


    if (!confirmation) {

        return;

    }


    /*================================================
      IMPACT STOCK
    =================================================*/

    const ancienValide =
        (ancienAchat.statut || "Validé")
        === "Validé";


    const nouveauValide =
        statut === "Validé";


    const ancienProduitIndex =
        produits.findIndex(
            p =>
                Number(p.id) ===
                Number(ancienAchat.produitId)
        );


    const nouveauProduitIndex =
        produits.findIndex(
            p =>
                Number(p.id) ===
                Number(produitId)
        );


    /*================================================
      CAS 1 :
      ANCIEN VALIDÉ + MÊME PRODUIT
    =================================================*/

    if (
        ancienValide &&
        nouveauValide &&
        Number(ancienAchat.produitId) ===
        Number(produitId)
    ) {

        const difference =
            quantite -
            Number(
                ancienAchat.quantite || 0
            );


        if (
            nouveauProduitIndex !== -1
        ) {

            const stockActuel =
                Number(
                    produits[
                        nouveauProduitIndex
                    ].stock || 0
                );


            if (
                difference < 0 &&
                stockActuel <
                Math.abs(difference)
            ) {

                alert(

                    "Modification impossible.\n\n" +

                    "Le stock actuel est insuffisant " +
                    "pour diminuer cet achat."

                );

                return;

            }


            produits[
                nouveauProduitIndex
            ].stock =
                stockActuel +
                difference;

        }

    }


    /*================================================
      CAS 2 :
      ANCIEN VALIDÉ + NOUVEAU PRODUIT
    =================================================*/

    if (
        ancienValide &&
        nouveauValide &&
        Number(ancienAchat.produitId) !==
        Number(produitId)
    ) {

        /* Retirer ancien stock */

        if (
            ancienProduitIndex !== -1
        ) {

            const ancienStock =
                Number(
                    produits[
                        ancienProduitIndex
                    ].stock || 0
                );


            if (
                ancienStock <
                Number(
                    ancienAchat.quantite || 0
                )
            ) {

                alert(

                    "Modification impossible.\n\n" +

                    "Le stock actuel du produit " +
                    "d'origine est insuffisant " +
                    "pour retirer cette ancienne quantité."

                );

                return;

            }


            produits[
                ancienProduitIndex
            ].stock =
                ancienStock -
                Number(
                    ancienAchat.quantite || 0
                );

        }


        /* Ajouter nouveau stock */

        if (
            nouveauProduitIndex !== -1
        ) {

            const nouveauStock =
                Number(
                    produits[
                        nouveauProduitIndex
                    ].stock || 0
                );


            produits[
                nouveauProduitIndex
            ].stock =
                nouveauStock +
                quantite;

        }

    }


    /*================================================
      CAS 3 :
      ANCIEN BROUILLON -> VALIDÉ
    =================================================*/

    if (
        !ancienValide &&
        nouveauValide
    ) {

        if (
            nouveauProduitIndex !== -1
        ) {

            const stockActuel =
                Number(
                    produits[
                        nouveauProduitIndex
                    ].stock || 0
                );


            produits[
                nouveauProduitIndex
            ].stock =
                stockActuel +
                quantite;

        }

    }


    /*================================================
      CAS 4 :
      ANCIEN VALIDÉ -> BROUILLON
    =================================================*/

    if (
        ancienValide &&
        !nouveauValide
    ) {

        if (
            ancienProduitIndex !== -1
        ) {

            const stockActuel =
                Number(
                    produits[
                        ancienProduitIndex
                    ].stock || 0
                );


            const ancienneQuantite =
                Number(
                    ancienAchat.quantite || 0
                );


            if (
                stockActuel <
                ancienneQuantite
            ) {

                alert(

                    "Impossible de passer cet achat en brouillon.\n\n" +

                    "Le stock actuel est inférieur " +
                    "à la quantité de cet achat."

                );

                return;

            }


            produits[
                ancienProduitIndex
            ].stock =
                stockActuel -
                ancienneQuantite;

        }

    }


    /*================================================
      SAUVEGARDER PRODUITS
    =================================================*/

    localStorage.setItem(
        "produits",
        JSON.stringify(
            produits
        )
    );


    /*================================================
      NOUVELLES DONNEES ACHAT
    =================================================*/

    const montant =
        quantite *
        prixUnitaire;


    ancienAchat.date =
        date;


    ancienAchat.fournisseurId =
        nouveauFournisseur.id;


    ancienAchat.fournisseurNom =
        nouveauFournisseur.nom;


    ancienAchat.produitId =
        nouveauProduit.id;


    ancienAchat.produitNom =
        nouveauProduit.nom;


    ancienAchat.quantite =
        quantite;


    ancienAchat.prixUnitaire =
        prixUnitaire;


    ancienAchat.montant =
        montant;


    ancienAchat.statut =
        statut;


    ancienAchat.notes =
        notes;


    ancienAchat.dateModification =
        new Date().toISOString();


    /*================================================
      SAUVEGARDER ACHAT
    =================================================*/

    sauvegarderAchats(
        achats
    );


    /*================================================
      METTRE A JOUR LE MOUVEMENT DE STOCK
    =================================================*/

    const mouvements =
        JSON.parse(
            localStorage.getItem(
                "mouvementsStock"
            )
        ) || [];


    const mouvement =
        mouvements.find(
            m =>
                m.reference ===
                ancienAchat.reference
        );


    if (mouvement) {

        if (nouveauValide) {

            mouvement.date =
                date;

            mouvement.produitId =
                nouveauProduit.id;

            mouvement.produit =
                nouveauProduit.nom;

            mouvement.type =
                "Entrée";

            mouvement.nature =
                "Achat";

            mouvement.quantite =
                quantite;

            mouvement.prix =
                prixUnitaire;

            mouvement.montant =
                montant;

            mouvement.observation =
                "Entrée en stock suite à l'achat " +
                ancienAchat.reference;

        }
        else {

            mouvement.type =
                "Aucun";

            mouvement.nature =
                "Brouillon";

            mouvement.quantite =
                0;

            mouvement.montant =
                0;

            mouvement.observation =
                "Achat en brouillon : " +
                ancienAchat.reference;

        }

    }


    localStorage.setItem(
        "mouvementsStock",
        JSON.stringify(
            mouvements
        )
    );


    /*================================================
      FOURNISSEURS
    =================================================*/

    /*
      Pour éviter de doubler les statistiques
      du fournisseur, on recalcule les statistiques
      à partir des achats validés.
    */

    fournisseurs.forEach(
        fournisseur => {

            fournisseur.nombreAchats = 0;

            fournisseur.totalAchats = 0;

            fournisseur.derniereCommande = null;

        }
    );


    achats.forEach(
        achat => {

            if (
                (achat.statut || "Validé")
                !== "Validé"
            ) {

                return;

            }


            const fournisseur =
                fournisseurs.find(
                    f =>
                        Number(f.id) ===
                        Number(
                            achat.fournisseurId
                        )
                );


            if (!fournisseur) {

                return;

            }


            fournisseur.nombreAchats =
                Number(
                    fournisseur.nombreAchats || 0
                ) + 1;


            fournisseur.totalAchats =
                Number(
                    fournisseur.totalAchats || 0
                ) +
                Number(
                    achat.montant || 0
                );


            fournisseur.derniereCommande =
                achat.date;

        }
    );


    localStorage.setItem(
        "fournisseurs",
        JSON.stringify(
            fournisseurs
        )
    );


    /*================================================
      CONFIRMATION
    =================================================*/

    alert(

        "Achat modifié avec succès.\n\n" +

        "Référence : " +
        ancienAchat.reference +
        "\n" +

        "Nouvelle quantité : " +
        quantite +
        "\n" +

        "Nouveau montant : " +
        montant.toLocaleString(
            "fr-FR"
        ) +
        " FC"

    );


    /*================================================
      RETOUR
    =================================================*/

    window.location.href =
        "index.html";

}


/*====================================================
 EXPORT
====================================================*/

window.initialiserFormulaireModificationAchat =
    initialiserFormulaireModificationAchat;

window.modifierAchatEnregistre =
    modifierAchatEnregistre;
