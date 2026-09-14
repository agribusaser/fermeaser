/* ==================================================
   FERME ASHER ERP
   SYNC.JS
   MOTEUR DE SYNCHRONISATION OFFLINE → SUPABASE
   VERSION 1.1
================================================== */

"use strict";


/* ==================================================
   CONFIGURATION
================================================== */

const SYNC_TABLE_VENTES =
    "ventes";

const SYNC_TABLE_PRODUITS =
    "produits";


/* ==================================================
   VÉRIFIER SUPABASE
================================================== */

function synchronisationDisponible() {

    return (
        navigator.onLine &&
        window.supabaseClient
    );

}


/* ==================================================
   PRÉPARER LES DONNÉES POUR SUPABASE
================================================== */

/*
 * Certains champs sont utilisés uniquement
 * par IndexedDB et ne doivent pas être envoyés
 * vers Supabase.
 */

function preparerDonneesSupabase(
    donnees
) {

    if (!donnees) {

        return null;

    }


    const donneesSupabase = {
        ...donnees
    };


    /*
     * Champ local uniquement.
     */

    delete donneesSupabase.synchronise;


    return donneesSupabase;

}


/* ==================================================
   SYNCHRONISER UNE OPÉRATION
================================================== */

async function synchroniserOperation(
    operation
) {

    if (!operation) {

        return false;

    }


    const {
        id,
        table,
        action,
        donnees
    } = operation;


    console.log(
        "Synchronisation opération :",
        id,
        table,
        action
    );

   /* ==================================================
   PRÉPARER LES DONNÉES POUR SUPABASE
================================================== */

/*
 * Certains champs sont utilisés uniquement
 * par IndexedDB et ne doivent pas être envoyés
 * vers Supabase.
 */

function preparerDonneesSupabase(
    donnees
) {

    if (!donnees) {

        return null;

    }


    const donneesSupabase = {
        ...donnees
    };


    /*
     * Champ local uniquement.
     */

    delete donneesSupabase.synchronise;


    return donneesSupabase;

}

    /* =================================================
       VENTES
    ================================================= */

    if (
        table === SYNC_TABLE_VENTES &&
        action === "INSERT"
    ) {

        const donneesSupabase =
            preparerDonneesSupabase(
                donnees
            );


        if (!donneesSupabase) {

            console.error(
                "Données vente invalides."
            );

            return false;

        }


        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(
                    SYNC_TABLE_VENTES
                )
                .upsert(
                    donneesSupabase,
                    {
                        onConflict: "id"
                    }
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Erreur synchronisation vente :",
                error
            );

            return false;

        }


        console.log(
            "✓ Vente synchronisée :",
            data
        );


        /*
         * Marquer la vente comme synchronisée
         * dans IndexedDB.
         */

        await enregistrerLocalement(
            SYNC_TABLE_VENTES,
            {
                ...donnees,
                synchronise: true
            }
        );


        /*
         * Supprimer l'opération de la file.
         */

        await supprimerLocalement(
            "sync_queue",
            id
        );


        console.log(
            "✓ Opération vente retirée de sync_queue."
        );


        return true;

    }

 
    /* =================================================
       PRODUITS / STOCK
    ================================================= */

    if (
        table === SYNC_TABLE_PRODUITS &&
        action === "UPDATE"
    ) {

        const donneesSupabase =
            preparerDonneesSupabase(
                donnees
            );


        if (!donneesSupabase) {

            console.error(
                "Données produit invalides."
            );

            return false;

        }


        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(
                    SYNC_TABLE_PRODUITS
                )
                .update(
                    donneesSupabase
                )
                .eq(
                    "id",
                    donneesSupabase.id
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Erreur synchronisation produit :",
                error
            );

            return false;

        }


        console.log(
            "✓ Stock produit synchronisé :",
            data
        );


        /*
         * Marquer le produit comme synchronisé
         * dans IndexedDB.
         */

        await enregistrerLocalement(
            SYNC_TABLE_PRODUITS,
            {
                ...donnees,
                synchronise: true
            }
        );


        /*
         * Supprimer l'opération de la file.
         */

        await supprimerLocalement(
            "sync_queue",
            id
        );


        console.log(
            "✓ Opération produit retirée de sync_queue."
        );


        return true;

    }


    /* =================================================
       OPÉRATION NON RECONNUE
    ================================================= */

    console.warn(
        "Opération non reconnue :",
        operation
    );


    return false;

}


/* ==================================================
   SYNCHRONISER TOUTE LA FILE
================================================== */

async function synchroniserDonnees() {

    if (
        !synchronisationDisponible()
    ) {

        console.log(
            "⏸ Synchronisation impossible : hors ligne ou Supabase indisponible."
        );

        return;

    }


    try {

        const operations =
            await lireToutLocalement(
                "sync_queue"
            );


        if (
            !operations.length
        ) {

            console.log(
                "✓ Aucune opération à synchroniser."
            );

            return;

        }


        console.log(
            "🔄 Opérations à synchroniser :",
            operations.length
        );


        /*
         * Traiter les opérations dans l'ordre
         * où elles ont été créées.
         */

        operations.sort(
            function (a, b) {

                return (
                    Number(a.id) -
                    Number(b.id)
                );

            }
        );


        for (
            const operation
            of operations
        ) {

            try {

                const succes =
                    await synchroniserOperation(
                        operation
                    );


                if (!succes) {

                    console.warn(
                        "⚠ Opération conservée dans sync_queue :",
                        operation.id
                    );


                    /*
                     * Arrêter ici pour éviter de
                     * traiter les opérations suivantes
                     * si celle-ci a échoué.
                     */

                    break;

                }

            } catch (error) {

                console.error(
                    "Erreur opération de synchronisation :",
                    operation,
                    error
                );


                /*
                 * Garder l'opération dans la file
                 * pour une nouvelle tentative.
                 */

                break;

            }

        }


        const restantes =
            await compterSynchronisations();


        console.log(
            "✓ Synchronisation terminée.",
            "Opérations restantes :",
            restantes
        );

    } catch (error) {

        console.error(
            "Erreur générale de synchronisation :",
            error
        );

    }

}


/* ==================================================
   DÉTECTION DU RETOUR INTERNET
================================================== */

window.addEventListener(
    "online",
    function () {

        console.log(
            "🌐 Internet disponible."
        );


        /*
         * Laisser quelques instants au navigateur
         * pour rétablir réellement la connexion.
         */

        setTimeout(
            function () {

                synchroniserDonnees();

            },
            1500
        );

    }
);


/* ==================================================
   INITIALISATION
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "FERME ASHER ERP - MOTEUR DE SYNCHRONISATION V1.1"
        );


        if (
            navigator.onLine
        ) {

            console.log(
                "🌐 Internet disponible au démarrage."
            );


            /*
             * Synchroniser les opérations déjà
             * présentes dans IndexedDB.
             */

            setTimeout(
                function () {

                    synchroniserDonnees();

                },
                1000
            );

        } else {

            console.log(
                "📴 Application hors ligne : synchronisation en attente."
            );

        }

    }
);


/* ==================================================
   EXPORT GLOBAL
================================================== */

window.synchroniserDonnees =
    synchroniserDonnees;


console.log(
    "✓ sync.js chargé."
);
