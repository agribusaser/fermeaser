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

    const table =
        document.getElementById("stocksTable");

    if(!table) return;

    table.innerHTML = "";

    let valeurTotale = 0;
    let stockFaible = 0;
    let rupture = 0;

    produits.forEach(produit => {

        const valeur =
            Number(produit.stock || 0) *
            Number(produit.prixAchat || 0);

        valeurTotale += valeur;

        let etat = "Disponible";
        let badge = "success";

        if(Number(produit.stock || 0) <= 0){

            etat = "Rupture";
            badge = "danger";
            rupture++;

        }

        else if(
            Number(produit.stock || 0) <=
            Number(produit.stockMinimum || 0)
        ){

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

            <td>
                ${valeur.toLocaleString()} FC
            </td>

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

    chargerHistorique();

    chargerStatistiquesMensuelles();

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

/*==================================================
CHARGER LA LISTE DES PRODUITS
==================================================*/

function chargerListeProduits() {

    const select = document.getElementById("produit");

    if (!select) return;

    const produits = JSON.parse(localStorage.getItem("produits")) || [];

    select.innerHTML = '<option value="">Sélectionner un produit</option>';

    produits.forEach(produit => {

        select.innerHTML += `
            <option value="${produit.id}">
                ${produit.code} - ${produit.nom}
            </option>
        `;

    });

}

/*==================================================
DATE D'AUJOURD'HUI
==================================================*/

function dateAujourdhui() {

    const champ = document.getElementById("date");

    if (!champ) return;

    champ.value = new Date().toISOString().split("T")[0];

}

/*==================================================
CALCUL AUTOMATIQUE DU MONTANT
==================================================*/

function calculerMontant() {

    const quantite = document.getElementById("quantite");
    const prix = document.getElementById("prix");
    const montant = document.getElementById("montant");

    if (!quantite || !prix || !montant) return;

    function calcul() {

        const qte = Number(quantite.value) || 0;
        const pu = Number(prix.value) || 0;

        montant.value = qte * pu;

    }

    quantite.addEventListener("input", calcul);
    prix.addEventListener("input", calcul);

}

/*==================================================
ENREGISTRER UNE ENTREE DE STOCK
==================================================*/

const entreeForm = document.getElementById("entreeForm");

if (entreeForm) {

    entreeForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const produits = JSON.parse(localStorage.getItem("produits")) || [];
        const mouvements = JSON.parse(localStorage.getItem("mouvementsStock")) || [];

        const idProduit = Number(document.getElementById("produit").value);
        const quantite = Number(document.getElementById("quantite").value);
        const prix = Number(document.getElementById("prix").value);

        const produit = produits.find(p => p.id === idProduit);

        if (!produit) {

            alert("Produit introuvable.");

            return;

        }

        produit.stock += quantite;

        mouvements.push({

            id: Date.now(),

            date: document.getElementById("date").value,

            produitId: produit.id,

            produit: produit.nom,

            type: "Entrée",

            nature: document.getElementById("type").value,

            quantite: quantite,

            prix: prix,

            montant: quantite * prix,

            reference: document.getElementById("reference").value,

            observation: document.getElementById("observation").value,

            utilisateur: "Administrateur"

        });

        localStorage.setItem("produits", JSON.stringify(produits));
        localStorage.setItem("mouvementsStock", JSON.stringify(mouvements));

        alert("Entrée de stock enregistrée avec succès.");

        window.location.href = "index.html";

    });

}

/*==================================================
INITIALISATION PAGE ENTREE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    chargerListeProduits();

    dateAujourdhui();

    calculerMontant();

});

console.log("Gestion des entrées de stock prête.");

/*==================================================
CHARGER INFORMATIONS PRODUIT
==================================================*/

function chargerInformationsProduit() {

    const select = document.getElementById("produit");

    if (!select) return;

    const stockDisponible = document.getElementById("stockDisponible");
    const prix = document.getElementById("prix");

    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    function mettreAJour() {

        const id = Number(select.value);

        const produit = produits.find(p => p.id === id);

        if (!produit) {

            stockDisponible.value = "";

            prix.value = "";

            return;

        }

        stockDisponible.value = produit.stock;

        prix.value = produit.prixVente;

    }

    select.addEventListener("change", mettreAJour);

    mettreAJour();

}

/*==================================================
ENREGISTRER SORTIE DE STOCK
==================================================*/

const sortieForm = document.getElementById("sortieForm");

if (sortieForm) {

    sortieForm.addEventListener("submit", function(e){

        e.preventDefault();

        let produits = JSON.parse(
            localStorage.getItem("produits")
        ) || [];

        let mouvements = JSON.parse(
            localStorage.getItem("mouvementsStock")
        ) || [];

        const idProduit = Number(
            document.getElementById("produit").value
        );

        const quantite = Number(
            document.getElementById("quantite").value
        );

        const produit = produits.find(
            p => p.id === idProduit
        );

        if(!produit){

            alert("Produit introuvable.");

            return;

        }

        if(quantite > produit.stock){

            alert("Stock insuffisant.");

            return;

        }

        produit.stock -= quantite;


                                        mouvements.push({

            id: Date.now(),

            date: document.getElementById("date").value,

            produitId: produit.id,

            produit: produit.nom,

            type: "Sortie",

            nature: document.getElementById("type").value,

            quantite: quantite,

            prix: produit.prixVente,

            montant: quantite * produit.prixVente,

            reference: document.getElementById("reference").value,

            observation: document.getElementById("observation").value,

            utilisateur: "Administrateur"

        });

        localStorage.setItem(

            "produits",

            JSON.stringify(produits)

        );

        localStorage.setItem(

            "mouvementsStock",

            JSON.stringify(mouvements)

        );

        alert(

            "Sortie enregistrée avec succès."

        );

        window.location.href = "index.html";

    });

}

/*==================================================
INITIALISATION PAGE SORTIE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    chargerInformationsProduit();

});

console.log("Gestion des sorties de stock prête.");

/*==================================================
CHARGER INVENTAIRE
==================================================*/

function chargerInventaire() {

    const table = document.getElementById("inventaireTable");

    if (!table) return;

    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    table.innerHTML = "";

    let nbEcarts = 0;
    let nbConformes = 0;

    produits.forEach(produit => {

        table.innerHTML += `

<tr>

<td>${produit.code}</td>

<td>${produit.nom}</td>

<td>${produit.categorie}</td>

<td>${produit.stock}</td>

<td>

<input
type="number"
class="form-control stockPhysique"
data-id="${produit.id}"
value="${produit.stock}"
min="0">

</td>

<td>

<span
class="badge bg-success"
id="ecart-${produit.id}">

0

</span>

</td>

</tr>

`;

        nbConformes++;

    });

    document.getElementById("nbProduitsInventaire").textContent =
        produits.length;

    document.getElementById("nbEcarts").textContent =
        nbEcarts;

    document.getElementById("nbConformes").textContent =
        nbConformes;

    calculerEcartsInventaire();

}

/*==================================================
CALCUL DES ECARTS
==================================================*/

function calculerEcartsInventaire(){

    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    const champs = document.querySelectorAll(".stockPhysique");

    champs.forEach(champ=>{

        champ.addEventListener("input",function(){

            const id = Number(this.dataset.id);

            const produit = produits.find(
                p=>p.id===id
            );

            if(!produit) return;

            const ecart =
                Number(this.value)-produit.stock;

            const badge =
                document.getElementById(
                    "ecart-"+id
                );

            badge.textContent = ecart;

            badge.className =
                ecart===0
                ? "badge bg-success"
                : "badge bg-danger";

            mettreAJourStatistiquesInventaire();

        });

    });

}

/*==================================================
STATISTIQUES INVENTAIRE
==================================================*/

function mettreAJourStatistiquesInventaire(){

    let ecarts = 0;

    let conformes = 0;

    document
    .querySelectorAll(".stockPhysique")
    .forEach(champ=>{

        const id = Number(champ.dataset.id);

        const badge =
        document.getElementById(
            "ecart-"+id
        );

        if(Number(badge.textContent)===0){

            conformes++;

        }else{

            ecarts++;

        }

    });

    document.getElementById("nbEcarts").textContent =
        ecarts;

    document.getElementById("nbConformes").textContent =
        conformes;

}

/*==================================================
ENREGISTRER INVENTAIRE
==================================================*/

const btnInventaire =
document.getElementById(
    "btnEnregistrerInventaire"
);

if(btnInventaire){

btnInventaire.addEventListener("click",()=>{

    const produits = JSON.parse(
        localStorage.getItem("produits")
    ) || [];

    document
    .querySelectorAll(".stockPhysique")
    .forEach(champ=>{

        const id = Number(champ.dataset.id);

        const produit = produits.find(
            p=>p.id===id
        );

        if(produit){

            produit.stock =
                Number(champ.value);

        }

    });

    localStorage.setItem(
        "produits",
        JSON.stringify(produits)
    );

    alert(
        "Inventaire enregistré avec succès."
    );

    window.location.href="index.html";

});

}

console.log("Inventaire prêt.");

/*==================================================
HISTORIQUE
==================================================*/

function chargerHistorique(){

    const table =
        document.getElementById("historiqueTable") ||
        document.getElementById("historiqueMouvements");

    if(!table) return;

    const mouvements =
        JSON.parse(
            localStorage.getItem("mouvementsStock")
        ) || [];

    table.innerHTML = "";

    const derniersMouvements =
        mouvements
        .slice()
        .sort((a, b) => {
            return Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 5);

    derniersMouvements.forEach(m => {

        table.innerHTML += `
            <tr>

                <td>${m.date || ""}</td>

                <td>${m.produit || ""}</td>

                <td>
                    <span class="badge ${
                        m.type === "Entrée"
                        ? "bg-success"
                        : "bg-danger"
                    }">
                        ${m.type || ""}
                    </span>
                </td>

                <td>${m.quantite || 0}</td>

                <td>${m.utilisateur || ""}</td>

            </tr>
        `;

    });

}

/*==================================================
STATISTIQUES MENSUELLES
==================================================*/

function chargerStatistiquesMensuelles(){

    const entreesElement =
        document.getElementById("entreesMois");

    const sortiesElement =
        document.getElementById("sortiesMois");

    if(!entreesElement || !sortiesElement) return;

    const mouvements =
        JSON.parse(
            localStorage.getItem("mouvementsStock")
        ) || [];

    const maintenant = new Date();

    const moisActuel =
        maintenant.getMonth();

    const anneeActuelle =
        maintenant.getFullYear();

    let totalEntrees = 0;
    let totalSorties = 0;

    mouvements.forEach(m => {

        if(!m.date) return;

        const date = new Date(m.date);

        if(
            date.getMonth() !== moisActuel ||
            date.getFullYear() !== anneeActuelle
        ){
            return;
        }

        const quantite =
            Number(m.quantite) || 0;

        if(m.type === "Entrée"){
            totalEntrees += quantite;
        }

        if(m.type === "Sortie"){
            totalSorties += quantite;
        }

    });

    entreesElement.textContent =
        totalEntrees;

    sortiesElement.textContent =
        totalSorties;

}

/*==================================================
FILTRES HISTORIQUE
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

const produit=document.getElementById("filtreProduit");

if(produit){

produit.addEventListener("keyup",chargerHistorique);

}

const type=document.getElementById("filtreType");

if(type){

type.addEventListener("change",chargerHistorique);

}

});

/*==================================================
FIN HISTORIQUE
==================================================*/

console.log(

"Historique prêt."

);

/*==================================================
FIN MODULE STOCKS
==================================================*/

console.log(

"Module Stocks Version 1.0 terminé."

);

