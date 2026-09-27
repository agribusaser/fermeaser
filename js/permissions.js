"use strict";

/**
 * =========================================================
 * FERME ASHER ERP
 * js/permissions.js
 *
 * SYSTÈME CENTRAL DES RÔLES ET PERMISSIONS
 *
 * Rôles :
 * - Administrateur
 * - Agent central
 * - Agent spécialisé
 * - Autres rôles personnalisés
 *
 * Actions :
 * - voir
 * - ajouter
 * - modifier
 * - supprimer
 * - exporter
 * - valider
 * =========================================================
 */


/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let utilisateurERP = null;
let permissionsERP = [];

let initialisationPermissionsEnCours = false;
let permissionsInitialisees = false;


/* =========================================================
   OUTILS INTERNES
   ========================================================= */

/**
 * Normalise un texte pour éviter les problèmes de majuscules,
 * espaces ou accents.
 */
function normaliserERP(valeur) {

    if (valeur === null || valeur === undefined) {
        return "";
    }

    return String(valeur)
        .trim()
        .toLowerCase();

}


/**
 * Vérifie si Supabase est disponible.
 */
function supabaseDisponibleERP() {

    return (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    );

}


/**
 * Attendre que Supabase soit disponible.
 *
 * Utile lorsque permissions.js est chargé avant supabase.js.
 */
async function attendreSupabaseERP(
    tentatives = 50,
    delai = 100
) {

    for (let i = 0; i < tentatives; i++) {

        if (supabaseDisponibleERP()) {
            return true;
        }

        await new Promise(function(resolve) {
            setTimeout(resolve, delai);
        });

    }

    return false;

}


/* =========================================================
   CHARGER L'UTILISATEUR CONNECTÉ
   ========================================================= */

async function chargerUtilisateurERP() {

    try {

        const disponible = await attendreSupabaseERP();

        if (!disponible) {

            console.error(
                "FERME ASHER ERP : Supabase n'est pas disponible."
            );

            utilisateurERP = null;

            return null;
        }


        /* -------------------------------------------------
           UTILISATEUR AUTHENTIFIÉ SUPABASE
           ------------------------------------------------- */

        const {
            data: authData,
            error: authError
        } = await window.supabaseClient.auth.getUser();


        if (authError) {

            console.error(
                "Erreur Supabase Auth :",
                authError
            );

            utilisateurERP = null;

            return null;
        }


        const user = authData?.user;


        if (!user) {

            console.warn(
                "FERME ASHER ERP : aucun utilisateur Supabase connecté."
            );

            utilisateurERP = null;

            return null;
        }


        /* -------------------------------------------------
           CHARGER LE PROFIL ERP
           ------------------------------------------------- */

        const {
            data,
            error
        } = await window.supabaseClient
            .from("utilisateurs")
            .select("*")
            .eq("auth_user_id", user.id)
            .eq("actif", true)
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "Erreur lors du chargement du profil utilisateur ERP :",
                error
            );

            utilisateurERP = null;

            return null;
        }


        if (!data) {

            console.warn(
                "Aucun profil ERP actif trouvé pour l'utilisateur connecté."
            );

            utilisateurERP = null;

            return null;
        }


        /* -------------------------------------------------
           STOCKER L'UTILISATEUR
           ------------------------------------------------- */

        utilisateurERP = data;


        console.log(
            "=========================================="
        );

        console.log(
            "FERME ASHER ERP"
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
            "Statut :",
            utilisateurERP.actif ? "Actif" : "Inactif"
        );

        console.log(
            "=========================================="
        );


        return utilisateurERP;


    } catch (error) {

        console.error(
            "Erreur chargerUtilisateurERP() :",
            error
        );

        utilisateurERP = null;

        return null;
    }

}


/* =========================================================
   CHARGER LES PERMISSIONS DU RÔLE
   ========================================================= */

async function chargerPermissionsERP() {

    try {

        if (!supabaseDisponibleERP()) {

            const disponible = await attendreSupabaseERP();

            if (!disponible) {

                console.error(
                    "Supabase indisponible pour charger les permissions."
                );

                permissionsERP = [];

                return [];
            }
        }


        /* -------------------------------------------------
           S'ASSURER QUE L'UTILISATEUR EST CHARGÉ
           ------------------------------------------------- */

        if (!utilisateurERP) {

            await chargerUtilisateurERP();
        }


        if (!utilisateurERP) {

            permissionsERP = [];

            return [];
        }


        /* -------------------------------------------------
           ADMINISTRATEUR
           
           On charge quand même les permissions présentes
           dans la base pour garder le système cohérent.
           ------------------------------------------------- */

        const roleUtilisateur = utilisateurERP.role;


        const {
            data,
            error
        } = await window.supabaseClient
            .from("role_permissions")
            .select(
                "module, action, autorise"
            )
            .eq("role", roleUtilisateur)
            .eq("autorise", true);


        if (error) {

            console.error(
                "Erreur lors du chargement des permissions :",
                error
            );

            permissionsERP = [];

            return [];
        }


        permissionsERP = Array.isArray(data)
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
            "Erreur chargerPermissionsERP() :",
            error
        );

        permissionsERP = [];

        return [];
    }

}


