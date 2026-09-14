/* ==================================================
   FERME ASHER ERP
   SERVICE WORKER
   VERSION 2.0 - OFFLINE ROBUSTE
================================================== */

"use strict";


/* ==================================================
   CONFIGURATION
================================================== */

const CACHE_VERSION = "ferme-asher-v2";

const CACHE_APP =
    `${CACHE_VERSION}-app`;

const CACHE_RUNTIME =
    `${CACHE_VERSION}-runtime`;

const CACHE_CDN =
    `${CACHE_VERSION}-cdn`;


/* ==================================================
   FICHIERS LOCAUX ESSENTIELS
================================================== */

const FICHIERS_APP = [

    "/fermeaser/",

    "/fermeaser/index.html",

    "/fermeaser/dashboard.html",

    "/fermeaser/login.html",

    "/fermeaser/modules/ventes/index.html",

    "/fermeaser/modules/ventes/nouvelle.html",

    "/fermeaser/js/supabase.js",

    "/fermeaser/js/permissions.js",

    "/fermeaser/js/local-db.js",

    "/fermeaser/js/ventes.js",

    "/fermeaser/css/ventes.css"

];


/* ==================================================
   RESSOURCES CDN
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

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Ferme Asher ERP - Service Worker V2 installation."
        );


        event.waitUntil(

            Promise.all([

                /* ----------------------------------
                   CACHE APPLICATION
                ---------------------------------- */

                caches.open(CACHE_APP)
                    .then(
                        async function (cache) {

                            for (
                                const fichier
                                of FICHIERS_APP
                            ) {

                                try {

                                    await cache.add(
                                        fichier
                                    );

                                    console.log(
                                        "✓ Cache application :",
                                        fichier
                                    );

                                } catch (error) {

                                    console.warn(
                                        "⚠ Impossible de mettre en cache :",
                                        fichier,
                                        error
                                    );

                                }

                            }

                        }
                    ),


                /* ----------------------------------
                   CACHE CDN
                ---------------------------------- */

                caches.open(CACHE_CDN)
                    .then(
                        async function (cache) {

                            for (
                                const fichier
                                of FICHIERS_CDN
                            ) {

                                try {

                                    await cache.add(
                                        fichier
                                    );

                                    console.log(
                                        "✓ Cache CDN :",
                                        fichier
                                    );

                                } catch (error) {

                                    console.warn(
                                        "⚠ CDN non disponible au moment du cache :",
                                        fichier
                                    );

                                }

                            }

                        }
                    )

            ])

        );


        /*
         * Le nouveau Service Worker peut
         * attendre que l'ancien termine.
         *
         * Cela évite les interruptions brutales.
         */

    }
);


/* ==================================================
   ACTIVATION
================================================== */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Ferme Asher ERP - Service Worker V2 activation."
        );


        event.waitUntil(

            caches.keys()
                .then(
                    function (nomsCaches) {

                        return Promise.all(

                            nomsCaches
                                .filter(
                                    function (nom) {

                                        return (
                                            nom.startsWith(
                                                "ferme-asher-"
                                            ) &&
                                            nom !== CACHE_APP &&
                                            nom !== CACHE_RUNTIME &&
                                            nom !== CACHE_CDN
                                        );

                                    }
                                )
                                .map(
                                    function (nom) {

                                        console.log(
                                            "Suppression ancien cache :",
                                            nom
                                        );

                                        return caches.delete(
                                            nom
                                        );

                                    }
                                )

                        );

                    }
                )
                .then(
                    function () {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* ==================================================
   REQUÊTES RÉSEAU
================================================== */

self.addEventListener(
    "fetch",
    function (event) {

        const requete =
            event.request;


        /*
         * Nous ne traitons que GET.
         */

        if (
            requete.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(
                requete.url
            );


        /* =========================================
           NAVIGATION HTML
        ========================================= */

        if (
            requete.mode === "navigate"
        ) {

            event.respondWith(

                caches.match(
                    requete
                )
                .then(
                    function (reponseCache) {

                        if (reponseCache) {

                            /*
                             * La page est disponible
                             * immédiatement hors ligne.
                             */

                            return reponseCache;

                        }


                        /*
                         * Si la page n'est pas encore
                         * en cache, essayer Internet.
                         */

                        return fetch(
                            requete
                        )
                        .then(
                            function (reponse) {

                                return reponse;

                            }
                        )
                                 .catch(
                            function () {

                                /*
                                 * Dernier secours :
                                 * essayer le cache de la page demandée
                                 * sans tenir compte des paramètres URL.
                                 */

                                return caches.match(
                                    requete,
                                    {
                                        ignoreSearch: true
                                    }
                                )
                                .then(
                                    function (reponseCache) {

                                        if (reponseCache) {
                                            return reponseCache;
                                        }

                                        /*
                                         * Si la page n'existe pas dans le cache,
                                         * utiliser le dashboard comme dernier secours.
                                         */

                                        return caches.match(
                                            "/fermeaser/dashboard.html"
                                        );

                                    }
                                );

                            }
                        )

                    );

                return;

            }

        /* =========================================
           RESSOURCES CDN / EXTERNES
        ========================================= */

        event.respondWith(

            caches.match(
                requete
            )
            .then(
                function (reponseCache) {

                    if (reponseCache) {

                        /*
                         * Le fichier CDN est déjà
                         * disponible localement.
                         */

                        return reponseCache;

                    }


                    /*
                     * Sinon essayer Internet.
                     */

                    return fetch(
                        requete
                    )
                    .then(
                        async function (reponse) {

                            /*
                             * Mettre en cache la
                             * ressource pour les
                             * prochaines utilisations.
                             */

                            if (
                                reponse &&
                                (
                                    reponse.ok ||
                                    reponse.type ===
                                    "opaque"
                                )
                            ) {

                                const cache =
                                    await caches.open(
                                        CACHE_CDN
                                    );

                                cache.put(
                                    requete,
                                    reponse.clone()
                                );

                            }


                            return reponse;

                        }
                    )
                    .catch(
                        function () {

                            console.warn(
                                "Ressource externe indisponible hors ligne :",
                                requete.url
                            );


                            /*
                             * Retourner une réponse
                             * vide plutôt que faire
                             * planter toute l'application.
                             */

                            return new Response(
                                "",
                                {
                                    status: 503,
                                    statusText:
                                        "Ressource indisponible hors ligne"
                                }
                            );

                        }
                    );

                }
            )

        );

    }
);


/* ==================================================
   MESSAGE DEPUIS L'APPLICATION
================================================== */

self.addEventListener(
    "message",
    function (event) {

        if (
            event.data ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* ==================================================
   FIN
================================================== */

console.log(
    "Ferme Asher ERP - Service Worker V2 chargé."
);
