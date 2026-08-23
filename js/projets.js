/*==================================================
FERME ASHER ERP
PROJETS.JS
GESTION DES PROJETS
==================================================*/

const CLE_PROJETS = "projets";


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerProjets();

        initialiserNouveauProjet();

    }
);


/*==================================================
OBTENIR LES PROJETS
==================================================*/

function obtenirProjets() {

    return JSON.parse(
        localStorage.getItem(CLE_PROJETS)
    ) || [];

}


/*==================================================
ENREGISTRER LES PROJETS
==================================================*/

function enregistrerProjets(projets) {

    localStorage.setItem(
        CLE_PROJETS,
        JSON.stringify(projets)
    );

}


/*==================================================
GÉNÉRER ID PROJET
==================================================*/

function genererIdProjet() {

    return "PROJ-" +
        Date.now();

}


/*==================================================
INITIALISER NOUVEAU PROJET
==================================================*/

function initialiserNouveauProjet() {

    const formulaire =
        document.getElementById(
            "projetForm"
        );


    if (!formulaire) {

        return;

    }


    const dateDebut =
        document.getElementById(
            "dateDebut"
        );


    if (
        dateDebut &&
        !dateDebut.value
    ) {

        dateDebut.value =
            new Date()
            .toISOString()
            .split("T")[0];

    }


    formulaire.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nom =
                document.getElementById(
                    "nomProjet"
                ).value.trim();


            const site =
                document.getElementById(
                    "siteProjet"
                ).value.trim();


            const responsable =
                document.getElementById(
                    "responsableProjet"
                ).value.trim();


            const dateDebut =
                document.getElementById(
                    "dateDebut"
                ).value;


            const dateFin =
                document.getElementById(
                    "dateFin"
                ).value;


            const budget =
                Number(
                    document.getElementById(
                        "budgetProjet"
                    ).value
                ) || 0;


            const description =
                document.getElementById(
                    "descriptionProjet"
                ).value.trim();


            if (!nom) {

                alert(
                    "Veuillez saisir le nom du projet."
                );

                return;

            }


            if (!site) {

                alert(
                    "Veuillez saisir le site ou le chantier."
                );

                return;

            }


            if (!responsable) {

                alert(
                    "Veuillez saisir le responsable."
                );

                return;

            }


            const projets =
                obtenirProjets();


            const nouveauProjet = {

                id:
                    genererIdProjet(),

                nom:
                    nom,

                site:
                    site,

                responsable:
                    responsable,

                dateDebut:
                    dateDebut,

                dateFin:
                    dateFin,

                budget:
                    budget,

                description:
                    description,

                statut:
                    "En cours",

                avancement:
                    0,

                dateCreation:
                    new Date()
                    .toISOString()

            };


            projets.push(
                nouveauProjet
            );


            enregistrerProjets(
                projets
            );


            alert(
                "Projet créé avec succès."
            );


            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
CHARGER LA LISTE DES PROJETS
==================================================*/

function chargerProjets() {

    const tbody =
        document.getElementById(
            "tableProjets"
        );


    if (!tbody) {

        return;

    }


    const projets =
        obtenirProjets();


    tbody.innerHTML = "";


    if (
        projets.length === 0
    ) {

        tbody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="text-center text-muted"
            >

                Aucun projet enregistré.

            </td>

        </tr>

        `;


        return;

    }


    projets.forEach(
        function (projet) {

            let badgeStatut =
                "secondary";


            if (
                projet.statut ===
                "En cours"
            ) {

                badgeStatut =
                    "primary";

            }


            if (
                projet.statut ===
                "Terminé"
            ) {

                badgeStatut =
                    "success";

            }


            if (
                projet.statut ===
                "Suspendu"
            ) {

                badgeStatut =
                    "warning";

            }


            tbody.innerHTML += `

            <tr>

                <td>

                    ${projet.id}

                </td>


                <td>

                    <strong>

                        ${projet.nom}

                    </strong>

                </td>


                <td>

                    ${projet.site}

                </td>


                <td>

                    ${projet.responsable}

                </td>


                <td>

                    ${projet.dateDebut || "-"}

                </td>


                <td>

                    ${projet.dateFin || "-"}

                </td>


                <td>

                    <div
                        class="progress"
                        style="height:20px;"
                    >

                        <div

                            class="progress-bar"

                            role="progressbar"

                            style="
                                width:
                                ${projet.avancement || 0}%
                            "

                        >

                            ${projet.avancement || 0}%

                        </div>

                    </div>

                </td>


                <td>

                    <span
                        class="
                        badge
                        bg-${badgeStatut}
                        "
                    >

                        ${projet.statut}

                    </span>

                </td>


                <td>

                    <a

                        href="
                        detail.html?id=${projet.id}
                        "

                        class="
                        btn
                        btn-sm
                        btn-success
                        "

                    >

                        <i
                            class="
                            fa-solid
                            fa-eye
                            "
                        ></i>

                    </a>


                    <button

                        class="
                        btn
                        btn-sm
                        btn-danger
                        "

                        onclick="
                        supprimerProjet(
                        '${projet.id}'
                        )
                        "

                    >

                        <i
                            class="
                            fa-solid
                            fa-trash
                            "
                        ></i>

                    </button>

                </td>

            </tr>

            `;

        }
    );

}


/*==================================================
SUPPRIMER PROJET
==================================================*/

function supprimerProjet(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce projet ?"
        );


    if (!confirmation) {

        return;

    }


    let projets =
        obtenirProjets();


    projets =
        projets.filter(
            projet =>
                projet.id !== id
        );


    enregistrerProjets(
        projets
    );


    chargerProjets();

}


/*==================================================
OBTENIR UN PROJET
==================================================*/

function obtenirProjetParId(id) {

    const projets =
        obtenirProjets();


    return projets.find(
        projet =>
            projet.id === id
    );

}


/*==================================================
METTRE À JOUR AVANCEMENT
==================================================*/

function mettreAJourAvancementProjet(
    projetId
) {

    const projets =
        obtenirProjets();


    const taches =
        JSON.parse(
            localStorage.getItem(
                "taches"
            )
        ) || [];


    const tachesProjet =
        taches.filter(
            tache =>
                tache.projetId === projetId
        );


    const projet =
        projets.find(
            projet =>
                projet.id === projetId
        );


    if (!projet) {

        return;

    }


    if (
        tachesProjet.length === 0
    ) {

        projet.avancement = 0;

    }

    else {

        let total =
            0;


        tachesProjet.forEach(
            tache => {

                total +=
                    Number(
                        tache.avancement
                    ) || 0;

            }
        );


        projet.avancement =
            Math.round(
                total /
                tachesProjet.length
            );

    }


    if (
        projet.avancement >= 100
    ) {

        projet.statut =
            "Terminé";

    }


    enregistrerProjets(
        projets
    );

}


/*==================================================
DETAIL DU PROJET
==================================================*/

function chargerDetailProjet() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        return;

    }


    const projet =
        obtenirProjetParId(id);


    if (!projet) {

        alert(
            "Projet introuvable."
        );

        return;

    }


    const nom =
        document.getElementById(
            "detailNomProjet"
        );


    if (nom) {

        nom.textContent =
            projet.nom;

    }


    const site =
        document.getElementById(
            "detailSiteProjet"
        );


    if (site) {

        site.textContent =
            projet.site;

    }


    const responsable =
        document.getElementById(
            "detailResponsableProjet"
        );


    if (responsable) {

        responsable.textContent =
            projet.responsable;

    }


    const avancement =
        document.getElementById(
            "detailAvancementProjet"
        );


    if (avancement) {

        avancement.textContent =
            projet.avancement +
            "%";

    }

}

/*==================================================
STATISTIQUES DES PROJETS
==================================================*/

function chargerStatistiquesProjets() {

    const projets =
        obtenirProjets();


    const total =
        projets.length;


    const enCours =
        projets.filter(
            projet =>
                projet.statut ===
                "En cours"
        ).length;


    const termines =
        projets.filter(
            projet =>
                projet.statut ===
                "Terminé"
        ).length;


    const suspendus =
        projets.filter(
            projet =>
                projet.statut ===
                "Suspendu"
        ).length;


    const elementTotal =
        document.getElementById(
            "nbTotalProjets"
        );

    const elementEnCours =
        document.getElementById(
            "nbProjetsEnCours"
        );

    const elementTermines =
        document.getElementById(
            "nbProjetsTermines"
        );

    const elementSuspendus =
        document.getElementById(
            "nbProjetsSuspendus"
        );


    if (elementTotal) {

        elementTotal.textContent =
            total;

    }


    if (elementEnCours) {

        elementEnCours.textContent =
            enCours;

    }


    if (elementTermines) {

        elementTermines.textContent =
            termines;

    }


    if (elementSuspendus) {

        elementSuspendus.textContent =
            suspendus;

    }

}

chargerStatistiquesProjets();

/*==================================================
FIN
==================================================*/

console.log(
    "Module Projets chargé."
);