/* =========================================================
   OBTENIR LE RÔLE
   ========================================================= */

function obtenirRoleERP() {

    if (!utilisateurERP) {
        return null;
    }

    return utilisateurERP.role || null;

}


/* =========================================================
   OBTENIR L'UTILISATEUR CONNECTÉ
   ========================================================= */

function obtenirUtilisateurERP() {

    return utilisateurERP;

}


/* =========================================================
   VÉRIFIER ADMINISTRATEUR
   ========================================================= */

function estAdministrateurERP() {

    const role = obtenirRoleERP();

    return (
        normaliserERP(role) ===
        "administrateur"
    );

}


/* =========================================================
   VÉRIFIER UNE PERMISSION
   ========================================================= */

/**
 * Exemple :
 *
 * aPermission("Ventes", "voir")
 * aPermission("Ventes", "ajouter")
 * aPermission("Ventes", "modifier")
 * aPermission("Ventes", "supprimer")
 * aPermission("Ventes", "exporter")
 * aPermission("Ventes", "valider")
 *
 * Retourne true ou false.
 */

function aPermission(module, action) {

    /* -------------------------------------------------
       AUCUN UTILISATEUR
       ------------------------------------------------- */

    if (!utilisateurERP) {

        return false;
    }


    /* -------------------------------------------------
       ADMINISTRATEUR
       
       L'administrateur possède tous les droits.
       ------------------------------------------------- */

    if (estAdministrateurERP()) {

        return true;
    }


    /* -------------------------------------------------
       NORMALISER LES VALEURS
       ------------------------------------------------- */

    const moduleRecherche = normaliserERP(
        module
    );

    const actionRecherche = normaliserERP(
        action
    );


    /* -------------------------------------------------
       RECHERCHER LA PERMISSION
       ------------------------------------------------- */

    return permissionsERP.some(
        function(permission) {

            const modulePermission =
                normaliserERP(
                    permission.module
                );

            const actionPermission =
                normaliserERP(
                    permission.action
                );


            return (
                modulePermission === moduleRecherche &&
                actionPermission === actionRecherche &&
                permission.autorise === true
            );

        }
    );

}


/* =========================================================
   VÉRIFIER L'ACCÈS À UN MODULE
   ========================================================= */

function peutVoirModuleERP(module) {

    return aPermission(
        module,
        "voir"
    );

}


/* =========================================================
   VÉRIFIER AJOUT
   ========================================================= */

function peutAjouterERP(module) {

    return aPermission(
        module,
        "ajouter"
    );

}


/* =========================================================
   VÉRIFIER MODIFICATION
   ========================================================= */

function peutModifierERP(module) {

    return aPermission(
        module,
        "modifier"
    );

}


/* =========================================================
   VÉRIFIER SUPPRESSION
   ========================================================= */

function peutSupprimerERP(module) {

    return aPermission(
        module,
        "supprimer"
    );

}


/* =========================================================
   VÉRIFIER EXPORT
   ========================================================= */

function peutExporterERP(module) {

    return aPermission(
        module,
        "exporter"
    );

}


/* =========================================================
   VÉRIFIER VALIDATION
   ========================================================= */

function peutValiderERP(module) {

    return aPermission(
        module,
        "valider"
    );

}


/* =========================================================
   APPLIQUER LES PERMISSIONS AU MENU
   ========================================================= */

function appliquerPermissionsMenuERP() {

    console.log(
        "Application des permissions au menu..."
    );


    /* -------------------------------------------------
       RECHERCHER LES ÉLÉMENTS DU MENU
       ------------------------------------------------- */

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


    const role = obtenirRoleERP();


    console.log(
        "Rôle détecté :",
        role
    );


    /* -------------------------------------------------
       PARCOURIR LES MODULES
       ------------------------------------------------- */

    elementsMenu.forEach(
        function(element) {

            const module =
                element.getAttribute(
                    "data-module"
                );


            if (!module) {
                return;
            }


            /* -----------------------------------------
               ADMINISTRATEUR
               ----------------------------------------- */

            if (
                estAdministrateurERP()
            ) {

                element.style.display = "";

                return;
            }


            /* -----------------------------------------
               AUTRES RÔLES
               ----------------------------------------- */

            const autorise =
                peutVoirModuleERP(
                    module
                );


            if (autorise) {

                element.style.display = "";

            } else {

                element.style.display = "none";

            }

        }
    );


    console.log(
        "Permissions du menu appliquées."
    );

}


/* =========================================================
   APPLIQUER LES PERMISSIONS AUX BOUTONS
   ========================================================= */

/**
 * Cette fonction permet plus tard de contrôler
 * automatiquement les boutons :
 *
 * data-module="Ventes"
 * data-action="modifier"
 *
 * Exemple :
 *
 * <button
 *     data-module="Ventes"
 *     data-action="modifier">
 *     Modifier
 * </button>
 */

