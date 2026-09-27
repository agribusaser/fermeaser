/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    AUTHENTIFICATION SUPABASE
    Version 6.0
    Connexion : E-mail OU Téléphone
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


        /*------------------------------------------
            Vérifier Supabase
        ------------------------------------------*/

        if (!window.supabaseClient) {

            alert(
                "Erreur : Supabase n'est pas disponible. Vérifiez le chargement de supabase.js."
            );

            console.error(
                "supabaseClient introuvable."
            );

            return;
        }


        /*------------------------------------------
            Récupérer les données
        ------------------------------------------*/

        const identifiant =
            document.getElementById("username").value.trim();

        const motdepasse =
            document.getElementById("password").value;


        if (identifiant === "" || motdepasse === "") {

            alert(
                "Veuillez remplir tous les champs."
            );

            return;
        }


        /*------------------------------------------
            Désactiver le bouton
        ------------------------------------------*/

        const bouton =
            formulaire.querySelector("button[type='submit']");

        if (bouton) {

            bouton.disabled = true;

            bouton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';

        }


        try {

            let emailConnexion = identifiant;


            /*================================================
                1. SI L'IDENTIFIANT EST UN TELEPHONE
            =================================================*/

            const ressembleTelephone =
                /^[+0-9\s().-]+$/.test(identifiant);


            if (ressembleTelephone) {

                /*
                    Rechercher le profil avec le téléphone
                */

                const { data: profilTelephone, error: telephoneError } =
                    await window.supabaseClient
                        .from("utilisateurs")
                        .select("email, actif")
                        .eq("telephone", identifiant)
                        .eq("actif", true)
                        .maybeSingle();


                if (telephoneError) {

                    console.error(
                        "Erreur recherche téléphone :",
                        telephoneError
                    );

                    alert(
                        "Impossible de vérifier ce numéro de téléphone."
                    );

                    return;
                }


                if (!profilTelephone) {

                    alert(
                        "Numéro de téléphone ou mot de passe incorrect."
                    );

                    return;
                }


                if (!profilTelephone.email) {

                    alert(
                        "Ce compte n'a pas d'adresse e-mail associée."
                    );

                    return;
                }


                /*
                    Supabase Auth utilise l'e-mail
                    pour effectuer la connexion.
                */

                emailConnexion =
                    profilTelephone.email;

            }


           /*------------------------------------------
    1. CONNEXION SUPABASE AUTH
------------------------------------------*/

const estEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(utilisateur);

let credentials;

if (estEmail) {

    // Connexion avec adresse e-mail
    credentials = {
        email: utilisateur,
        password: motdepasse
    };

} else {

    // Connexion avec numéro de téléphone
    credentials = {
        phone: utilisateur,
        password: motdepasse
    };

}


const { data, error } =
    await window.supabaseClient.auth.signInWithPassword(
        credentials
    );


if (error) {

    console.error(
        "Erreur Supabase Auth :",
        error
    );

    alert(
        "Numéro de téléphone/e-mail ou mot de passe incorrect."
    );

    return;
}


            if (error) {

                console.error(
                    "Erreur Supabase Auth :",
                    error
                );

                alert(
                    "Identifiant ou mot de passe incorrect."
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


            /*================================================
                3. CHERCHER LE PROFIL ERP
            =================================================*/

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


            /*================================================
                4. CREER LA SESSION ERP
            =================================================*/

            const session = {

                auth_user_id:
                    authUser.id,

                utilisateur_id:
                    profil.id,

                nom:
                    profil.nom,

                email:
                    profil.email || authUser.email,

                telephone:
                    profil.telephone || null,

                role:
                    profil.role,

                connexion:
                    new Date().toISOString()

            };


            sessionStorage.setItem(
                "sessionERP",
                JSON.stringify(session)
            );


            console.log(
                "Connexion réussie :",
                session
            );


            /*================================================
                5. REDIRECTION
            =================================================*/

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


        /*------------------------------------------
            Recréer la session ERP
        ------------------------------------------*/

        const session = {

            auth_user_id:
                sessionAuth.user.id,

            utilisateur_id:
                profil.id,

            nom:
                profil.nom,

            email:
                profil.email || sessionAuth.user.email,

            telephone:
                profil.telephone || null,

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
            Redirection
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
    "Ferme Asher ERP - Login.js Version 6.0 chargé."
);
