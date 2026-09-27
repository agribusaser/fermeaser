/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    AUTHENTIFICATION SUPABASE
    Version 6.0

    Connexion possible avec :
    - Adresse e-mail
    - Numéro de téléphone
    - Mot de passe

    Le rôle est récupéré depuis :
    public.utilisateurs
====================================================*/


document.addEventListener("DOMContentLoaded", async () => {

    await verifierSession();

    initialiserConnexion();

});


/*====================================================
    CONNEXION
====================================================*/

function initialiserConnexion() {

    const formulaire =
        document.getElementById("loginForm");

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
            Récupérer les informations
        ------------------------------------------*/

        const utilisateur =
            document
                .getElementById("username")
                .value
                .trim();

        const motdepasse =
            document
                .getElementById("password")
                .value;


        if (
            utilisateur === "" ||
            motdepasse === ""
        ) {

            alert(
                "Veuillez saisir votre e-mail ou numéro de téléphone et votre mot de passe."
            );

            return;
        }


        /*------------------------------------------
            Désactiver le bouton
        ------------------------------------------*/

        const bouton =
            formulaire.querySelector(
                "button[type='submit']"
            );


        if (bouton) {

            bouton.disabled = true;

            bouton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';

        }


        try {

            /*======================================
                1. DÉTERMINER LE TYPE D'IDENTIFIANT
            ======================================*/

            const estEmail =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(utilisateur);


            let identifiantAuth = utilisateur;


            /*======================================
                2. SI TÉLÉPHONE
            ======================================*/

            if (!estEmail) {

                const telephone =
                    normaliserTelephone(utilisateur);


                console.log(
                    "Connexion avec téléphone :",
                    telephone
                );


                /*
                    Supabase Auth doit connaître
                    ce numéro comme téléphone du compte.
                */

                identifiantAuth = telephone;

            }


            /*======================================
                3. CONNEXION SUPABASE AUTH
            ======================================*/

            const credentials = estEmail

                ? {
                    email: identifiantAuth,
                    password: motdepasse
                }

                : {
                    phone: identifiantAuth,
                    password: motdepasse
                };


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .signInWithPassword(
                        credentials
                    );


            /*--------------------------------------
                Erreur de connexion
            --------------------------------------*/

            if (error) {

                console.error(
                    "Erreur Supabase Auth :",
                    error
                );


                alert(
                    "E-mail ou numéro de téléphone, ou mot de passe incorrect."
                );

                return;
            }


            /*======================================
                4. UTILISATEUR AUTHENTIFIÉ
            ======================================*/

            const authUser =
                data.user;


            if (!authUser) {

                alert(
                    "Impossible de récupérer votre compte."
                );

                return;
            }


            /*======================================
                5. RÉCUPÉRER LE PROFIL ERP
            ======================================*/

            const {
                data: profil,
                error: profilError
            } =
                await window.supabaseClient
                    .from("utilisateurs")
                    .select("*")
                    .eq(
                        "auth_user_id",
                        authUser.id
                    )
                    .eq(
                        "actif",
                        true
                    )
                    .single();


            /*--------------------------------------
                Profil introuvable
            --------------------------------------*/

            if (
                profilError ||
                !profil
            ) {

                console.error(
                    "Profil ERP introuvable :",
                    profilError
                );


                await window.supabaseClient
                    .auth
                    .signOut();


                alert(
                    "Votre compte existe, mais aucun profil ERP actif ne lui est attribué."
                );

                return;
            }


            /*======================================
                6. CRÉER LA SESSION ERP
            ======================================*/

            const session = {

                auth_user_id:
                    authUser.id,

                utilisateur_id:
                    profil.id,

                nom:
                    profil.nom,

                email:
                    profil.email ||
                    authUser.email ||
                    "",

                telephone:
                    profil.telephone ||
                    authUser.phone ||
                    "",

                role:
                    profil.role,

                connexion:
                    new Date().toISOString()

            };


            /*======================================
                7. ENREGISTRER LA SESSION
            ======================================*/

            sessionStorage.setItem(
                "sessionERP",
                JSON.stringify(session)
            );


            console.log(
                "Connexion ERP réussie :",
                session
            );


            /*======================================
                8. REDIRECTION
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
    NORMALISER LE NUMÉRO DE TÉLÉPHONE
====================================================*/

function normaliserTelephone(numero) {

    let telephone =
        numero
            .trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "");


    /*
        Exemple :

        097 000 00 00
        devient :
        0970000000

        Si tu saisis :
        +243970000000
        il reste :
        +243970000000
    */


    return telephone;

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

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .getSession();


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

        const {
            data: profil,
            error: profilError
        } =
            await window.supabaseClient
                .from("utilisateurs")
                .select("*")
                .eq(
                    "auth_user_id",
                    sessionAuth.user.id
                )
                .eq(
                    "actif",
                    true
                )
                .single();


        if (
            profilError ||
            !profil
        ) {

            await window.supabaseClient
                .auth
                .signOut();


            sessionStorage.removeItem(
                "sessionERP"
            );

            return;

        }


        /*------------------------------------------
            Reconstituer la session ERP
        ------------------------------------------*/

        const session = {

            auth_user_id:
                sessionAuth.user.id,

            utilisateur_id:
                profil.id,

            nom:
                profil.nom,

            email:
                profil.email ||
                sessionAuth.user.email ||
                "",

            telephone:
                profil.telephone ||
                sessionAuth.user.phone ||
                "",

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
            Redirection si déjà connecté
        ------------------------------------------*/

        const page =
            window.location.pathname
                .toLowerCase();


        if (
            page.endsWith("login.html")
        ) {

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

            await window.supabaseClient
                .auth
                .signOut();

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
    UTILISATEUR CONNECTÉ
====================================================*/

function utilisateurConnecte() {

    const session =
        sessionStorage.getItem(
            "sessionERP"
        );


    if (!session) {

        return null;

    }


    try {

        return JSON.parse(
            session
        );

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
