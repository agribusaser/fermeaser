/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    Version 4.0 - SUPABASE AUTH
====================================================*/

/*====================================================
    INITIALISATION
====================================================*/

document.addEventListener("DOMContentLoaded", async () => {

    await verifierSession();

    initialiserConnexion();

});


/*====================================================
    CONNEXION
====================================================*/

function initialiserConnexion() {

    const formulaire = document.getElementById("loginForm");

    if (!formulaire) return;

    formulaire.addEventListener("submit", async function (e) {

        e.preventDefault();

        const utilisateur =
            document.getElementById("username").value.trim();

        const motdepasse =
            document.getElementById("password").value;

        if (utilisateur === "" || motdepasse === "") {

            alert("Veuillez remplir tous les champs.");

            return;

        }

        /*==========================================
            VERIFICATION SUPABASE
        ==========================================*/

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            alert(
                "Erreur : Supabase n'est pas disponible. " +
                "Vérifiez le chargement de supabase.js."
            );

            console.error(
                "supabaseClient est introuvable."
            );

            return;
        }

        try {

            /*======================================
                CONNEXION AUTHENTIFICATION
            ======================================*/

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: utilisateur,

                    password: motdepasse

                });


            if (error) {

                console.error(
                    "Erreur de connexion Supabase :",
                    error
                );

                alert(
                    "Email ou mot de passe incorrect."
                );

                return;

            }


            /*======================================
                UTILISATEUR AUTHENTIFIE
            ======================================*/

            const authUser = data.user;

            if (!authUser) {

                alert(
                    "Impossible de récupérer l'utilisateur connecté."
                );

                return;

            }


            console.log(
                "Utilisateur Auth connecté :",
                authUser.id
            );


            /*======================================
                RECUPERATION DU PROFIL ERP
            ======================================*/

            const { data: profil, error: profilError } =
                await supabaseClient
                    .from("utilisateurs")
                    .select("*")
                    .eq("auth_user_id", authUser.id)
                    .eq("actif", true)
                    .single();


            if (profilError || !profil) {

                console.error(
                    "Profil ERP introuvable :",
                    profilError
                );

                await supabaseClient.auth.signOut();

                alert(
                    "Votre compte existe dans l'authentification, " +
                    "mais aucun profil ERP actif ne lui est associé."
                );

                return;

            }


            /*======================================
                SESSION ERP
            ======================================*/

            const sessionERP = {

                auth_user_id: authUser.id,

                utilisateur_id: profil.id,

                nom: profil.nom,

                email: profil.email || authUser.email,

                role: profil.role,

                connexion: new Date().toISOString()

            };


            /*
             * IMPORTANT :
             * Cette session ne sert pas à authentifier
             * l'utilisateur.
             *
             * L'authentification réelle est gérée
             * par Supabase Auth.
             */

            sessionStorage.setItem(
                "sessionERP",
                JSON.stringify(sessionERP)
            );


            console.log(
                "Connexion ERP réussie :",
                sessionERP
            );


            /*======================================
                REDIRECTION
            ======================================*/

            window.location.replace(
                "dashboard.html"
            );

        }

        catch (erreur) {

            console.error(
                "Erreur inattendue :",
                erreur
            );

            alert(
                "Une erreur est survenue pendant la connexion."
            );

        }

    });

}


/*====================================================
    VERIFIER SESSION
====================================================*/

async function verifierSession() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient introuvable."
        );

        return;

    }


    try {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        if (!session || !session.user) {

            return;

        }


        /*==========================================
            VERIFIER LE PROFIL ERP
        ==========================================*/

        const { data: profil, error } =
            await supabaseClient
                .from("utilisateurs")
                .select("*")
                .eq("auth_user_id", session.user.id)
                .eq("actif", true)
                .single();


        if (error || !profil) {

            await supabaseClient.auth.signOut();

            sessionStorage.removeItem(
                "sessionERP"
            );

            return;

        }


        /*==========================================
            METTRE A JOUR LA SESSION ERP
        ==========================================*/

        const sessionERP = {

            auth_user_id: session.user.id,

            utilisateur_id: profil.id,

            nom: profil.nom,

            email: profil.email || session.user.email,

            role: profil.role,

            connexion: new Date().toISOString()

        };


        sessionStorage.setItem(
            "sessionERP",
            JSON.stringify(sessionERP)
        );


        /*==========================================
            SI DEJA CONNECTE → DASHBOARD
        ==========================================*/

        const page =
            window.location.pathname.toLowerCase();


        if (page.endsWith("login.html")) {

            window.location.replace(
                "dashboard.html"
            );

        }

    }

    catch (erreur) {

        console.error(
            "Erreur vérification session :",
            erreur
        );

    }

}


/*====================================================
    DECONNEXION
====================================================*/

async function deconnexion() {

    if (
        !confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        )
    ) {

        return;

    }


    try {

        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Erreur de déconnexion :",
                error
            );

            alert(
                "Erreur pendant la déconnexion."
            );

            return;

        }


        sessionStorage.removeItem(
            "sessionERP"
        );


        window.location.replace(
            "login.html"
        );

    }

    catch (erreur) {

        console.error(
            "Erreur inattendue :",
            erreur
        );

    }

}


/*====================================================
    UTILISATEUR CONNECTE
====================================================*/

function utilisateurConnecte() {

    const session =
        sessionStorage.getItem("sessionERP");

    if (!session) {

        return null;

    }

    try {

        return JSON.parse(session);

    }

    catch (erreur) {

        console.error(
            "Session ERP invalide :",
            erreur
        );

        return null;

    }

}


/*====================================================
    FIN
====================================================*/

console.log(
    "Ferme Asher ERP - Login.js Version 4.0 - Supabase Auth chargé."
);
