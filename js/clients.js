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

/*==================================================
GENERER NUMERO CLIENT
==================================================*/

function genererNumeroClient(){

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    let numero = clients.length + 1;

    let numeroClient =
        "CLI" +
        String(numero).padStart(6, "0");

    // Sécurité : éviter un doublon
    while(
        clients.some(
            client =>
            client.numeroClient === numeroClient
        )
    ){

        numero++;

        numeroClient =
            "CLI" +
            String(numero).padStart(6, "0");

    }

    return numeroClient;

}

/*==================================================
PREVISUALISER NUMERO CLIENT
==================================================*/

function previsualiserNumeroClient(){

    const preview =
        document.getElementById(
            "numeroClientPreview"
        );

    if(!preview) return;

    preview.textContent =
        genererNumeroClient();

}

/*==================================================
CREATION CLIENT
==================================================*/

const clientForm =
    document.getElementById("clientForm");

if(clientForm){

    clientForm.addEventListener(
        "submit",
        function(e){

            e.preventDefault();

            let clients =
                JSON.parse(
                    localStorage.getItem("clients")
                ) || [];

            const nom =
                document
                .getElementById("nom")
                .value
                .trim();

            const telephone =
                document
                .getElementById("telephone")
                .value
                .trim();

            const adresse =
                document
                .getElementById("adresse")
                .value
                .trim();

            const email =
                document
                .getElementById("email")
                .value
                .trim();

            const source =
                document
                .getElementById("source")
                .value;

            const statut =
                document
                .getElementById("statut")
                .value;

            const notes =
                document
                .getElementById("notes")
                .value
                .trim();


            /*======================================
            VERIFICATION TELEPHONE
            ======================================*/

            const telephoneExiste =
                clients.some(
                    client =>
                    client.telephone === telephone
                );

            if(telephoneExiste){

                alert(
                    "Ce numéro de téléphone est déjà enregistré."
                );

                return;

            }


            /*======================================
            NUMERO CLIENT
            ======================================*/

            const numeroClient =
                genererNumeroClient();


            /*======================================
            CREATION
            ======================================*/

            const client = {

                id: Date.now(),

                numeroClient: numeroClient,

                nom: nom,

                telephone: telephone,

                adresse: adresse,

                email: email,

                source: source,

                statut: statut,

                dateInscription:
                    new Date().toISOString(),

                nombreCommandes: 0,

                totalAchats: 0,

                derniereCommande: null,

                notes: notes

            };


            /*======================================
            ENREGISTREMENT
            ======================================*/

            clients.push(client);

            localStorage.setItem(

                "clients",

                JSON.stringify(clients)

            );


            /*======================================
            CONFIRMATION
            ======================================*/

            alert(

                "Client créé avec succès.\n\n" +

                "Numéro client : " +

                numeroClient

            );


            /*======================================
            RETOUR
            ======================================*/

            window.location.href =
                "index.html";

        }
    );

}

/*==================================================
INITIALISATION NUMERO CLIENT
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        previsualiserNumeroClient();

    }
);


/*==================================================
FIN CREATION CLIENT
==================================================*/

console.log(
    "Création client prête."
);

/*==================================================
CHARGER CLIENT A MODIFIER
==================================================*/

function chargerClientModification(){

    const formulaire =
        document.getElementById("editClientForm");

    if(!formulaire) return;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        Number(params.get("id"));

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    const client =
        clients.find(
            c => c.id === id
        );

    if(!client){

        alert("Client introuvable.");

        window.location.href =
            "index.html";

        return;

    }

    document.getElementById("clientId").value =
        client.id;

    document.getElementById("numeroClient").textContent =
        client.numeroClient;

    document.getElementById("nom").value =
        client.nom || "";

    document.getElementById("telephone").value =
        client.telephone || "";

    document.getElementById("adresse").value =
        client.adresse || "";

    document.getElementById("email").value =
        client.email || "";

    document.getElementById("statut").value =
        client.statut || "Actif";

    document.getElementById("source").value =
        client.source || "ERP";

    document.getElementById("notes").value =
        client.notes || "";

    document.getElementById("nombreCommandes").textContent =
        Number(client.nombreCommandes || 0);

    document.getElementById("totalAchats").textContent =
        Number(client.totalAchats || 0)
        .toLocaleString("fr-FR") + " FC";

    document.getElementById("dateInscription").textContent =
        client.dateInscription
        ? new Date(client.dateInscription)
            .toLocaleDateString("fr-FR")
        : "-";

}

/*==================================================
MODIFICATION CLIENT
==================================================*/

const editClientForm =
    document.getElementById("editClientForm");

