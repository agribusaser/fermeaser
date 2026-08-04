/*====================================================
 FERME ASHER ERP
 MODULE : VENTES
 FICHIER : ventes.js
 VERSION : 2.0
====================================================*/


// ===============================
// VARIABLES GLOBALES
// ===============================

let ventes = [];

let graphiqueVentes = null;


// ===============================
// DEMARRAGE DU MODULE
// ===============================

document.addEventListener("DOMContentLoaded", function(){

    console.log("Ferme Asher ERP - Module Ventes chargé");

    chargerVentes();

    activerRecherche();

});



// ===============================
// CHARGEMENT DU FICHIER JSON
// ===============================


async function chargerVentes(){

    try{


        const reponse = await fetch("../../data/ventes.json");


        if(!reponse.ok){

            throw new Error(
                "Impossible de charger ventes.json"
            );

        }


        ventes = await reponse.json();



        afficherVentes();


        calculerStatistiques();


        afficherGraphique();



    }

    catch(erreur){

        console.error(
            "Erreur : ",
            erreur
        );


        afficherErreur();

    }


}




// ===============================
// AFFICHAGE TABLEAU
// ===============================


function afficherVentes(){


    const tableau = document.querySelector(
        "tbody"
    );


    if(!tableau){

        console.warn(
            "Tableau ventes introuvable"
        );

        return;

    }



    tableau.innerHTML="";



    ventes.forEach((vente)=>{


        tableau.innerHTML += `


<tr>


<td>

${vente.id}

</td>



<td>

${vente.date}

</td>



<td>

${vente.client}

</td>



<td>

${vente.produit}

</td>



<td>

${vente.quantite}

</td>



<td>

${formatFC(vente.prix)}

</td>



<td>

<strong>

${formatFC(vente.total)}

</strong>

</td>



<td>

<span class="badge bg-success">

${vente.paiement}

</span>


</td>



<td>

<span class="badge bg-primary">

${vente.statut}

</span>


</td>



<td>


<button 
class="btn btn-sm btn-info"
onclick="voirVente(${vente.id})">

<i class="fa fa-eye"></i>

</button>



<button 
class="btn btn-sm btn-warning"
onclick="modifierVente(${vente.id})">

<i class="fa fa-edit"></i>

</button>



<button 
class="btn btn-sm btn-danger"
onclick="supprimerVente(${vente.id})">

<i class="fa fa-trash"></i>

</button>


</td>



</tr>


`;



    });



}

/*====================================================
 STATISTIQUES
====================================================*/


function calculerStatistiques(){


    let totalVentes = ventes.length;


    let chiffreAffaire = 0;


    ventes.forEach((vente)=>{


        chiffreAffaire += Number(vente.total);


    });



    const cartes = document.querySelectorAll(
        ".card h2"
    );



    if(cartes.length >= 4){


        cartes[0].innerHTML = totalVentes;


        cartes[1].innerHTML = totalVentes;


        cartes[2].innerHTML = totalVentes;


        cartes[3].innerHTML =
        formatFC(chiffreAffaire);


    }



    console.log(
        "Nombre ventes : ",
        totalVentes
    );


    console.log(
        "Chiffre affaire : ",
        chiffreAffaire
    );


}





/*====================================================
 FORMAT MONNAIE
====================================================*/


function formatFC(nombre){


    return Number(nombre)
    .toLocaleString("fr-FR")
    + " FC";


}




/*====================================================
 RECHERCHE DES VENTES
====================================================*/


function activerRecherche(){


    const recherche =
    document.querySelector(
        ".toolbar-left input"
    );



    if(!recherche){

        return;

    }



    recherche.addEventListener(
        "keyup",
        function(){



            let valeur =
            this.value.toLowerCase();



            let lignes =
            document.querySelectorAll(
                "tbody tr"
            );



            lignes.forEach(
                (ligne)=>{


                    if(
                        ligne.innerText
                        .toLowerCase()
                        .includes(valeur)

                    ){


                        ligne.style.display="";


                    }

                    else{


                        ligne.style.display="none";


                    }



                }

            );



        }

    );



}






/*====================================================
 GRAPHIQUE DES VENTES
====================================================*/


function afficherGraphique(){



    const graphique =
    document.getElementById(
        "salesChart"
    );



    if(!graphique){

        return;

    }




    const nomsClients =
    ventes.map(
        vente=>vente.client
    );



    const montants =
    ventes.map(
        vente=>vente.total
    );




    if(graphiqueVentes){


        graphiqueVentes.destroy();


    }



    graphiqueVentes =
    new Chart(
        graphique,
        {


            type:"bar",



            data:{


                labels:nomsClients,



                datasets:[{


                    label:
                    "Ventes en FC",



                    data:montants,



                    borderWidth:1



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

/*====================================================
 ACTIONS SUR LES VENTES
====================================================*/


// ===============================
// VOIR UNE VENTE
// ===============================

function voirVente(id){


    const vente = ventes.find(
        v => v.id === id
    );


    if(!vente){

        alert(
            "Vente introuvable"
        );

        return;

    }



    alert(

        "Facture : " + vente.facture +
        "\nClient : " + vente.client +
        "\nProduit : " + vente.produit +
        "\nTotal : " + formatFC(vente.total)

    );


}





// ===============================
// MODIFIER UNE VENTE
// ===============================


function modifierVente(id){


    const vente = ventes.find(
        v => v.id === id
    );


    if(!vente){

        alert(
            "Vente introuvable"
        );

        return;

    }



    console.log(
        "Modification vente : ",
        vente
    );


    // Préparation future :
    // ouverture de nouvelle.html
    // avec formulaire rempli


    window.location.href =
    "nouvelle.html?id=" + id;



}






// ===============================
// SUPPRIMER UNE VENTE
// ===============================


function supprimerVente(id){



    const confirmation =
    confirm(
        "Voulez-vous supprimer cette vente ?"
    );



    if(!confirmation){

        return;

    }



    ventes =
    ventes.filter(
        vente => vente.id !== id
    );



    afficherVentes();


    calculerStatistiques();



    alert(
        "Vente supprimée localement"
    );



}







// ===============================
// IMPRESSION FACTURE
// ===============================


function imprimerFacture(id){



    const vente =
    ventes.find(
        v => v.id === id
    );



    if(!vente){

        alert(
            "Facture impossible"
        );

        return;

    }



    const facture = `

FERME ASHER

FACTURE

----------------------

Client :
${vente.client}


Produit :
${vente.produit}


Quantité :
${vente.quantite}


Montant :
${formatFC(vente.total)}


Paiement :
${vente.paiement}


----------------------

Merci pour votre confiance.

`;



    const fenetre =
    window.open("");



    fenetre.document.write(
        facture
    );


    fenetre.print();



}







// ===============================
// EXPORT PREPARATION
// ===============================


function exporterExcel(){


    console.log(
        "Export Excel bientôt disponible"
    );


}




function exporterPDF(){


    console.log(
        "Export PDF bientôt disponible"
    );


}







// ===============================
// GESTION DES ERREURS
// ===============================


function afficherErreur(){


    const tableau =
    document.querySelector("tbody");



    if(tableau){


        tableau.innerHTML = `

<tr>

<td colspan="10"
class="text-center text-danger">

Erreur de chargement des données.

</td>

</tr>

`;

    }



}







// ===============================
// ACTUALISATION
// ===============================


function actualiserVentes(){


    chargerVentes();


}
