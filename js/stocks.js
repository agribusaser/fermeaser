/* =========================================================
   FERME ASHER ERP
   STOCKS.JS
   VERSION 4.0 - OFFLINE FIRST
   IndexedDB -> sync_queue -> Supabase
   ========================================================= */

"use strict";

const STOCKS_VERSION = "4.0";
const STOCKS_TABLE_PRODUITS = "produits";
const STOCKS_TABLE_MOUVEMENTS = "mouvements_stock";

function dateLocale() {
    return new Date().toISOString().slice(0, 10);
}

function maintenantISO() {
    return new Date().toISOString();
}

function afficherNombre(value) {
    return Number(value || 0).toLocaleString("fr-FR");
}

function echapperHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function verifierDependancesStocks() {
    const manquantes = [];

    if (typeof lireToutLocalement !== "function") {
        manquantes.push("local-db.js");
    }

    if (typeof enregistrerLocalement !== "function") {
        manquantes.push("local-db.js");
    }

    if (typeof ajouterFileSynchronisation !== "function") {
        manquantes.push("local-db.js");
    }

    if (typeof lireLocalement !== "function") {
        manquantes.push("local-db.js");
    }

    if (typeof synchroniserDonnees !== "function") {
        console.warn(
            "⚠ sync.js non chargé : les opérations resteront dans sync_queue."
        );
    }

    if (manquantes.length) {
        console.error(
            "❌ Dépendances Stocks manquantes :",
            [...new Set(manquantes)]
        );

        return false;
    }

    return true;
}

async function lireProduitsStocks() {
    return await lireToutLocalement(STOCKS_TABLE_PRODUITS);
}

async function lireMouvementsStocks() {
    return await lireToutLocalement(STOCKS_TABLE_MOUVEMENTS);
}

function libelleTypeMouvement(type) {
    const types = {
        ENTREE: "Entrée",
        SORTIE: "Sortie",
        VENTE: "Vente",
        AJUSTEMENT: "Inventaire",
        RETOUR: "Retour"
    };

    return (
        types[String(type || "").toUpperCase()] ||
        String(type || "Mouvement")
    );
}

function classeTypeMouvement(type) {
    const t = String(type || "").toUpperCase();

    if (t === "ENTREE" || t === "RETOUR") {
        return "bg-success";
    }

    if (t === "SORTIE" || t === "VENTE") {
        return "bg-danger";
    }

    return "bg-warning text-dark";
}

function nomProduitDepuisMouvement(mouvement, produits) {
    const produit = produits.find(
        p => String(p.id) === String(mouvement.produit_id)
    );

    return (
        produit?.nom ||
        mouvement.produit ||
        mouvement.produit_id ||
        "Produit inconnu"
    );
}

function valeurUnitaireProduit(produit) {
    return Number(
        produit?.prixAchat ??
        produit?.prix ??
        0
    ) || 0;
}

/* =========================================================
   PAGE PRINCIPALE
   ========================================================= */

