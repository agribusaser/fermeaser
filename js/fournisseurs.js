/*====================================================
 FERME ASHER ERP
 FOURNISSEURS.JS
 VERSION 1.0
====================================================*/


/*====================================================
 INITIALISATION
====================================================*/

document.addEventListener("DOMContentLoaded", function () {

    initialiserFournisseurs();

});


/*====================================================
 INITIALISER MODULE FOURNISSEURS
====================================================*/

function initialiserFournisseurs() {

    const fournisseurs =
        obtenirFournisseurs();

    afficherStatistiquesFournisseurs(
        fournisseurs
    );

    afficherFournisseurs(
        fournisseurs
    );

    initialiserRecherche();

    initialiserFiltres();

    initialiserBoutonActualiser();

}


/*====================================================
 OBTENIR FOURNISSEURS
====================================================*/

function obtenirFournisseurs() {

    try {

        return JSON.parse(
            localStorage.getItem("fournisseurs")
        ) || [];

    }

    catch (erreur) {

        console.error(
            "Erreur lecture fournisseurs :",
            erreur
        );

        return [];

    }

}


/*====================================================
 SAUVEGARDER FOURNISSEURS
====================================================*/

function sauvegarderFournisseurs(
    fournisseurs
) {

    localStorage.setItem(
        "fournisseurs",
        JSON.stringify(fournisseurs)
    );

}


/*====================================================
 GENERER NUMERO FOURNISSEUR
====================================================*/

function genererNumeroFournisseur() {

    const fournisseurs =
        obtenirFournisseurs();

    let numero =
        fournisseurs.length + 1;

    let numeroFournisseur =
        "FOU" +
        String(numero).padStart(
            6,
            "0"
        );


    while (
        fournisseurs.some(
            fournisseur =>
            fournisseur.numeroFournisseur ===
            numeroFournisseur
        )
    ) {

        numero++;

        numeroFournisseur =
            "FOU" +
            String(numero).padStart(
                6,
                "0"
            );

    }


    return numeroFournisseur;

}


/*====================================================
 AFFICHER STATISTIQUES
====================================================*/

function afficherStatistiquesFournisseurs(
    fournisseurs
) {

    const total =
        fournisseurs.length;


    const actifs =
        fournisseurs.filter(
            fournisseur =>
            fournisseur.statut === "Actif"
        ).length;


    const avecProduits =
        fournisseurs.filter(
            fournisseur =>
            Number(
                fournisseur.nombreProduits || 0
            ) > 0
        ).length;


    const totalAchats =
        fournisseurs.reduce(
            (
                total,
                fournisseur
            ) => {

                return total +
                    Number(
                        fournisseur.totalAchats || 0
                    );

            },
            0
        );


    const elementTotal =
        document.getElementById(
            "totalFournisseurs"
        );

    const elementActifs =
        document.getElementById(
            "fournisseursActifs"
        );

    const elementProduits =
        document.getElementById(
            "fournisseursProduits"
        );

    const elementAchats =
        document.getElementById(
            "totalAchatsFournisseurs"
        );


    if (elementTotal) {

        elementTotal.textContent =
            total;

    }


    if (elementActifs) {

        elementActifs.textContent =
            actifs;

    }


    if (elementProduits) {

        elementProduits.textContent =
            avecProduits;

    }


    if (elementAchats) {

        elementAchats.textContent =
            totalAchats.toLocaleString(
                "fr-FR"
            ) + " FC";

    }

}


/*====================================================
 AFFICHER FOURNISSEURS
====================================================*/

