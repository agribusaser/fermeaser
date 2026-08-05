/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    Version 3.0
====================================================*/

/*====================================================
    INITIALISATION
====================================================*/

document.addEventListener("DOMContentLoaded", () => {

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

        if (utilisateur === "" || motdepasse === "") {

            alert("Veuillez remplir tous les champs.");

            return;

        }

        //==========================================
        // UTILISATEUR PAR DEFAUT
        //==========================================

        if (utilisateur === "admin" && motdepasse === "admin123") {

            const session = {

                utilisateur: "admin",

                nom: "Administrateur",

                role: "Administrateur",

                connexion: new Date().toISOString()

            };

            localStorage.setItem(

                "sessionERP",

                JSON.stringify(session)

            );

            console.log("Connexion réussie.");

            // Redirection
            window.location.replace("dashboard.html");

            return;

        }

        alert("Nom d'utilisateur ou mot de passe incorrect.");

    });

}

/*====================================================
    VERIFIER SESSION
====================================================*/

function verifierSession() {

    const session = JSON.parse(

        localStorage.getItem("sessionERP")

    );

    if (!session) return;

    const page = window.location.pathname.toLowerCase();

    if (page.endsWith("login.html")) {

        window.location.replace("dashboard.html");

    }

}

/*====================================================
    DECONNEXION
====================================================*/

function deconnexion() {

    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {

        return;

    }

    localStorage.removeItem("sessionERP");

    window.location.replace("login.html");

}

/*====================================================
    UTILISATEUR CONNECTE
====================================================*/

function utilisateurConnecte() {

    return JSON.parse(

        localStorage.getItem("sessionERP")

    );

}

/*====================================================
    FIN
====================================================*/

console.log("Ferme Asher ERP - Login.js Version 3.0 chargé.");
