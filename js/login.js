/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    AUTHENTIFICATION SUPABASE
    Version 5.0
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


        // Vérifier que Supabase est disponible
        if (!window.supabaseClient) {

            alert(
                "Erreur : Supabase n'est pas disponible. Vérifiez le chargement de supabase.js."
            );

            console.error(
                "supabaseClient introuvable."
            );

            return;
        }


        const utilisateur =
            document.getElementById("username").value.trim();

        const motdepasse =
            document.getElementById("password").value;


        if (utilisateur === "" || motdepasse === "") {

            alert(
                "Veuillez remplir tous les champs."
            );

            return;
        }


        // Désactiver le bouton pendant la connexion
        const bouton =
            formulaire.querySelector("button[type='submit']");

        if (bouton) {

            bouton.disabled = true;

            bouton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';
        }


        try {

            /*------------------------------------------
                1. CONNEXION SUPABASE AUTH
            ------------------------------------------*/

            const { data, error } =
                await window.supabaseClient.auth.signInWithPassword({

                    email: utilisateur,

                    password: motdepasse

                });


            if (error) {

                console.error(
                    "Erreur Supabase Auth :",
                    error
                );

                alert(
                    "Adresse e-mail ou mot de passe incorrect."
                );

                return;
            }


            const authUser = data.user;


            if (!authUser) {

                alert(
                    "Impossible de récupérer votre compte."
                );

                return;
            }


            /*------------------------------------------
                2. CHERCHER LE PROFIL ERP
            ------------------------------------------*/

            const { data: profil, error: profilError } =
                await window.supabaseClient
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


                await window.supabaseClient.auth.signOut();


                alert(
                    "Votre compte existe, mais aucun profil ERP actif ne lui est attribué."
                );

                return;
            }


            /*------------------------------------------
                3. CREER LA SESSION ERP
            ------------------------------------------*/

            const session = {

                auth_user_id: authUser.id,

                utilisateur_id: profil.id,

                nom: profil.nom,

                email: profil.email || authUser.email,

                role: profil.role,

                connexion: new Date().toISOString()

            };


            sessionStorage.setItem(
                "sessionERP",
                JSON.stringify(session)
            );


            console.log(
                "Connexion réussie :",
                session
            );


            /*------------------------------------------
                4. REDIRECTION
            ------------------------------------------*/

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


        finally {

            if (bouton) {

                bouton.disabled = false;

                bouton.innerHTML =
                    '<i class="fa-solid fa-right-to-bracket"></i> Se connecter';

            }

        }

    });

}


/*====================================================
    VERIFIER LA SESSION EXISTANTE
====================================================*/

async function verifierSession() {

    // Si Supabase n'est pas encore disponible,
    // on ne bloque pas la page de connexion.

    if (!window.supabaseClient) {

        console.error(
            "Supabase n'est pas disponible."
        );

        return;
    }


    try {

        const { data, error } =
            await window.supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Erreur récupération session :",
                error
            );

            return;
        }


        const sessionAuth =
            data.session;


        if (!sessionAuth) {

            return;
        }


        /*------------------------------------------
            Récupérer le profil ERP
        ------------------------------------------*/

        const { data: profil, error: profilError } =
            await window.supabaseClient
                .from("utilisateurs")
                .select("*")
                .eq("auth_user_id", sessionAuth.user.id)
                .eq("actif", true)
                .single();


        if (profilError || !profil) {

            await window.supabaseClient.auth.signOut();

            sessionStorage.removeItem(
                "sessionERP"
            );

            return;
        }


        const session = {

            auth_user_id:
                sessionAuth.user.id,

            utilisateur_id:
                profil.id,

            nom:
                profil.nom,

            email:
                profil.email || sessionAuth.user.email,

            role:
                profil.role,

            connexion:
                new Date().toISOString()

        };


        sessionStorage.setItem(
            "sessionERP",
            JSON.stringify(session)
        );


        /*------------------------------------------
            Si déjà connecté et sur login.html
        ------------------------------------------*/

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

        if (window.supabaseClient) {

            await window.supabaseClient.auth.signOut();

        }

    }


    catch (erreur) {

        console.error(
            "Erreur déconnexion :",
            erreur
        );

    }


    sessionStorage.removeItem(
        "sessionERP"
    );


    window.location.replace(
        "login.html"
    );

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
    "Ferme Asher ERP - Login.js Version 5.0 chargé."
);
