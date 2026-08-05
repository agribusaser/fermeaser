/*==================================================
FERME ASHER ERP
STOCKS.JS
VERSION 1.0
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    chargerStocks();

    initialiserRecherche();

    initialiserFiltres();

});

/*==================================================
CHARGER STOCKS
==================================================*/

function chargerStocks(){

    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    const table = document.getElementById("stocksTable");

    if(!table) return;

    table.innerHTML = "";

    let valeurTotale = 0;
    let stockFaible = 0;
    let rupture = 0;

    produits.forEach(produit=>{

        const valeur =
            produit.stock * produit.prixAchat;

        valeurTotale += valeur;

        let etat = "Disponible";
        let badge = "success";

        if(produit.stock <= 0){

            etat = "Rupture";
            badge = "danger";
            rupture++;

        }

        else if(produit.stock <= produit.stockMinimum){

            etat = "Stock faible";
            badge = "warning";
            stockFaible++;

        }

        table.innerHTML += `
<tr>

<td>${produit.code}</td>

<td>${produit.nom}</td>

<td>${produit.categorie}</td>

<td>${produit.stock}</td>

<td>${produit.stockMinimum}</td>

<td>${produit.unite}</td>

<td>${valeur.toLocaleString()} FC</td>

<td>

<span class="badge bg-${badge}">

${etat}

</span>

</td>

<td>

<button
class="btn btn-success btn-sm"
onclick="entreeStock(${produit.id})">

<i class="fa fa-plus"></i>

</button>

<button
class="btn btn-danger btn-sm"
onclick="sortieStock(${produit.id})">

<i class="fa fa-minus"></i>

</button>

</td>

</tr>

`;

    });

    mettreAJourStatistiques(
        produits,
        valeurTotale,
        stockFaible,
        rupture
    );

    afficherAlertes(produits);

}

/*==================================================
STATISTIQUES
==================================================*/

function mettreAJourStatistiques(

produits,

valeur,

stockFaible,

rupture

){

document.getElementById("totalProduits").textContent=

produits.length;

document.getElementById("valeurStock").textContent=

valeur.toLocaleString()+" FC";

document.getElementById("stockFaible").textContent=

stockFaible;

document.getElementById("ruptureStock").textContent=

rupture;

}

/*==================================================
ALERTES
==================================================*/

function afficherAlertes(produits){

const zone=

document.getElementById("alertesStock");

if(!zone) return;

zone.innerHTML="";

produits.forEach(p=>{

if(p.stock<=0){

zone.innerHTML+=`

<div class="alert alert-danger">

<strong>${p.nom}</strong>

<br>

Rupture de stock.

</div>

`;

}

else if(

p.stock<=p.stockMinimum

){

zone.innerHTML+=`

<div class="alert alert-warning">

<strong>${p.nom}</strong>

<br>

Stock faible.

</div>

`;

}

});

if(zone.innerHTML===""){

zone.innerHTML=`

<div class="alert alert-success">

Tous les stocks sont corrects.

</div>

`;

}

}

/*==================================================
RECHERCHE
==================================================*/

function initialiserRecherche(){

const champ=

document.getElementById("rechercheStock");

if(!champ) return;

champ.addEventListener("keyup",()=>{

const valeur=

champ.value.toLowerCase();

document

.querySelectorAll(

"#stocksTable tr"

)

.forEach(ligne=>{

ligne.style.display=

ligne.innerText

.toLowerCase()

.includes(valeur)

?

""

:

"none";

});

});

}

/*==================================================
FILTRES
==================================================*/

function initialiserFiltres(){

const categorie=

document.getElementById("filtreCategorie");

const etat=

document.getElementById("filtreEtat");

if(!categorie || !etat) return;

categorie.addEventListener(

"change",

chargerStocks

);

etat.addEventListener(

"change",

chargerStocks

);

}

/*==================================================
ENTREE / SORTIE
==================================================*/

function entreeStock(id){

window.location.href=

"entree.html?id="+id;

}

function sortieStock(id){

window.location.href=

"sortie.html?id="+id;

}

/*==================================================
FIN
==================================================*/

console.log(

"Module Stocks chargé."

);
