/* =====================================================
   FERME ASHER ERP
   LOCAL-DB.JS
   BASE DE DONNÉES LOCALE HORS LIGNE
   IndexedDB
===================================================== */

"use strict";

const FERME_ASHER_DB = "ferme_asher_erp";
const FERME_ASHER_DB_VERSION = 2;
let fermeAsherDB = null;


/* =====================================================
   OUVRIR LA BASE
===================================================== */

function ouvrirBaseLocale() {

    return new Promise(function(resolve, reject) {

        if (fermeAsherDB) {

            resolve(fermeAsherDB);

            return;
        }


        const requete = indexedDB.open(
            FERME_ASHER_DB,
            FERME_ASHER_DB_VERSION
        );


        /* =============================================
           CRÉATION / MISE À JOUR
        ============================================= */

        requete.onupgradeneeded = function(event) {

            const db = event.target.result;


            /* =========================================
               VENTES
            ========================================= */

            if (!db.objectStoreNames.contains("ventes")) {

                const ventes =
                    db.createObjectStore(
                        "ventes",
                        {
                            keyPath: "id"
                        }
                    );

                ventes.createIndex(
                    "created_at",
                    "created_at",
                    {
                        unique: false
                    }
                );

                ventes.createIndex(
                    "synchronise",
                    "synchronise",
                    {
                        unique: false
                    }
                );
            }


            /* =========================================
               PRODUITS
            ========================================= */

            if (!db.objectStoreNames.contains("produits")) {

                const produits =
                    db.createObjectStore(
                        "produits",
                        {
                            keyPath: "id"
                        }
                    );

                produits.createIndex(
                    "nom",
                    "nom",
                    {
                        unique: false
                    }
                );

                produits.createIndex(
                    "synchronise",
                    "synchronise",
                    {
                        unique: false
                    }
                );
            }


            /* =========================================
               CLIENTS
            ========================================= */

            if (!db.objectStoreNames.contains("clients")) {

                const clients =
                    db.createObjectStore(
                        "clients",
                        {
                            keyPath: "id"
                        }
                    );

                clients.createIndex(
                    "nom",
                    "nom",
                    {
                        unique: false
                    }
                );

                clients.createIndex(
                    "synchronise",
                    "synchronise",
                    {
                        unique: false
                    }
                );
            }


            /* =========================================
               JOURNAL DES ACTIONS
            ========================================= */

            if (!db.objectStoreNames.contains("journal_actions")) {

                const journal =
                    db.createObjectStore(
                        "journal_actions",
                        {
                            keyPath: "id"
                        }
                    );

                journal.createIndex(
                    "created_at",
                    "created_at",
                    {
                        unique: false
                    }
                );

                journal.createIndex(
                    "synchronise",
                    "synchronise",
                    {
                        unique: false
                    }
                );
            }


            /* =========================================
               FILE D'ATTENTE DE SYNCHRONISATION
            ========================================= */

            if (!db.objectStoreNames.contains("sync_queue")) {

                const syncQueue =
                    db.createObjectStore(
                        "sync_queue",
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                syncQueue.createIndex(
                    "table",
                    "table",
                    {
                        unique: false
                    }
                );

                syncQueue.createIndex(
                    "date",
                    "date",
                    {
                        unique: false
                    }
                );
            }


            console.log(
                "Base locale Ferme Asher créée."
            );
        };


        /* =============================================
           SUCCÈS
        ============================================= */

        requete.onsuccess = function(event) {

            fermeAsherDB =
                event.target.result;

            console.log(
                "✓ Base locale Ferme Asher ouverte."
            );

            resolve(fermeAsherDB);
        };


        /* =============================================
           ERREUR
        ============================================= */

        requete.onerror = function(event) {

            console.error(
                "Erreur ouverture base locale :",
                event.target.error
            );

            reject(
                event.target.error
            );
        };

    });
}


/* =====================================================
   AJOUTER / MODIFIER UNE DONNÉE
===================================================== */

async function enregistrerLocalement(
    nomTable,
    donnees
) {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                nomTable,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                nomTable
            );


        const requete =
            store.put(donnees);


        requete.onsuccess =
            function() {

                resolve(
                    donnees
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   LIRE UNE DONNÉE
===================================================== */

async function lireLocalement(
    nomTable,
    id
) {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                nomTable,
                "readonly"
            );


        const store =
            transaction.objectStore(
                nomTable
            );


        const requete =
            store.get(id);


        requete.onsuccess =
            function() {

                resolve(
                    requete.result
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   LIRE TOUTES LES DONNÉES
===================================================== */

async function lireToutLocalement(
    nomTable
) {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                nomTable,
                "readonly"
            );


        const store =
            transaction.objectStore(
                nomTable
            );


        const requete =
            store.getAll();


        requete.onsuccess =
            function() {

                resolve(
                    requete.result || []
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   SUPPRIMER UNE DONNÉE
===================================================== */

async function supprimerLocalement(
    nomTable,
    id
) {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                nomTable,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                nomTable
            );


        const requete =
            store.delete(id);


        requete.onsuccess =
            function() {

                resolve(
                    true
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   AJOUTER À LA FILE DE SYNCHRONISATION
===================================================== */

async function ajouterFileSynchronisation(
    table,
    action,
    donnees
) {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                "sync_queue",
                "readwrite"
            );


        const store =
            transaction.objectStore(
                "sync_queue"
            );


        const element = {

            table: table,

            action: action,

            donnees: donnees,

            date: new Date().toISOString()

        };


        const requete =
            store.add(element);


        requete.onsuccess =
            function() {

                console.log(
                    "Élément ajouté à la file de synchronisation."
                );

                resolve(
                    requete.result
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   COMPTER LES ÉLÉMENTS À SYNCHRONISER
===================================================== */

async function compterSynchronisations() {

    const db =
        await ouvrirBaseLocale();


    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                "sync_queue",
                "readonly"
            );


        const store =
            transaction.objectStore(
                "sync_queue"
            );


        const requete =
            store.count();


        requete.onsuccess =
            function() {

                resolve(
                    requete.result
                );

            };


        requete.onerror =
            function(event) {

                reject(
                    event.target.error
                );

            };

    });
}


/* =====================================================
   INITIALISATION AUTOMATIQUE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await ouvrirBaseLocale();

            console.log(
                "✓ Système hors ligne prêt."
            );

        } catch (error) {

            console.error(
                "Impossible d'initialiser la base locale :",
                error
            );

        }

    }
);

