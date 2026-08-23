/*==================================================
FERME ASHER ERP
EMPLOYES.JS
GESTION DES EMPLOYÉS
VERSION 1.0
==================================================*/


/*==================================================
CLÉ LOCALSTORAGE
==================================================*/

const CLE_EMPLOYES = "employes";


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initialiserNouvelEmploye();

        chargerEmployes();

    }
);


/*==================================================
OBTENIR LES EMPLOYÉS
==================================================*/

function obtenirEmployes() {

    return JSON.parse(
        localStorage.getItem(
            CLE_EMPLOYES
        )
    ) || [];

}


/*==================================================
ENREGISTRER LES EMPLOYÉS
==================================================*/

function enregistrerEmployes(employes) {

    localStorage.setItem(
        CLE_EMPLOYES,
        JSON.stringify(
            employes
        )
    );

}


/*==================================================
GÉNÉRER UN MATRICULE
EXEMPLE : EMP-0001
==================================================*/

function genererMatricule() {

    const employes =
        obtenirEmployes();


    let numero =
        employes.length + 1;


    let matricule =
        "EMP-" +
        String(numero).padStart(
            4,
            "0"
        );


    const matriculesExistants =
        employes.map(
            employe =>
                employe.matricule
        );


    while (
        matriculesExistants.includes(
            matricule
        )
    ) {

        numero++;

        matricule =
            "EMP-" +
            String(numero).padStart(
                4,
                "0"
            );

    }


    return matricule;

}


/*==================================================
GÉNÉRER ID UNIQUE
==================================================*/

function genererIdEmploye() {

    return "EMPLOYEE-" +
        Date.now();

}


/*==================================================
INITIALISER LE FORMULAIRE
NOUVEL EMPLOYÉ
==================================================*/

function initialiserNouvelEmploye() {

    const formulaire =
        document.getElementById(
            "employeForm"
        );


    if (!formulaire) {

        return;

    }


    formulaire.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nom =
                document.getElementById(
                    "nomEmploye"
                ).value.trim();


            const telephone =
                document.getElementById(
                    "telephoneEmploye"
                ).value.trim();


            const fonction =
                document.getElementById(
                    "fonctionEmploye"
                ).value.trim();


            const poste =
                document.getElementById(
                    "posteEmploye"
                ).value.trim();


            const statut =
                document.getElementById(
                    "statutEmploye"
                ).value;


            /*------------------------------------------
            VALIDATION
            ------------------------------------------*/

            if (!nom) {

                alert(
                    "Veuillez saisir le nom de l'employé."
                );

                return;

            }


            if (!fonction) {

                alert(
                    "Veuillez saisir la fonction de l'employé."
                );

                return;

            }


            const employes =
                obtenirEmployes();


            const nouvelEmploye = {

                id:
                    genererIdEmploye(),

                matricule:
                    genererMatricule(),

                nom:
                    nom,

                telephone:
                    telephone,

                fonction:
                    fonction,

                poste:
                    poste,

                statut:
                    statut,

                dateCreation:
                    new Date()
                    .toISOString()

            };


            employes.push(
                nouvelEmploye
            );


            enregistrerEmployes(
                employes
            );


            alert(
                "Employé créé avec succès.\n\n" +
                "Matricule : " +
                nouvelEmploye.matricule
            );


            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
CHARGER LA LISTE DES EMPLOYÉS
==================================================*/

function chargerEmployes() {

    const tbody =
        document.getElementById(
            "tableEmployes"
        );


    if (!tbody) {

        return;

    }


    const employes =
        obtenirEmployes();


    tbody.innerHTML = "";


    if (
        employes.length === 0
    ) {

        tbody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="text-center text-muted"
            >

                Aucun employé enregistré.

            </td>

        </tr>

        `;


        chargerStatistiquesEmployes();

        return;

    }


    employes.forEach(
        function (employe) {

            let classeStatut =
                "secondary";


            if (
                employe.statut ===
                "Actif"
            ) {

                classeStatut =
                    "success";

            }


            if (
                employe.statut ===
                "Inactif"
            ) {

                classeStatut =
                    "secondary";

            }


            tbody.innerHTML += `

            <tr>

                <td>

                    ${employe.matricule}

                </td>


                <td>

                    <strong>

                        ${employe.nom}

                    </strong>

                </td>


                <td>

                    ${employe.telephone || "-"}

                </td>


                <td>

                    ${employe.fonction}

                </td>


                <td>

                    ${employe.poste || "-"}

                </td>


                <td>

                    <span
                        class="
                            badge
                            bg-${classeStatut}
                        "
                    >

                        ${employe.statut}

                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="
                            btn
                            btn-sm
                            btn-warning
                        "
                        onclick="
                            changerStatutEmploye(
                                '${employe.id}'
                            )
                        "
                        title="
                            Changer le statut
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-arrows-rotate
                            "
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="
                            btn
                            btn-sm
                            btn-danger
                        "
                        onclick="
                            supprimerEmploye(
                                '${employe.id}'
                            )
                        "
                        title="
                            Supprimer
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


    chargerStatistiquesEmployes();

}


/*==================================================
STATISTIQUES DES EMPLOYÉS
==================================================*/

function chargerStatistiquesEmployes() {

    const employes =
        obtenirEmployes();


    const total =
        employes.length;


    const actifs =
        employes.filter(
            employe =>
                employe.statut ===
                "Actif"
        ).length;


    const inactifs =
        employes.filter(
            employe =>
                employe.statut ===
                "Inactif"
        ).length;


    const totalElement =
        document.getElementById(
            "nbTotalEmployes"
        );


    const actifsElement =
        document.getElementById(
            "nbEmployesActifs"
        );


    const inactifsElement =
        document.getElementById(
            "nbEmployesInactifs"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (actifsElement) {

        actifsElement.textContent =
            actifs;

    }


    if (inactifsElement) {

        inactifsElement.textContent =
            inactifs;

    }

}


/*==================================================
CHANGER LE STATUT
ACTIF <-> INACTIF
==================================================*/

function changerStatutEmploye(id) {

    const employes =
        obtenirEmployes();


    const employe =
        employes.find(
            e =>
                e.id === id
        );


    if (!employe) {

        alert(
            "Employé introuvable."
        );

        return;

    }


    if (
        employe.statut ===
        "Actif"
    ) {

        employe.statut =
            "Inactif";

    }

    else {

        employe.statut =
            "Actif";

    }


    enregistrerEmployes(
        employes
    );


    chargerEmployes();

}


/*==================================================
SUPPRIMER EMPLOYÉ
==================================================*/

function supprimerEmploye(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cet employé ?"
        );


    if (!confirmation) {

        return;

    }


    let employes =
        obtenirEmployes();


    employes =
        employes.filter(
            employe =>
                employe.id !== id
        );


    enregistrerEmployes(
        employes
    );


    chargerEmployes();

}


/*==================================================
OBTENIR UN EMPLOYÉ PAR ID
Cette fonction sera utilisée plus tard
dans Projets et Tâches.
==================================================*/

function obtenirEmployeParId(id) {

    const employes =
        obtenirEmployes();


    return employes.find(
        employe =>
            employe.id === id
    );

}


/*==================================================
OBTENIR UNIQUEMENT LES EMPLOYÉS ACTIFS
Cette fonction sera utilisée dans :
- Responsables
- Chantiers
- Projets
- Tâches
==================================================*/

function obtenirEmployesActifs() {

    const employes =
        obtenirEmployes();


    return employes.filter(
        employe =>
            employe.statut ===
            "Actif"
    );

}


/*==================================================
FIN
==================================================*/

console.log(
    "Module Employés chargé."
);
