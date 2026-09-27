"use strict";

/**
 * =========================================================
 * FERME ASHER ERP
 * PERMISSIONS.JS
 * Gestion des rôles et permissions
 * =========================================================
 *
 * RÔLES :
 * 1. Administrateur
 * 2. Agent central
 * 3. Agent spécialisé
 *
 * ACTIONS :
 * voir
 * ajouter
 * modifier
 * supprimer
 * exporter
 * valider
 * =========================================================
 */


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let utilisateurERP = null;

let permissionsERP = [];



/* =========================================================
   CHARGER L'UTILISATEUR CONNECTÉ
========================================================= */

async function chargerUtilisateurERP() {

    try {

        /*
         * Vérifier Supabase
         */

        if (!window.supabaseClient) {

            console.error(
                "Supabase n'est pas disponible."
            );

            return null;
        }


        /*
         * Récupérer l'utilisateur authentifié
         */

        const {
            data: { user },
            error: authError
        } = await window.supabaseClient.auth.getUser();


        if (authError || !user) {

            console.warn(
                "Aucun utilisateur Supabase connecté."
            );

            return null;
        }


        /*
         * Chercher son profil ERP
         */

        const {
            data,
            error
        } = await window.supabaseClient

            .from("utilisateurs")

            .select("*")

            .eq(
                "auth_user_id",
                user.id
            )

            .eq(
                "actif",
                true
            )

            .single();


        if (error || !data) {

            console.error(
                "Erreur lors du chargement du profil utilisateur :",
                error
            );

            return null;
        }


        /*
         * Stocker l'utilisateur
         */

        utilisateurERP = data;


        console.log(
            "===================================="
        );

        console.log(
            "Utilisateur connecté :",
            utilisateurERP.nom
        );

        console.log(
            "Rôle :",
            utilisateurERP.role
        );

        console.log(
            "===================================="
        );


        return utilisateurERP;


    } catch (error) {

        console.error(
            "Erreur chargerUtilisateurERP :",
            error
        );

        return null;
    }

}



/* =========================================================
   CHARGER LES PERMISSIONS DU RÔLE
========================================================= */

async function chargerPermissionsERP() {

    try {

        /*
         * Si l'utilisateur n'est pas encore chargé
         */

        if (!utilisateurERP) {

            await chargerUtilisateurERP();

        }


        /*
         * Aucun utilisateur
         */

        if (!utilisateurERP) {

            permissionsERP = [];

            return [];

        }


        /*
         * ADMINISTRATEUR
         *
         * L'administrateur possède tous les droits.
         * Il n'est donc pas nécessaire de dépendre
         * de la table role_permissions pour le menu.
         */

        if (
            utilisateurERP.role &&
            utilisateurERP.role
                .toLowerCase()
                .trim() === "administrateur"
        ) {

            permissionsERP = [];

            console.log(
                "Administrateur détecté : accès complet."
            );

            return permissionsERP;
        }


        /*
         * AUTRES RÔLES
         *
         * Charger les permissions depuis Supabase.
         */

        const {
            data,
            error
        } = await window.supabaseClient

            .from("role_permissions")

            .select(
                "role, module, action, autorise"
            )

            .eq(
                "role",
                utilisateurERP.role
            )

            .eq(
                "autorise",
                true
            );


        if (error) {

            console.error(
                "Erreur lors du chargement des permissions :",
                error
            );

            permissionsERP = [];

            return [];

        }


        permissionsERP =
            data || [];


        console.log(
            "Permissions chargées :",
            permissionsERP
        );


        return permissionsERP;


    } catch (error) {

        console.error(
            "Erreur chargerPermissionsERP :",
            error
        );

        permissionsERP = [];

        return [];

    }

}



/* =========================================================
   VÉRIFIER UNE PERMISSION
========================================================= */

function aPermission(
    module,
    action
) {

    /*
     * Vérification de sécurité
     */

    if (
        !module ||
        !action
    ) {

        return false;

    }


    /*
     * ADMINISTRATEUR
     *
     * Accès total.
     */

    if (
        utilisateurERP &&
        utilisateurERP.role &&
        utilisateurERP.role
            .toLowerCase()
            .trim() === "administrateur"
    ) {

        return true;

    }


    /*
     * Vérifier dans les permissions
     */

    return permissionsERP.some(
        permission =>

            permission.module === module &&

            permission.action === action &&

            permission.autorise === true

    );

}



/* =========================================================
   OBTENIR LE RÔLE
========================================================= */

function obtenirRoleERP() {

    return utilisateurERP
        ? utilisateurERP.role
        : null;

}



/* =========================================================
   VÉRIFIER ADMINISTRATEUR
========================================================= */

function estAdministrateurERP() {

    return (

        utilisateurERP &&

        utilisateurERP.role &&

        utilisateurERP.role
            .toLowerCase()
            .trim() === "administrateur"

    );

}



/* =========================================================
   VÉRIFIER AGENT CENTRAL
========================================================= */

function estAgentCentralERP() {

    return (

        utilisateurERP &&

        utilisateurERP.role &&

        utilisateurERP.role
            .toLowerCase()
            .trim() === "agent central"

    );

}



