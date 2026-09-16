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

const SYNC_TABLE_VENTES = "ventes";
const SYNC_TABLE_PRODUITS = "produits";

/* ==================================================
   MIGRATION DES ANCIENS IDS DE VENTES
================================================== */

async function migrerAnciennesVentes() {
    const operations = await lireToutLocalement("sync_queue");

    for (const operation of operations) {
        if (
            operation.table !== SYNC_TABLE_VENTES ||
            operation.action !== "INSERT" ||
            !operation.donnees ||
            !operation.donnees.id
        ) {
            continue;
        }

        const ancienId = String(operation.donnees.id);

        // Si l'ID est déjà un UUID, aucune migration nécessaire.
        const estUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(ancienId);

        if (estUUID) {
            continue;
        }

        const nouvelId = crypto.randomUUID();

        console.log(
            "🔄 Migration vente :",
            ancienId,
            "→",
            nouvelId
        );

        // 1. Migrer la vente locale
        const ancienneVente = await lireLocalement(
            SYNC_TABLE_VENTES,
            ancienId
        );

        if (ancienneVente) {
            await supprimerLocalement(
                SYNC_TABLE_VENTES,
                ancienId
            );

            ancienneVente.id = nouvelId;
            ancienneVente.synchronise = false;

            await enregistrerLocalement(
                SYNC_TABLE_VENTES,
                ancienneVente
            );
        }

        // 2. Mettre à jour l'ID dans l'opération de vente
        operation.donnees.id = nouvelId;

        await enregistrerLocalement(
            "sync_queue",
            operation
        );

        // 3. Migrer les mouvements de stock liés à cette vente
        const mouvements = await lireToutLocalement(
            "mouvements_stock"
        );

        for (const mouvement of mouvements) {
            if (
                mouvement.reference_table === "ventes" &&
                String(mouvement.reference_id) === ancienId
            ) {
                mouvement.reference_id = nouvelId;

                await enregistrerLocalement(
                    "mouvements_stock",
                    mouvement
                );

                console.log(
                    "🔄 Référence mouvement mise à jour :",
                    ancienId,
                    "→",
                    nouvelId
                );
            }
        }

        // 4. Mettre à jour aussi le mouvement dans la file de synchronisation
        const queueComplete = await lireToutLocalement(
            "sync_queue"
        );

        for (const operationMouvement of queueComplete) {
            if (
                operationMouvement.table === "mouvements_stock" &&
                operationMouvement.action === "INSERT" &&
                operationMouvement.donnees &&
                operationMouvement.donnees.reference_table === "ventes" &&
                String(operationMouvement.donnees.reference_id) === ancienId
            ) {
                operationMouvement.donnees.reference_id = nouvelId;

                await enregistrerLocalement(
                    "sync_queue",
                    operationMouvement
                );

                console.log(
                    "🔄 Référence du mouvement dans sync_queue mise à jour."
                );
            }
        }
    }
}

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

function preparerDonneesSupabase(donnees) {

    if (!donnees) {
        return null;
    }

    const donneesSupabase = {
        ...donnees
    };

    /*
     * Champ utilisé uniquement localement.
     */

    delete donneesSupabase.synchronise;

    return donneesSupabase;
}


/* ==================================================
   SYNCHRONISER UNE OPÉRATION
================================================== */