function appliquerPermissionsBoutonsERP() {

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


            if (!module || !action) {
                return;
            }


            /* ADMINISTRATEUR */

            if (
                estAdministrateurERP()
            ) {

                element.style.display = "";

                element.disabled = false;

                return;
            }


            /* AUTRES RÔLES */

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

}


/* =========================================================
   APPLIQUER TOUTES LES PERMISSIONS
   ========================================================= */

function appliquerToutesPermissionsERP() {

    appliquerPermissionsMenuERP();

    appliquerPermissionsBoutonsERP();

}


/* =========================================================
   INITIALISATION DU SYSTÈME
   ========================================================= */

async function initialiserPermissionsERP() {

    /* -------------------------------------------------
       ÉVITER LES INITIALISATIONS MULTIPLES
       ------------------------------------------------- */

    if (initialisationPermissionsEnCours) {

        console.warn(
            "Initialisation des permissions déjà en cours."
        );

        return false;
    }


    if (permissionsInitialisees) {

        console.log(
            "Permissions ERP déjà initialisées."
        );

        appliquerToutesPermissionsERP();

        return true;
    }


    initialisationPermissionsEnCours = true;


    try {

        console.log(
            "=========================================="
        );

        console.log(
            "INITIALISATION PERMISSIONS FERME ASHER ERP"
        );

        console.log(
            "=========================================="
        );


        /* -------------------------------------------------
           ATTENDRE SUPABASE
           ------------------------------------------------- */

        const supabasePret =
            await attendreSupabaseERP();


        if (!supabasePret) {

            console.error(
                "Impossible d'initialiser les permissions : Supabase indisponible."
            );

            return false;
        }


        /* -------------------------------------------------
           CHARGER UTILISATEUR
           ------------------------------------------------- */

        const utilisateur =
            await chargerUtilisateurERP();


        if (!utilisateur) {

            console.warn(
                "Impossible d'initialiser les permissions : utilisateur introuvable."
            );

            return false;
        }


        /* -------------------------------------------------
           CHARGER PERMISSIONS
           ------------------------------------------------- */

        await chargerPermissionsERP();


        /* -------------------------------------------------
           APPLIQUER MENU + BOUTONS
           ------------------------------------------------- */

        appliquerToutesPermissionsERP();


        /* -------------------------------------------------
           ACTUALISER LA POUSSINIÈRE SI LA FONCTION EXISTE
           ------------------------------------------------- */

        if (
            typeof window.chargerPoussiniere ===
            "function"
        ) {

            try {

                await window.chargerPoussiniere();

            } catch (error) {

                console.warn(
                    "Impossible d'actualiser la poussinière :",
                    error
                );

            }

        }


        permissionsInitialisees = true;


        console.log(
            "=========================================="
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
            "Permissions :",
            permissionsERP.length
        );

        console.log(
            "=========================================="
        );


        return true;


    } catch (error) {

        console.error(
            "Erreur initialiserPermissionsERP() :",
            error
        );

        return false;


    } finally {

        initialisationPermissionsEnCours =
            false;

    }

}


/* =========================================================
   RECHARGER LES PERMISSIONS
   ========================================================= */

/**
 * Fonction utile lorsqu'un administrateur modifie
 * les permissions d'un rôle.
 */

async function rechargerPermissionsERP() {

    console.log(
        "Rechargement des permissions ERP..."
    );


    permissionsInitialisees = false;


    const utilisateur =
        await chargerUtilisateurERP();


    if (!utilisateur) {

        return false;
    }


    await chargerPermissionsERP();


    appliquerToutesPermissionsERP();


    permissionsInitialisees = true;


    console.log(
        "Permissions ERP rechargées."
    );


    return true;

}


/* =========================================================
   EXPORTS GLOBAUX
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

window.appliquerPermissionsMenuERP =
    appliquerPermissionsMenuERP;

window.appliquerPermissionsBoutonsERP =
    appliquerPermissionsBoutonsERP;

window.appliquerToutesPermissionsERP =
    appliquerToutesPermissionsERP;

window.initialiserPermissionsERP =
    initialiserPermissionsERP;

window.rechargerPermissionsERP =
    rechargerPermissionsERP;


/* =========================================================
   DÉMARRAGE AUTOMATIQUE
   ========================================================= */

function demarrerPermissionsERP() {

    initialiserPermissionsERP()
        .then(function(resultat) {

            if (resultat) {

                console.log(
                    "FERME ASHER ERP : permissions initialisées avec succès."
                );

            } else {

                console.warn(
                    "FERME ASHER ERP : initialisation des permissions non terminée."
                );

            }

        })
        .catch(function(error) {

            console.error(
                "Erreur au démarrage du système de permissions :",
                error
            );

        });

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        demarrerPermissionsERP
    );

} else {

    demarrerPermissionsERP();

}
