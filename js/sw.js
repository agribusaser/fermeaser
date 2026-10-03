/* ==================================================
   FERME ASHER ERP
   SERVICE WORKER
   VERSION 5.0
   MISE À JOUR AUTOMATIQUE
   ================================================== */

"use strict";


/* ==================================================
   CONFIGURATION
   ================================================== */

const CACHE_VERSION = "ferme-asher-v8";

const CACHE_APP =
    `${CACHE_VERSION}-app`;

const CACHE_RUNTIME =
    `${CACHE_VERSION}-runtime`;

const CACHE_CDN =
    `${CACHE_VERSION}-cdn`;


/* ==================================================
   FICHIERS APPLICATION À PRÉ-CACHER
   ================================================== */

const FICHIERS_APP = [

    "/fermeaser/",
    "/fermeaser/index.html",
    "/fermeaser/dashboard.html",
    "/fermeaser/login.html",

    /* Ventes */
    "/fermeaser/modules/ventes/index.html",
    "/fermeaser/modules/ventes/nouvelle.html",

    /* JavaScript */
    "/fermeaser/js/supabase.js",
    "/fermeaser/js/permissions.js",
    "/fermeaser/js/local-db.js",
    "/fermeaser/js/sync.js",
    "/fermeaser/js/ventes.js",
    "/fermeaser/js/alimentation.js",

    /* CSS */
    "/fermeaser/css/ventes.css",
    "/fermeaser/css/elevage.css"

];


/* ==================================================
   CDN
   ================================================== */

const FICHIERS_CDN = [

    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css",

    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js",

    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",

    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"

];


/* ==================================================
   INSTALLATION
   ================================================== */

self.addEventListener("install", function(event) {

    console.log(
        "Ferme Asher ERP - Service Worker V5 installation."
    );

    event.waitUntil(

        Promise.all([

            /* ==========================================
               CACHE APPLICATION
               ========================================== */

            caches.open(CACHE_APP)
                .then(async function(cache) {

                    for (const fichier of FICHIERS_APP) {

                        try {

                            await cache.add(
                                new Request(
                                    fichier,
                                    {
                                        cache: "no-store"
                                    }
                                )
                            );

                            console.log(
                                "✓ Cache application :",
                                fichier
                            );

                        } catch(error) {

                            console.warn(
                                "⚠ Impossible de mettre en cache :",
                                fichier,
                                error
                            );

                        }

                    }

                }),


            /* ==========================================
               CACHE CDN
               ========================================== */

            caches.open(CACHE_CDN)
                .then(async function(cache) {

                    for (const fichier of FICHIERS_CDN) {

                        try {

                            await cache.add(fichier);

                            console.log(
                                "✓ Cache CDN :",
                                fichier
                            );

                        } catch(error) {

                            console.warn(
                                "⚠ CDN non disponible :",
                                fichier,
                                error
                            );

                        }

                    }

                })

        ])

        .then(function() {

            /*
             * Le nouveau Service Worker
             * devient actif immédiatement.
             */

            console.log(
                "✓ Installation terminée."
            );

            return self.skipWaiting();

        })

    );

});


/* ==================================================
   ACTIVATION
   ================================================== */

self.addEventListener("activate", function(event) {

    console.log(
        "Ferme Asher ERP - Service Worker V5 activation."
    );

    event.waitUntil(

        caches.keys()

            .then(function(nomsCaches) {

                return Promise.all(

                    nomsCaches

                        .filter(function(nom) {

                            return (

                                nom.startsWith(
                                    "ferme-asher-"
                                )

                                &&

                                nom !== CACHE_APP

                                &&

                                nom !== CACHE_RUNTIME

                                &&

                                nom !== CACHE_CDN

                            );

                        })

                        .map(function(nom) {

                            console.log(
                                "🗑 Suppression ancien cache :",
                                nom
                            );

                            return caches.delete(nom);

                        })

                );

            })

            .then(function() {

                /*
                 * Le nouveau Service Worker
                 * prend immédiatement le contrôle
                 * des pages ouvertes.
                 */

                return self.clients.claim();

            })

            .then(function() {

                /*
                 * IMPORTANT :
                 *
                 * Les anciennes pages déjà ouvertes
                 * peuvent encore afficher l'ancienne
                 * version du HTML.
                 *
                 * On force donc leur rechargement
                 * après l'activation du nouveau SW.
                 */

                return self.clients.matchAll({

                    type: "window",

                    includeUncontrolled: true

                });

            })

            .then(function(clients) {

                for (const client of clients) {

                    try {

                        /*
                         * Recharge automatiquement
                         * la page actuellement ouverte.
                         */

                        client.navigate(client.url);

                        console.log(
                            "↻ Rechargement automatique :",
                            client.url
                        );

                    } catch(error) {

                        console.warn(
                            "⚠ Impossible de recharger :",
                            client.url,
                            error
                        );

                    }

                }

            })

    );

});


