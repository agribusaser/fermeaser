/*======================================================
 FERME ASHER ERP
 Module : Ventes
 Version : 1.0
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Module Ventes chargé.");

    chargerStatistiques();

    chargerTableau();

    initialiserRecherche();

});


/*======================================================
 DONNEES TEMPORAIRES
======================================================*/

let ventes = [

    {
        id:1,
        date:"03/08/2026",
        client:"Restaurant ABC",
        produit:"Plateau de 15 œufs",
        quantite:5,
        prix:9000,
        total:45000,
        paiement:"Cash",
        statut:"Payée"
    },

    {
        id:2,
        date:"03/08/2026",
        client:"Supermarché Espoir",
        produit:"Cailles vivantes",
        quantite:30,
        prix:6000,
        total:180000,
        paiement:"Mobile Money",
        statut:"Terminée"
    },

    {
        id:3,
        date:"02/08/2026",
        client:"Jean Mukendi",
        produit:"Œufs de cailles",
        quantite:10,
        prix:9000,
        total:90000,
        paiement:"Banque",
        statut:"En attente"
    }

];


/*======================================================
 STATISTIQUES
======================================================*/

function chargerStatistiques(){

    let nombreVentes = ventes.length;

    let chiffreAffaire = 0;

    ventes.forEach(v=>{

        chiffreAffaire += v.total;

    });

    console.log("Nombre ventes :",nombreVentes);

    console.log("CA :",chiffreAffaire);

}

/*======================================================
 TABLEAU
======================================================*/

function chargerTableau(){

    const tbody=document.querySelector("tbody");

    if(!tbody) return;

    tbody.innerHTML="";

    ventes.forEach(v=>{

        tbody.innerHTML += `

<tr>

<td>${v.id}</td>

<td>${v.date}</td>

<td>${v.client}</td>

<td>${v.produit}</td>

<td>${v.quantite}</td>

<td>${v.prix.toLocaleString()} FC</td>

<td>${v.total.toLocaleString()} FC</td>

<td>${v.paiement}</td>

<td>${v.statut}</td>

<td>

<button class="btn btn-sm btn-success">

<i class="fa fa-eye"></i>

</button>

<button class="btn btn-sm btn-warning">

<i class="fa fa-edit"></i>

</button>

<button class="btn btn-sm btn-danger">

<i class="fa fa-trash"></i>

</button>

</td>

</tr>

`;

    });

}

/*======================================================
 RECHERCHE
======================================================*/

function initialiserRecherche(){

    const recherche=document.querySelector("input");

    if(!recherche) return;

    recherche.addEventListener("keyup",function(){

        let mot=this.value.toLowerCase();

        let lignes=document.querySelectorAll("tbody tr");

        lignes.forEach(ligne=>{

            if(ligne.innerText.toLowerCase().includes(mot))

                ligne.style.display="";

            else

                ligne.style.display="none";

        });

    });

}

/*======================================================
 FUTURES FONCTIONS
======================================================*/

function ajouterVente(){

    console.log("Nouvelle vente");

}

function modifierVente(id){

    console.log("Modifier",id);

}

function supprimerVente(id){

    console.log("Supprimer",id);

}

function imprimerFacture(id){

    console.log("Facture",id);

}

function exporterPDF(){

    console.log("PDF");

}

function exporterExcel(){

    console.log("Excel");

}
