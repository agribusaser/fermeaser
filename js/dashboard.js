/*==================================================
FERME ASHER ERP
DASHBOARD.JS
VERSION 1.0
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    masquerLoader();

    chargerDashboard();

    initialiserGraphiques();

    actualiserDate();

});

/*==================================================
LOADER
==================================================*/

function masquerLoader(){

    const loader=document.getElementById("loader");

    if(!loader) return;

    setTimeout(()=>{

        loader.classList.add("hidden");

    },700);

}



/*==================================================
DATE
==================================================*/

function actualiserDate(){

    const date=new Date();

    console.log(

        "Connexion :",

        date.toLocaleString()

    );

}

/*==================================================
CHARGEMENT DASHBOARD
==================================================*/

function chargerDashboard(){

    chargerStatistiques();

    chargerNotifications();

    chargerActivites();

}

/*==================================================
STATISTIQUES
==================================================*/

function chargerStatistiques(){

    const ventes = JSON.parse(localStorage.getItem("ventes")) || [];
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    const produits = JSON.parse(localStorage.getItem("produits")) || [];
    const stocks = JSON.parse(localStorage.getItem("stocks")) || [];

    let chiffreAffaires = 0;

    ventes.forEach(vente => {

        chiffreAffaires += Number(vente.total || 0);

    });

    document.getElementById("kpiVentes").textContent = ventes.length;

    document.getElementById("kpiClients").textContent = clients.length;

    document.getElementById("kpiStock").textContent = produits.length;

    document.getElementById("kpiCA").textContent =
        chiffreAffaires.toLocaleString("fr-FR") + " FC";

}


/*==================================================
NOTIFICATIONS
==================================================*/


function chargerNotifications(){

    const ventes =
    JSON.parse(localStorage.getItem("ventes")) || [];

    if(ventes.length==0){

        console.log("Aucune vente.");

    }

    else{

        console.log(

            ventes.length+

            " ventes enregistrées."

        );

    }

}



/*==================================================
ACTIVITES
==================================================*/

function chargerActivites(){

console.log(

"Activités chargées."

);

}

/*==================================================
GRAPHIQUES
==================================================*/

function initialiserGraphiques(){

const ventes = JSON.parse(

localStorage.getItem("ventes")

)||[];

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

let totalMois =

Array(12).fill(0);

ventes.forEach(v=>{

let d = new Date(v.date);

if(!isNaN(d)){

totalMois[d.getMonth()] +=

Number(v.total);

}

});

const canvas =

document.getElementById("salesChart");

if(canvas){

new Chart(canvas,{

type:"bar",

data:{

labels:mois,

datasets:[{

label:"Chiffre d'affaires",

data:totalMois

}]

},

options:{

responsive:true

}

});

}

}

/*==================================================
DECONNEXION
==================================================*/

function deconnexion(){

localStorage.removeItem(

"sessionERP"

);

window.location.href=

"login.html";

}

/*==================================================
ACTIVITES RECENTES
==================================================*/

function chargerActivites(){

    const tbody = document.getElementById("recentActivities");

    if(!tbody) return;

    const ventes = JSON.parse(localStorage.getItem("ventes")) || [];

    tbody.innerHTML="";

    ventes
    .slice()
    .reverse()
    .slice(0,5)
    .forEach(vente=>{

        tbody.innerHTML += `

<tr>

<td>${vente.date}</td>

<td>${vente.client}</td>

<td>

Vente de ${vente.produit}

</td>

</tr>

`;

    });

}



/*==================================================
FIN
==================================================*/

console.log(

"Dashboard chargé."

);