/* ==================================================
   REQUÊTES
   ================================================== */

self.addEventListener("fetch", function(event) {

    const requete = event.request;


    /* ==========================================
       UNIQUEMENT GET
       ========================================== */

    if (requete.method !== "GET") {

        return;

    }


    const url = new URL(requete.url);


    /* ==========================================
       PAGES HTML
       
       RÉSEAU TOUJOURS EN PRIORITÉ
       + NO CACHE HTTP
       ========================================== */

    if (requete.mode === "navigate") {

        event.respondWith(

            fetch(

                new Request(
                    requete,
                    {
                        cache: "no-store"
                    }
                )

            )

                .then(function(reponse) {

                    if (
                        reponse &&
                        reponse.ok
                    ) {

                        /*
                         * Copie de la nouvelle page
                         * dans le cache runtime.
                         */

                        const copie =
                            reponse.clone();

                        caches.open(CACHE_RUNTIME)

                            .then(function(cache) {

                                cache.put(
                                    requete,
                                    copie
                                );

                            });

                    }

                    console.log(
                        "✓ Page chargée depuis Internet :",
                        requete.url
                    );

                    return reponse;

                })

                .catch(function() {

                    console.warn(
                        "⚠ Internet indisponible.",
                        "Utilisation du cache :",
                        requete.url
                    );

                    return caches.match(

                        requete,

                        {
                            ignoreSearch: true
                        }

                    )

                        .then(function(reponseCache) {

                            if (reponseCache) {

                                return reponseCache;

                            }


                            /*
                             * Dernier secours :
                             * Dashboard.
                             */

                            return caches.match(
                                "/fermeaser/dashboard.html"
                            );

                        });

                })

        );

        return;

    }


    /* ==========================================
       FICHIERS LOCAUX
       
       RÉSEAU EN PRIORITÉ
       NO-CACHE POUR ÉVITER LES ANCIENNES
       VERSIONS DE JS / CSS
       ========================================== */

    if (
        url.origin === self.location.origin
    ) {

        event.respondWith(

            fetch(

                new Request(
                    requete,
                    {
                        cache: "no-store"
                    }
                )

            )

                .then(function(reponse) {

                    if (
                        reponse &&
                        reponse.ok
                    ) {

                        const copie =
                            reponse.clone();

                        caches.open(CACHE_RUNTIME)

                            .then(function(cache) {

                                cache.put(
                                    requete,
                                    copie
                                );

                            });

                    }

                    return reponse;

                })

                .catch(function() {

                    console.warn(
                        "⚠ Fichier local hors ligne :",
                        requete.url
                    );

                    return caches.match(

                        requete,

                        {
                            ignoreSearch: true
                        }

                    );

                })

        );

        return;

    }


    /* ==========================================
       CDN / RESSOURCES EXTERNES
       
       INTERNET EN PRIORITÉ
       CACHE EN SECOURS
       ========================================== */

    event.respondWith(

        fetch(requete)

            .then(function(reponse) {

                if (
                    reponse &&
                    (
                        reponse.ok ||
                        reponse.type === "opaque"
                    )
                ) {

                    const copie =
                        reponse.clone();

                    caches.open(CACHE_CDN)

                        .then(function(cache) {

                            cache.put(
                                requete,
                                copie
                            );

                        });

                }

                return reponse;

            })

            .catch(function() {

                console.warn(
                    "⚠ CDN indisponible.",
                    "Utilisation du cache :",
                    requete.url
                );

                return caches.match(

                    requete

                )

                    .then(function(reponseCache) {

                        if (reponseCache) {

                            return reponseCache;

                        }

                        return new Response(

                            "",

                            {

                                status: 503,

                                statusText:
                                    "Ressource indisponible hors ligne"

                            }

                        );

                    });

            })

    );

});


/* ==================================================
   MESSAGES
   ================================================== */

self.addEventListener("message", function(event) {

    if (!event.data) {

        return;

    }


    /* ==========================================
       ACTIVATION IMMÉDIATE
       ========================================== */

    if (
        event.data === "SKIP_WAITING"
    ) {

        console.log(
            "⚡ SKIP_WAITING reçu."
        );

        self.skipWaiting();

    }


    /* ==========================================
       DEMANDE DE RECHARGEMENT
       ========================================== */

    if (
        event.data === "RELOAD_CLIENTS"
    ) {

        self.clients.matchAll({

            type: "window",

            includeUncontrolled: true

        })

            .then(function(clients) {

                for (const client of clients) {

                    try {

                        client.navigate(
                            client.url
                        );

                    } catch(error) {

                        console.warn(
                            "⚠ Rechargement impossible :",
                            error
                        );

                    }

                }

            });

    }

});


/* ==================================================
   FIN
   ================================================== */

console.log(
    "Ferme Asher ERP - Service Worker V5 chargé."
);
