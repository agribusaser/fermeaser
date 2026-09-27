"use strict";

/**
 * ============================================================
 * FERME ASHER ERP
 * SYSTÈME CENTRAL DES RÔLES ET PERMISSIONS
 * ============================================================
 *
 * Rôles prévus :
 *
 * 1. Administrateur
 * 2. Agent central
 * 3. Agent spécialisé
 *
 * Actions prévues :
 *
 * - voir
 * - ajouter
 * - modifier
 * - supprimer
 * - exporter
 * - valider
 *
 * ============================================================
 */


/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */

let utilisateurERP = null;
let permissionsERP = [];


/* ============================================================
   NORMALISER UNE VALEUR
   ============================================================ */

function normaliserPermissionERP(valeur) {

    if (valeur === null || valeur === undefined) {
        return "";
    }

    return String(valeur)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* ============================================================
   CHARGER L'UTILISATEUR CONNECTÉ
   ============================================================ */

async function chargerUtilisateurERP() {

    try {

        if (!window.supabaseClient) {

            console.error(
                "Supabase n'est pas disponible."
            );

            return null;
        }


        /* ----------------------------------------------------
           Récupérer l'utilisateur authentifié
           ---------------------------------------------------- */

        const {
            data: { user },
            error: authError
        } = await window.supabaseClient.auth.getUser();


        if (authError) {

            console.error(
                "Erreur authentification Supabase :",
                authError
            );

            return null;
        }


        if (!user) {

            console.warn(
                "Aucun utilisateur Supabase connecté."
            );

            return null;
        }


        /* ----------------------------------------------------
           Récupérer son profil ERP
           ---------------------------------------------------- */

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


        if (error) {

            console.error(
                "Erreur lors du chargement du profil utilisateur :",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "Profil ERP introuvable."
            );

            return null;
        }


        utilisateurERP = data;


        console.log(
            "========================================"
        );

        console.log(
            "UTILISATEUR ERP CONNECTÉ"
        );

        console.log(
            "Nom :",
            utilisateurERP.nom
        );

        console.log(
            "Rôle :",
            utilisateurERP.role
        );

        console.log(
            "========================================"
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


/* ============================================================
   CHARGER LES PERMISSIONS DU RÔLE
   ============================================================ */

async function chargerPermissionsERP() {

    try {

        if (!utilisateurERP) {

            await chargerUtilisateurERP();
        }


        if (!utilisateurERP) {

            permissionsERP = [];

            return [];
        }


        /* ----------------------------------------------------
           ADMINISTRATEUR
           
           L'administrateur n'a pas besoin que chaque permission
           soit présente dans la table pour accéder au système.
           Il possède tous les droits.
           ---------------------------------------------------- */

        if (
            normaliserPermissionERP(
                utilisateurERP.role
            ) === "administrateur"
        ) {

            permissionsERP = [];

            console.log(
                "Administrateur détecté : accès global activé."
            );

            return permissionsERP;
        }


        /* ----------------------------------------------------
           AUTRES RÔLES
           ---------------------------------------------------- */

        const {
            data,
            error
        } = await window.supabaseClient

            .from("role_permissions")

            .select(
                "id, role, module, action, autorise"
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


        permissionsERP = data || [];


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


/* ============================================================
   VÉRIFIER UNE PERMISSION
   ============================================================ */

function aPermission(module, action) {

    /* --------------------------------------------------------
       Sans utilisateur connecté
       -------------------------------------------------------- */

    if (!utilisateurERP) {

        return false;
    }


    /* --------------------------------------------------------
       ADMINISTRATEUR = TOUS LES DROITS
       -------------------------------------------------------- */

    if (
        normaliserPermissionERP(
            utilisateurERP.role
        ) === "administrateur"
    ) {

        return true;
    }


    /* --------------------------------------------------------
       Normalisation
       -------------------------------------------------------- */

    const moduleNormalise =
        normaliserPermissionERP(module);

    const actionNormalisee =
        normaliserPermissionERP(action);


    /* --------------------------------------------------------
       Recherche de la permission
       -------------------------------------------------------- */

    return permissionsERP.some(
        function(permission) {

            const modulePermission =
                normaliserPermissionERP(
                    permission.module
                );

            const actionPermission =
                normaliserPermissionERP(
                    permission.action
                );


            return (

                modulePermission === moduleNormalise

                &&

                actionPermission === actionNormalisee

                &&

                permission.autorise === true

            );

        }
    );
}


/* ============================================================
   OBTENIR LE RÔLE
   ============================================================ */

function obtenirRoleERP() {

    if (!utilisateurERP) {

        return null;
    }

    return utilisateurERP.role || null;
}


/* ============================================================
   VÉRIFIER ADMINISTRATEUR
   ============================================================ */

function estAdministrateurERP() {

    return (
        normaliserPermissionERP(
            obtenirRoleERP()
        ) === "administrateur"
    );
}


/* ============================================================
   OBTENIR L'UTILISATEUR
   ============================================================ */

function obtenirUtilisateurERP() {

    return utilisateurERP;
}


/* ============================================================
   APPLIQUER LES PERMISSIONS AU MENU
   ============================================================ */

function appliquerPermissionsMenuERP() {

    console.log(
        "Application des permissions au menu..."
    );


    const elementsMenu =
        document.querySelectorAll(
            ".sidebar li[data-module]"
        );


    if (!elementsMenu.length) {

        console.warn(
            "Aucun élément de menu data-module trouvé."
        );

        return;
    }


    const role =
        obtenirRoleERP();


    console.log(
        "Rôle détecté :",
        role
    );


    /* ========================================================
       PARCOURIR LES ÉLÉMENTS DU MENU
       ======================================================== */

    elementsMenu.forEach(
        function(element) {

            const module =
                element.getAttribute(
                    "data-module"
                );


            if (!module) {

                return;
            }


            /* ------------------------------------------------
               ADMINISTRATEUR
               ------------------------------------------------ */

            if (estAdministrateurERP()) {

                element.style.display = "";

                console.log(
                    "ADMIN → accès autorisé :",
                    module
                );

                return;
            }


            /* ------------------------------------------------
               AUTRES RÔLES
               ------------------------------------------------ */

            const autorise =
                aPermission(
                    module,
                    "voir"
                );


            if (autorise) {

                element.style.display = "";

                console.log(
                    "ACCÈS AUTORISÉ :",
                    module
                );

            } else {

                element.style.display = "none";

                console.log(
                    "ACCÈS REFUSÉ :",
                    module
                );
            }

        }
    );


    console.log(
        "Permissions du menu appliquées."
    );
}


/* ============================================================
   INITIALISATION DU SYSTÈME
   ============================================================ */

async function initialiserPermissionsERP() {

    console.log(
        "========================================"
    );

    console.log(
        "INITIALISATION DES PERMISSIONS ERP"
    );

    console.log(
        "========================================"
    );


    /* --------------------------------------------------------
       1. Charger l'utilisateur
       -------------------------------------------------------- */

    const utilisateur =
        await chargerUtilisateurERP();


    if (!utilisateur) {

        console.warn(
            "Impossible d'initialiser les permissions."
        );

        return false;
    }


    /* --------------------------------------------------------
       2. Charger les permissions
       -------------------------------------------------------- */

    await chargerPermissionsERP();


    /* --------------------------------------------------------
       3. Appliquer les permissions au menu
       -------------------------------------------------------- */

    appliquerPermissionsMenuERP();


    /* --------------------------------------------------------
       4. Afficher le résultat
       -------------------------------------------------------- */

    console.log(
        "========================================"
    );

    console.log(
        "SYSTÈME DE PERMISSIONS PRÊT"
    );

    console.log(
        "Utilisateur :",
        utilisateurERP.nom
    );

    console.log(
        "Rôle :",
        utilisateurERP.role
    );

    console.log(
        "Administrateur :",
        estAdministrateurERP()
    );

    console.log(
        "Nombre de permissions :",
        permissionsERP.length
    );

    console.log(
        "========================================"
    );


    return true;
}


/* ============================================================
   EXPORTS GLOBAUX
   ============================================================ */

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

window.initialiserPermissionsERP =
    initialiserPermissionsERP;

window.appliquerPermissionsMenuERP =
    appliquerPermissionsMenuERP;


/* ============================================================
   DÉMARRAGE AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initialiserPermissionsERP();

    }
);
