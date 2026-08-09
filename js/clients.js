/*==================================================
FERME ASHER ERP
CLIENTS.JS
VERSION 1.0
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    chargerClients();

    initialiserRecherche();

    initialiserFiltres();

});

/*==================================================
CHARGER CLIENTS
==================================================*/

function chargerClients(){

    const table =
        document.getElementById("clientsTable");

    if(!table) return;

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    table.innerHTML = "";

    clients.forEach(client => {

        const commandes =
            Number(client.nombreCommandes || 0);

        const totalAchats =
            Number(client.totalAchats || 0);

        const statut =
            client.statut || "Actif";

        const badge =
            statut === "Actif"
            ? "success"
            : "secondary";

        table.innerHTML += `

        <tr>

            <td>

                <strong>

                    ${client.numeroClient}

                </strong>

            </td>

            <td>

                ${client.nom}

            </td>

            <td>

                ${client.telephone}

            </td>

            <td>

                ${client.source || "ERP"}

            </td>

            <td>

                ${commandes}

            </td>

            <td>

                ${totalAchats.toLocaleString("fr-FR")} FC

            </td>

            <td>

                <span class="badge bg-${badge}">

                    ${statut}

                </span>

            </td>

            <td>

                <button

                    class="btn btn-primary btn-sm"

                    onclick="voirClient(${client.id})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button

                    class="btn btn-warning btn-sm"

                    onclick="modifierClient(${client.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="supprimerClient(${client.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    mettreAJourStatistiquesClients();

}

/*==================================================
STATISTIQUES CLIENTS
==================================================*/

function mettreAJourStatistiquesClients(){

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    let actifs = 0;

    let nouveaux = 0;

    let clientsCommandes = 0;

    const maintenant = new Date();

    clients.forEach(client => {

        if(client.statut === "Actif"){

            actifs++;

        }

        if(client.dateInscription){

            const date =
                new Date(client.dateInscription);

            const difference =
                maintenant - date;

            const jours =
                difference /
                (1000 * 60 * 60 * 24);

            if(jours <= 30){

                nouveaux++;

            }

        }

        if(
            Number(client.nombreCommandes || 0) > 0
        ){

            clientsCommandes++;

        }

    });

    const total =
        document.getElementById("totalClients");

    const actifsElement =
        document.getElementById("clientsActifs");

    const nouveauxElement =
        document.getElementById("nouveauxClients");

    const commandesElement =
        document.getElementById("clientsCommandes");

    if(total){

        total.textContent =
            clients.length;

    }

    if(actifsElement){

        actifsElement.textContent =
            actifs;

    }

    if(nouveauxElement){

        nouveauxElement.textContent =
            nouveaux;

    }

    if(commandesElement){

        commandesElement.textContent =
            clientsCommandes;

    }

}

/*==================================================
RECHERCHE CLIENT
==================================================*/

function initialiserRecherche(){

    const champ =
        document.getElementById(
            "rechercheClient"
        );

    if(!champ) return;

    champ.addEventListener(
        "input",
        appliquerFiltresClients
    );

}

/*==================================================
FILTRES CLIENTS
==================================================*/

function initialiserFiltres(){

    const statut =
        document.getElementById(
            "filtreStatut"
        );

    const inscription =
        document.getElementById(
            "filtreInscription"
        );

    if(statut){

        statut.addEventListener(
            "change",
            appliquerFiltresClients
        );

    }

    if(inscription){

        inscription.addEventListener(
            "change",
            appliquerFiltresClients
        );

    }

}


/*==================================================
APPLIQUER LES FILTRES
==================================================*/

function appliquerFiltresClients(){

    const recherche =
        (
            document.getElementById(
                "rechercheClient"
            )?.value || ""
        ).toLowerCase();

    const statut =
        document.getElementById(
            "filtreStatut"
        )?.value || "";

    const inscription =
        document.getElementById(
            "filtreInscription"
        )?.value || "";

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    const filtres =
        clients.filter(client => {

            const texte = `

                ${client.numeroClient}

                ${client.nom}

                ${client.telephone}

            `.toLowerCase();

            const rechercheOK =
                texte.includes(recherche);

            const statutOK =
                !statut ||
                client.statut === statut;

            const inscriptionOK =
                !inscription ||
                client.source === inscription;

            return (

                rechercheOK &&
                statutOK &&
                inscriptionOK

            );

        });

    afficherClients(filtres);

}

/*==================================================
AFFICHER CLIENTS
==================================================*/

function afficherClients(clients){

    const table =
        document.getElementById(
            "clientsTable"
        );

    if(!table) return;

    table.innerHTML = "";

    clients.forEach(client => {

        const statut =
            client.statut || "Actif";

        const badge =
            statut === "Actif"
            ? "success"
            : "secondary";

        table.innerHTML += `

        <tr>

            <td>

                <strong>

                    ${client.numeroClient}

                </strong>

            </td>

            <td>${client.nom}</td>

            <td>${client.telephone}</td>

            <td>${client.source || "ERP"}</td>

            <td>

                ${Number(
                    client.nombreCommandes || 0
                )}

            </td>

            <td>

                ${Number(
                    client.totalAchats || 0
                ).toLocaleString("fr-FR")} FC

            </td>

            <td>

                <span class="badge bg-${badge}">

                    ${statut}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-primary btn-sm"
                    onclick="voirClient(${client.id})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    class="btn btn-warning btn-sm"
                    onclick="modifierClient(${client.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="supprimerClient(${client.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

/*==================================================
VOIR CLIENT
==================================================*/

function voirClient(id){

    window.location.href =
        "detail.html?id=" + id;

}


/*==================================================
MODIFIER CLIENT
==================================================*/

function modifierClient(id){

    window.location.href =
        "modifier.html?id=" + id;

}


/*==================================================
SUPPRIMER CLIENT
==================================================*/

function supprimerClient(id){

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce client ?"
        );

    if(!confirmation) return;

    let clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    clients =
        clients.filter(
            client => client.id !== id
        );

    localStorage.setItem(
        "clients",
        JSON.stringify(clients)
    );

    chargerClients();

}


/*==================================================
FIN
==================================================*/

console.log(
    "Module Clients chargé."
);