async function chargerStocks() {
    if (!verifierDependancesStocks()) {
        return;
    }

    try {
        const produits = await lireProduitsStocks();

        const table = document.getElementById("stocksTable");
        const totalProduits = document.getElementById("totalProduits");
        const valeurStock = document.getElementById("valeurStock");
        const stockFaibleElement =
            document.getElementById("stockFaible");
        const ruptureElement =
            document.getElementById("ruptureStock");

        const categorie =
            document.getElementById("filtreCategorie")?.value || "";

        const etatRecherche =
            document.getElementById("filtreEtat")?.value || "";

        if (!table) {
            return;
        }

        let valeurTotale = 0;
        let stockFaible = 0;
        let rupture = 0;

        table.innerHTML = "";

        produits.forEach(produit => {
            const stock = Number(produit.stock) || 0;

            const minimum =
                Number(
                    produit.minimum ??
                    produit.stockMinimum ??
                    0
                ) || 0;

            const prix = valeurUnitaireProduit(produit);
            const valeur = stock * prix;

            valeurTotale += valeur;

            let etat = "Disponible";
            let badge = "success";

            if (stock <= 0) {
                etat = "Rupture";
                badge = "danger";
                rupture++;
            } else if (stock <= minimum) {
                etat = "Stock faible";
                badge = "warning";
                stockFaible++;
            }

            if (
                categorie &&
                String(produit.categorie || "") !== categorie
            ) {
                return;
            }

            if (
                etatRecherche &&
                etat !== etatRecherche
            ) {
                return;
            }

            const code = produit.code || produit.id || "";

            table.insertAdjacentHTML(
                "beforeend",
                `
                <tr>
                    <td>${echapperHTML(code)}</td>

                    <td>
                        ${echapperHTML(produit.nom || "")}
                    </td>

                    <td>
                        ${echapperHTML(produit.categorie || "")}
                    </td>

                    <td>
                        <strong>
                            ${afficherNombre(stock)}
                        </strong>
                    </td>

                    <td>
                        ${afficherNombre(minimum)}
                    </td>

                    <td>
                        ${echapperHTML(produit.unite || "")}
                    </td>

                    <td>
                        ${afficherNombre(valeur)} FC
                    </td>

                    <td>
                        <span class="badge bg-${badge}">
                            ${etat}
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="btn btn-success btn-sm"
                            onclick="entreeStock('${encodeURIComponent(
                                String(produit.id)
                            )}')"
                            title="Entrée de stock"
                        >
                            <i class="fa fa-plus"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="sortieStock('${encodeURIComponent(
                                String(produit.id)
                            )}')"
                            title="Sortie de stock"
                        >
                            <i class="fa fa-minus"></i>
                        </button>
                    </td>
                </tr>
                `
            );
        });

        if (totalProduits) {
            totalProduits.textContent = produits.length;
        }

        if (valeurStock) {
            valeurStock.textContent =
                `${afficherNombre(valeurTotale)} FC`;
        }

        if (stockFaibleElement) {
            stockFaibleElement.textContent = stockFaible;
        }

        if (ruptureElement) {
            ruptureElement.textContent = rupture;
        }

        await afficherAlertesStocks(produits);
        await afficherDerniersMouvements(produits);
        await chargerStatistiquesMensuelles();

    } catch (error) {
        console.error(
            "❌ Erreur chargement stocks :",
            error
        );
    }
}

async function afficherAlertesStocks(produits) {
    const zone = document.getElementById("alertesStock");

    if (!zone) {
        return;
    }

    const alertes = produits.filter(produit => {
        const stock = Number(produit.stock) || 0;

        const minimum =
            Number(
                produit.minimum ??
                produit.stockMinimum ??
                0
            ) || 0;

        return stock <= minimum;
    });

    if (!alertes.length) {
        zone.innerHTML = `
            <div class="alert alert-success mb-0">
                Aucun problème détecté.
            </div>
        `;

        return;
    }

    zone.innerHTML = alertes
        .map(produit => {
            const stock = Number(produit.stock) || 0;

            const minimum =
                Number(
                    produit.minimum ??
                    produit.stockMinimum ??
                    0
                ) || 0;

            return `
                <div class="alert ${
                    stock <= 0
                        ? "alert-danger"
                        : "alert-warning"
                }">

                    <strong>
                        ${echapperHTML(produit.nom)}
                    </strong>

                    <br>

                    ${
                        stock <= 0
                            ? "Rupture de stock."
                            : `Stock faible : ${
                                afficherNombre(stock)
                            } / minimum ${
                                afficherNombre(minimum)
                            }.`
                    }
                </div>
            `;
        })
        .join("");
}

