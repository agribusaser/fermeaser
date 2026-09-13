const CACHE_NAME = "ferme-asher-v1";

const FICHIERS_A_CACHER = [
    "/fermeaser/",
    "/fermeaser/index.html",
    "/fermeaser/dashboard.html",
    "/fermeaser/modules/ventes/index.html",
    "/fermeaser/modules/ventes/nouvelle.html",

    "/fermeaser/js/supabase.js",
    "/fermeaser/js/permissions.js",
    "/fermeaser/js/local-db.js",
    "/fermeaser/js/ventes.js",

    "/fermeaser/css/ventes.css"
];


/* =========================================
   INSTALLATION
========================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Service Worker Ferme Asher : installation"
        );

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(
                    function (cache) {

                        return cache.addAll(
                            FICHIERS_A_CACHER
                        );

                    }
                )

        );

        self.skipWaiting();
    }
);


/* =========================================
   ACTIVATION
========================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Service Worker Ferme Asher : activation"
        );

        event.waitUntil(
            self.clients.claim()
        );

    }
);


/* =========================================
   INTERCEPTION DES REQUÊTES
========================================= */

self.addEventListener(
    "fetch",
    function (event) {

        event.respondWith(

            fetch(event.request)
                .then(
                    function (response) {

                        return response;

                    }
                )
                .catch(
                    function () {

                        return caches.match(
                            event.request
                        );

                    }
                )

        );

    }
);
