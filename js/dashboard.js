/*==================================================
FERME ASHER ERP
DASHBOARD.JS
VERSION 2.0
==================================================*/


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    masquerLoader();

    chargerDashboard();

    actualiserDate();

});


/*==================================================
LOADER
==================================================*/

function masquerLoader() {

    const loader =
        document.getElementById("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 700);

}


/*==================================================
DATE / CONNEXION
==================================================*/

function actualiserDate() {

    const date = new Date();

    console.log(
        "Dashboard chargé :",
        date.toLocaleString()
    );

}


/*==================================================
CHARGEMENT DU DASHBOARD
==================================================*/

function chargerDashboard() {

    chargerStatistiques();

    chargerNotifications();

    chargerActivites();

    initialiserGraphiques();

}


/*==================================================
STATISTIQUES
==================================================*/

function chargerStatistiques() {

    const ventes =
        JSON.parse(
            localStorage.getItem("ventes")
        ) || [];

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    const produits =
        JSON.parse(
            localStorage.getItem("produits")
        ) || [];

    let chiffreAffaires = 0;


    ventes.forEach(vente => {

        chiffreAffaires +=
            Number(vente.total || 0);

    });


    const kpiVentes =
        document.getElementById("kpiVentes");

    const kpiClients =
        document.getElementById("kpiClients");

    const kpiStock =
        document.getElementById("kpiStock");

    const kpiCA =
        document.getElementById("kpiCA");


    if (kpiVentes) {

        kpiVentes.textContent =
            ventes.length;

    }


    if (kpiClients) {

        kpiClients.textContent =
            clients.length;

    }


    if (kpiStock) {

        kpiStock.textContent =
            produits.length;

    }


    if (kpiCA) {

        kpiCA.textContent =
            chiffreAffaires
                .toLocaleString("fr-FR")
            + " FC";

    }

}


/*==================================================
NOTIFICATIONS
==================================================*/

function chargerNotifications() {

    const ventes =
        JSON.parse(
            localStorage.getItem("ventes")
        ) || [];


    if (ventes.length === 0) {

        console.log(
            "Aucune vente enregistrée."
        );

    } else {

        console.log(
            ventes.length +
            " vente(s) enregistrée(s)."
        );

    }

}


/*==================================================
ACTIVITÉS RÉCENTES
==================================================*/

function chargerActivites() {

    const tbody =
        document.getElementById(
            "recentActivities"
        );


    if (!tbody) return;


    const ventes =
        JSON.parse(
            localStorage.getItem("ventes")
        ) || [];


    tbody.innerHTML = "";


    if (ventes.length === 0) {

        tbody.innerHTML = `

        <tr>

            <td colspan="3"
                class="text-center text-muted">

                Aucune activité récente.

            </td>

        </tr>

        `;

        return;

    }


    ventes
        .slice()
        .reverse()
        .slice(0, 5)
        .forEach(vente => {


            tbody.innerHTML += `

            <tr>

                <td>

                    ${vente.date || ""}

                </td>


                <td>

                    ${vente.client || ""}

                </td>


                <td>

                    Vente de
                    ${vente.produit || ""}

                </td>

            </tr>

            `;

        });

}


/*==================================================
GRAPHIQUE DES VENTES
==================================================*/

function initialiserGraphiques() {

    const ventes =
        JSON.parse(
            localStorage.getItem("ventes")
        ) || [];


    const mois = [

        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc"

    ];


    const totalMois =
        Array(12).fill(0);


    ventes.forEach(vente => {

        if (!vente.date) return;


        const parties =
            vente.date.split("-");


        if (parties.length !== 3) return;


        const moisVente =
            Number(parties[1]) - 1;


        if (
            moisVente >= 0 &&
            moisVente <= 11
        ) {

            totalMois[moisVente] +=
                Number(
                    vente.total || 0
                );

        }

    });


    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) return;


    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js n'est pas chargé."
        );

        return;

    }


    new Chart(canvas, {

        type: "bar",

        data: {

            labels: mois,

            datasets: [{

                label:
                    "Chiffre d'affaires",

                data:
                    totalMois

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true

        }

    });

}


/*==================================================
DÉCONNEXION
==================================================*/

function deconnexion() {

    localStorage.removeItem(
        "sessionERP"
    );

    window.location.href =
        "login.html";

}


/*==================================================
FIN
==================================================*/

console.log(
    "Ferme Asher ERP - Dashboard.js Version 2.0 chargé."
);
