/*==================================================
FERME ASHER ERP
DASHBOARD.JS
VERSION 5.0
SUPABASE + REALTIME + MOBILE + RECONNEXION
==================================================*/

"use strict";

/* ==================================================
   VARIABLES
================================================== */

let ventesERP = [];
let produitsERP = [];
let clientsERP = [];

let channelDashboard = null;

let dashboardInitialise = false;
let actualisationEnCours = false;
let reconnexionEnCours = false;
let timerReconnexion = null;


/* ==================================================
   INITIALISATION
================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("==========================================");
    console.log("FERME ASHER ERP - DASHBOARD VERSION 5.0");
    console.log("Initialisation...");
    console.log("==========================================");

    masquerLoader();
    actualiserDate();
    initialiserMenuMobile();
    initialiserEvenementsConnexion();

    const supabaseOK = await attendreSupabase();

    if (!supabaseOK) {
        afficherErreurDashboard(
            "Connexion Supabase indisponible."
        );
        return;
    }

    const sessionOK = await attendreSessionSupabase();

    if (!sessionOK) {
        afficherErreurDashboard(
            "Session utilisateur indisponible."
        );
        return;
    }

    await chargerDashboard();

    initialiserTempsReel();

    dashboardInitialise = true;

    console.log("==========================================");
    console.log("Dashboard prêt.");
    console.log("Realtime actif.");
    console.log("==========================================");
});


/* ==================================================
   ATTENDRE SUPABASE
================================================== */

async function attendreSupabase() {

    let tentatives = 0;
    const maximum = 40;

    while (
        !window.supabaseClient &&
        tentatives < maximum
    ) {

        console.log(
            "Attente de Supabase...",
            tentatives + 1
        );

        await new Promise(function (resolve) {
            setTimeout(resolve, 250);
        });

        tentatives++;
    }

    if (!window.supabaseClient) {

        console.error(
            "Supabase n'a pas pu être chargé."
        );

        return false;
    }

    console.log(
        "Supabase disponible."
    );

    return true;
}


/* ==================================================
   ATTENDRE SESSION SUPABASE
================================================== */

async function attendreSessionSupabase() {

    if (!verifierSupabase()) {
        return false;
    }

    let tentatives = 0;
    const maximum = 20;

    while (tentatives < maximum) {

        try {

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .getSession();

            if (
                !error &&
                data &&
                data.session
            ) {

                console.log(
                    "Session Supabase active."
                );

                return true;
            }

        } catch (error) {

            console.error(
                "Erreur récupération session :",
                error
            );
        }

        await new Promise(function (resolve) {
            setTimeout(resolve, 300);
        });

        tentatives++;
    }

    console.warn(
        "Aucune session Supabase après attente."
    );

    return false;
}


/* ==================================================
   LOADER
================================================== */

function masquerLoader() {

    const loader =
        document.getElementById("loader");

    if (!loader) {
        return;
    }

    setTimeout(function () {

        loader.classList.add("hidden");

    }, 500);
}


/* ==================================================
   DATE
================================================== */

function actualiserDate() {

    const date = new Date();

    console.log(
        "Dashboard chargé :",
        date.toLocaleString("fr-FR")
    );
}


/* ==================================================
   VÉRIFICATION SUPABASE
================================================== */

function verifierSupabase() {

    if (!window.supabaseClient) {

        console.error(
            "ERREUR : Supabase n'est pas disponible."
        );

        return false;
    }

    return true;
}


/* ==================================================
   VÉRIFICATION SESSION
================================================== */

async function verifierSessionSupabase() {

    if (!verifierSupabase()) {
        return false;
    }

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .getSession();

        if (error) {

            console.error(
                "Erreur session Supabase :",
                error
            );

            return false;
        }

        if (
            !data ||
            !data.session
        ) {

            console.warn(
                "Aucune session Supabase active."
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Erreur verifierSessionSupabase :",
            error
        );

        return false;
    }
}


/* ==================================================
   CHARGEMENT GLOBAL
================================================== */

