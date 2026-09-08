"use strict";

/**
 * FERME ASHER ERP
 * Gestion des rôles et permissions
 */

let utilisateurERP = null;
let permissionsERP = [];


/* =========================================================
   CHARGER L'UTILISATEUR CONNECTÉ
   ========================================================= */

async function chargerUtilisateurERP() {

    try {

        if (!window.supabaseClient) {
            console.error("Supabase n'est pas disponible.");
            return null;
        }

        const {
            data: { user },
            error: authError
        } = await window.supabaseClient.auth.getUser();

        if (authError || !user) {
            console.warn("Aucun utilisateur Supabase connecté.");
            return null;
        }

        const { data, error } = await window.supabaseClient
            .from("utilisateurs")
            .select("*")
            .eq("auth_user_id", user.id)
            .eq("actif", true)
            .single();

        if (error) {
            console.error(
                "Erreur lors du chargement du profil utilisateur :",
                error
            );
            return null;
        }

        utilisateurERP = data;

        console.log(
            "Utilisateur connecté :",
            utilisateurERP.nom
        );

        console.log(
            "Rôle :",
            utilisateurERP.role
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

        if (!utilisateurERP) {
            await chargerUtilisateurERP();
        }

        if (!utilisateurERP) {
            return [];
        }

        const { data, error } = await window.supabaseClient
            .from("role_permissions")
            .select("module, action, autorise")
            .eq("role", utilisateurERP.role)
            .eq("autorise", true);

        if (error) {

            console.error(
                "Erreur lors du chargement des permissions :",
                error
            );

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

        return [];
    }
}


/* =========================================================
   VERIFIER UNE PERMISSION
   ========================================================= */

function aPermission(module, action) {

    return permissionsERP.some(permission =>

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
   OBTENIR L'UTILISATEUR
   ========================================================= */

function obtenirUtilisateurERP() {

    return utilisateurERP;
}


/* =========================================================
   INITIALISATION
   ========================================================= */

async function initialiserPermissionsERP() {

    console.log(
        "Initialisation du système de permissions..."
    );

    const utilisateur = await chargerUtilisateurERP();

    if (!utilisateur) {

        console.warn(
            "Impossible d'initialiser les permissions."
        );

        return false;
    }

    await chargerPermissionsERP();

    console.log(
        "Système de permissions prêt."
    );

    console.log(
        "Utilisateur :",
        utilisateurERP.nom
    );

    console.log(
        "Rôle :",
        utilisateurERP.role
    );

    return true;
}

/* =========================================================
   APPLIQUER LES PERMISSIONS AU MENU
   ========================================================= */

function appliquerPermissionsMenuERP() {

    console.log("Application des permissions au menu...");

    const elementsMenu = document.querySelectorAll(
        ".sidebar li[data-module]"
    );

    elementsMenu.forEach(function(element) {

        const module = element.getAttribute("data-module");

        const autorise = aPermission(module, "voir");

        if (autorise) {

            element.style.display = "";

        } else {

            element.style.display = "none";

        }

    });

    console.log(
        "Permissions du menu appliquées."
    );
}

/* =========================================================
   EXPORT GLOBAL
   ========================================================= */

window.chargerUtilisateurERP = chargerUtilisateurERP;
window.chargerPermissionsERP = chargerPermissionsERP;
window.aPermission = aPermission;
window.obtenirRoleERP = obtenirRoleERP;
window.obtenirUtilisateurERP = obtenirUtilisateurERP;
window.initialiserPermissionsERP = initialiserPermissionsERP;

document.addEventListener("DOMContentLoaded", function () {
    initialiserPermissionsERP();
});
