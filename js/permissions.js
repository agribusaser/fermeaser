"use strict";

/**
 * ============================================================
 * FERME ASHER ERP
 * js/permissions.js
 *
 * Gestion centralisée :
 * - Utilisateur connecté
 * - Rôle
 * - Permissions
 * - Accès aux modules
 * - Permissions du menu
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

function normaliserValeurERP(valeur) {

    if (valeur === null || valeur === undefined) {
        return "";
    }

    return String(valeur)
        .trim()
        .toLowerCase();

}


/* ============================================================
   CHARGER L'UTILISATEUR CONNECTÉ
   ============================================================ */

async function chargerUtilisateurERP() {

    try {

        if (!window.supabaseClient) {

            console.error(
                "❌ Supabase n'est pas disponible."
            );

            return null;
        }


        /* ----------------------------------------------------
           RÉCUPÉRER L'UTILISATEUR SUPABASE AUTH
           ---------------------------------------------------- */

        const {
            data: { user },
            error: authError
        } = await window.supabaseClient.auth.getUser();


        if (authError) {

            console.error(
                "❌ Erreur Auth Supabase :",
                authError
            );

            return null;
        }


        if (!user) {

            console.warn(
                "⚠️ Aucun utilisateur Supabase connecté."
            );

            return null;
        }


        /* ----------------------------------------------------
           CHERCHER LE PROFIL DANS utilisateurs
           ---------------------------------------------------- */

        const {
            data,
            error
        } = await window.supabaseClient
            .from("utilisateurs")
            .select("*")
            .eq("auth_user_id", user.id)
            .eq("actif", true)
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Erreur chargement profil utilisateur :",
                error
            );

            return null;
        }


        if (!data) {

            console.warn(
                "⚠️ Aucun profil ERP actif trouvé pour :",
                user.email
            );

            return null;
        }


        /* ----------------------------------------------------
           STOCKER L'UTILISATEUR
           ---------------------------------------------------- */

        utilisateurERP = data;


        console.log(
            "✅ Utilisateur ERP connecté :",
            utilisateurERP.nom
        );

        console.log(
            "✅ Rôle ERP :",
            utilisateurERP.role
        );


        return utilisateurERP;


    } catch (error) {

        console.error(
            "❌ Exception chargerUtilisateurERP :",
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
           S'ASSURER QUE L'UTILISATEUR EST CHARGÉ
           ---------------------------------------------------- */

        if (!utilisateurERP) {

            await chargerUtilisateurERP();
        }


        if (!utilisateurERP) {

            console.warn(
                "⚠️ Impossible de charger les permissions : utilisateur absent."
            );

            permissionsERP = [];

            return [];
        }


        if (!window.supabaseClient) {

            console.error(
                "❌ Supabase n'est pas disponible."
            );

            permissionsERP = [];

            return [];
        }


        /* ----------------------------------------------------
           ADMINISTRATEUR
           
           Les permissions administrateur sont normalement
           présentes dans role_permissions.
           
           On les charge quand même pour garder un système
           cohérent.
           ---------------------------------------------------- */

        const {
            data,
            error
        } = await window.supabaseClient
            .from("role_permissions")
            .select(
                "module, action, autorise"
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
                "❌ Erreur chargement permissions :",
                error
            );

            permissionsERP = [];

            return [];
        }


        permissionsERP = Array.isArray(data)
            ? data
            : [];


        console.log(
            "✅ Permissions chargées :",
            permissionsERP.length
        );


        console.table(
            permissionsERP
        );


        return permissionsERP;


    } catch (error) {

        console.error(
            "❌ Exception chargerPermissionsERP :",
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

    /* ----------------------------------------------------
       SÉCURITÉ
       ---------------------------------------------------- */

    if (!module || !action) {
        return false;
    }


    /* ----------------------------------------------------
       ADMINISTRATEUR
       
       L'administrateur possède tous les droits.
       ---------------------------------------------------- */

    if (estAdministrateurERP()) {

        return true;
    }


    /* ----------------------------------------------------
       NORMALISATION
       
       Exemple :
       "Élevage" / "elevage"
       "Voir" / "voir"
       ---------------------------------------------------- */

    const moduleRecherche = normaliserValeurERP(
        module
    );

    const actionRecherche = normaliserValeurERP(
        action
    );


    /* ----------------------------------------------------
       RECHERCHE
       ---------------------------------------------------- */

    return permissionsERP.some(
        function(permission) {

            const modulePermission =
                normaliserValeurERP(
                    permission.module
                );

            const actionPermission =
                normaliserValeurERP(
                    permission.action
                );


            const autorise =
                permission.autorise === true;


            return (
                modulePermission === moduleRecherche &&
                actionPermission === actionRecherche &&
                autorise
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

    const role = normaliserValeurERP(
        obtenirRoleERP()
    );


    return role === "administrateur";

}


/* ============================================================
   OBTENIR L'UTILISATEUR CONNECTÉ
   ============================================================ */

function obtenirUtilisateurERP() {

    return utilisateurERP;

}


/* ============================================================
   VÉRIFIER SI L'UTILISATEUR PEUT VOIR UN MODULE
   ============================================================ */

function peutVoirModuleERP(module) {

    return aPermission(
        module,
        "voir"
    );

}


/* ============================================================
   VÉRIFIER AJOUTER
   ============================================================ */

function peutAjouterERP(module) {

    return aPermission(
        module,
        "ajouter"
    );

}


/* ============================================================
   VÉRIFIER MODIFIER
   ============================================================ */

function peutModifierERP(module) {

    return aPermission(
        module,
        "modifier"
    );

}


/* ============================================================
   VÉRIFIER SUPPRIMER
   ============================================================ */

function peutSupprimerERP(module) {

    return aPermission(
        module,
        "supprimer"
    );

}


/* ============================================================
   VÉRIFIER EXPORTER
   ============================================================ */

function peutExporterERP(module) {

    return aPermission(
        module,
        "exporter"
    );

}


/* ============================================================
   VÉRIFIER VALIDER
   ============================================================ */

function peutValiderERP(module) {

    return aPermission(
        module,
        "valider"
    );

}


/* ============================================================
   MASQUER / AFFICHER UN ÉLÉMENT
   ============================================================ */

function appliquerVisibilitePermissionERP(
    element,
    module,
    action = "voir"
) {

    if (!element) {
        return;
    }


    const autorise = aPermission(
        module,
        action
    );


    if (autorise) {

        element.style.display = "";

    } else {

        element.style.display = "none";

    }

}


/* ============================================================
   APPLIQUER LES PERMISSIONS AU MENU
   ============================================================ */

function appliquerPermissionsMenuERP() {

    console.log(
        "🔐 Application des permissions au menu..."
    );


    const elementsMenu =
        document.querySelectorAll(
            ".sidebar li[data-module]"
        );


    const role = obtenirRoleERP();


    console.log(
        "👤 Rôle détecté :",
        role
    );


    /* ----------------------------------------------------
       SI AUCUN MENU
       ---------------------------------------------------- */

    if (!elementsMenu.length) {

        console.warn(
            "⚠️ Aucun élément de menu data-module trouvé."
        );

        return;
    }


    /* ----------------------------------------------------
       TRAITER CHAQUE MODULE
       ---------------------------------------------------- */

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
                    "🟢 ADMIN → accès autorisé :",
                    module
                );

                return;
            }


            /* ------------------------------------------------
               AUTRES RÔLES
               ------------------------------------------------ */

            const autorise =
                peutVoirModuleERP(
                    module
                );


            if (autorise) {

                element.style.display = "";

                console.log(
                    "🟢 Accès autorisé :",
                    module
                );

            } else {

                element.style.display = "none";

                console.log(
                    "🔴 Accès refusé :",
                    module
                );

            }

        }
    );


    console.log(
        "✅ Permissions du menu appliquées."
    );

}