async function chargerDashboard() {

    if (!verifierSupabase()) {

        afficherErreurDashboard(
            "Connexion à Supabase impossible."
        );

        return false;
    }

    console.log(
        "Chargement des données Supabase..."
    );

    const sessionOK =
        await verifierSessionSupabase();

    if (!sessionOK) {

        afficherErreurDashboard(
            "Session utilisateur indisponible."
        );

        return false;
    }

    const resultats =
        await Promise.all([

            chargerVentes(),
            chargerProduits(),
            chargerClients(),
            chargerActivites()

        ]);

    console.log(
        "Résultat chargement Dashboard :",
        resultats
    );

    afficherStatistiques();

    initialiserGraphiques();

    console.log(
        "Dashboard chargé avec succès."
    );

    return true;
}


/* ==================================================
   CHARGER VENTES
================================================== */

async function chargerVentes() {

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("ventes")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "Erreur chargement ventes :",
                error
            );

            return false;
        }

        ventesERP =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "Ventes chargées :",
            ventesERP.length
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur chargerVentes :",
            error
        );

        return false;
    }
}


/* ==================================================
   CHARGER PRODUITS
================================================== */

async function chargerProduits() {

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("produits")
                .select("*")
                .eq("actif", true)
                .order(
                    "nom",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "Erreur chargement produits :",
                error
            );

            return false;
        }

        produitsERP =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "Produits chargés :",
            produitsERP.length
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur chargerProduits :",
            error
        );

        return false;
    }
}


/* ==================================================
   CHARGER CLIENTS
================================================== */

async function chargerClients() {

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("clients")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "Erreur chargement clients :",
                error
            );

            return false;
        }

        clientsERP =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "Clients chargés :",
            clientsERP.length
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur chargerClients :",
            error
        );

        return false;
    }
}


/* ==================================================
   KPI
================================================== */

function afficherStatistiques() {

    let chiffreAffaires = 0;

    ventesERP.forEach(function (vente) {

        chiffreAffaires +=
            Number(
                vente.total || 0
            );

    });

    const kpiVentes =
        document.getElementById("kpiVentes");

    const kpiStock =
        document.getElementById("kpiStock");

    const kpiClients =
        document.getElementById("kpiClients");

    const kpiCA =
        document.getElementById("kpiCA");


    if (kpiVentes) {

        kpiVentes.textContent =
            ventesERP.length;
    }


    if (kpiStock) {

        kpiStock.textContent =
            produitsERP.length;
    }


    if (kpiClients) {

        kpiClients.textContent =
            clientsERP.length;
    }


    if (kpiCA) {

        kpiCA.textContent =
            chiffreAffaires.toLocaleString(
                "fr-FR"
            ) + " FC";
    }


    console.log(
        "KPI :",
        {
            ventes: ventesERP.length,
            produits: produitsERP.length,
            clients: clientsERP.length,
            chiffreAffaires: chiffreAffaires
        }
    );
}


/* ==================================================
   ACTIVITÉS RÉCENTES
================================================== */

async function chargerActivites() {

    const tbody =
        document.getElementById(
            "recentActivities"
        );

    if (!tbody) {
        return true;
    }

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("journal_actions")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);

        if (error) {

            console.error(
                "Erreur chargement activités :",
                error
            );

            return false;
        }

        if (
            !data ||
            data.length === 0
        ) {

            afficherAucuneActivite();

            return true;
        }

        tbody.innerHTML = "";

        data.forEach(function (action) {

            const ligne =
                document.createElement("tr");

            const date =
                document.createElement("td");

            const utilisateur =
                document.createElement("td");

            const description =
                document.createElement("td");

            date.textContent =
                formaterDate(
                    action.created_at
                );

            utilisateur.textContent =
                action.utilisateur_nom ||
                "Système";

            description.textContent =
                action.description ||
                action.action ||
                "Action enregistrée";

            ligne.appendChild(date);
            ligne.appendChild(utilisateur);
            ligne.appendChild(description);

            tbody.appendChild(ligne);
        });

        return true;

    } catch (error) {

        console.error(
            "Erreur chargerActivites :",
            error
        );

        return false;
    }
}


/* ==================================================
   AUCUNE ACTIVITÉ
================================================== */

