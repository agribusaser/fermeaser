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

/*==================================================
GENERER CODE PRODUIT
==================================================*/

function genererCodeProduit(){

    const champ = document.getElementById("code");

    if(!champ) return;

    let produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    let numero = produits.length + 1;

    champ.value =
        "PRD" +
        String(numero).padStart(6,"0");

}

/*==================================================
ENREGISTREMENT PRODUIT
==================================================*/

const productForm =
document.getElementById("productForm");

if(productForm){

productForm.addEventListener(

"submit",

function(e){

e.preventDefault();

let produits=

JSON.parse(

localStorage.getItem("produits")

)||[];

const imageInput=

document.getElementById("image");

let image="";

if(

imageInput.files.length>0

){

image=

"images/"+

imageInput.files[0].name;

}

else{

image=

"../../images/no-image.png";

}

const produit={

id:Date.now(),

code:document.getElementById("code").value,

nom:document.getElementById("nom").value,

categorie:document.getElementById("categorie").value,

prixAchat:Number(

document.getElementById("prixAchat").value

),

prixVente:Number(

document.getElementById("prixVente").value

),

stock:Number(

document.getElementById("stock").value

),

stockMinimum:Number(

document.getElementById("stockMinimum").value

),

unite:document.getElementById("unite").value,

statut:document.getElementById("statut").value,

description:document.getElementById("description").value,

image:image

};

produits.push(produit);

localStorage.setItem(

"produits",

JSON.stringify(produits)

);

    alert(

"Produit enregistré avec succès."

);

window.location.href=

"index.html";

});

}

/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

genererCodeProduit();

});

/*==================================================
CHARGER PRODUIT A MODIFIER
==================================================*/

function chargerProduitModification(){

    const formulaire = document.getElementById("editProductForm");

    if(!formulaire) return;

    const params = new URLSearchParams(window.location.search);

    const id = Number(params.get("id"));

    let produits = JSON.parse(localStorage.getItem("produits")) || [];

    const produit = produits.find(p => p.id === id);

    if(!produit){

        alert("Produit introuvable.");

        window.location.href = "index.html";

        return;

    }

    document.getElementById("productId").value = produit.id;
    document.getElementById("code").value = produit.code;
    document.getElementById("nom").value = produit.nom;
    document.getElementById("categorie").value = produit.categorie;
    document.getElementById("prixAchat").value = produit.prixAchat;
    document.getElementById("prixVente").value = produit.prixVente;
    document.getElementById("stock").value = produit.stock;
    document.getElementById("stockMinimum").value = produit.stockMinimum;
    document.getElementById("statut").value = produit.statut;
    document.getElementById("description").value = produit.description;

}

/*==================================================
ENREGISTRER MODIFICATION
==================================================*/

const editProductForm = document.getElementById("editProductForm");

if(editProductForm){

editProductForm.addEventListener("submit",function(e){

e.preventDefault();

let produits = JSON.parse(localStorage.getItem("produits")) || [];

const id = Number(document.getElementById("productId").value);

const index = produits.findIndex(p => p.id === id);

if(index === -1){

alert("Produit introuvable.");

return;

}

produits[index].nom = document.getElementById("nom").value;
produits[index].categorie = document.getElementById("categorie").value;
produits[index].prixAchat = Number(document.getElementById("prixAchat").value);
produits[index].prixVente = Number(document.getElementById("prixVente").value);
produits[index].stock = Number(document.getElementById("stock").value);
produits[index].stockMinimum = Number(document.getElementById("stockMinimum").value);
produits[index].statut = document.getElementById("statut").value;
produits[index].description = document.getElementById("description").value;

                                 localStorage.setItem(

"produits",

JSON.stringify(produits)

);

alert(

"Produit modifié avec succès."

);

window.location.href="index.html";

});

}

/*==================================================
FIN MODIFICATION
==================================================*/

console.log(

"Modification produit prête."

);
