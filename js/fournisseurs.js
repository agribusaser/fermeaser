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