async function synchroniserOperation(operation) {

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


    /* =================================================
       VENTES
    ================================================= */

    if (
        table === SYNC_TABLE_VENTES &&
        action === "INSERT"
    ) {

        const donneesSupabase =
            preparerDonneesSupabase(donnees);


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
                .from(SYNC_TABLE_VENTES)
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

console.error(
    "DÉTAIL ERREUR VENTE :",
    JSON.stringify(error, null, 2)
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
   MOUVEMENTS DE STOCK
================================================= */

if (
    table === "mouvements_stock" &&
    action === "INSERT"
) {

    const donneesSupabase =
        preparerDonneesSupabase(donnees);


    if (!donneesSupabase) {

        console.error(
            "Données mouvement de stock invalides."
        );

        return false;
    }


    /* =============================================
       VERIFIER LES INFORMATIONS NECESSAIRES
    ============================================= */

    if (
        !donneesSupabase.produit_id ||
        !donneesSupabase.type ||
        !Number.isFinite(
            Number(
                donneesSupabase.quantite
            )
        )
    ) {

        console.error(
            "Mouvement de stock incomplet :",
            donneesSupabase
        );

        return false;
    }


    /* =============================================
       APPLIQUER LE MOUVEMENT DANS SUPABASE
       
       La fonction PostgreSQL :
       - verrouille le produit
       - vérifie le stock
       - modifie le stock
       - crée le mouvement
       - évite les doublons
    ============================================= */

    const {
        data: mouvement,
        error
    } =
        await window.supabaseClient
            .rpc(
                "appliquer_mouvement_stock",
                {
                    p_produit_id:
                        String(
                            donneesSupabase.produit_id
                        ),

                    p_type:
                        donneesSupabase.type,

                    p_quantite:
                        Number(
                            donneesSupabase.quantite
                        ),

                    p_reference_table:
                        donneesSupabase.reference_table ||
                        null,

                    p_reference_id:
                        donneesSupabase.reference_id ||
                        null,

                    p_commentaire:
                        donneesSupabase.commentaire ||
                        null,

                    p_utilisateur:
                        donneesSupabase.utilisateur ||
                        null
                }
            );


    /* =============================================
       ERREUR SUPABASE
    ============================================= */

    if (error) {

        console.error(
            "Erreur synchronisation mouvement de stock :",
            error
        );

        console.error(
            "DÉTAIL ERREUR MOUVEMENT :",
            JSON.stringify(
                error,
                null,
                2
            )
        );

        return false;
    }


    console.log(
        "✓ Mouvement de stock synchronisé :",
        mouvement
    );


    /* =============================================
       RECUPERER LE STOCK REEL DE SUPABASE
       
       Important :
       le stock peut avoir changé pendant
       que l'appareil était hors ligne.
    ============================================= */

    try {

        const {
            data: produitDistant,
            error: erreurProduit
        } =
            await window.supabaseClient
                .from(
                    SYNC_TABLE_PRODUITS
                )
                .select("*")
                .eq(
                    "id",
                    donneesSupabase.produit_id
                )
                .single();


        if (
            !erreurProduit &&
            produitDistant
        ) {

            await enregistrerLocalement(
                SYNC_TABLE_PRODUITS,
                {
                    ...produitDistant,
                    synchronise: true
                }
            );


            console.log(
                "✓ Stock local réaligné sur Supabase :",
                produitDistant.stock
            );

        } else {

            console.warn(
                "Impossible de réaligner le produit local.",
                erreurProduit
            );

        }

    } catch (error) {

        console.warn(
            "Erreur récupération stock distant :",
            error
        );

    }


    /* =============================================
       MARQUER LE MOUVEMENT COMME SYNCHRONISÉ
    ============================================= */

    await enregistrerLocalement(
        "mouvements_stock",
        {
            ...donnees,
            synchronise: true
        }
    );


    /* =============================================
       SUPPRIMER L'OPÉRATION DE LA FILE
    ============================================= */

    await supprimerLocalement(
        "sync_queue",
        id
    );


    console.log(
        "✓ Opération mouvement de stock retirée de sync_queue."
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

    if (!synchronisationDisponible()) {

        console.log(
            "⏸ Synchronisation impossible : hors ligne ou Supabase indisponible."
        );

        return;
    }


    try {
      await migrerAnciennesVentes();
        const operations =
            await lireToutLocalement("sync_queue");


        if (!operations.length) {

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
         * de leur création.
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


        if (navigator.onLine) {

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
