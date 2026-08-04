/*====================================================
 FERME ASHER ERP
 LOGIN.JS
 VERSION 1.0
====================================================*/

document.addEventListener("DOMContentLoaded", function () {

    verifierSession();

    initialiserConnexion();

});

/*====================================================
 CONNEXION
====================================================*/

function initialiserConnexion() {

    const formulaire = document.getElementById("loginForm");

    if (!formulaire) return;

    formulaire.addEventListener("submit", function (e) {

        e.preventDefault();

        const utilisateur = document.getElementById("username").value.trim();

        const motdepasse = document.getElementById("password").value.trim();

        if (utilisateur === "admin" && motdepasse === "admin123") {

            const session = {

                utilisateur: utilisateur,

                nom: "Administrateur",

                role: "Admin",

                connexion: new Date().toISOString()

            };

            localStorage.setItem(

                "sessionERP",

                JSON.stringify(session)

            );

            window.location.href = "dashboard.html";

        }

        else {

            alert("Nom d'utilisateur ou mot de passe incorrect.");

        }

    });

  /*====================================================
 VERIFIER SESSION
====================================================*/

function verifierSession() {

    const session = JSON.parse(

        localStorage.getItem("sessionERP")

    );

    if (session && window.location.pathname.includes("login.html")) {

        console.log("Utilisateur déjà connecté.");

    }

}

  /*====================================================
 DECONNEXION
====================================================*/

function deconnexion() {

    if (!confirm("Voulez-vous vous déconnecter ?")) {

        return;

    }

    localStorage.removeItem("sessionERP");

    window.location.href = "login.html";

}

/*====================================================
 FIN
====================================================*/

console.log("Login.js chargé.");

}
