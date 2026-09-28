"use strict";

/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    AUTHENTIFICATION SUPABASE
    VERSION 7.0

    Fonctionnalités :
    - Connexion par e-mail
    - Connexion par téléphone
    - Vérification du profil ERP
    - Gestion de session ERP
    - Déconnexion complète Supabase
    - Changement de compte sans reconnexion automatique
====================================================*/


/*====================================================
    INITIALISATION
====================================================*/

document.addEventListener("DOMContentLoaded", async function () {

    console.log("==========================================");
    console.log("FERME ASHER ERP - LOGIN VERSION 7.0");
    console.log("Initialisation...");
    console.log("==========================================");

    await verifierSession();

    initialiserConnexion();

});


/*====================================================
    CONNEXION
====================================================*/

function initialiserConnexion() {

    const formulaire =
        document.getElementById("loginForm");

    if (!formulaire) {
        return;
    }


    formulaire.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /*------------------------------------------
                Vérifier Supabase
            ------------------------------------------*/

            if (!window.supabaseClient) {

                alert(
                    "Erreur : Supabase n'est pas disponible."
                );

                console.error(
                    "supabaseClient introuvable."
                );

                return;
            }


            /*------------------------------------------
                Récupérer les champs
            ------------------------------------------*/

            const champIdentifiant =
                document.getElementById("username");

            const champMotDePasse =
                document.getElementById("password");


            if (!champIdentifiant || !champMotDePasse) {

                console.error(
                    "Champs de connexion introuvables."
                );

                return;
            }


            const identifiant =
                champIdentifiant.value.trim();

            const motdepasse =
                champMotDePasse.value;


            /*------------------------------------------
                Vérifier les champs
            ------------------------------------------*/

            if (
                identifiant === "" ||
                motdepasse === ""
            ) {

                alert(
                    "Veuillez remplir tous les champs."
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
                    1. DETERMINER LE TYPE D'IDENTIFIANT
                ======================================*/

                const estEmail =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(identifiant);


                let emailConnexion =
                    identifiant;


                /*======================================
                    2. SI TELEPHONE
                ======================================*/

                if (!estEmail) {

                    console.log(
                        "Connexion par téléphone..."
                    );


                    const {
                        data: profilTelephone,
                        error: telephoneError
                    } =
                        await window.supabaseClient
                            .from("utilisateurs")
                            .select(
                                "email, actif"
                            )
                            .eq(
                                "telephone",
                                identifiant
                            )
                            .eq(
                                "actif",
                                true
                            )
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


                    emailConnexion =
                        profilTelephone.email;
                }


                /*======================================
                    3. CONNEXION SUPABASE AUTH
                ======================================*/

                console.log(
                    "Connexion Supabase avec :",
                    emailConnexion
                );


                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .signInWithPassword({

                            email:
                                emailConnexion,

                            password:
                                motdepasse

                        });


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


                const authUser =
                    data.user;


                if (!authUser) {

                    alert(
                        "Impossible de récupérer votre compte."
                    );

                    return;
                }


                console.log(
                    "Utilisateur Supabase :",
                    authUser.id
                );


                /*======================================
                    4. CHERCHER LE PROFIL ERP
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


                    sessionStorage.removeItem(
                        "sessionERP"
                    );


                    alert(
                        "Votre compte existe, mais aucun profil ERP actif ne lui est attribué."
                    );

                    return;
                }


                /*======================================
                    5. CREER LA SESSION ERP
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
                        authUser.email,

                    telephone:
                        profil.telephone ||
                        null,

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
                    "=========================================="
                );

                console.log(
                    "CONNEXION REUSSIE"
                );

                console.log(
                    "Utilisateur :",
                    session.nom
                );

                console.log(
                    "Rôle :",
                    session.role
                );

                console.log(
                    "=========================================="
                );


                /*======================================
                    6. REDIRECTION
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

        }
    );
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


        /*------------------------------------------
            Aucune session
        ------------------------------------------*/

        if (!sessionAuth) {

            console.log(
                "Aucune session Supabase active."
            );

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


        /*------------------------------------------
            Session invalide
        ------------------------------------------*/

        if (
            profilError ||
            !profil
        ) {

            console.warn(
                "Session Supabase sans profil ERP actif."
            );


            await window.supabaseClient
                .auth
                .signOut();


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
                profil.email ||
                sessionAuth.user.email,

            telephone:
                profil.telephone ||
                null,

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
            "Session Supabase active."
        );

        console.log(
            "Utilisateur :",
            session.nom
        );

        console.log(
            "Rôle :",
            session.role
        );


        /*------------------------------------------
            Si déjà sur login.html,
            retourner automatiquement au dashboard
        ------------------------------------------*/

        const page =
            window.location.pathname
                .toLowerCase();


        if (
            page.endsWith(
                "login.html"
            )
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
    DECONNEXION COMPLETE
====================================================*/

async function deconnexion(event) {

    /*
     * IMPORTANT :
     * empêcher le lien <a href="login.html">
     * de naviguer immédiatement.
     */

    if (event) {

        event.preventDefault();

        event.stopPropagation();
    }


    /*------------------------------------------
        Confirmation
    ------------------------------------------*/

    const confirmation =
        confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        );


    if (!confirmation) {

        return false;
    }


    console.log(
        "Déconnexion en cours..."
    );


    try {

        /*------------------------------------------
            Déconnexion Supabase
        ------------------------------------------*/

        if (window.supabaseClient) {

           const {
    error
} =
    await window.supabaseClient
        .auth
        .signOut();


            if (error) {

                console.error(
                    "Erreur Supabase déconnexion :",
                    error
                );

                alert(
                    "Impossible de terminer la déconnexion."
                );

                return false;
            }
        }


        /*------------------------------------------
            Supprimer la session ERP
        ------------------------------------------*/

        sessionStorage.removeItem(
            "sessionERP"
        );


        localStorage.removeItem(
            "sessionERP"
        );


        console.log(
            "Session Supabase supprimée."
        );

        console.log(
            "Session ERP supprimée."
        );


        /*------------------------------------------
            Redirection vers login
        ------------------------------------------*/

        window.location.replace(
            "login.html"
        );

    }


    catch (erreur) {

        console.error(
            "Erreur déconnexion :",
            erreur
        );


        /*
         * Même en cas d'erreur,
         * supprimer la session locale.
         */

        sessionStorage.removeItem(
            "sessionERP"
        );


        localStorage.removeItem(
            "sessionERP"
        );


        alert(
            "La session locale a été supprimée."
        );


        window.location.replace(
            "login.html"
        );
    }


    return false;
}


/*====================================================
    UTILISATEUR CONNECTE
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
    EXPORT GLOBAL
====================================================*/

window.deconnexion =
    deconnexion;

window.utilisateurConnecte =
    utilisateurConnecte;


/*====================================================
    FIN
====================================================*/

console.log(
    "Ferme Asher ERP - Login.js Version 7.0 chargé."
);
