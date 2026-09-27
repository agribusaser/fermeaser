"use strict";

/**
 * ============================================================
 * FERME ASHER ERP
 * SYSTÈME CENTRAL DES RÔLES ET PERMISSIONS
 * ============================================================
 *
 * RÔLES :
 * 1. Administrateur
 * 2. Agent central
 * 3. Agent spécialisé
 *
 * ACTIONS :
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

    if (
        valeur === null ||
        valeur === undefined
    ) {
        return "";
    }

    return String(valeur)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* ============================================================
   VERIFIER SUPABASE
   ============================================================ */

function supabaseDisponibleERP() {

    return (
        window.supabaseClient &&
        typeof window.supabaseClient.auth === "object"
    );
}


/* ============================================================
   CHARGER L'UTILISATEUR CONNECTÉ
   ============================================================ */

async function chargerUtilisateurERP() {

    try {

        /* ----------------------------------------------------
           Vérifier Supabase
           ---------------------------------------------------- */

        if (!supabaseDisponibleERP()) {

            console.warn(
                "Supabase n'est pas encore disponible."
            );

            return null;
        }


        /* ----------------------------------------------------
           Récupérer l'utilisateur authentifié
           ---------------------------------------------------- */

        const {
            data: { user },
            error: authError
        } =
            await window.supabaseClient.auth.getUser();


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
           Récupérer le profil ERP
           ---------------------------------------------------- */

        const {
            data,
            error
        } =
            await window.supabaseClient
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
                .maybeSingle();


        if (error) {

            console.error(
                "Erreur lors du chargement du profil utilisateur :",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "Aucun profil ERP actif trouvé pour cet utilisateur."
            );

            return null;
        }


        /* ----------------------------------------------------
           Stocker l'utilisateur
           ---------------------------------------------------- */

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

        /* ----------------------------------------------------
           Vérifier l'utilisateur
           ---------------------------------------------------- */

        if (!utilisateurERP) {

            await chargerUtilisateurERP();
        }


        if (!utilisateurERP) {

            permissionsERP = [];

            return [];
        }


        /* ----------------------------------------------------
           Récupérer le rôle
           ---------------------------------------------------- */

        const roleUtilisateur =
            normaliserPermissionERP(
                utilisateurERP.role
            );


        console.log(
            "Chargement des permissions pour le rôle :",
            utilisateurERP.role
        );


        /* ----------------------------------------------------
           ADMINISTRATEUR
           
           L'administrateur possède tous les droits.
           Il n'est donc pas nécessaire de dépendre
           de la table role_permissions pour son accès.
           ---------------------------------------------------- */

        if (
            roleUtilisateur === "administrateur"
        ) {

            permissionsERP = [];

            console.log(
                "ADMINISTRATEUR → accès complet activé."
            );

            return permissionsERP;
        }


        /* ----------------------------------------------------
           AUTRES RÔLES
           ---------------------------------------------------- */

        const {
            data,
            error
        } =
            await window.supabaseClient
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


        permissionsERP =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Permissions chargées :",
            permissionsERP.length
        );


        console.table(
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
   VERIFIER UNE PERMISSION
   ============================================================ */

function aPermission(
    module,
    action
) {

    /* --------------------------------------------------------
       Aucun utilisateur
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
       Normaliser module et action
       -------------------------------------------------------- */

    const moduleNormalise =
        normaliserPermissionERP(
            module
        );

    const actionNormalisee =
        normaliserPermissionERP(
            action
        );


    /* --------------------------------------------------------
       Vérifier la permission
       -------------------------------------------------------- */

    return permissionsERP.some(
        function(permission) {

            if (!permission) {
                return false;
            }


            const modulePermission =
                normaliserPermissionERP(
                    permission.module
                );


            const actionPermission =
                normaliserPermissionERP(
                    permission.action
                );


            return (
                modulePermission ===
                    moduleNormalise
                &&
                actionPermission ===
                    actionNormalisee
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
   VERIFIER ADMINISTRATEUR
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


    /* --------------------------------------------------------
       Chercher les éléments du menu
       -------------------------------------------------------- */

    const elementsMenu =
        document.querySelectorAll(
            ".sidebar li[data-module]"
        );


    if (!elementsMenu.length) {

        console.warn(
            "Aucun élément .sidebar li[data-module] trouvé."
        );

        return;
    }


    const role =
        obtenirRoleERP();


    console.log(
        "Rôle détecté :",
        role
    );


    /* --------------------------------------------------------
       Parcourir les menus
       -------------------------------------------------------- */

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

            if (
                estAdministrateurERP()
            ) {

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
   VERIFIER UNE ACTION AVANT UNE OPERATION
   ============================================================ */

function verifierPermissionERP(
    module,
    action
) {

    if (
        estAdministrateurERP()
    ) {

        return true;
    }


    return aPermission(
        module,
        action
    );
}


/* ============================================================
   RACCOURCIS DE PERMISSIONS
   ============================================================ */

function peutVoirERP(module) {

    return verifierPermissionERP(
        module,
        "voir"
    );
}


function peutAjouterERP(module) {

    return verifierPermissionERP(
        module,
        "ajouter"
    );
}


function peutModifierERP(module) {

    return verifierPermissionERP(
        module,
        "modifier"
    );
}


function peutSupprimerERP(module) {

    return verifierPermissionERP(
        module,
        "supprimer"
    );
}


function peutExporterERP(module) {

    return verifierPermissionERP(
        module,
        "exporter"
    );
}


function peutValiderERP(module) {

    return verifierPermissionERP(
        module,
        "valider"
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
       Vérifier Supabase
       -------------------------------------------------------- */

    if (
        !supabaseDisponibleERP()
    ) {

        console.warn(
            "Supabase n'est pas encore disponible."
        );

        return false;
    }


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


window.verifierPermissionERP =
    verifierPermissionERP;


window.peutVoirERP =
    peutVoirERP;


window.peutAjouterERP =
    peutAjouterERP;


window.peutModifierERP =
    peutModifierERP;


window.peutSupprimerERP =
    peutSupprimerERP;


window.peutExporterERP =
    peutExporterERP;


window.peutValiderERP =
    peutValiderERP;


/* ============================================================
   DÉMARRAGE AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "DOM chargé → démarrage du système de permissions."
        );

        await initialiserPermissionsERP();

    }
);
