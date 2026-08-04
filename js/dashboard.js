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

    const ventes=

    JSON.parse(

        localStorage.getItem("ventes")

    )||[];

    const clients=

    JSON.parse(

        localStorage.getItem("clients")

    )||[];

    let chiffreAffaires=0;

    ventes.forEach(v=>{

        chiffreAffaires+=Number(v.total);

    });

    document.getElementById("kpiVentes").innerHTML=

    ventes.length;

    document.getElementById("kpiClients").innerHTML=

    clients.length;

    document.getElementById("kpiCA").innerHTML=

    chiffreAffaires.toLocaleString()

    +" FC";

}

/*==================================================
NOTIFICATIONS
==================================================*/

function chargerNotifications(){

console.log(

"Notifications chargées."

);

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

const ventesCanvas=

document.getElementById("salesChart");

if(ventesCanvas){

new Chart(

ventesCanvas,

{

type:"line",

data:{

labels:[

"Jan",

"Fév",

"Mar",

"Avr",

"Mai",

"Juin"

],

datasets:[{

label:"Ventes",

data:[

12,

18,

10,

25,

22,

30

],

fill:true,

borderWidth:3,

tension:.4

}]

},

options:{

responsive:true,

plugins:{

legend:{

display:true

}

}

}

}

);

}



const produitsCanvas=

document.getElementById("productChart");

if(produitsCanvas){

new Chart(

produitsCanvas,

{

type:"doughnut",

data:{

labels:[

"Œufs",

"Cailles",

"Soja",

"Farine"

],

datasets:[{

data:[

45,

20,

18,

17

]

}]

},

options:{

responsive:true

}

}

);

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
FIN
==================================================*/

console.log(

"Dashboard chargé."

);
