/* =========================================================
   FERME ASHER ERP
   SERVICE WORKER
   VERSION 8.0
   CACHE ROBUSTE + MISE À JOUR AUTOMATIQUE

   IMPORTANT :
   - INTERNET TOUJOURS PRIORITAIRE
   - CACHE UNIQUEMENT EN SECOURS
   - SUPPRESSION DES ANCIENS CACHES
   - ÉVITE DE SERVIR ANCIEN ALIMENTATION.JS
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CACHE_VERSION = "ferme-asher-v8";

const CACHE_APP =
    `${CACHE_VERSION}-app`;

const CACHE_RUNTIME =
    `${CACHE_VERSION}-runtime`;

const CACHE_CDN =
    `${CACHE_VERSION}-cdn`;


/* =========================================================
   FICHIERS APPLICATION ESSENTIELS
========================================================= */

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
    "/fermeaser/js/sync.js",
    "/fermeaser/js/ventes.js",

    "/fermeaser/css/ventes.css"

];


/* =========================================================
   RESSOURCES CDN
========================================================= */

const FICHIERS_CDN = [

    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css",

    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js",

    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",

    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"

];


/* =========================================================
   INSTALLATION
========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Ferme Asher ERP - Service Worker V8 installation."
        );


        event.waitUntil(

            Promise.all([


                /* =========================================
                   CACHE APPLICATION
                ========================================= */

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


                /* =========================================
                   CACHE CDN
                ========================================= */

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
                                        "⚠ CDN non disponible :",
                                        fichier
                                    );

                                }

                            }

                        }
                    )

            ])

            .then(
                function () {

                    /*
                       Le nouveau Service Worker
                       prend immédiatement le contrôle.
                    */

                    return self.skipWaiting();

                }
            )

        );

    }
);


/* =========================================================
   ACTIVATION
========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Ferme Asher ERP - Service Worker V8 activation."
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
                                            )
                                            &&
                                            nom !== CACHE_APP
                                            &&
                                            nom !== CACHE_RUNTIME
                                            &&
                                            nom !== CACHE_CDN
                                        );

                                    }
                                )

                                .map(
                                    function (nom) {

                                        console.log(
                                            "🗑 Suppression ancien cache :",
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

                        /*
                           Le nouveau Service Worker
                           prend immédiatement le contrôle
                           des pages déjà ouvertes.
                        */

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   GESTION DES REQUÊTES
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        const requete =
            event.request;


        /*
           Nous traitons uniquement GET.
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


        /* =================================================
           1. PAGES HTML

           INTERNET D'ABORD
           CACHE EN SECOURS
        ================================================= */

        if (
            requete.mode === "navigate"
        ) {

            event.respondWith(

                fetch(
                    requete
                )

                .then(
                    function (reponse) {

                        if (
                            reponse &&
                            reponse.ok
                        ) {

                            const copie =
                                reponse.clone();


                            caches.open(
                                CACHE_RUNTIME
                            )
                            .then(
                                function (cache) {

                                    cache.put(
                                        requete,
                                        copie
                                    );

                                }
                            );

                        }


                        console.log(
                            "🌐 Page chargée depuis Internet :",
                            requete.url
                        );


                        return reponse;

                    }
                )

                .catch(
                    function () {

                        console.warn(
                            "⚠ Internet indisponible. Utilisation du cache :",
                            requete.url
                        );


                        return caches.match(
                            requete,
                            {
                                ignoreSearch: true
                            }
                        )

                        .then(
                            function (reponseCache) {

                                if (
                                    reponseCache
                                ) {

                                    return reponseCache;

                                }


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


        /* =================================================
           2. FICHIERS LOCAUX

           IMPORTANT :
           INTERNET D'ABORD
           CACHE EN SECOURS

           C'est cette partie qui corrige
           notre problème avec alimentation.js.
        ================================================= */

        if (
            url.origin ===
            self.location.origin
        ) {

            event.respondWith(

                fetch(
                    requete
                )

                .then(
                    function (reponse) {

                        if (
                            reponse &&
                            reponse.ok
                        ) {

                            const copie =
                                reponse.clone();


                            caches.open(
                                CACHE_RUNTIME
                            )
                            .then(
                                function (cache) {

                                    cache.put(
                                        requete,
                                        copie
                                    );

                                }
                            );

                        }


                        console.log(
                            "🌐 Fichier local chargé depuis Internet :",
                            requete.url
                        );


                        return reponse;

                    }
                )

                .catch(
                    function () {

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

                    }
                )

            );


            return;

        }


        /* =================================================
           3. CDN / RESSOURCES EXTERNES

           INTERNET D'ABORD
           CACHE EN SECOURS
        ================================================= */

        event.respondWith(

            fetch(
                requete
            )

            .then(
                function (reponse) {

                    if (
                        reponse &&
                        (
                            reponse.ok ||
                            reponse.type === "opaque"
                        )
                    ) {

                        const copie =
                            reponse.clone();


                        caches.open(
                            CACHE_CDN
                        )
                        .then(
                            function (cache) {

                                cache.put(
                                    requete,
                                    copie
                                );

                            }
                        );

                    }


                    return reponse;

                }
            )

            .catch(
                function () {

                    console.warn(
                        "⚠ CDN indisponible. Utilisation du cache :",
                        requete.url
                    );


                    return caches.match(
                        requete
                    )

                    .then(
                        function (reponseCache) {

                            if (
                                reponseCache
                            ) {

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

                        }
                    );

                }
            )

        );

    }
);


/* =========================================================
   MESSAGES
========================================================= */

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


/* =========================================================
   FIN
========================================================= */

console.log(
    "Ferme Asher ERP - Service Worker V8 chargé."
);