/* =========================================================
   VÉRIFIER AGENT SPÉCIALISÉ
========================================================= */

function estAgentSpecialiseERP() {

    return (

        utilisateurERP &&

        utilisateurERP.role &&

        utilisateurERP.role
            .toLowerCase()
            .trim() === "agent spécialisé"

    );

}



/* =========================================================
   OBTENIR L'UTILISATEUR
========================================================= */

function obtenirUtilisateurERP() {

    return utilisateurERP;

}



/* =========================================================
   INITIALISATION DU SYSTÈME
========================================================= */

async function initialiserPermissionsERP() {

    console.log(
        "===================================="
    );

    console.log(
        "FERME ASHER ERP"
    );

    console.log(
        "Initialisation des permissions..."
    );

    console.log(
        "===================================="
    );


    /*
     * Charger l'utilisateur
     */

    const utilisateur =
        await chargerUtilisateurERP();


    /*
     * Si aucun utilisateur
     */

    if (!utilisateur) {

        console.warn(
            "Impossible d'initialiser les permissions."
        );

        return false;

    }


    /*
     * Charger les permissions
     */

    await chargerPermissionsERP();


    /*
     * Appliquer les permissions au menu
     */

    appliquerPermissionsMenuERP();


    /*
     * Actualiser la poussinière
     * si la fonction existe.
     */

    if (
        typeof chargerPoussiniere === "function"
    ) {

        try {

            chargerPoussiniere();

        } catch (error) {

            console.warn(
                "Erreur chargement poussinière :",
                error
            );

        }

    }


    /*
     * Informations de contrôle
     */

    console.log(
        "Utilisateur :",
        utilisateurERP.nom
    );

    console.log(
        "Rôle :",
        utilisateurERP.role
    );

    console.log(
        "Permissions :",
        permissionsERP
    );


    console.log(
        "Système de permissions prêt."
    );


    return true;

}



/* =========================================================
   APPLIQUER LES PERMISSIONS AU MENU
========================================================= */

function appliquerPermissionsMenuERP() {

    console.log(
        "Application des permissions au menu..."
    );


    /*
     * Chercher tous les éléments du menu
     * possédant data-module.
     */

    const elementsMenu =
        document.querySelectorAll(
            ".sidebar li[data-module]"
        );


    /*
     * Aucun menu trouvé
     */

    if (
        !elementsMenu ||
        elementsMenu.length === 0
    ) {

        console.warn(
            "Aucun élément de menu data-module trouvé."
        );

        return;

    }


    /*
     * Récupérer le rôle
     */

    const role =
        obtenirRoleERP();


    console.log(
        "Rôle détecté :",
        role
    );


    /*
     * Parcourir le menu
     */

    elementsMenu.forEach(
        function(element) {


            const module =
                element.getAttribute(
                    "data-module"
                );


            /*
             * Aucun module
             */

            if (!module) {

                return;

            }


            /*
             * ADMINISTRATEUR
             *
             * Accès complet.
             */

            if (
                role &&
                role
                    .toLowerCase()
                    .trim() === "administrateur"
            ) {

                element.style.display = "";


                console.log(
                    "ADMIN → accès autorisé :",
                    module
                );


                return;

            }


            /*
             * AUTRES RÔLES
             *
             * Vérifier le droit "voir".
             */

            const autorise =
                aPermission(
                    module,
                    "voir"
                );


            if (autorise) {

                element.style.display = "";


                console.log(
                    "Accès autorisé :",
                    module
                );

            } else {

                element.style.display = "none";


                console.log(
                    "Accès refusé :",
                    module
                );

            }

        }
    );


    console.log(
        "Permissions du menu appliquées."
    );

}



/* =========================================================
   RÉINITIALISER LES PERMISSIONS
========================================================= */

function reinitialiserPermissionsERP() {

    utilisateurERP = null;

    permissionsERP = [];


    console.log(
        "Permissions ERP réinitialisées."
    );

}



/* =========================================================
   EXPORT GLOBAL
========================================================= */

window.chargerUtilisateurERP =
    chargerUtilisateurERP;


window.chargerPermissionsERP =
    chargerPermissionsERP;


window.aPermission =
    aPermission;


window.obtenirRoleERP =
    obtenirRoleERP;


window.obtenirUtilisateurERP =
    obtenirUtilisateurERP;


window.estAdministrateurERP =
    estAdministrateurERP;


window.estAgentCentralERP =
    estAgentCentralERP;


window.estAgentSpecialiseERP =
    estAgentSpecialiseERP;


window.initialiserPermissionsERP =
    initialiserPermissionsERP;


window.appliquerPermissionsMenuERP =
    appliquerPermissionsMenuERP;


window.reinitialiserPermissionsERP =
    reinitialiserPermissionsERP;



/* =========================================================
   DÉMARRAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initialiserPermissionsERP();

    }
);



/* =========================================================
   FIN
========================================================= */

console.log(
    "Ferme Asher ERP - permissions.js chargé."
);
