/*==================================================
FERME ASHER ERP
TACHES.JS
GESTION DES TÂCHES
==================================================*/

const CLE_TACHES = "taches";


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerTaches();

        initialiserNouvelleTache();

    }
);


/*==================================================
OBTENIR TACHES
==================================================*/

function obtenirTaches() {

    return JSON.parse(
        localStorage.getItem(
            CLE_TACHES
        )
    ) || [];

}


/*==================================================
ENREGISTRER TACHES
==================================================*/

function enregistrerTaches(taches) {

    localStorage.setItem(
        CLE_TACHES,
        JSON.stringify(taches)
    );

}


/*==================================================
GÉNÉRER ID
==================================================*/

function genererIdTache() {

    return "TASK-" +
        Date.now();

}


/*==================================================
INITIALISER FORMULAIRE
==================================================*/

function initialiserNouvelleTache() {

    const formulaire =
        document.getElementById(
            "tacheForm"
        );


    if (!formulaire) {

        return;

    }


    formulaire.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const projetId =
                document.getElementById(
                    "projetId"
                ).value;


            const nom =
                document.getElementById(
                    "nomTache"
                ).value.trim();


            const employe =
                document.getElementById(
                    "employeTache"
                ).value.trim();


            const site =
                document.getElementById(
                    "siteTache"
                ).value.trim();


            const dateDebut =
                document.getElementById(
                    "dateDebutTache"
                ).value;


            const dateFin =
                document.getElementById(
                    "dateFinTache"
                ).value;


            const priorite =
                document.getElementById(
                    "prioriteTache"
                ).value;


            const description =
                document.getElementById(
                    "descriptionTache"
                ).value.trim();


            if (!nom) {

                alert(
                    "Veuillez saisir la tâche."
                );

                return;

            }


            if (!employe) {

                alert(
                    "Veuillez sélectionner un employé."
                );

                return;

            }


            const taches =
                obtenirTaches();


            const nouvelleTache = {

                id:
                    genererIdTache(),

                projetId:
                    projetId,

                nom:
                    nom,

                employe:
                    employe,

                site:
                    site,

                dateDebut:
                    dateDebut,

                dateFin:
                    dateFin,

                priorite:
                    priorite,

                description:
                    description,

                statut:
                    "À faire",

                avancement:
                    0,

                dateCreation:
                    new Date()
                    .toISOString()

            };


            taches.push(
                nouvelleTache
            );


            enregistrerTaches(
                taches
            );


            if (projetId) {

                mettreAJourAvancementProjet(
                    projetId
                );

            }


            alert(
                "Tâche créée avec succès."
            );


            window.history.back();

        }
    );

}


/*==================================================
CHARGER TÂCHES
==================================================*/

function chargerTaches() {

    const tbody =
        document.getElementById(
            "tableTaches"
        );


    if (!tbody) {

        return;

    }


    const taches =
        obtenirTaches();


    tbody.innerHTML = "";


    if (
        taches.length === 0
    ) {

        tbody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="text-center"
            >

                Aucune tâche enregistrée.

            </td>

        </tr>

        `;

        return;

    }


    taches.forEach(
        function (tache) {

            let badge =
                "secondary";


            if (
                tache.statut ===
                "En cours"
            ) {

                badge =
                    "primary";

            }


            if (
                tache.statut ===
                "Terminée"
            ) {

                badge =
                    "success";

            }


            if (
                tache.statut ===
                "En retard"
            ) {

                badge =
                    "danger";

            }


            tbody.innerHTML += `

            <tr>

                <td>

                    ${tache.nom}

                </td>


                <td>

                    ${tache.site || "-"}

                </td>


                <td>

                    ${tache.employe}

                </td>


                <td>

                    ${tache.dateDebut || "-"}

                </td>


                <td>

                    ${tache.dateFin || "-"}

                </td>


                <td>

                    <span
                        class="
                        badge
                        bg-info
                        "
                    >

                        ${tache.priorite}

                    </span>

                </td>


                <td>

                    <span
                        class="
                        badge
                        bg-${badge}
                        "
                    >

                        ${tache.statut}

                    </span>

                </td>


                <td>

                    ${tache.avancement}%

                </td>


                <td>

                    <button

                        class="
                        btn
                        btn-sm
                        btn-primary
                        "

                        onclick="
                        avancerTache(
                        '${tache.id}'
                        )
                        "

                    >

                        Avancer

                    </button>


                    <button

                        class="
                        btn
                        btn-sm
                        btn-danger
                        "

                        onclick="
                        supprimerTache(
                        '${tache.id}'
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
AVANCEMENT TÂCHE
==================================================*/

function avancerTache(id) {

    const taches =
        obtenirTaches();


    const tache =
        taches.find(
            t =>
                t.id === id
        );


    if (!tache) {

        return;

    }


    const valeur =
        prompt(
            "Indiquez l'avancement de 0 à 100 :",
            tache.avancement
        );


    if (
        valeur === null
    ) {

        return;

    }


    const avancement =
        Number(
            valeur
        );


    if (
        avancement < 0 ||
        avancement > 100 ||
        !Number.isFinite(
            avancement
        )
    ) {

        alert(
            "Veuillez saisir une valeur entre 0 et 100."
        );

        return;

    }


    tache.avancement =
        avancement;


    if (
        avancement === 0
    ) {

        tache.statut =
            "À faire";

    }


    else if (
        avancement < 100
    ) {

        tache.statut =
            "En cours";

    }


    else {

        tache.statut =
            "Terminée";

    }


    enregistrerTaches(
        taches
    );


    if (
        tache.projetId &&
        typeof mettreAJourAvancementProjet ===
        "function"
    ) {

        mettreAJourAvancementProjet(
            tache.projetId
        );

    }


    chargerTaches();

}


/*==================================================
SUPPRIMER TÂCHE
==================================================*/

function supprimerTache(id) {

    if (
        !confirm(
            "Supprimer cette tâche ?"
        )
    ) {

        return;

    }


    let taches =
        obtenirTaches();


    const tache =
        taches.find(
            t =>
                t.id === id
        );


    taches =
        taches.filter(
            t =>
                t.id !== id
        );


    enregistrerTaches(
        taches
    );


    if (
        tache &&
        tache.projetId &&
        typeof mettreAJourAvancementProjet ===
        "function"
    ) {

        mettreAJourAvancementProjet(
            tache.projetId
        );

    }


    chargerTaches();

}


/*==================================================
FIN
==================================================*/

console.log(
    "Module Tâches chargé."
);