function afficherAucuneActivite() {

    const tbody =
        document.getElementById(
            "recentActivities"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="3"
                class="text-center text-muted">
                Aucune activité récente.
            </td>
        </tr>
    `;
}


/* ==================================================
   GRAPHIQUES
================================================== */

function initialiserGraphiques() {

    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js n'est pas chargé."
        );

        return;
    }

    initialiserGraphiqueVentes();
    initialiserGraphiqueProduits();
}


/* ==================================================
   GRAPHIQUE VENTES
================================================== */

function initialiserGraphiqueVentes() {

    const canvas =
        document.getElementById(
            "salesChart"
        );

    if (!canvas) {
        return;
    }

    const mois = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc"
    ];

    const totalMois =
        Array(12).fill(0);

    ventesERP.forEach(function (vente) {

        if (!vente.date) {
            return;
        }

        const date =
            new Date(
                vente.date
            );

        if (
            isNaN(
                date.getTime()
            )
        ) {
            return;
        }

        totalMois[
            date.getMonth()
        ] +=
            Number(
                vente.total || 0
            );
    });

    if (canvas._chartInstance) {

        canvas._chartInstance.destroy();
    }

    canvas._chartInstance =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: mois,

                    datasets: [
                        {
                            label:
                                "Chiffre d'affaires",

                            data:
                                totalMois
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: true,

                    plugins: {

                        legend: {
                            display: true
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function (value) {

                                        return Number(
                                            value
                                        ).toLocaleString(
                                            "fr-FR"
                                        ) + " FC";
                                    }
                            }
                        }
                    }
                }
            }
        );
}


/* ==================================================
   GRAPHIQUE PRODUITS
================================================== */

function initialiserGraphiqueProduits() {

    const canvas =
        document.getElementById(
            "productChart"
        );

    if (!canvas) {
        return;
    }

    const produits =
        produitsERP.slice(
            0,
            10
        );

    const labels =
        produits.map(
            function (produit) {

                return produit.nom ||
                    "Produit";

            }
        );

    const stocks =
        produits.map(
            function (produit) {

                return Number(
                    produit.stock || 0
                );

            }
        );

    if (canvas._chartInstance) {

        canvas._chartInstance.destroy();
    }

    canvas._chartInstance =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label: "Stock",
                            data: stocks
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: true,

                    indexAxis: "y",

                    scales: {

                        x: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


/* ==================================================
   REALTIME SUPABASE
================================================== */

function initialiserTempsReel() {

    if (!verifierSupabase()) {
        return;
    }

    console.log(
        "Activation du temps réel Supabase..."
    );


    /* Supprimer ancien canal */

    if (channelDashboard) {

        try {

            window.supabaseClient
                .removeChannel(
                    channelDashboard
                );

        } catch (error) {

            console.warn(
                "Impossible de supprimer ancien canal.",
                error
            );
        }

        channelDashboard = null;
    }


    /* Créer nouveau canal */

    channelDashboard =
        window.supabaseClient
            .channel(
                "dashboard-temps-reel-v5-" +
                Date.now()
            )


            /* ==========================
               VENTES
            ========================== */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "ventes"
                },

                async function (payload) {

                    console.log(
                        "REALTIME VENTES :",
                        payload.eventType,
                        payload
                    );

                    await actualiserDashboard();
                }
            )


            /* ==========================
               PRODUITS
            ========================== */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "produits"
                },

                async function (payload) {

                    console.log(
                        "REALTIME PRODUITS :",
                        payload.eventType,
                        payload
                    );

                    await actualiserDashboard();
                }
            )


            /* ==========================
               CLIENTS
            ========================== */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "clients"
                },

                async function (payload) {

                    console.log(
                        "REALTIME CLIENTS :",
                        payload.eventType,
                        payload
                    );

                    await actualiserDashboard();
                }
            )


            /* ==========================
               JOURNAL
            ========================== */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "journal_actions"
                },

                async function (payload) {

                    console.log(
                        "REALTIME JOURNAL :",
                        payload.eventType
                    );

                    await chargerActivites();
                }
            )


            /* ==========================
               SOUSCRIPTION
            ========================== */

            .subscribe(
                function (status, error) {

                    console.log(
                        "Realtime Dashboard :",
                        status
                    );

                    if (error) {

                        console.error(
                            "Erreur Realtime :",
                            error
                        );
                    }


                    if (
                        status === "SUBSCRIBED"
                    ) {

                        console.log(
                            "✓ Realtime Dashboard connecté."
                        );

                        reconnexionEnCours = false;
                    }


                    if (
                        status === "CHANNEL_ERROR"
                    ) {

                        console.warn(
                            "⚠ Realtime : CHANNEL_ERROR"
                        );

                        programmerReconnexionRealtime();
                    }


                    if (
                        status === "TIMED_OUT"
                    ) {

                        console.warn(
                            "⚠ Realtime : TIMED_OUT"
                        );

                        programmerReconnexionRealtime();
                    }


                    if (
                        status === "CLOSED"
                    ) {

                        console.warn(
                            "⚠ Realtime : canal fermé."
                        );

                        programmerReconnexionRealtime();
                    }
                }
            );
}


/* ==================================================
   RECONNEXION REALTIME
================================================== */

function programmerReconnexionRealtime() {

    if (reconnexionEnCours) {
        return;
    }

    if (!navigator.onLine) {

        console.log(
            "Pas d'Internet : reconnexion différée."
        );

        return;
    }

    reconnexionEnCours = true;

    console.log(
        "Reconnexion Realtime programmée..."
    );


    if (timerReconnexion) {

        clearTimeout(
            timerReconnexion
        );
    }


    timerReconnexion =
        setTimeout(
            async function () {

                reconnexionEnCours = false;

                console.log(
                    "Tentative de reconnexion Realtime..."
                );

                const sessionOK =
                    await verifierSessionSupabase();

                if (!sessionOK) {

                    console.warn(
                        "Session indisponible."
                    );

                    return;
                }

                initialiserTempsReel();

                await actualiserDashboard();

            },
            2000
        );
}


/* ==================================================
   ACTUALISATION DASHBOARD
================================================== */

async function actualiserDashboard() {

    if (actualisationEnCours) {

        console.log(
            "Actualisation déjà en cours."
        );

        return;
    }


    if (!navigator.onLine) {

        console.warn(
            "Actualisation impossible : hors ligne."
        );

        return;
    }


    actualisationEnCours = true;


    try {

        console.log(
            "=========================================="
        );

        console.log(
            "Actualisation du Dashboard..."
        );


        const sessionOK =
            await verifierSessionSupabase();

        if (!sessionOK) {

            console.warn(
                "Session Supabase absente."
            );

            return;
        }


        await Promise.all([

            chargerVentes(),

            chargerProduits(),

            chargerClients(),

            chargerActivites()

        ]);


        afficherStatistiques();

        initialiserGraphiques();


        console.log(
            "Dashboard actualisé."
        );


    } catch (error) {

        console.error(
            "Erreur actualiserDashboard :",
            error
        );

    } finally {

        actualisationEnCours = false;
    }
}


/* ==================================================
   CONNEXION INTERNET
================================================== */

function initialiserEvenementsConnexion() {


    /* ==========================
       RETOUR EN LIGNE
    ========================== */

    window.addEventListener(
        "online",
        async function () {

            console.log(
                "✓ Internet disponible."
            );

            afficherEtatConnexion(
                true
            );

            await attendreSupabase();

            await attendreSessionSupabase();

            await actualiserDashboard();

            initialiserTempsReel();
        }
    );


    /* ==========================
       HORS LIGNE
    ========================== */

    window.addEventListener(
        "offline",
        function () {

            console.warn(
                "⚠ Connexion Internet perdue."
            );

            afficherEtatConnexion(
                false
            );
        }
    );


    /* ==========================
       RETOUR APPLICATION MOBILE
    ========================== */

    document.addEventListener(
        "visibilitychange",
        async function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                console.log(
                    "Application redevenue active."
                );

                if (
                    navigator.onLine
                ) {

                    await attendreSupabase();

                    await attendreSessionSupabase();

                    await actualiserDashboard();

                    initialiserTempsReel();
                }
            }
        }
    );


    /* ==========================
       FOCUS FENÊTRE
    ========================== */

    window.addEventListener(
        "focus",
        async function () {

            if (
                navigator.onLine &&
                dashboardInitialise
            ) {

                console.log(
                    "Fenêtre active : vérification Dashboard..."
                );

                await actualiserDashboard();
            }
        }
    );


    /* ==========================
       PAGESHOW MOBILE
    ========================== */

    window.addEventListener(
        "pageshow",
        async function () {

            console.log(
                "pageshow : page affichée."
            );

            if (
                navigator.onLine
            ) {

                await attendreSupabase();

                await attendreSessionSupabase();

                await actualiserDashboard();

                initialiserTempsReel();
            }
        }
    );
}


/* ==================================================
   INDICATEUR CONNEXION
================================================== */

function afficherEtatConnexion(
    enLigne
) {

    let indicateur =
        document.getElementById(
            "etatConnexionERP"
        );


    if (!indicateur) {

        indicateur =
            document.createElement(
                "div"
            );

        indicateur.id =
            "etatConnexionERP";

        indicateur.style.position =
            "fixed";

        indicateur.style.bottom =
            "15px";

        indicateur.style.left =
            "15px";

        indicateur.style.zIndex =
            "99999";

        indicateur.style.padding =
            "7px 12px";

        indicateur.style.borderRadius =
            "20px";

        indicateur.style.fontSize =
            "12px";

        indicateur.style.fontWeight =
            "600";

        document.body.appendChild(
            indicateur
        );
    }


    if (enLigne) {

        indicateur.textContent =
            "● En ligne";

        indicateur.style.background =
            "#d1e7dd";

        indicateur.style.color =
            "#0f5132";


        setTimeout(
            function () {

                const element =
                    document.getElementById(
                        "etatConnexionERP"
                    );

                if (element) {
                    element.remove();
                }

            },
            3000
        );

    } else {

        indicateur.textContent =
            "● Hors ligne";

        indicateur.style.background =
            "#f8d7da";

        indicateur.style.color =
            "#842029";
    }
}


/* ==================================================
   FORMATAGE DATE
================================================== */

function formaterDate(
    dateTexte
) {

    if (!dateTexte) {
        return "";
    }

    const date =
        new Date(
            dateTexte
        );

    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateTexte;
    }

    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ==================================================
   ERREUR DASHBOARD
================================================== */

function afficherErreurDashboard(
    message
) {

    console.error(
        "Dashboard :",
        message
    );


    const zones = [

        "kpiVentes",
        "kpiStock",
        "kpiClients",
        "kpiCA"

    ];


    zones.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.textContent =
                    "—";
            }
        }
    );
}


/* ==================================================
   DÉCONNEXION
================================================== */

async function deconnexion() {

    console.log(
        "Déconnexion..."
    );

    try {

        if (
            window.supabaseClient
        ) {

            const {
                error
            } =
                await window.supabaseClient
                    .auth
                    .signOut();

            if (error) {

                console.error(
                    "Erreur déconnexion Supabase :",
                    error
                );
            }
        }

    } catch (error) {

        console.error(
            "Erreur deconnexion :",
            error
        );
    }


    sessionStorage.removeItem(
        "sessionERP"
    );

    localStorage.removeItem(
        "sessionERP"
    );

    window.location.href =
        "login.html";
}


/* ==================================================
   MENU MOBILE
================================================== */

function initialiserMenuMobile() {

    const menuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !menuBtn ||
        !sidebar ||
        !overlay
    ) {

        console.warn(
            "Menu mobile incomplet."
        );

        return;
    }


    menuBtn.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "active"
            );

            overlay.classList.toggle(
                "active"
            );


            const icon =
                menuBtn.querySelector(
                    "i"
                );

            if (!icon) {
                return;
            }


            if (
                sidebar.classList.contains(
                    "active"
                )
            ) {

                icon.classList.remove(
                    "fa-bars"
                );

                icon.classList.add(
                    "fa-xmark"
                );

            } else {

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );
            }
        }
    );


    overlay.addEventListener(
        "click",
        function () {

            fermerMenuMobile();

        }
    );


    sidebar
        .querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        fermerMenuMobile();

                    }
                );
            }
        );
}


/* ==================================================
   FERMER MENU MOBILE
================================================== */

function fermerMenuMobile() {

    const menuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "active"
        );
    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }


    if (menuBtn) {

        const icon =
            menuBtn.querySelector(
                "i"
            );

        if (icon) {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );
        }
    }
}


/* ==================================================
   EXPORT GLOBAL
================================================== */

window.chargerDashboard =
    chargerDashboard;

window.actualiserDashboard =
    actualiserDashboard;

window.chargerVentes =
    chargerVentes;

window.chargerProduits =
    chargerProduits;

window.chargerClients =
    chargerClients;

window.deconnexion =
    deconnexion;


/* ==================================================
   MESSAGE CONSOLE
================================================== */

console.log(
    "Ferme Asher ERP - Dashboard.js Version 5.0 chargé."
);
