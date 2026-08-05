/*==================================================
FERME ASHER ERP
PRODUITS.JS
VERSION 1.0
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    chargerProduits();

    initialiserRecherche();

});

/*==================================================
CHARGER PRODUITS
==================================================*/

function chargerProduits(){

    let produits=

    JSON.parse(

        localStorage.getItem("produits")

    )||[];

    const table=

    document.getElementById("productsTable");

    if(!table) return;

    table.innerHTML="";

    produits.forEach(produit=>{

        table.innerHTML+=`

<tr>

<td>

<img

src="${produit.image}"

class="img-fluid">

</td>

<td>

${produit.code}

</td>

<td>

${produit.nom}

</td>

<td>

${produit.categorie}

</td>

<td>

${Number(produit.prixVente).toLocaleString()} FC

</td>

<td>

${produit.stock}

</td>

<td>

<span class="badge bg-success">

${produit.statut}

</span>

</td>

<td>

<button

class="btn btn-primary btn-sm"

onclick="voirProduit(${produit.id})">

<i class="fa fa-eye"></i>

</button>

<button

class="btn btn-warning btn-sm"

onclick="modifierProduit(${produit.id})">

<i class="fa fa-edit"></i>

</button>

<button

class="btn btn-danger btn-sm"

onclick="supprimerProduit(${produit.id})">

<i class="fa fa-trash"></i>

</button>

</td>

</tr>

`;

    });

    mettreAJourStatistiques();

}

/*==================================================
STATISTIQUES
==================================================*/

function mettreAJourStatistiques(){

const produits=

JSON.parse(

localStorage.getItem("produits")

)||[];

let actifs=0;

let inactifs=0;

let alertes=0;

produits.forEach(p=>{

if(p.statut==="Actif") actifs++;

if(p.statut==="Inactif") inactifs++;

if(Number(p.stock)<=Number(p.stockMinimum))

alertes++;

});

const total=document.getElementById("totalProducts");
const actifsEl=document.getElementById("activeProducts");
const inactifsEl=document.getElementById("inactiveProducts");
const alertesEl=document.getElementById("stockAlert");

if(total) total.textContent=produits.length;
if(actifsEl) actifsEl.textContent=actifs;
if(inactifsEl) inactifsEl.textContent=inactifs;
if(alertesEl) alertesEl.textContent=alertes;

}

/*==================================================
RECHERCHE
==================================================*/

function initialiserRecherche(){

const recherche=

document.getElementById("searchProduct");

if(!recherche) return;

recherche.addEventListener("keyup",()=>{

const valeur=

recherche.value.toLowerCase();

const lignes=

document.querySelectorAll(

"#productsTable tr"

);

lignes.forEach(ligne=>{

ligne.style.display=

ligne.innerText.toLowerCase()

.includes(valeur)

?

""

:

"none";

});

});

}

/*==================================================
SUPPRESSION
==================================================*/

function supprimerProduit(id){

if(!confirm(

"Supprimer ce produit ?"

))

return;

let produits=

JSON.parse(

localStorage.getItem("produits")

)||[];

produits=

produits.filter(

p=>p.id!==id

);

localStorage.setItem(

"produits",

JSON.stringify(produits)

);

chargerProduits();

}

/*==================================================
DETAIL
==================================================*/

function voirProduit(id){

window.location.href=

"detail.html?id="+id;

}



/*==================================================
MODIFICATION
==================================================*/

function modifierProduit(id){

window.location.href=

"modifier.html?id="+id;

}



/*==================================================
FIN
==================================================*/

console.log(

"Module Produits chargé."

);
