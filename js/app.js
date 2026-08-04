/*====================================================
 FERME ASHER
 APP.JS
 VERSION 3.0
====================================================*/


document.addEventListener("DOMContentLoaded", () => {

    initialiserNavbar();

    initialiserRetourHaut();

    initialiserCompteurs();

    initialiserScroll();

});



/*====================================================
 NAVBAR
====================================================*/

function initialiserNavbar(){

    const navbar=document.querySelector(".navbar");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>60){

            navbar.style.background="#1B5E20";

            navbar.style.padding="10px 0";

        }

        else{

            navbar.style.background="rgba(27,94,32,.95)";

            navbar.style.padding="14px 0";

        }

    });

}



/*====================================================
 RETOUR HAUT
====================================================*/

function initialiserRetourHaut(){

    const bouton=document.getElementById("topButton");

    if(!bouton) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>500){

            bouton.style.display="flex";

        }

        else{

            bouton.style.display="none";

        }

    });

    bouton.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/*====================================================
 COMPTEURS
====================================================*/

function initialiserCompteurs(){

    const compteurs=document.querySelectorAll(".counter-box h2");

    compteurs.forEach(compteur=>{

        const texte=compteur.innerText;

        const cible=parseInt(texte);

        if(isNaN(cible)) return;

        let valeur=0;

        const increment=Math.max(1,Math.ceil(cible/80));

        const timer=setInterval(()=>{

            valeur+=increment;

            if(valeur>=cible){

                valeur=cible;

                clearInterval(timer);

            }

            if(texte.includes("+")){

                compteur.innerText=valeur+"+";

            }

            else if(texte.includes("%")){

                compteur.innerText=valeur+"%";

            }

            else{

                compteur.innerText=valeur;

            }

        },20);

    });

}



/*====================================================
 SCROLL DOUX
====================================================*/

function initialiserScroll(){

    document.querySelectorAll('a[href^="#"]').forEach(lien=>{

        lien.addEventListener("click",function(e){

            const cible=document.querySelector(this.getAttribute("href"));

            if(!cible) return;

            e.preventDefault();

            cible.scrollIntoView({

                behavior:"smooth"

            });

        });

    });

}

/*====================================================
 GALERIE
====================================================*/

document.querySelectorAll(".gallery-item").forEach(item=>{

    item.addEventListener("click",()=>{

        const image=item.querySelector("img");

        if(image){

            window.open(image.src,"_blank");

        }

    });

});



/*====================================================
 FORMULAIRE CONTACT
====================================================*/

const formulaire=document.querySelector(".contact-form");

if(formulaire){

    formulaire.addEventListener("submit",(e)=>{

        e.preventDefault();

        alert("Merci ! Votre message a été envoyé.");

        formulaire.reset();

    });

}



/*====================================================
 FIN
====================================================*/

console.log("Ferme Asher Version 3.0 chargée.");