async function afficherDerniersMouvements(produits) {
    const table =
        document.getElementById("historiqueTable");

    if (!table) {
        return;
    }

    const mouvements =
        await lireMouvementsStocks();

    mouvements.sort(
        (a, b) =>
            new Date(
                b.date ||
                b.created_at ||
                0
            ) -
            new Date(
                a.date ||
                a.created_at ||
                0
            )
    );

    const derniers =
        mouvements.slice(0, 10);

    if (!derniers.length) {
        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted"
                >
                    Aucun mouvement enregistré.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = derniers
        .map(mouvement => {
            return `
                <tr>

                    <td>
                        ${echapperHTML(
                            String(
                                mouvement.date ||
                                mouvement.created_at ||
                                ""
                            ).slice(0, 10)
                        )}
                    </td>

                    <td>
                        ${echapperHTML(
                            nomProduitDepuisMouvement(
                                mouvement,
                                produits
                            )
                        )}
                    </td>

                    <td>
                        <span
                            class="badge ${
                                classeTypeMouvement(
                                    mouvement.type
                                )
                            }"
                        >
                            ${echapperHTML(
                                libelleTypeMouvement(
                                    mouvement.type
                                )
                            )}
                        </span>
                    </td>

                    <td>
                        ${afficherNombre(
                            Math.abs(
                                Number(
                                    mouvement.quantite
                                ) || 0
                            )
                        )}
                    </td>

                    <td>
                        ${echapperHTML(
                            mouvement.utilisateur ||
                            "Administrateur"
                        )}
                    </td>

                </tr>
            `;
        })
        .join("");
}

/* =========================================================
   RECHERCHE / FILTRES
   ========================================================= */

function initialiserRecherche() {
    const champ =
        document.getElementById(
            "rechercheStock"
        );

    if (
        !champ ||
        champ.dataset.stocksReady === "true"
    ) {
        return;
    }

    champ.dataset.stocksReady = "true";

    champ.addEventListener(
        "input",
        () => {
            const recherche =
                champ.value.toLowerCase();

            document
                .querySelectorAll(
                    "#stocksTable tr"
                )
                .forEach(ligne => {
                    ligne.style.display =
                        ligne.innerText
                            .toLowerCase()
                            .includes(recherche)
                            ? ""
                            : "none";
                });
        }
    );
}

function initialiserFiltres() {
    const categorie =
        document.getElementById(
            "filtreCategorie"
        );

    const etat =
        document.getElementById(
            "filtreEtat"
        );

    if (
        categorie &&
        categorie.dataset.stocksReady !== "true"
    ) {
        categorie.dataset.stocksReady = "true";

        categorie.addEventListener(
            "change",
            chargerStocks
        );
    }

    if (
        etat &&
        etat.dataset.stocksReady !== "true"
    ) {
        etat.dataset.stocksReady = "true";

        etat.addEventListener(
            "change",
            chargerStocks
        );
    }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function entreeStock(id) {
    window.location.href =
        `entree.html?id=${encodeURIComponent(
            decodeURIComponent(id)
        )}`;
}

function sortieStock(id) {
    window.location.href =
        `sortie.html?id=${encodeURIComponent(
            decodeURIComponent(id)
        )}`;
}

/* =========================================================
   PRODUITS FORMULAIRES
   ========================================================= */

async function chargerListeProduits() {
    const select =
        document.getElementById("produit");

    if (!select) {
        return;
    }

    const produits =
        await lireProduitsStocks();

    const idSelectionne =
        new URLSearchParams(
            window.location.search
        ).get("id");

    select.innerHTML =
        `<option value="">
            Sélectionner un produit
        </option>`;

    produits.forEach(produit => {
        const option =
            document.createElement("option");

        option.value = produit.id;

        option.textContent =
            `${produit.nom || "Sans nom"} — Stock : ${
                Number(produit.stock) || 0
            } ${produit.unite || ""}`;

        if (
            String(produit.id) ===
            String(idSelectionne)
        ) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

/* =========================================================
   MOUVEMENT LOCAL + FILE SYNC
   ========================================================= */

async function creerMouvementStock({
    produit,
    type,
    quantite,
    commentaire,
    referenceTable = null,
    referenceId = null
}) {
    const maintenant =
        maintenantISO();

    const mouvement = {
        id: crypto.randomUUID(),

        produit_id:
            String(produit.id),

        type:
            String(type),

        quantite:
            Number(quantite),

        reference_table:
            referenceTable,

        reference_id:
            referenceId,

        commentaire:
            commentaire || null,

        utilisateur:
            "Administrateur",

        date:
            maintenant,

        created_at:
            maintenant,

        synchronise:
            false
    };

    await enregistrerLocalement(
        STOCKS_TABLE_MOUVEMENTS,
        mouvement
    );

    await ajouterFileSynchronisation(
        STOCKS_TABLE_MOUVEMENTS,
        "INSERT",
        mouvement
    );

    if (
        typeof synchroniserDonnees === "function" &&
        navigator.onLine
    ) {
        try {
            await synchroniserDonnees();
        } catch (error) {
            console.warn(
                "Synchronisation automatique reportée :",
                error
            );
        }
    }

    return mouvement;
}

/* =========================================================
   ENTREE
   ========================================================= */

async function initialiserPageEntree() {
    const formulaire =
        document.getElementById(
            "entreeForm"
        );

    if (
        !formulaire ||
        formulaire.dataset.stocksReady === "true"
    ) {
        return;
    }

    formulaire.dataset.stocksReady = "true";

    await chargerListeProduits();

    const date =
        document.getElementById("date");

    const produitSelect =
        document.getElementById("produit");

    const quantite =
        document.getElementById("quantite");

    const prix =
        document.getElementById("prix");

    const montant =
        document.getElementById("montant");

    const type =
        document.getElementById("type");

    const reference =
        document.getElementById("reference");

    const observation =
        document.getElementById("observation");

    if (
        date &&
        !date.value
    ) {
        date.value = dateLocale();
    }

    function calculerMontant() {
        if (montant) {
            montant.value = (
                (Number(
                    quantite?.value
                ) || 0) *
                (Number(
                    prix?.value
                ) || 0)
            ).toFixed(2);
        }
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
        async event => {
            event.preventDefault();

            try {
                const idProduit =
                    produitSelect?.value;

                const quantiteEntree =
                    Number(
                        quantite?.value
                    );

                const nature =
                    type?.value?.trim() ||
                    "";

                if (!idProduit) {
                    alert(
                        "Veuillez sélectionner un produit."
                    );
                    return;
                }

                if (
                    !Number.isFinite(
                        quantiteEntree
                    ) ||
                    quantiteEntree <= 0
                ) {
                    alert(
                        "La quantité doit être supérieure à zéro."
                    );
                    return;
                }

                if (!nature) {
                    alert(
                        "Veuillez sélectionner la provenance de l'entrée."
                    );
                    return;
                }

                const produit =
                    await lireLocalement(
                        STOCKS_TABLE_PRODUITS,
                        idProduit
                    );

                if (!produit) {
                    alert(
                        "Produit introuvable dans la base locale."
                    );
                    return;
                }

                produit.stock =
                    (Number(produit.stock) || 0) +
                    quantiteEntree;

                produit.synchronise =
                    false;

                await enregistrerLocalement(
                    STOCKS_TABLE_PRODUITS,
                    produit
                );

                const referenceValeur =
                    reference?.value?.trim() ||
                    crypto.randomUUID();

                const commentaire = [
                    `Entrée : ${nature}`,

                    reference?.value?.trim()
                        ? `Référence : ${reference.value.trim()}`
                        : "",

                    observation?.value?.trim()
                        ? `Observation : ${observation.value.trim()}`
                        : "",

                    prix?.value
                        ? `Prix unitaire : ${
                            Number(prix.value) || 0
                        } FC`
                        : ""
                ]
                    .filter(Boolean)
                    .join(" | ");

                await creerMouvementStock({
                    produit,
                    type: "ENTREE",
                    quantite:
                        quantiteEntree,
                    commentaire,
                    referenceTable:
                        "stocks",
                    referenceId:
                        referenceValeur
                });

                alert(
                    "Entrée de stock enregistrée localement avec succès."
                );

                window.location.href =
                    "index.html";

            } catch (error) {
                console.error(
                    "❌ Erreur entrée stock :",
                    error
                );

                alert(
                    "Impossible d'enregistrer l'entrée de stock."
                );
            }
        }
    );
}

/* =========================================================
   SORTIE
   ========================================================= */

async function initialiserPageSortie() {
    const formulaire =
        document.getElementById(
            "sortieForm"
        );

    if (
        !formulaire ||
        formulaire.dataset.stocksReady === "true"
    ) {
        return;
    }

    formulaire.dataset.stocksReady = "true";

    await chargerListeProduits();

    const date =
        document.getElementById("date");

    const select =
        document.getElementById("produit");

    const stockDisponible =
        document.getElementById(
            "stockDisponible"
        );

    const quantite =
        document.getElementById(
            "quantite"
        );

    const prix =
        document.getElementById("prix");

    const type =
        document.getElementById("type");

    const reference =
        document.getElementById(
            "reference"
        );

    const observation =
        document.getElementById(
            "observation"
        );

    if (
        date &&
        !date.value
    ) {
        date.value = dateLocale();
    }

    async function afficherProduit() {
        const produit =
            await lireLocalement(
                STOCKS_TABLE_PRODUITS,
                select?.value
            );

        if (stockDisponible) {
            stockDisponible.value =
                produit
                    ? Number(
                        produit.stock
                    ) || 0
                    : "";
        }

        if (prix) {
            prix.value =
                produit
                    ? Number(
                        produit.prixVente ??
                        produit.prix ??
                        0
                    ) || 0
                    : "";
        }
    }

    select?.addEventListener(
        "change",
        afficherProduit
    );

    await afficherProduit();

    formulaire.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            try {
                const idProduit =
                    select?.value;

                const quantiteSortie =
                    Number(
                        quantite?.value
                    );

                const nature =
                    type?.value?.trim() ||
                    "";

                if (!idProduit) {
                    alert(
                        "Veuillez sélectionner un produit."
                    );
                    return;
                }

                if (
                    !Number.isFinite(
                        quantiteSortie
                    ) ||
                    quantiteSortie <= 0
                ) {
                    alert(
                        "La quantité doit être supérieure à zéro."
                    );
                    return;
                }

                if (!nature) {
                    alert(
                        "Veuillez sélectionner le motif de sortie."
                    );
                    return;
                }

                const produit =
                    await lireLocalement(
                        STOCKS_TABLE_PRODUITS,
                        idProduit
                    );

                if (!produit) {
                    alert(
                        "Produit introuvable dans la base locale."
                    );
                    return;
                }

                const stockActuel =
                    Number(
                        produit.stock
                    ) || 0;

                if (
                    quantiteSortie >
                    stockActuel
                ) {
                    alert(
                        `Stock insuffisant.\n\nDisponible : ${
                            stockActuel
                        } ${
                            produit.unite || ""
                        }`
                    );
                    return;
                }

                produit.stock =
                    stockActuel -
                    quantiteSortie;

                produit.synchronise =
                    false;

                await enregistrerLocalement(
                    STOCKS_TABLE_PRODUITS,
                    produit
                );

                const referenceValeur =
                    reference?.value?.trim() ||
                    crypto.randomUUID();

                const commentaire = [
                    `Sortie : ${nature}`,

                    reference?.value?.trim()
                        ? `Référence : ${reference.value.trim()}`
                        : "",

                    observation?.value?.trim()
                        ? `Observation : ${observation.value.trim()}`
                        : ""
                ]
                    .filter(Boolean)
                    .join(" | ");

                await creerMouvementStock({
                    produit,
                    type: "SORTIE",
                    quantite:
                        -Math.abs(
                            quantiteSortie
                        ),
                    commentaire,
                    referenceTable:
                        "stocks",
                    referenceId:
                        referenceValeur
                });

                alert(
                    "Sortie de stock enregistrée localement avec succès."
                );

                window.location.href =
                    "index.html";

            } catch (error) {
                console.error(
                    "❌ Erreur sortie stock :",
                    error
                );

                alert(
                    "Impossible d'enregistrer la sortie de stock."
                );
            }
        }
    );
}

/* =========================================================
   INVENTAIRE
   ========================================================= */

async function chargerInventaire() {
    const table =
        document.getElementById(
            "inventaireTable"
        );

    if (!table) {
        return;
    }

    const produits =
        await lireProduitsStocks();

    table.innerHTML =
        produits
            .map(produit => {
                const stock =
                    Number(
                        produit.stock
                    ) || 0;

                return `
                    <tr>

                        <td>
                            ${echapperHTML(
                                produit.code ||
                                produit.id
                            )}
                        </td>

                        <td>
                            ${echapperHTML(
                                produit.nom || ""
                            )}
                        </td>

                        <td>
                            ${echapperHTML(
                                produit.categorie || ""
                            )}
                        </td>

                        <td>
                            ${afficherNombre(
                                stock
                            )}
                        </td>

                        <td>
                            <input
                                type="number"
                                class="form-control stock-physique"
                                data-id="${echapperHTML(
                                    produit.id
                                )}"
                                data-stock="${stock}"
                                min="0"
                                step="0.01"
                                value="${stock}"
                            >
                        </td>

                        <td class="ecart text-success">
                            0
                        </td>

                    </tr>
                `;
            })
            .join("");

    document
        .querySelectorAll(
            ".stock-physique"
        )
        .forEach(champ => {
            champ.addEventListener(
                "input",
                calculerEcartsInventaire
            );
        });

    calculerEcartsInventaire();
}

function calculerEcartsInventaire() {
    const champs =
        document.querySelectorAll(
            ".stock-physique"
        );

    let nbProduits = 0;
    let nbEcarts = 0;
    let nbConformes = 0;

    champs.forEach(champ => {
        nbProduits++;

        const systeme =
            Number(
                champ.dataset.stock
            ) || 0;

        const physique =
            Number(
                champ.value
            );

        const ecart =
            Number.isFinite(
                physique
            )
                ? physique - systeme
                : 0;

        const cellule =
            champ
                .closest("tr")
                ?.querySelector(
                    ".ecart"
                );

        if (cellule) {
            cellule.textContent =
                afficherNombre(
                    ecart
                );

            cellule.className =
                `ecart ${
                    ecart === 0
                        ? "text-success"
                        : "text-danger"
                }`;
        }

        if (ecart === 0) {
            nbConformes++;
        } else {
            nbEcarts++;
        }
    });

    const produits =
        document.getElementById(
            "nbProduitsInventaire"
        );

    const ecarts =
        document.getElementById(
            "nbEcarts"
        );

    const conformes =
        document.getElementById(
            "nbConformes"
        );

    if (produits) {
        produits.textContent =
            nbProduits;
    }

    if (ecarts) {
        ecarts.textContent =
            nbEcarts;
    }

    if (conformes) {
        conformes.textContent =
            nbConformes;
    }
}

function initialiserInventaire() {
    const bouton =
        document.getElementById(
            "btnEnregistrerInventaire"
        );

    if (
        !bouton ||
        bouton.dataset.stocksReady === "true"
    ) {
        return;
    }

    bouton.dataset.stocksReady = "true";

    bouton.addEventListener(
        "click",
        enregistrerInventaire
    );
}

async function enregistrerInventaire() {
    const champs =
        document.querySelectorAll(
            ".stock-physique"
        );

    if (!champs.length) {
        alert(
            "Aucun produit à inventorier."
        );

        return;
    }

    let modifications = 0;

    try {
        for (const champ of champs) {
            const idProduit =
                champ.dataset.id;

            const stockPhysique =
                Number(
                    champ.value
                );

            if (
                !Number.isFinite(
                    stockPhysique
                ) ||
                stockPhysique < 0
            ) {
                continue;
            }

            const produit =
                await lireLocalement(
                    STOCKS_TABLE_PRODUITS,
                    idProduit
                );

            if (!produit) {
                continue;
            }

            const stockSysteme =
                Number(
                    produit.stock
                ) || 0;

            const ecart =
                stockPhysique -
                stockSysteme;

            if (ecart === 0) {
                continue;
            }

            produit.stock =
                stockPhysique;

            produit.synchronise =
                false;

            await enregistrerLocalement(
                STOCKS_TABLE_PRODUITS,
                produit
            );

            await creerMouvementStock({
                produit,
                type: "AJUSTEMENT",
                quantite: ecart,
                commentaire:
                    `Ajustement inventaire : ${
                        stockSysteme
                    } → ${
                        stockPhysique
                    }`,
                referenceTable:
                    "inventaires",
                referenceId:
                    crypto.randomUUID()
            });

            modifications++;
        }

        if (!modifications) {
            alert(
                "Aucun écart à enregistrer."
            );

            return;
        }

        alert(
            `${modifications} ajustement(s) d'inventaire enregistré(s) localement.`
        );

        await chargerInventaire();

    } catch (error) {
        console.error(
            "❌ Erreur inventaire :",
            error
        );

        alert(
            "Impossible d'enregistrer l'inventaire."
        );
    }
}

/* =========================================================
   HISTORIQUE
   ========================================================= */

async function chargerHistorique() {
    const table =
        document.getElementById(
            "historiqueMouvements"
        );

    if (!table) {
        return;
    }

    const [
        produits,
        mouvementsTous
    ] = await Promise.all([
        lireProduitsStocks(),
        lireMouvementsStocks()
    ]);

    const filtreDate =
        document.getElementById(
            "filtreDate"
        )?.value || "";

    const filtreProduit =
        document.getElementById(
            "filtreProduit"
        )?.value
            ?.trim()
            .toLowerCase() || "";

    const filtreType =
        document.getElementById(
            "filtreType"
        )?.value || "";

    let mouvements =
        mouvementsTous.filter(
            mouvement => {
                const nomProduit =
                    nomProduitDepuisMouvement(
                        mouvement,
                        produits
                    ).toLowerCase();

                const date =
                    String(
                        mouvement.date ||
                        mouvement.created_at ||
                        ""
                    ).slice(0, 10);

                let typePourFiltre =
                    libelleTypeMouvement(
                        mouvement.type
                    );

                if (
                    typePourFiltre ===
                    "Vente"
                ) {
                    typePourFiltre =
                        "Sortie";
                }

                return (
                    (!filtreDate ||
                        date === filtreDate) &&

                    (!filtreProduit ||
                        nomProduit.includes(
                            filtreProduit
                        )) &&

                    (!filtreType ||
                        typePourFiltre ===
                        filtreType)
                );
            }
        );

    mouvements.sort(
        (a, b) =>
            new Date(
                b.date ||
                b.created_at ||
                0
            ) -
            new Date(
                a.date ||
                a.created_at ||
                0
            )
    );

    let totalEntrees = 0;
    let totalSorties = 0;

    mouvements.forEach(
        mouvement => {
            const q =
                Number(
                    mouvement.quantite
                ) || 0;

            if (q > 0) {
                totalEntrees += q;
            }

            if (q < 0) {
                totalSorties +=
                    Math.abs(q);
            }
        }
    );

    const nb =
        document.getElementById(
            "nbMouvements"
        );

    const entrees =
        document.getElementById(
            "totalEntrees"
        );

    const sorties =
        document.getElementById(
            "totalSorties"
        );

    if (nb) {
        nb.textContent =
            mouvements.length;
    }

    if (entrees) {
        entrees.textContent =
            afficherNombre(
                totalEntrees
            );
    }

    if (sorties) {
        sorties.textContent =
            afficherNombre(
                totalSorties
            );
    }

    if (!mouvements.length) {
        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center text-muted"
                >
                    Aucun mouvement trouvé.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        mouvements
            .map(mouvement => {
                const produit =
                    produits.find(
                        p =>
                            String(p.id) ===
                            String(
                                mouvement.produit_id
                            )
                    );

                const prix =
                    valeurUnitaireProduit(
                        produit
                    );

                const quantite =
                    Math.abs(
                        Number(
                            mouvement.quantite
                        ) || 0
                    );

                const montant =
                    quantite * prix;

                return `
                    <tr>

                        <td>
                            ${echapperHTML(
                                String(
                                    mouvement.date ||
                                    mouvement.created_at ||
                                    ""
                                ).slice(0, 10)
                            )}
                        </td>

                        <td>
                            ${echapperHTML(
                                nomProduitDepuisMouvement(
                                    mouvement,
                                    produits
                                )
                            )}
                        </td>

                        <td>
                            <span
                                class="badge ${
                                    classeTypeMouvement(
                                        mouvement.type
                                    )
                                }"
                            >
                                ${echapperHTML(
                                    libelleTypeMouvement(
                                        mouvement.type
                                    )
                                )}
                            </span>
                        </td>

                        <td>
                            ${echapperHTML(
                                mouvement.commentaire ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${afficherNombre(
                                quantite
                            )}
                        </td>

                        <td>
                            ${afficherNombre(
                                prix
                            )} FC
                        </td>

                        <td>
                            ${afficherNombre(
                                montant
                            )} FC
                        </td>

                        <td>
                            ${echapperHTML(
                                mouvement.utilisateur ||
                                "Administrateur"
                            )}
                        </td>

                    </tr>
                `;
            })
            .join("");
}

function initialiserFiltresHistorique() {
    const date =
        document.getElementById(
            "filtreDate"
        );

    const produit =
        document.getElementById(
            "filtreProduit"
        );

    const type =
        document.getElementById(
            "filtreType"
        );

    if (
        date &&
        date.dataset.stocksReady !== "true"
    ) {
        date.dataset.stocksReady = "true";

        date.addEventListener(
            "change",
            chargerHistorique
        );
    }

    if (
        produit &&
        produit.dataset.stocksReady !== "true"
    ) {
        produit.dataset.stocksReady = "true";

        produit.addEventListener(
            "input",
            chargerHistorique
        );
    }

    if (
        type &&
        type.dataset.stocksReady !== "true"
    ) {
        type.dataset.stocksReady = "true";

        type.addEventListener(
            "change",
            chargerHistorique
        );
    }
}

/* =========================================================
   STATISTIQUES MENSUELLES
   ========================================================= */

async function chargerStatistiquesMensuelles() {
    const elementEntrees =
        document.getElementById(
            "entreesMois"
        );

    const elementSorties =
        document.getElementById(
            "sortiesMois"
        );

    if (
        !elementEntrees &&
        !elementSorties
    ) {
        return;
    }

    const mois =
        dateLocale().slice(0, 7);

    const mouvements =
        await lireMouvementsStocks();

    let entrees = 0;
    let sorties = 0;

    mouvements.forEach(
        mouvement => {
            const date =
                String(
                    mouvement.date ||
                    mouvement.created_at ||
                    ""
                ).slice(0, 7);

            if (date !== mois) {
                return;
            }

            const q =
                Number(
                    mouvement.quantite
                ) || 0;

            if (q > 0) {
                entrees += q;
            }

            if (q < 0) {
                sorties +=
                    Math.abs(q);
            }
        }
    );

    if (elementEntrees) {
        elementEntrees.textContent =
            afficherNombre(
                entrees
            );
    }

    if (elementSorties) {
        elementSorties.textContent =
            afficherNombre(
                sorties
            );
    }
}

/* =========================================================
   COMPATIBILITE ANCIENNES FONCTIONS
   ========================================================= */

async function retirerStockApresVente(vente) {
    if (
        !vente?.produitId ||
        !vente?.quantite
    ) {
        return false;
    }

    const produit =
        await lireLocalement(
            STOCKS_TABLE_PRODUITS,
            String(
                vente.produitId
            )
        );

    if (!produit) {
        return false;
    }

    const quantite =
        Number(
            vente.quantite
        );

    if (
        !Number.isFinite(
            quantite
        ) ||
        quantite <= 0
    ) {
        return false;
    }

    const stock =
        Number(
            produit.stock
        ) || 0;

    if (
        quantite > stock
    ) {
        return false;
    }

    produit.stock =
        stock - quantite;

    produit.synchronise =
        false;

    await enregistrerLocalement(
        STOCKS_TABLE_PRODUITS,
        produit
    );

    await creerMouvementStock({
        produit,
        type: "VENTE",
        quantite:
            -Math.abs(
                quantite
            ),
        commentaire:
            "Sortie automatique suite à une vente.",
        referenceTable:
            "ventes",
        referenceId:
            String(
                vente.id ||
                crypto.randomUUID()
            )
    });

    return true;
}

async function remettreStockApresAnnulation(vente) {
    if (
        !vente?.produitId ||
        !vente?.quantite
    ) {
        return false;
    }

    const produit =
        await lireLocalement(
            STOCKS_TABLE_PRODUITS,
            String(
                vente.produitId
            )
        );

    if (!produit) {
        return false;
    }

    const quantite =
        Number(
            vente.quantite
        );

    if (
        !Number.isFinite(
            quantite
        ) ||
        quantite <= 0
    ) {
        return false;
    }

    produit.stock =
        (Number(
            produit.stock
        ) || 0) +
        quantite;

    produit.synchronise =
        false;

    await enregistrerLocalement(
        STOCKS_TABLE_PRODUITS,
        produit
    );

    await creerMouvementStock({
        produit,
        type: "RETOUR",
        quantite:
            Math.abs(
                quantite
            ),
        commentaire:
            "Retour suite à annulation de vente.",
        referenceTable:
            "ventes_annulation",
        referenceId:
            String(
                vente.id ||
                crypto.randomUUID()
            )
    });

    return true;
}

/* =========================================================
   INITIALISATION
   ========================================================= */

async function initialiserStocksERP() {
    if (!verifierDependancesStocks()) {
        return;
    }

    try {
        if (
            typeof ouvrirBaseLocale ===
            "function"
        ) {
            await ouvrirBaseLocale();
        }

        initialiserRecherche();
        initialiserFiltres();
        initialiserFiltresHistorique();
        initialiserInventaire();

        await Promise.all([
            chargerStocks(),
            chargerListeProduits(),
            chargerInventaire(),
            chargerHistorique(),
            chargerStatistiquesMensuelles(),
            initialiserPageEntree(),
            initialiserPageSortie()
        ]);

        console.log(
            `✓ Ferme Asher ERP - Stocks.js Version ${STOCKS_VERSION} chargé.`
        );

    } catch (error) {
        console.error(
            "❌ Initialisation Stocks impossible :",
            error
        );
    }
}

/* =========================================================
   EXPORTS GLOBAUX
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialiserStocksERP
);

window.chargerStocks =
    chargerStocks;

window.entreeStock =
    entreeStock;

window.sortieStock =
    sortieStock;

window.chargerListeProduits =
    chargerListeProduits;

window.initialiserPageEntree =
    initialiserPageEntree;

window.initialiserPageSortie =
    initialiserPageSortie;

window.chargerInventaire =
    chargerInventaire;

window.calculerEcartsInventaire =
    calculerEcartsInventaire;

window.initialiserInventaire =
    initialiserInventaire;

window.enregistrerInventaire =
    enregistrerInventaire;

window.chargerHistorique =
    chargerHistorique;

window.initialiserFiltresHistorique =
    initialiserFiltresHistorique;

window.chargerStatistiquesMensuelles =
    chargerStatistiquesMensuelles;

window.retirerStockApresVente =
    retirerStockApresVente;

window.remettreStockApresAnnulation =
    remettreStockApresAnnulation;