function afficherFournisseurs(
    fournisseurs
) {

    const tableau =
        document.getElementById(
            "fournisseursTable"
        );

    if (!tableau) return;


    tableau.innerHTML = "";


    if (fournisseurs.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5"
                >

                    <i
                        class="fa-solid
                        fa-building-circle-xmark"
                        style="
                            font-size:40px;
                            color:#94A3B8;
                        "
                    ></i>

                    <div class="mt-3">

                        <strong>
                            Aucun fournisseur
                        </strong>

                    </div>

                    <div class="text-muted">

                        Commencez par ajouter
                        votre premier fournisseur.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    fournisseurs.forEach(
        fournisseur => {

            const ligne =
                document.createElement("tr");


            const statut =
                fournisseur.statut ||
                "Actif";


            const badgeStatut =
                statut === "Actif"

                ? `
                    <span class="badge bg-success">
                        Actif
                    </span>
                  `

                : `
                    <span class="badge bg-secondary">
                        Inactif
                    </span>
                  `;


            const nombreProduits =
                Number(
                    fournisseur.nombreProduits || 0
                );


            const totalAchats =
                Number(
                    fournisseur.totalAchats || 0
                );


            ligne.innerHTML = `

                <td>

                    <strong>
                        ${
                            fournisseur.numeroFournisseur
                            || "-"
                        }
                    </strong>

                </td>


                <td>

                    ${
                        fournisseur.nom
                        || "-"
                    }

                </td>


                <td>

                    ${
                        fournisseur.telephone
                        || "-"
                    }

                </td>


                <td>

                    ${
                        fournisseur.ville
                        || "-"
                    }

                </td>


                <td>

                    ${nombreProduits}

                </td>


                <td>

                    ${
                        totalAchats.toLocaleString(
                            "fr-FR"
                        )
                    }
                    FC

                </td>


                <td>

                    ${badgeStatut}

                </td>


                <td>

                    <button
                        class="btn btn-primary"
                        title="Voir"
                        onclick="
                            voirFournisseur(
                                ${fournisseur.id}
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
                            modifierFournisseur(
                                ${fournisseur.id}
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                    </button>


                    <button
                        class="btn btn-danger"
                        title="Supprimer"
                        onclick="
                            supprimerFournisseur(
                                ${fournisseur.id}
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-trash"
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

    const recherche =
        document.getElementById(
            "rechercheFournisseur"
        );

    if (!recherche) return;


    recherche.addEventListener(
        "input",
        appliquerFiltresFournisseurs
    );

}


/*====================================================
 FILTRE STATUT
====================================================*/

function initialiserFiltres() {

    const filtre =
        document.getElementById(
            "filtreStatut"
        );

    if (!filtre) return;


    filtre.addEventListener(
        "change",
        appliquerFiltresFournisseurs
    );

}


/*====================================================
 APPLIQUER FILTRES
====================================================*/

function appliquerFiltresFournisseurs() {

    const recherche =
        document.getElementById(
            "rechercheFournisseur"
        );


    const filtreStatut =
        document.getElementById(
            "filtreStatut"
        );


    const texte =
        recherche
        ? recherche.value
            .trim()
            .toLowerCase()
        : "";


    const statut =
        filtreStatut
        ? filtreStatut.value
        : "";


    const fournisseurs =
        obtenirFournisseurs();


    const resultats =
        fournisseurs.filter(
            fournisseur => {

                const correspondRecherche =

                    !texte ||

                    String(
                        fournisseur.nom || ""
                    )
                    .toLowerCase()
                    .includes(texte)

                    ||

                    String(
                        fournisseur.telephone || ""
                    )
                    .toLowerCase()
                    .includes(texte)

                    ||

                    String(
                        fournisseur.numeroFournisseur
                        || ""
                    )
                    .toLowerCase()
                    .includes(texte);


                const correspondStatut =

                    !statut ||

                    fournisseur.statut ===
                    statut;


                return (
                    correspondRecherche &&
                    correspondStatut
                );

            }
        );


    afficherFournisseurs(
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

            initialiserFournisseurs();

        }
    );

}


/*====================================================
 VOIR FOURNISSEUR
====================================================*/

function voirFournisseur(id) {

    window.location.href =
        "detail.html?id=" + id;

}


/*====================================================
 MODIFIER FOURNISSEUR
====================================================*/

function modifierFournisseur(id) {

    window.location.href =
        "modifier.html?id=" + id;

}


/*====================================================
 SUPPRIMER FOURNISSEUR
====================================================*/

function supprimerFournisseur(id) {

    const fournisseurs =
        obtenirFournisseurs();


    const fournisseur =
        fournisseurs.find(
            f => f.id === id
        );


    if (!fournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        return;

    }


    /*
    ================================================
    PROTECTION
    ================================================
    */

    if (
        Number(
            fournisseur.totalAchats || 0
        ) > 0
    ) {

        alert(
            "Ce fournisseur possède un historique " +
            "d'achats. Il ne peut pas être supprimé."
        );

        return;

    }


    const confirmation =
        confirm(

            "Voulez-vous vraiment supprimer " +

            fournisseur.nom +

            " (" +

            fournisseur.numeroFournisseur +

            ") ?"

        );


    if (!confirmation) return;


    const nouveauxFournisseurs =
        fournisseurs.filter(
            f => f.id !== id
        );


    sauvegarderFournisseurs(
        nouveauxFournisseurs
    );


    alert(
        "Fournisseur supprimé avec succès."
    );


    initialiserFournisseurs();

}


/*====================================================
 CREER FOURNISSEUR
====================================================*/

function creerFournisseur(
    donnees
) {

    const fournisseurs =
        obtenirFournisseurs();


    const telephone =
        String(
            donnees.telephone || ""
        )
        .trim();


    /*
    ================================================
    TELEPHONE UNIQUE
    ================================================
    */

    if (
        telephone &&
        fournisseurs.some(
            fournisseur =>
            fournisseur.telephone ===
            telephone
        )
    ) {

        alert(
            "Ce numéro de téléphone " +
            "est déjà associé à un fournisseur."
        );

        return false;

    }


    const fournisseur = {

        id: Date.now(),

        numeroFournisseur:
            genererNumeroFournisseur(),

        nom:
            String(
                donnees.nom || ""
            ).trim(),

        telephone:
            telephone,

        email:
            String(
                donnees.email || ""
            ).trim(),

        adresse:
            String(
                donnees.adresse || ""
            ).trim(),

        ville:
            String(
                donnees.ville || ""
            ).trim(),

        pays:
            String(
                donnees.pays || "RDC"
            ).trim(),

        type:
            donnees.type || "Entreprise",

        statut:
            donnees.statut || "Actif",

        produits:
            [],

        nombreProduits:
            0,

        totalAchats:
            0,

        nombreAchats:
            0,

        derniereCommande:
            null,

        dateCreation:
            new Date().toISOString(),

        notes:
            String(
                donnees.notes || ""
            ).trim()

    };


    fournisseurs.push(
        fournisseur
    );


    sauvegarderFournisseurs(
        fournisseurs
    );


    return fournisseur;

}


/*====================================================
 EXPORT
====================================================*/

window.obtenirFournisseurs =
    obtenirFournisseurs;

window.sauvegarderFournisseurs =
    sauvegarderFournisseurs;

window.genererNumeroFournisseur =
    genererNumeroFournisseur;

window.afficherFournisseurs =
    afficherFournisseurs;

window.afficherStatistiquesFournisseurs =
    afficherStatistiquesFournisseurs;

window.creerFournisseur =
    creerFournisseur;

window.voirFournisseur =
    voirFournisseur;

window.modifierFournisseur =
    modifierFournisseur;

window.supprimerFournisseur =
    supprimerFournisseur;


/*====================================================
 FIN
====================================================*/

console.log(
    "Module Fournisseurs chargé."
);

/*====================================================
 CREATION FOURNISSEUR
====================================================*/

function initialiserFormulaireFournisseur() {

    const formulaire =
        document.getElementById(
            "fournisseurForm"
        );

    if (!formulaire) return;


    formulaire.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            /*========================================
            RECUPERATION DES DONNEES
            ========================================*/

            const nom =
                document
                .getElementById("nom")
                .value
                .trim();


            const type =
                document
                .getElementById("type")
                .value;


            const telephone =
                document
                .getElementById("telephone")
                .value
                .trim();


            const email =
                document
                .getElementById("email")
                .value
                .trim();


            const adresse =
                document
                .getElementById("adresse")
                .value
                .trim();


            const ville =
                document
                .getElementById("ville")
                .value
                .trim();


            const pays =
                document
                .getElementById("pays")
                .value
                .trim();


            const statut =
                document
                .getElementById("statut")
                .value;


            const notes =
                document
                .getElementById("notes")
                .value
                .trim();


            /*========================================
            VALIDATION
            ========================================*/

            if (!nom) {

                alert(
                    "Veuillez saisir le nom du fournisseur."
                );

                return;

            }


            if (!telephone) {

                alert(
                    "Veuillez saisir le numéro de téléphone."
                );

                return;

            }


            /*========================================
            CREATION
            ========================================*/

            const fournisseur =
                creerFournisseur({

                    nom:
                        nom,

                    type:
                        type,

                    telephone:
                        telephone,

                    email:
                        email,

                    adresse:
                        adresse,

                    ville:
                        ville,

                    pays:
                        pays,

                    statut:
                        statut,

                    notes:
                        notes

                });


            /*========================================
            ECHEC
            ========================================*/

            if (!fournisseur) {

                return;

            }


            /*========================================
            CONFIRMATION
            ========================================*/

            alert(

                "Fournisseur créé avec succès.\n\n" +

                "Numéro fournisseur : " +

                fournisseur.numeroFournisseur

            );


            /*========================================
            RETOUR
            ========================================*/

            window.location.href =
                "index.html";

        }
    );

}


/*====================================================
 FIN CREATION FOURNISSEUR
====================================================*/

window.initialiserFormulaireFournisseur =
    initialiserFormulaireFournisseur;


console.log(
    "Création fournisseur prête."
);

/*====================================================
 CHARGER FOURNISSEUR A MODIFIER
====================================================*/

function chargerFournisseurModification() {

    const formulaire =
        document.getElementById(
            "modifierFournisseurForm"
        );

    if (!formulaire) return;


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get("id")
        );


    const fournisseurs =
        obtenirFournisseurs();


    const fournisseur =
        fournisseurs.find(
            f => f.id === id
        );


    if (!fournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        window.location.href =
            "index.html";

        return;

    }


    /*==============================================
    IDENTIFICATION
    ==============================================*/

    document.getElementById(
        "fournisseurId"
    ).value =
        fournisseur.id;


    document.getElementById(
        "numeroFournisseur"
    ).textContent =
        fournisseur.numeroFournisseur;


    document.getElementById(
        "nom"
    ).value =
        fournisseur.nom || "";


    document.getElementById(
        "type"
    ).value =
        fournisseur.type || "Entreprise";


    document.getElementById(
        "telephone"
    ).value =
        fournisseur.telephone || "";


    document.getElementById(
        "email"
    ).value =
        fournisseur.email || "";


    document.getElementById(
        "adresse"
    ).value =
        fournisseur.adresse || "";


    document.getElementById(
        "ville"
    ).value =
        fournisseur.ville || "";


    document.getElementById(
        "pays"
    ).value =
        fournisseur.pays || "RDC";


    document.getElementById(
        "statut"
    ).value =
        fournisseur.statut || "Actif";


    document.getElementById(
        "notes"
    ).value =
        fournisseur.notes || "";


    /*==============================================
    INFORMATIONS COMMERCIALES
    ==============================================*/

    document.getElementById(
        "nombreAchats"
    ).textContent =
        Number(
            fournisseur.nombreAchats || 0
        );


    document.getElementById(
        "totalAchats"
    ).textContent =
        Number(
            fournisseur.totalAchats || 0
        ).toLocaleString("fr-FR")
        + " FC";


    document.getElementById(
        "dateCreation"
    ).textContent =
        fournisseur.dateCreation

        ? new Date(
            fournisseur.dateCreation
        ).toLocaleDateString("fr-FR")

        : "-";

}


/*====================================================
 ENREGISTRER MODIFICATION
====================================================*/

const modifierFournisseurForm =
    document.getElementById(
        "modifierFournisseurForm"
    );


if (modifierFournisseurForm) {

    modifierFournisseurForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const fournisseurs =
                obtenirFournisseurs();


            const id =
                Number(
                    document.getElementById(
                        "fournisseurId"
                    ).value
                );


            const index =
                fournisseurs.findIndex(
                    fournisseur =>
                    fournisseur.id === id
                );


            if (index === -1) {

                alert(
                    "Fournisseur introuvable."
                );

                return;

            }


            const telephone =
                document
                .getElementById("telephone")
                .value
                .trim();


            /*======================================
            TELEPHONE UNIQUE
            ======================================*/

            const telephoneExiste =
                fournisseurs.some(
                    fournisseur =>

                    fournisseur.telephone ===
                    telephone &&

                    fournisseur.id !== id

                );


            if (telephoneExiste) {

                alert(
                    "Ce numéro de téléphone " +
                    "est déjà utilisé par un autre fournisseur."
                );

                return;

            }


            /*======================================
            MODIFICATION
            ======================================*/

            fournisseurs[index].nom =
                document
                .getElementById("nom")
                .value
                .trim();


            fournisseurs[index].type =
                document
                .getElementById("type")
                .value;


            fournisseurs[index].telephone =
                telephone;


            fournisseurs[index].email =
                document
                .getElementById("email")
                .value
                .trim();


            fournisseurs[index].adresse =
                document
                .getElementById("adresse")
                .value
                .trim();


            fournisseurs[index].ville =
                document
                .getElementById("ville")
                .value
                .trim();


            fournisseurs[index].pays =
                document
                .getElementById("pays")
                .value
                .trim();


            fournisseurs[index].statut =
                document
                .getElementById("statut")
                .value;


            fournisseurs[index].notes =
                document
                .getElementById("notes")
                .value
                .trim();


            /*======================================
            SAUVEGARDE
            ======================================*/

            sauvegarderFournisseurs(
                fournisseurs
            );


            alert(
                "Fournisseur modifié avec succès."
            );


            window.location.href =
                "index.html";

        }
    );

}


/*====================================================
 EXPORT
====================================================*/

window.chargerFournisseurModification =
    chargerFournisseurModification;


console.log(
    "Modification fournisseur prête."
);

/*====================================================
 DETAIL FOURNISSEUR
====================================================*/

function chargerDetailFournisseur() {

    const element =
        document.getElementById(
            "detailNom"
        );

    if (!element) return;


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get("id")
        );


    const fournisseurs =
        obtenirFournisseurs();


    const fournisseur =
        fournisseurs.find(
            f => f.id === id
        );


    if (!fournisseur) {

        alert(
            "Fournisseur introuvable."
        );

        window.location.href =
            "index.html";

        return;

    }


    /*==============================================
    IDENTITE
    ==============================================*/

    document.getElementById(
        "detailNom"
    ).textContent =
        fournisseur.nom || "-";


    document.getElementById(
        "detailNumero"
    ).textContent =
        fournisseur.numeroFournisseur || "-";


    document.getElementById(
        "infoNumero"
    ).textContent =
        fournisseur.numeroFournisseur || "-";


    document.getElementById(
        "infoNom"
    ).textContent =
        fournisseur.nom || "-";


    document.getElementById(
        "infoType"
    ).textContent =
        fournisseur.type || "-";


    document.getElementById(
        "infoTelephone"
    ).textContent =
        fournisseur.telephone || "-";


    document.getElementById(
        "infoEmail"
    ).textContent =
        fournisseur.email || "-";


    document.getElementById(
        "infoVille"
    ).textContent =
        fournisseur.ville || "-";


    document.getElementById(
        "infoAdresse"
    ).textContent =
        fournisseur.adresse || "-";


    document.getElementById(
        "infoPays"
    ).textContent =
        fournisseur.pays || "-";


    /*==============================================
    STATUT
    ==============================================*/

    const statut =
        fournisseur.statut || "Actif";


    const statutElement =
        document.getElementById(
            "detailStatut"
        );


    statutElement.textContent =
        statut;


    statutElement.className =
        statut === "Actif"

        ? "badge bg-success"

        : "badge bg-secondary";


    /*==============================================
    STATISTIQUES
    ==============================================*/

    const nombreAchats =
        Number(
            fournisseur.nombreAchats || 0
        );


    const totalAchats =
        Number(
            fournisseur.totalAchats || 0
        );


    const nombreProduits =
        Number(
            fournisseur.nombreProduits || 0
        );


    document.getElementById(
        "detailAchats"
    ).textContent =
        nombreAchats;


    document.getElementById(
        "detailTotalAchats"
    ).textContent =
        totalAchats.toLocaleString(
            "fr-FR"
        ) + " FC";


    document.getElementById(
        "detailProduits"
    ).textContent =
        nombreProduits;


    /*==============================================
    PRODUITS
    ==============================================*/

    afficherProduitsFournisseur(
        fournisseur
    );


    /*==============================================
    HISTORIQUE ACHATS
    ==============================================*/

    afficherHistoriqueAchatsFournisseur(
        fournisseur
    );


    /*==============================================
    NOTES
    ==============================================*/

    document.getElementById(
        "detailNotes"
    ).textContent =
        fournisseur.notes ||
        "Aucune note.";


    /*==============================================
    DATE CREATION
    ==============================================*/

    document.getElementById(
        "detailDateCreation"
    ).textContent =

        fournisseur.dateCreation

        ? new Date(
            fournisseur.dateCreation
        ).toLocaleDateString(
            "fr-FR"
        )

        : "-";


    /*==============================================
    MODIFIER
    ==============================================*/

    const btnModifier =
        document.getElementById(
            "btnModifier"
        );


    if (btnModifier) {

        btnModifier.onclick =
            function () {

                window.location.href =
                    "modifier.html?id=" +
                    id;

            };

    }


    /*==============================================
    SUPPRIMER
    ==============================================*/

    const btnSupprimer =
        document.getElementById(
            "btnSupprimer"
        );


    if (btnSupprimer) {

        btnSupprimer.onclick =
            function () {

                supprimerFournisseur(
                    id
                );

            };

    }

}


/*====================================================
 PRODUITS FOURNIS
====================================================*/

function afficherProduitsFournisseur(
    fournisseur
) {

    const conteneur =
        document.getElementById(
            "listeProduitsFournisseur"
        );


    if (!conteneur) return;


    const produits =
        fournisseur.produits || [];


    if (produits.length === 0) {

        conteneur.innerHTML = `

            <div class="text-muted">

                Aucun produit enregistré.

            </div>

        `;

        return;

    }


    conteneur.innerHTML = "";


    produits.forEach(
        produit => {

            conteneur.innerHTML += `

                <span
                    class="badge bg-success me-2 mb-2"
                >

                    ${
                        typeof produit === "string"
                        ? produit
                        : produit.nom || "-"
                    }

                </span>

            `;

        }
    );

}


/*====================================================
 HISTORIQUE ACHATS FOURNISSEUR
====================================================*/

function afficherHistoriqueAchatsFournisseur(
    fournisseur
) {

    const conteneur =
        document.getElementById(
            "historiqueAchatsFournisseur"
        );


    if (!conteneur) return;


    const achats =
        JSON.parse(
            localStorage.getItem("achats")
        ) || [];


    const achatsFournisseur =
        achats.filter(
            achat =>

            Number(
                achat.fournisseurId
            ) === Number(
                fournisseur.id
            )
        );


    if (achatsFournisseur.length === 0) {

        conteneur.innerHTML = `

            <div class="text-muted">

                Aucun achat enregistré.

            </div>

        `;

        return;

    }


    let html = `

        <div class="table-responsive">

            <table class="table table-hover">

                <thead class="table-success">

                    <tr>

                        <th>Date</th>

                        <th>Référence</th>

                        <th>Produit</th>

                        <th>Quantité</th>

                        <th>Montant</th>

                    </tr>

                </thead>

                <tbody>

    `;


    achatsFournisseur.forEach(
        achat => {

            html += `

                <tr>

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

                        ${
                            achat.reference || "-"
                        }

                    </td>

                    <td>

                        ${
                            achat.produitNom || "-"
                        }

                    </td>

                    <td>

                        ${
                            achat.quantite || 0
                        }

                    </td>

                    <td>

                        ${
                            Number(
                                achat.montant || 0
                            ).toLocaleString(
                                "fr-FR"
                            )
                        }

                        FC

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    conteneur.innerHTML =
        html;

}


/*====================================================
 EXPORT
====================================================*/

window.chargerDetailFournisseur =
    chargerDetailFournisseur;

window.afficherProduitsFournisseur =
    afficherProduitsFournisseur;

window.afficherHistoriqueAchatsFournisseur =
    afficherHistoriqueAchatsFournisseur;


/*====================================================
 FIN
====================================================*/

console.log(
    "Fiche fournisseur prête."
);