if(editClientForm){

    editClientForm.addEventListener(
        "submit",
        function(e){

            e.preventDefault();

            let clients =
                JSON.parse(
                    localStorage.getItem("clients")
                ) || [];

            const id =
                Number(
                    document.getElementById(
                        "clientId"
                    ).value
                );

            const index =
                clients.findIndex(
                    client =>
                    client.id === id
                );

            if(index === -1){

                alert("Client introuvable.");

                return;

            }

            const telephone =
                document
                .getElementById("telephone")
                .value
                .trim();

            /*
            ========================================
            VERIFICATION TELEPHONE
            ========================================
            */

            const telephoneExiste =
                clients.some(
                    client =>
                    client.telephone === telephone &&
                    client.id !== id
                );

            if(telephoneExiste){

                alert(
                    "Ce numéro de téléphone appartient déjà à un autre client."
                );

                return;

            }

            /*
            ========================================
            MODIFICATION
            ========================================
            */

            clients[index].nom =
                document
                .getElementById("nom")
                .value
                .trim();

            clients[index].telephone =
                telephone;

            clients[index].adresse =
                document
                .getElementById("adresse")
                .value
                .trim();

            clients[index].email =
                document
                .getElementById("email")
                .value
                .trim();

            clients[index].statut =
                document
                .getElementById("statut")
                .value;

            clients[index].source =
                document
                .getElementById("source")
                .value;

            clients[index].notes =
                document
                .getElementById("notes")
                .value
                .trim();

            /*
            ========================================
            CONSERVATION DES DONNEES COMMERCIALES
            ========================================
            */

            // Le numéro client ne change pas.
            // Les commandes ne changent pas.
            // Le total des achats ne change pas.
            // La date d'inscription ne change pas.

            localStorage.setItem(
                "clients",
                JSON.stringify(clients)
            );

            alert(
                "Client modifié avec succès."
            );

            window.location.href =
                "index.html";

        }
    );

}

/*==================================================
FIN MODIFICATION CLIENT
==================================================*/

console.log(
    "Modification client prête."
);

/*==================================================
DETAIL CLIENT
==================================================*/

function chargerDetailClient(){

    const element =
        document.getElementById("detailNom");

    if(!element) return;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        Number(params.get("id"));

    const clients =
        JSON.parse(
            localStorage.getItem("clients")
        ) || [];

    const client =
        clients.find(
            c => c.id === id
        );

    if(!client){

        alert("Client introuvable.");

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
        client.nom || "-";

    document.getElementById(
        "detailNumero"
    ).textContent =
        client.numeroClient || "-";

    document.getElementById(
        "infoNumero"
    ).textContent =
        client.numeroClient || "-";

    document.getElementById(
        "infoNom"
    ).textContent =
        client.nom || "-";

    document.getElementById(
        "infoTelephone"
    ).textContent =
        client.telephone || "-";

    document.getElementById(
        "infoEmail"
    ).textContent =
        client.email || "-";

    document.getElementById(
        "infoAdresse"
    ).textContent =
        client.adresse || "-";

    document.getElementById(
        "infoSource"
    ).textContent =
        client.source || "ERP";


    /*==============================================
    STATUT
    ==============================================*/

    const statut =
        client.statut || "Actif";

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

    const commandes =
        Number(
            client.nombreCommandes || 0
        );

    const achats =
        Number(
            client.totalAchats || 0
        );

    document.getElementById(
        "detailCommandes"
    ).textContent =
        commandes;

    document.getElementById(
        "detailAchats"
    ).textContent =
        achats.toLocaleString("fr-FR")
        + " FC";


    /*==============================================
    DERNIERE COMMANDE
    ==============================================*/

    document.getElementById(
        "detailDerniereCommande"
    ).textContent =
        client.derniereCommande
        ? new Date(
            client.derniereCommande
        ).toLocaleDateString("fr-FR")
        : "-";


    /*==============================================
    DATE INSCRIPTION
    ==============================================*/

    document.getElementById(
        "detailInscription"
    ).textContent =
        client.dateInscription
        ? new Date(
            client.dateInscription
        ).toLocaleDateString("fr-FR")
        : "-";


    /*==============================================
    ACCES CLIENT
    ==============================================*/

    document.getElementById(
        "accesNumero"
    ).textContent =
        client.numeroClient || "-";

    document.getElementById(
        "accesTelephone"
    ).textContent =
        client.telephone || "-";


    /*==============================================
    NOTES
    ==============================================*/

    document.getElementById(
        "detailNotes"
    ).textContent =
        client.notes || "Aucune note.";


    /*==============================================
    MESSAGE COMMANDES
    ==============================================*/

    const commandeMessage =
        document.getElementById(
            "commandeMessage"
        );

    if(commandes > 0){

        commandeMessage.textContent =
            commandes +
            " commande(s) enregistrée(s).";

    }
    else{

        commandeMessage.textContent =
            "Aucune commande enregistrée.";

    }


    /*==============================================
    BOUTON MODIFIER
    ==============================================*/

    const btnModifier =
        document.getElementById(
            "btnModifier"
        );

    if(btnModifier){

        btnModifier.onclick = function(){

            window.location.href =
                "modifier.html?id=" + id;

        };

    }


    /*==============================================
    BOUTON SUPPRIMER
    ==============================================*/

    const btnSupprimer =
        document.getElementById(
            "btnSupprimer"
        );

    if(btnSupprimer){

        btnSupprimer.onclick = function(){

            supprimerClient(id);

        };

    }

}
