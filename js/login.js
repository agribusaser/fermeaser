/*====================================================
    FERME ASHER ERP
    LOGIN.JS
    AUTHENTIFICATION SUPABASE
    Version 7.0

    CONNEXION :
    - E-mail + mot de passe
    - Téléphone + mot de passe

    Le téléphone est recherché dans la table
    public.utilisateurs puis l'e-mail associé
    est utilisé pour Supabase Auth.
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

    const formulaire =
        document.getElementById("loginForm");

    if (!formulaire) {

        console.error(
            "Formulaire loginForm introuvable."
        );

        return;
    }


    formulaire.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            /*------------------------------------------
                1. VERIFIER SUPABASE
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
                2. RECUPERER LES CHAMPS
            ------------------------------------------*/

            const champIdentifiant =
                document.getElementById("username");

            const champMotDePasse =
                document.getElementById("password");


            if (!champIdentifiant || !champMotDePasse) {

                console.error(
                    "Champ username ou password introuvable."
                );

                alert(
                    "Erreur : les champs de connexion sont introuvables."
                );

                return;
            }


            const identifiant =
                champIdentifiant.value.trim();

            const motdepasse =
                champMotDePasse.value;


            /*------------------------------------------
                3. VERIFIER LES CHAMPS
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
                4. BOUTON CONNEXION
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

                /*--------------------------------------
                    5. DETERMINER LE TYPE D'IDENTIFIANT
                --------------------------------------*/

                const estEmail =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(identifiant);


                let emailConnexion =
                    identifiant;


                /*======================================
                    CAS 1 : CONNEXION PAR TELEPHONE
                ======================================*/

                if (!estEmail) {

                    console.log(
                        "Connexion par téléphone..."
                    );


                    /*----------------------------------
                        Rechercher le téléphone
                    ----------------------------------*/

                    const {
                        data: profilTelephone,
                        error: telephoneError
                    } =
                        await window.supabaseClient
                            .from("utilisateurs")
                            .select(
                                "id, auth_user_id, nom, email, telephone, role, actif"
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


                    /*----------------------------------
                        Erreur recherche téléphone
                    ----------------------------------*/

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


                    /*----------------------------------
                        Téléphone introuvable
                    ----------------------------------*/

                    if (!profilTelephone) {

                        alert(
                            "Numéro de téléphone ou mot de passe incorrect."
                        );

                        return;
                    }


                    /*----------------------------------
                        Vérifier l'e-mail associé
                    ----------------------------------*/

                    if (
                        !profilTelephone.email ||
                        profilTelephone.email.trim() === ""
                    ) {

                        console.error(
                            "Aucun e-mail associé au téléphone."
                        );

                        alert(
                            "Ce compte possède un numéro de téléphone mais aucune adresse e-mail associée. Contactez l'administrateur."
                        );

                        return;
                    }


                    /*----------------------------------
                        Utiliser l'e-mail pour Supabase
                    ----------------------------------*/

                    emailConnexion =
                        profilTelephone.email.trim();


                    console.log(
                        "Téléphone reconnu. E-mail Auth utilisé :",
                        emailConnexion
                    );

                }


                /*======================================
                    CAS 2 : CONNEXION SUPABASE AUTH
                ======================================*/

                console.log(
                    "Connexion Supabase Auth..."
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


                /*--------------------------------------
                    Erreur authentification
                --------------------------------------*/

                if (error) {

                    console.error(
                        "Erreur Supabase Auth :",
                        error
                    );

                    alert(
                        "E-mail, numéro de téléphone ou mot de passe incorrect."
                    );

                    return;
                }


                /*--------------------------------------
                    Utilisateur Auth
                --------------------------------------*/

                const authUser =
                    data.user;


                if (!authUser) {

                    alert(
                        "Impossible de récupérer votre compte."
                    );

                    return;
                }


                console.log(
                    "Utilisateur Supabase Auth :",
                    authUser.id
                );


                /*======================================
                    6. CHERCHER LE PROFIL ERP
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
                        .maybeSingle();


                /*--------------------------------------
                    Profil ERP introuvable
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


                    sessionStorage.removeItem(
                        "sessionERP"
                    );


                    alert(
                        "Votre compte existe dans Supabase, mais aucun profil ERP actif ne lui est attribué."
                    );

                    return;
                }


                /*======================================
                    7. CREER LA SESSION ERP
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
                        null,

                    telephone:
                        profil.telephone ||
                        null,

                    role:
                        profil.role,

                    connexion:
                        new Date().toISOString()

                };


                /*--------------------------------------
                    Enregistrer la session
                --------------------------------------*/

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
                    "Erreur inattendue pendant la connexion :",
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

    /*------------------------------------------
        Vérifier Supabase
    ------------------------------------------*/

    if (!window.supabaseClient) {

        console.error(
            "Supabase n'est pas disponible."
        );

        return;
    }


    try {

        /*------------------------------------------
            Récupérer la session Supabase
        ------------------------------------------*/

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

            return;
        }


        /*==========================================
            Récupérer le profil ERP
        ==========================================*/

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
                .maybeSingle();


        /*------------------------------------------
            Profil absent ou inactif
        ------------------------------------------*/

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


        /*==========================================
            Recréer la session ERP
        ==========================================*/

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
                null,

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


        /*------------------------------------------
            Redirection si déjà connecté
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


    /*------------------------------------------
        Supprimer la session ERP locale
    ------------------------------------------*/

    sessionStorage.removeItem(
        "sessionERP"
    );


    /*------------------------------------------
        Retour à la connexion
    ------------------------------------------*/

    window.location.replace(
        "login.html"
    );

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
    FIN
====================================================*/

console.log(
    "Ferme Asher ERP - Login.js Version 7.0 chargé."
);
