/* ============================================================
   FERME ASHER ERP
   STOCKS.JS
   VERSION 5.0
   Gestion des stocks - IndexedDB + Sync Supabase
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const STOCKS_VERSION = "5.0";

const TABLE_PRODUITS = "produits";
const TABLE_MOUVEMENTS = "mouvements_stock";
const TABLE_QUEUE = "sync_queue";

let stocksInitialises = false;
let stocksInitialisationPromise = null;
let produitsStocks = [];
let mouvementsStocks = [];


/* ============================================================
   OUTILS
   ============================================================ */

function stockLog(...args) {
    console.log("[STOCKS]", ...args);
}


function stockErreur(...args) {
    console.error("[STOCKS]", ...args);
}


function echapperHTML(valeur) {

    if (valeur === null || valeur === undefined) {
        return "";
    }

    return String(valeur)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function nombre(valeur) {

    const n = Number(valeur);

    return Number.isFinite(n) ? n : 0;
}


function formatNombre(valeur) {

    return nombre(valeur).toLocaleString("fr-FR", {
        maximumFractionDigits: 2
    });
}


function formatFC(valeur) {

    return nombre(valeur).toLocaleString("fr-FR", {
        maximumFractionDigits: 0
    }) + " FC";
}


function formatDate(valeur) {

    if (!valeur) {
        return "-";
    }

    const date = new Date(valeur);

    if (Number.isNaN(date.getTime())) {
        return String(valeur);
    }

    return date.toLocaleDateString("fr-FR");
}


function formatDateHeure(valeur) {

    if (!valeur) {
        return "-";
    }

    const date = new Date(valeur);

    if (Number.isNaN(date.getTime())) {
        return String(valeur);
    }

    return date.toLocaleString("fr-FR");
}


/* ============================================================
   CHARGEMENT DES DÉPENDANCES
   ============================================================ */

function chargerScript(src) {

    return new Promise((resolve, reject) => {

        const scriptExistant =
            document.querySelector(
                'script[src="' + src + '"]'
            );

        if (scriptExistant) {

            if (
                src.includes("local-db.js") &&
                typeof window.ouvrirBaseLocale === "function"
            ) {
                resolve();
                return;
            }

            if (
                src.includes("sync.js") &&
                typeof window.synchroniserDonnees === "function"
            ) {
                resolve();
                return;
            }

            if (
                src.includes("supabase.js") &&
                window.supabaseClient
            ) {
                resolve();
                return;
            }
        }

        const script = document.createElement("script");

        script.src = src;
        script.async = false;

        script.onload = () => {
            stockLog("Script chargé :", src);
            resolve();
        };

        script.onerror = () => {
            stockErreur("Impossible de charger :", src);
            reject(
                new Error(
                    "Impossible de charger " + src
                )
            );
        };

        document.head.appendChild(script);
    });
}


async function chargerDependancesStocks() {

    stockLog(
        "Chargement des dépendances..."
    );

    /*
       1. SDK Supabase
    */

    if (!window.supabase) {

        await chargerScript(
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"
        );
    }

    /*
       2. Client Supabase
    */

    if (!window.supabaseClient) {

        await chargerScript(
            "../../js/supabase.js"
        );
    }

    /*
       3. IndexedDB
    */

    if (
        typeof window.ouvrirBaseLocale !== "function"
    ) {

        await chargerScript(
            "../../js/local-db.js?v=3"
        );
    }

    /*
       4. Moteur de synchronisation
    */

    if (
        typeof window.synchroniserDonnees !== "function"
    ) {

        await chargerScript(
            "../../js/sync.js"
        );
    }

    stockLog(
        "Dépendances prêtes."
    );
}


/* ============================================================
   INITIALISATION
   ============================================================ */

async function initialiserStocksERP() {

    if (stocksInitialises) {
        return true;
    }

    try {

        await chargerDependancesStocks();

        if (
            typeof window.ouvrirBaseLocale !== "function"
        ) {

            throw new Error(
                "local-db.js n'est pas disponible."
            );
        }

        await window.ouvrirBaseLocale();

        stocksInitialises = true;

        stockLog(
            "Ferme Asher ERP - Stocks " +
            STOCKS_VERSION +
            " initialisé."
        );

        return true;

    } catch (error) {

        stockErreur(
            "Erreur initialisation :",
            error
        );

        return false;
    }
}


/* ============================================================
   LECTURE DES PRODUITS
   ============================================================ */

async function chargerProduitsLocaux() {

    await initialiserStocksERP();

    try {

        produitsStocks =
            await window.lireToutLocalement(
                TABLE_PRODUITS
            );

        produitsStocks =
            Array.isArray(produitsStocks)
                ? produitsStocks
                : [];

        return produitsStocks;

    } catch (error) {

        stockErreur(
            "Erreur lecture produits :",
            error
        );

        produitsStocks = [];

        return [];
    }
}


/* ============================================================
   LECTURE DES MOUVEMENTS
   ============================================================ */

async function chargerMouvementsLocaux() {

    await initialiserStocksERP();

    try {

        mouvementsStocks =
            await window.lireToutLocalement(
                TABLE_MOUVEMENTS
            );

        mouvementsStocks =
            Array.isArray(mouvementsStocks)
                ? mouvementsStocks
                : [];

        return mouvementsStocks;

    } catch (error) {

        stockErreur(
            "Erreur lecture mouvements :",
            error
        );

        mouvementsStocks = [];

        return [];
    }
}


/* ============================================================
   TROUVER UN PRODUIT
   ============================================================ */

async function trouverProduit(produitId) {

    await initialiserStocksERP();

    if (!produitId) {
        return null;
    }

    try {

        return await window.lireLocalement(
            TABLE_PRODUITS,
            String(produitId)
        );

    } catch (error) {

        stockErreur(
            "Erreur recherche produit :",
            error
        );

        return null;
    }
}


/* ============================================================
   ÉTAT DU STOCK
   ============================================================ */

function obtenirEtatStock(produit) {

    const stock = nombre(produit.stock);
    const minimum = nombre(produit.minimum);

    if (stock <= 0) {
        return "Rupture";
    }

    if (
        minimum > 0 &&
        stock <= minimum
    ) {
        return "Stock faible";
    }

    return "Disponible";
}


function classeEtatStock(etat) {

    if (etat === "Rupture") {
        return "danger";
    }

    if (etat === "Stock faible") {
        return "warning";
    }

    return "success";
}


/* ============================================================
   CHARGEMENT PRINCIPAL DES STOCKS
   ============================================================ */

async function chargerStocks() {

    const initialisation =
        await initialiserStocksERP();

    if (!initialisation) {

        afficherErreurStocks(
            "Impossible d'initialiser la base locale."
        );

        return;
    }

    try {

        await chargerProduitsLocaux();

        await chargerMouvementsLocaux();

        mettreAJourStatistiques();

        afficherStocks();

        afficherAlertes();

        afficherHistorique();

        afficherStatistiquesMensuelles();

        initialiserRechercheEtFiltres();

        stockLog(
            "Stocks chargés :",
            produitsStocks.length,
            "produits"
        );

    } catch (error) {

        stockErreur(
            "Erreur chargement stocks :",
            error
        );

        afficherErreurStocks(
            "Erreur lors du chargement des stocks."
        );
    }
}


/* ============================================================
   ERREUR AFFICHAGE
   ============================================================ */

function afficherErreurStocks(message) {

    const tableau =
        document.getElementById(
            "stocksTable"
        );

    if (tableau) {

        tableau.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-danger py-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    ${echapperHTML(message)}
                </td>
            </tr>
        `;
    }
}


/* ============================================================
   STATISTIQUES
   ============================================================ */

function mettreAJourStatistiques() {

    const totalProduits =
        produitsStocks.length;

    let valeurStock = 0;
    let stockFaible = 0;
    let rupture = 0;

    produitsStocks.forEach(produit => {

        const stock =
            nombre(produit.stock);

        const prix =
            nombre(produit.prix);

        const minimum =
            nombre(produit.minimum);

        valeurStock +=
            stock * prix;

        if (stock <= 0) {

            rupture++;

        } else if (
            minimum > 0 &&
            stock <= minimum
        ) {

            stockFaible++;
        }
    });

    const totalEl =
        document.getElementById(
            "totalProduits"
        );

    if (totalEl) {
        totalEl.textContent =
            formatNombre(totalProduits);
    }

    const valeurEl =
        document.getElementById(
            "valeurStock"
        );

    if (valeurEl) {
        valeurEl.textContent =
            formatFC(valeurStock);
    }

    const faibleEl =
        document.getElementById(
            "stockFaible"
        );

    if (faibleEl) {
        faibleEl.textContent =
            formatNombre(stockFaible);
    }

    const ruptureEl =
        document.getElementById(
            "ruptureStock"
        );

    if (ruptureEl) {
        ruptureEl.textContent =
            formatNombre(rupture);
    }
}


/* ============================================================
   AFFICHER LE TABLEAU DES STOCKS
   ============================================================ */

function afficherStocks() {

    const tableau =
        document.getElementById(
            "stocksTable"
        );

    if (!tableau) {
        return;
    }

    const recherche =
        (
            document.getElementById(
                "rechercheStock"
            )?.value || ""
        )
        .trim()
        .toLowerCase();

    const categorie =
        document.getElementById(
            "filtreCategorie"
        )?.value || "";

    const etat =
        document.getElementById(
            "filtreEtat"
        )?.value || "";

    const produitsFiltres =
        produitsStocks.filter(produit => {

            const nom =
                String(produit.nom || "")
                    .toLowerCase();

            const id =
                String(produit.id || "")
                    .toLowerCase();

            const cat =
                String(produit.categorie || "");

            const etatProduit =
                obtenirEtatStock(produit);

            const rechercheOK =
                !recherche ||
                nom.includes(recherche) ||
                id.includes(recherche);

            const categorieOK =
                !categorie ||
                cat === categorie;

            const etatOK =
                !etat ||
                etatProduit === etat;

            return (
                rechercheOK &&
                categorieOK &&
                etatOK
            );
        });

    if (
        produitsFiltres.length === 0
    ) {

        tableau.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-muted py-4">
                    Aucun produit trouvé.
                </td>
            </tr>
        `;

        return;
    }

    tableau.innerHTML =
        produitsFiltres
            .map(produit => {

                const stock =
                    nombre(produit.stock);

                const minimum =
                    nombre(produit.minimum);

                const prix =
                    nombre(produit.prix);

                const valeur =
                    stock * prix;

                const etat =
                    obtenirEtatStock(
                        produit
                    );

                const classe =
                    classeEtatStock(
                        etat
                    );

                return `
                    <tr>

                        <td>
                            <strong>
                                ${echapperHTML(produit.id)}
                            </strong>
                        </td>

                        <td>
                            ${echapperHTML(produit.nom)}
                        </td>

                        <td>
                            ${echapperHTML(
                                produit.categorie || "-"
                            )}
                        </td>

                        <td>
                            <strong>
                                ${formatNombre(stock)}
                            </strong>
                        </td>

                        <td>
                            ${formatNombre(minimum)}
                        </td>

                        <td>
                            ${echapperHTML(
                                produit.unite || "-"
                            )}
                        </td>

                        <td>
                            ${formatFC(valeur)}
                        </td>

                        <td>
                            <span class="badge bg-${classe}">
                                ${echapperHTML(etat)}
                            </span>
                        </td>

                        <td>

                            <a
                                href="entree.html?produit=${encodeURIComponent(produit.id)}"
                                class="btn btn-sm btn-success"
                                title="Entrée">
                                <i class="fa-solid fa-plus"></i>
                            </a>

                            <a
                                href="sortie.html?produit=${encodeURIComponent(produit.id)}"
                                class="btn btn-sm btn-danger"
                                title="Sortie">
                                <i class="fa-solid fa-minus"></i>
                            </a>

                        </td>

                    </tr>
                `;
            })
            .join("");
}


/* ============================================================
   ALERTES
   ============================================================ */

function afficherAlertes() {

    const conteneur =
        document.getElementById(
            "alertesStock"
        );

    if (!conteneur) {
        return;
    }

    const ruptures =
        produitsStocks.filter(
            produit =>
                nombre(produit.stock) <= 0
        );

    const faibles =
        produitsStocks.filter(
            produit =>
                nombre(produit.stock) > 0 &&
                nombre(produit.minimum) > 0 &&
                nombre(produit.stock) <=
                    nombre(produit.minimum)
        );

    let html = "";

    if (
        ruptures.length === 0 &&
        faibles.length === 0
    ) {

        html = `
            <div class="alert alert-success">
                <i class="fa-solid fa-circle-check"></i>
                Aucun problème détecté.
            </div>
        `;

        conteneur.innerHTML = html;

        return;
    }

    ruptures.forEach(produit => {

        html += `
            <div class="alert alert-danger">
                <strong>
                    Rupture :
                </strong>
                ${echapperHTML(produit.nom)}
            </div>
        `;
    });

    faibles.forEach(produit => {

        html += `
            <div class="alert alert-warning">
                <strong>
                    Stock faible :
                </strong>
                ${echapperHTML(produit.nom)}
                —
                ${formatNombre(produit.stock)}
                ${echapperHTML(produit.unite || "")}
            </div>
        `;
    });

    conteneur.innerHTML = html;
}


/* ============================================================
   HISTORIQUE
   ============================================================ */

function afficherHistorique() {

    const tableau =
        document.getElementById(
            "historiqueTable"
        );

    if (!tableau) {
        return;
    }

    const mouvements =
        [...mouvementsStocks]
            .sort(
                (a, b) =>
                    new Date(
                        b.date || b.created_at || 0
                    ) -
                    new Date(
                        a.date || a.created_at || 0
                    )
            )
            .slice(0, 10);

    if (mouvements.length === 0) {

        tableau.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted">
                    Aucun mouvement enregistré.
                </td>
            </tr>
        `;

        return;
    }

    tableau.innerHTML =
        mouvements
            .map(mouvement => {

                const produit =
                    produitsStocks.find(
                        p =>
                            String(p.id) ===
                            String(
                                mouvement.produit_id
                            )
                    );

                const quantite =
                    nombre(
                        mouvement.quantite
                    );

                const type =
                    String(
                        mouvement.type || ""
                    );

                const positif =
                    quantite >= 0;

                return `
                    <tr>

                        <td>
                            ${formatDateHeure(
                                mouvement.date ||
                                mouvement.created_at
                            )}
                        </td>

                        <td>
                            ${echapperHTML(
                                produit?.nom ||
                                mouvement.produit_id ||
                                "-"
                            )}
                        </td>

                        <td>
                            <span class="badge ${
                                positif
                                    ? "bg-success"
                                    : "bg-danger"
                            }">
                                ${echapperHTML(type)}
                            </span>
                        </td>

                        <td>
                            <strong>
                                ${positif ? "+" : ""}
                                ${formatNombre(quantite)}
                            </strong>
                        </td>

                        <td>
                            ${echapperHTML(
                                mouvement.utilisateur ||
                                "-"
                            )}
                        </td>

                    </tr>
                `;
            })
            .join("");
}


/* ============================================================
   STATISTIQUES MENSUELLES
   ============================================================ */

function afficherStatistiquesMensuelles() {

    const maintenant =
        new Date();

    const mois =
        maintenant.getMonth();

    const annee =
        maintenant.getFullYear();

    let entrees = 0;
    let sorties = 0;

    mouvementsStocks.forEach(mouvement => {

        const date =
            new Date(
                mouvement.date ||
                mouvement.created_at
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return;
        }

        if (
            date.getMonth() !== mois ||
            date.getFullYear() !== annee
        ) {
            return;
        }

        const qte =
            nombre(
                mouvement.quantite
            );

        if (qte > 0) {

            entrees += qte;

        } else if (qte < 0) {

            sorties += Math.abs(qte);
        }
    });

    const entreesEl =
        document.getElementById(
            "entreesMois"
        );

    if (entreesEl) {
        entreesEl.textContent =
            formatNombre(entrees);
    }

    const sortiesEl =
        document.getElementById(
            "sortiesMois"
        );

    if (sortiesEl) {
        sortiesEl.textContent =
            formatNombre(sorties);
    }
}


/* ============================================================
   RECHERCHE ET FILTRES
   ============================================================ */

function initialiserRechercheEtFiltres() {

    const recherche =
        document.getElementById(
            "rechercheStock"
        );

    const categorie =
        document.getElementById(
            "filtreCategorie"
        );

    const etat =
        document.getElementById(
            "filtreEtat"
        );

    if (recherche && !recherche.dataset.stockReady) {

        recherche.addEventListener(
            "input",
            afficherStocks
        );

        recherche.dataset.stockReady =
            "true";
    }

    if (categorie && !categorie.dataset.stockReady) {

        categorie.addEventListener(
            "change",
            afficherStocks
        );

        categorie.dataset.stockReady =
            "true";
    }

    if (etat && !etat.dataset.stockReady) {

        etat.addEventListener(
            "change",
            afficherStocks
        );

        etat.dataset.stockReady =
            "true";
    }
}


/* ============================================================
   CHARGER LES PRODUITS DANS UN SELECT
   ============================================================ */

async function chargerListeProduits() {

    await chargerProduitsLocaux();

    const select =
        document.getElementById(
            "produit"
        );

    if (!select) {
        return;
    }

    const produitSelectionne =
        new URLSearchParams(
            window.location.search
        ).get("produit");

    select.innerHTML = `
        <option value="">
            Sélectionner un produit
        </option>
    `;

    produitsStocks
        .sort(
            (a, b) =>
                String(a.nom || "")
                    .localeCompare(
                        String(b.nom || ""),
                        "fr"
                    )
        )
        .forEach(produit => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(produit.id);

            option.textContent =
                `${produit.nom} — Stock : ${formatNombre(produit.stock)} ${produit.unite || ""}`;

            if (
                produitSelectionne &&
                String(produit.id) ===
                String(produitSelectionne)
            ) {
                option.selected = true;
            }

            select.appendChild(option);
        });

    select.dispatchEvent(
        new Event("change")
    );
}


/* ============================================================
   UTILISATEUR
   ============================================================ */

function obtenirUtilisateur() {

    if (
        window.utilisateurConnecte
    ) {

        if (
            typeof window.utilisateurConnecte ===
            "string"
        ) {
            return window.utilisateurConnecte;
        }

        if (
            window.utilisateurConnecte.nom
        ) {
            return window.utilisateurConnecte.nom;
        }
    }

    return (
        localStorage.getItem(
            "utilisateurNom"
        ) ||
        localStorage.getItem(
            "nomUtilisateur"
        ) ||
        "Administrateur"
    );
}


/* ============================================================
   CRÉER UN MOUVEMENT
   ============================================================ */

async function creerMouvementStock({
    produitId,
    type,
    quantite,
    referenceTable = null,
    referenceId = null,
    commentaire = "",
    utilisateur = null,
    date = null
}) {

    await initialiserStocksERP();

    const produit =
        await trouverProduit(
            produitId
        );

    if (!produit) {

        throw new Error(
            "Produit introuvable : " +
            produitId
        );
    }

    const qte =
        nombre(quantite);

    if (qte === 0) {

        throw new Error(
            "La quantité doit être différente de zéro."
        );
    }

    const stockActuel =
        nombre(produit.stock);

    const nouveauStock =
        stockActuel + qte;

    if (nouveauStock < 0) {

        throw new Error(
            "Stock insuffisant. Stock actuel : " +
            formatNombre(stockActuel)
        );
    }

    const maintenant =
        new Date().toISOString();

    const mouvement = {

        id: crypto.randomUUID(),

        produit_id:
            String(produitId),

        type:
            String(type || "STOCK"),

        quantite:
            qte,

        reference_table:
            referenceTable,

        reference_id:
            referenceId
                ? String(referenceId)
                : null,

        commentaire:
            commentaire || "",

        utilisateur:
            utilisateur ||
            obtenirUtilisateur(),

        date:
            date || maintenant,

        created_at:
            maintenant,

        synchronise:
            false
    };

    /*
       Mise à jour locale du stock.
    */

    produit.stock =
        nouveauStock;

    produit.synchronise =
        true;

    /*
       Enregistrement local.
    */

    await window.enregistrerLocalement(
        TABLE_PRODUITS,
        produit
    );

    await window.enregistrerLocalement(
        TABLE_MOUVEMENTS,
        mouvement
    );

    /*
       Ajout à la file de synchronisation.
    */

    await window.ajouterFileSynchronisation(
        TABLE_MOUVEMENTS,
        "INSERT",
        mouvement
    );

    stockLog(
        "Mouvement enregistré localement :",
        mouvement
    );

    /*
       Synchronisation immédiate si Internet disponible.
    */

    if (
        navigator.onLine &&
        typeof window.synchroniserDonnees ===
        "function"
    ) {

        try {

            await window.synchroniserDonnees();

        } catch (error) {

            stockLog(
                "Synchronisation différée :",
                error
            );
        }
    }

    return mouvement;
}


/* ============================================================
   ENTRÉE DE STOCK
   ============================================================ */

async function enregistrerEntreeStock(donnees) {

    const produitId =
        donnees.produitId;

    const quantite =
        nombre(donnees.quantite);

    if (!produitId) {

        throw new Error(
            "Veuillez sélectionner un produit."
        );
    }

    if (quantite <= 0) {

        throw new Error(
            "La quantité doit être supérieure à zéro."
        );
    }

    const mouvement =
        await creerMouvementStock({

            produitId,

            type:
                "ENTREE",

            quantite,

            referenceTable:
                "stocks",

            referenceId:
                crypto.randomUUID(),

            commentaire:
                [
                    donnees.type,
                    donnees.reference,
                    donnees.observation
                ]
                .filter(Boolean)
                .join(" | "),

            utilisateur:
                obtenirUtilisateur(),

            date:
                donnees.date
                    ? new Date(
                        donnees.date +
                        "T00:00:00"
                    ).toISOString()
                    : null
        });

    return mouvement;
}


/* ============================================================
   SORTIE DE STOCK
   ============================================================ */

async function enregistrerSortieStock(donnees) {

    const produitId =
        donnees.produitId;

    const quantite =
        nombre(donnees.quantite);

    if (!produitId) {

        throw new Error(
            "Veuillez sélectionner un produit."
        );
    }

    if (quantite <= 0) {

        throw new Error(
            "La quantité doit être supérieure à zéro."
        );
    }

    const produit =
        await trouverProduit(
            produitId
        );

    if (!produit) {

        throw new Error(
            "Produit introuvable."
        );
    }

    if (
        nombre(produit.stock) <
        quantite
    ) {

        throw new Error(
            "Stock insuffisant. Disponible : " +
            formatNombre(produit.stock)
        );
    }

    const mouvement =
        await creerMouvementStock({

            produitId,

            type:
                "SORTIE",

            quantite:
                -Math.abs(quantite),

            referenceTable:
                "stocks",

            referenceId:
                crypto.randomUUID(),

            commentaire:
                [
                    donnees.type,
                    donnees.reference,
                    donnees.observation
                ]
                .filter(Boolean)
                .join(" | "),

            utilisateur:
                obtenirUtilisateur(),

            date:
                donnees.date
                    ? new Date(
                        donnees.date +
                        "T00:00:00"
                    ).toISOString()
                    : null
        });

    return mouvement;
}


/* ============================================================
   PAGE ENTRÉE
   ============================================================ */

async function initialiserPageEntree() {

    const formulaire =
        document.getElementById(
            "entreeForm"
        );

    if (!formulaire) {
        return;
    }

    await initialiserStocksERP();

    await chargerListeProduits();

    const date =
        document.getElementById(
            "date"
        );

    if (
        date &&
        !date.value
    ) {

        date.value =
            new Date()
                .toISOString()
                .split("T")[0];
    }

    const quantite =
        document.getElementById(
            "quantite"
        );

    const prix =
        document.getElementById(
            "prix"
        );

    const montant =
        document.getElementById(
            "montant"
        );

    function calculerMontant() {

        if (!montant) {
            return;
        }

        montant.value =
            (
                nombre(
                    quantite?.value
                ) *
                nombre(
                    prix?.value
                )
            ).toFixed(2);
    }

    quantite?.addEventListener(
        "input",
        calculerMontant
    );

    prix?.addEventListener(
        "input",
        calculerMontant
    );

    formulaire.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const bouton =
                formulaire.querySelector(
                    'button[type="submit"]'
                );

            try {

                if (bouton) {
                    bouton.disabled = true;
                }

                const mouvement =
                    await enregistrerEntreeStock({

                        date:
                            document.getElementById(
                                "date"
                            )?.value,

                        produitId:
                            document.getElementById(
                                "produit"
                            )?.value,

                        quantite:
                            document.getElementById(
                                "quantite"
                            )?.value,

                        prix:
                            document.getElementById(
                                "prix"
                            )?.value,

                        type:
                            document.getElementById(
                                "type"
                            )?.value,

                        reference:
                            document.getElementById(
                                "reference"
                            )?.value,

                        observation:
                            document.getElementById(
                                "observation"
                            )?.value
                    });

                alert(
                    "Entrée de stock enregistrée avec succès."
                );

                stockLog(
                    "Entrée enregistrée :",
                    mouvement
                );

                window.location.href =
                    "index.html";

            } catch (error) {

                stockErreur(
                    "Erreur entrée :",
                    error
                );

                alert(
                    error.message ||
                    "Impossible d'enregistrer l'entrée."
                );

            } finally {

                if (bouton) {
                    bouton.disabled = false;
                }
            }
        }
    );

    stockLog(
        "Page Entrée initialisée."
    );
}


/* ============================================================
   PAGE SORTIE
   ============================================================ */

async function initialiserPageSortie() {

    const formulaire =
        document.getElementById(
            "sortieForm"
        );

    if (!formulaire) {
        return;
    }

    await initialiserStocksERP();

    await chargerListeProduits();

    const date =
        document.getElementById(
            "date"
        );

    if (
        date &&
        !date.value
    ) {

        date.value =
            new Date()
                .toISOString()
                .split("T")[0];
    }

    const selectProduit =
        document.getElementById(
            "produit"
        );

    const stockDisponible =
        document.getElementById(
            "stockDisponible"
        );

    const prix =
        document.getElementById(
            "prix"
        );

    function actualiserProduit() {

        const produit =
            produitsStocks.find(
                p =>
                    String(p.id) ===
                    String(
                        selectProduit?.value
                    )
            );

        if (!produit) {

            if (stockDisponible) {
                stockDisponible.value = "";
            }

            if (prix) {
                prix.value = "";
            }

            return;
        }

        if (stockDisponible) {

            stockDisponible.value =
                nombre(produit.stock);
        }

        if (prix) {

            prix.value =
                nombre(produit.prix);
        }
    }

    selectProduit?.addEventListener(
        "change",
        actualiserProduit
    );

    actualiserProduit();

    formulaire.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const bouton =
                formulaire.querySelector(
                    'button[type="submit"]'
                );

            try {

                if (bouton) {
                    bouton.disabled = true;
                }

                const mouvement =
                    await enregistrerSortieStock({

                        date:
                            document.getElementById(
                                "date"
                            )?.value,

                        produitId:
                            document.getElementById(
                                "produit"
                            )?.value,

                        quantite:
                            document.getElementById(
                                "quantite"
                            )?.value,

                        prix:
                            document.getElementById(
                                "prix"
                            )?.value,

                        type:
                            document.getElementById(
                                "type"
                            )?.value,

                        reference:
                            document.getElementById(
                                "reference"
                            )?.value,

                        observation:
                            document.getElementById(
                                "observation"
                            )?.value
                    });

                alert(
                    "Sortie de stock enregistrée avec succès."
                );

                stockLog(
                    "Sortie enregistrée :",
                    mouvement
                );

                window.location.href =
                    "index.html";

            } catch (error) {

                stockErreur(
                    "Erreur sortie :",
                    error
                );

                alert(
                    error.message ||
                    "Impossible d'enregistrer la sortie."
                );

            } finally {

                if (bouton) {
                    bouton.disabled = false;
                }
            }
        }
    );

    stockLog(
        "Page Sortie initialisée."
    );
}


/* ============================================================
   INVENTAIRE
   ============================================================ */

async function chargerInventaire() {

    await chargerStocks();

    return produitsStocks;
}


async function ajusterStockInventaire(
    produitId,
    nouveauStock,
    commentaire = "Ajustement inventaire"
) {

    const produit =
        await trouverProduit(
            produitId
        );

    if (!produit) {

        throw new Error(
            "Produit introuvable."
        );
    }

    const ancienStock =
        nombre(produit.stock);

    const stockFinal =
        nombre(nouveauStock);

    const difference =
        stockFinal - ancienStock;

    if (difference === 0) {

        return null;
    }

    return creerMouvementStock({

        produitId,

        type:
            "INVENTAIRE",

        quantite:
            difference,

        referenceTable:
            "inventaire",

        referenceId:
            crypto.randomUUID(),

        commentaire,

        utilisateur:
            obtenirUtilisateur(),

        date:
            new Date().toISOString()
    });
}


/* ============================================================
   COMPATIBILITÉ AVEC ANCIENS APPELS
   ============================================================ */

async function retirerStockApresVente(
    produitId,
    quantite,
    venteId = null
) {

    return creerMouvementStock({

        produitId,

        type:
            "VENTE",

        quantite:
            -Math.abs(
                nombre(quantite)
            ),

        referenceTable:
            "ventes",

        referenceId:
            venteId
                ? String(venteId)
                : crypto.randomUUID(),

        commentaire:
            "Sortie de stock suite à une vente",

        utilisateur:
            obtenirUtilisateur(),

        date:
            new Date().toISOString()
    });
}


async function remettreStockApresAnnulation(
    produitId,
    quantite,
    venteId = null
) {

    return creerMouvementStock({

        produitId,

        type:
            "ANNULATION_VENTE",

        quantite:
            Math.abs(
                nombre(quantite)
            ),

        referenceTable:
            "ventes",

        referenceId:
            venteId
                ? String(venteId)
                : crypto.randomUUID(),

        commentaire:
            "Retour de stock suite à annulation de vente",

        utilisateur:
            obtenirUtilisateur(),

        date:
            new Date().toISOString()
    });
}


/* ============================================================
   ACTUALISATION APRÈS SYNCHRONISATION
   ============================================================ */

window.addEventListener(
    "online",
    async function() {

        stockLog(
            "Connexion Internet détectée."
        );

        if (
            typeof window.synchroniserDonnees ===
            "function"
        ) {

            try {

                await window.synchroniserDonnees();

                await chargerStocks();

            } catch (error) {

                stockErreur(
                    "Erreur synchronisation online :",
                    error
                );
            }
        }
    }
);


/* ============================================================
   INITIALISATION AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            if (
                document.getElementById(
                    "stocksTable"
                )
            ) {

                await chargerStocks();

            }

            if (
                document.getElementById(
                    "entreeForm"
                )
            ) {

                await initialiserPageEntree();

            }

            if (
                document.getElementById(
                    "sortieForm"
                )
            ) {

                await initialiserPageSortie();

            }

        } catch (error) {

            stockErreur(
                "Erreur initialisation page :",
                error
            );
        }
    }
);


/* ============================================================
   EXPORTS GLOBAUX
   ============================================================ */

window.STOCKS_VERSION =
    STOCKS_VERSION;

window.chargerStocks =
    chargerStocks;

window.initialiserStocksERP =
    initialiserStocksERP;

window.chargerProduitsLocaux =
    chargerProduitsLocaux;

window.chargerMouvementsLocaux =
    chargerMouvementsLocaux;

window.chargerListeProduits =
    chargerListeProduits;

window.creerMouvementStock =
    creerMouvementStock;

window.enregistrerEntreeStock =
    enregistrerEntreeStock;

window.enregistrerSortieStock =
    enregistrerSortieStock;

window.initialiserPageEntree =
    initialiserPageEntree;

window.initialiserPageSortie =
    initialiserPageSortie;

window.chargerInventaire =
    chargerInventaire;

window.ajusterStockInventaire =
    ajusterStockInventaire;

window.retirerStockApresVente =
    retirerStockApresVente;

window.remettreStockApresAnnulation =
    remettreStockApresAnnulation;

stockLog(
    "stocks.js version " +
    STOCKS_VERSION +
    " chargé."
);