/* ============================================================
   ACTIVER / DÉSACTIVER LES BOUTONS D'ACTION
   ============================================================ */

function appliquerPermissionsActionsERP() {

    console.log(
        "🔐 Application des permissions aux actions..."
    );


    /*
     * Les boutons peuvent utiliser :
     *
     * data-module="Ventes"
     * data-action="ajouter"
     *
     * Exemple :
     *
     * <button
     *   data-module="Ventes"
     *   data-action="supprimer">
     *   Supprimer
     * </button>
     */


    const elements =
        document.querySelectorAll(
            "[data-module][data-action]"
        );


    elements.forEach(
        function(element) {

            const module =
                element.getAttribute(
                    "data-module"
                );


            const action =
                element.getAttribute(
                    "data-action"
                );


            const autorise =
                aPermission(
                    module,
                    action
                );


            if (autorise) {

                element.style.display = "";

                element.disabled = false;

            } else {

                element.style.display = "none";

                element.disabled = true;

            }

        }
    );


    console.log(
        "✅ Permissions des actions appliquées."
    );

}


/* ============================================================
   INITIALISER LE SYSTÈME DE PERMISSIONS
   ============================================================ */

async function initialiserPermissionsERP() {

    console.log(
        "=========================================="
    );

    console.log(
        "🔐 INITIALISATION DES PERMISSIONS ERP"
    );

    console.log(
        "=========================================="
    );


    /* ----------------------------------------------------
       1. CHARGER UTILISATEUR
       ---------------------------------------------------- */

    const utilisateur =
        await chargerUtilisateurERP();


    if (!utilisateur) {

        console.warn(
            "⚠️ Impossible d'initialiser les permissions."
        );

        return false;
    }


    /* ----------------------------------------------------
       2. CHARGER PERMISSIONS
       ---------------------------------------------------- */

    await chargerPermissionsERP();


    /* ----------------------------------------------------
       3. APPLIQUER MENU
       ---------------------------------------------------- */

    appliquerPermissionsMenuERP();


    /* ----------------------------------------------------
       4. APPLIQUER ACTIONS
       ---------------------------------------------------- */

    appliquerPermissionsActionsERP();


    /* ----------------------------------------------------
       5. CHARGER POUSSINIÈRE SI DISPONIBLE
       ---------------------------------------------------- */

    if (
        typeof window.chargerPoussiniere === "function"
    ) {

        try {

            await window.chargerPoussiniere();

        } catch (error) {

            console.warn(
                "⚠️ Erreur chargement poussinière :",
                error
            );

        }

    }


    /* ----------------------------------------------------
       6. INFORMATIONS CONSOLE
       ---------------------------------------------------- */

    console.log(
        "=========================================="
    );

    console.log(
        "✅ SYSTÈME DE PERMISSIONS PRÊT"
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
        "Nombre de permissions :",
        permissionsERP.length
    );

    console.log(
        "Administrateur :",
        estAdministrateurERP()
    );

    console.log(
        "=========================================="
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

window.peutVoirModuleERP =
    peutVoirModuleERP;

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

window.appliquerVisibilitePermissionERP =
    appliquerVisibilitePermissionERP;

window.appliquerPermissionsMenuERP =
    appliquerPermissionsMenuERP;

window.appliquerPermissionsActionsERP =
    appliquerPermissionsActionsERP;

window.initialiserPermissionsERP =
    initialiserPermissionsERP;


/* ============================================================
   DÉMARRAGE AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "📋 DOM chargé → démarrage permissions ERP..."
        );


        await initialiserPermissionsERP();

    }
);
