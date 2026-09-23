/* =========================================================
   FERME ASHER ERP
   GESTION DES PRODUITS
   VERSION 7.0

   Architecture :
   - Supabase = base centrale
   - IndexedDB = base locale / hors ligne
   - Synchronisation automatique
   - Plus de localStorage pour les produits
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PRODUITS_TABLE = "produits";
const PRODUITS_VERSION = "7.0";

let produitsMemoire = [];
let produitsInitialises = false;
let produitsInitialisationPromise = null;


/* =========================================================
   OUTILS
   ========================================================= */

function produitLog(...args) {
    console.log("[PRODUITS]", ...args);
}


function produitErreur(...args) {
    console.error("[PRODUITS]", ...args);
}


function nombre(valeur) {

    const n = Number(valeur);

    return Number.isFinite(n) ? n : 0;
}


function formatFC(valeur) {

    return nombre(valeur).toLocaleString("fr-FR", {
        maximumFractionDigits: 0
    }) + " FC";
}


function echapperHTML(valeur) {

    if (
        valeur === null ||
        valeur === undefined
    ) {
        return "";
    }

    return String(valeur)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   VERIFIER LES DEPENDANCES
   ========================================================= */

function produitsDependancesDisponibles() {

    const indexedDBDisponible =
        typeof window.lireToutLocalement === "function" &&
        typeof window.enregistrerLocalement === "function";

    const supabaseDisponible =
        !!window.supabaseClient;

    return {
        indexedDB: indexedDBDisponible,
        supabase: supabaseDisponible
    };
}


/* =========================================================
   NORMALISER UN PRODUIT
   ========================================================= */

function normaliserProduit(produit) {

    if (!produit) {
        return null;
    }

    return {

        id:
            String(produit.id || ""),

        nom:
            String(produit.nom || "").trim(),

        categorie:
            produit.categorie || "",

        prix:
            nombre(produit.prix),

        stock:
            nombre(produit.stock),

        minimum:
            nombre(produit.minimum),

        unite:
            produit.unite || "",

        description:
            produit.description || "",

        actif:
            produit.actif !== false,

        created_at:
            produit.created_at ||
            produit.dateCreation ||
            new Date().toISOString(),

        synchronise:
            produit.synchronise !== false

    };
}


/* =========================================================
   PREPARER POUR SUPABASE
   =========================================================

   On envoie uniquement les colonnes métier connues.

   Le champ "synchronise" reste local et ne doit jamais
   être envoyé à Supabase.
   ========================================================= */

function preparerProduitSupabase(produit) {

    if (!produit) {
        return null;
    }

    return {

        id:
            String(produit.id),

        nom:
            String(produit.nom || "").trim(),

        categorie:
            produit.categorie || null,

        prix:
            nombre(produit.prix),

        stock:
            nombre(produit.stock),

        minimum:
            nombre(produit.minimum),

        unite:
            produit.unite || null,

        description:
            produit.description || null,

        actif:
            produit.actif !== false

    };
}


/* =========================================================
   LIRE LES PRODUITS LOCALEMENT
   ========================================================= */

async function lireProduitsLocaux() {

    if (
        typeof window.lireToutLocalement !==
        "function"
    ) {
        produitErreur(
            "IndexedDB indisponible."
        );

        return [];
    }

    try {

        const produits =
            await window.lireToutLocalement(
                PRODUITS_TABLE
            );

        if (!Array.isArray(produits)) {
            return [];
        }

        return produits
            .map(normaliserProduit)
            .filter(function (produit) {

                return (
                    produit &&
                    produit.id
                );

            });

    } catch (error) {

        produitErreur(
            "Erreur lecture IndexedDB :",
            error
        );

        return [];
    }
}


/* =========================================================
   ENREGISTRER UN PRODUIT LOCALEMENT
   ========================================================= */

async function enregistrerProduitLocal(produit) {

    if (
        typeof window.enregistrerLocalement !==
        "function"
    ) {
        throw new Error(
            "IndexedDB indisponible."
        );
    }

    const produitNormalise =
        normaliserProduit(produit);

    return await window.enregistrerLocalement(
        PRODUITS_TABLE,
        produitNormalise
    );
}


/* =========================================================
   CHARGER LES PRODUITS DEPUIS SUPABASE
   ========================================================= */

async function chargerProduitsSupabase() {

    if (!window.supabaseClient) {

        produitLog(
            "Supabase indisponible."
        );

        return [];

    }

    if (!navigator.onLine) {

        produitLog(
            "Hors ligne : utilisation des données locales."
        );

        return [];

    }

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(PRODUITS_TABLE)
                .select("*")
                .order("nom", {
                    ascending: true
                });

        if (error) {

            produitErreur(
                "Erreur Supabase produits :",
                error
            );

            return [];

        }

        if (!Array.isArray(data)) {
            return [];
        }


        const produits =
            data
                .map(function (produit) {

                    return normaliserProduit({

                        ...produit,

                        synchronise: true

                    });

                })
                .filter(function (produit) {

                    return (
                        produit &&
                        produit.id
                    );

                });


        /*
         * Mise en cache IndexedDB
         */

        for (
            const produit
            of produits
        ) {

            await enregistrerProduitLocal(
                produit
            );

        }


        produitLog(
            "Produits chargés depuis Supabase :",
            produits.length
        );


        return produits;

    } catch (error) {

        produitErreur(
            "Erreur accès Supabase :",
            error
        );

        return [];
    }
}


/* =========================================================
   SYNCHRONISER LES PRODUITS LOCAUX NON SYNCHRONISES
   ========================================================= */

async function synchroniserProduitsLocaux() {

    if (
        !navigator.onLine ||
        !window.supabaseClient
    ) {
        return;
    }

    try {

        const produitsLocaux =
            await lireProduitsLocaux();


        const produitsNonSynchronises =
            produitsLocaux.filter(
                function (produit) {

                    return (
                        produit.synchronise === false
                    );

                }
            );


        if (
            produitsNonSynchronises.length === 0
        ) {

            return;

        }


        produitLog(
            "Synchronisation de",
            produitsNonSynchronises.length,
            "produit(s)..."
        );


        for (
            const produit
            of produitsNonSynchronises
        ) {

            const donnees =
                preparerProduitSupabase(
                    produit
                );


            if (!donnees) {
                continue;
            }


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(PRODUITS_TABLE)
                    .upsert(
                        donnees,
                        {
                            onConflict: "id"
                        }
                    )
                    .select()
                    .single();


            if (error) {

                produitErreur(
                    "Erreur synchronisation produit :",
                    produit.id,
                    error
                );

                continue;

            }


            await enregistrerProduitLocal({

                ...data,

                synchronise: true

            });


            produitLog(
                "✓ Produit synchronisé :",
                produit.id
            );

        }


        produitsMemoire =
            await lireProduitsLocaux();

    } catch (error) {

        produitErreur(
            "Erreur synchronisation produits :",
            error
        );

    }
}


/* =========================================================
   CHARGER TOUS LES PRODUITS
   ========================================================= */

async function obtenirProduits(
    forcerSupabase = false
) {

    /*
     * Lire d'abord IndexedDB.
     */

    let produitsLocaux =
        await lireProduitsLocaux();


    /*
     * Si certains produits locaux ne sont pas encore
     * synchronisés, on ne les écrase pas avec Supabase.
     */

    const modificationsLocales =
        produitsLocaux.some(
            function (produit) {

                return (
                    produit.synchronise === false
                );

            }
        );


    /*
     * Charger Supabase lorsque :
     *
     * 1. on demande explicitement le distant
     * 2. ou aucune donnée locale n'existe
     * 3. et qu'il n'y a pas de modification locale
     */

    if (
        navigator.onLine &&
        window.supabaseClient &&
        !modificationsLocales &&
        (
            forcerSupabase ||
            produitsLocaux.length === 0
        )
    ) {

        const produitsDistant =
            await chargerProduitsSupabase();


        if (
            produitsDistant.length > 0
        ) {

            produitsLocaux =
                produitsDistant;

        }

    }


    produitsMemoire =
        produitsLocaux;


    return produitsMemoire;
}


/* =========================================================
   TROUVER UN PRODUIT
   ========================================================= */

async function trouverProduit(id) {

    const produits =
        await obtenirProduits();


    return produits.find(
        function (produit) {

            return (
                String(produit.id) ===
                String(id)
            );

        }
    ) || null;
}


/* =========================================================
   GENERER UN ID PRODUIT
   ========================================================= */

function genererIdProduit(
    produits = produitsMemoire
) {

    let numeroMaximum = 0;


    produits.forEach(
        function (produit) {

            if (!produit.id) {
                return;
            }


            const numero =
                parseInt(
                    String(produit.id)
                        .replace("PROD", ""),
                    10
                );


            if (
                !Number.isNaN(numero) &&
                numero > numeroMaximum
            ) {

                numeroMaximum =
                    numero;

            }

        }
    );


    return (
        "PROD" +
        String(numeroMaximum + 1)
            .padStart(4, "0")
    );
}


/* =========================================================
   ENREGISTRER UN NOUVEAU PRODUIT
   ========================================================= */

async function ajouterProduit(event) {

    if (event) {
        event.preventDefault();
    }


    const champNom =
        document.getElementById("nom");

    const champCategorie =
        document.getElementById("categorie");

    const champPrix =
        document.getElementById("prix");

    const champStock =
        document.getElementById("stock");

    const champMinimum =
        document.getElementById("minimum");

    const champUnite =
        document.getElementById("unite");

    const champDescription =
        document.getElementById("description");


    if (
        !champNom ||
        !champCategorie ||
        !champPrix ||
        !champStock ||
        !champMinimum ||
        !champUnite ||
        !champDescription
    ) {

        alert(
            "Erreur : certains champs du formulaire sont introuvables."
        );

        return;

    }


    const nom =
        champNom.value.trim();

    const categorie =
        champCategorie.value;

    const prix =
        Number(champPrix.value);

    const stock =
        Number(champStock.value);

    const minimum =
        Number(champMinimum.value);

    const unite =
        champUnite.value;

    const description =
        champDescription.value.trim();


    if (!nom) {

        alert(
            "Veuillez entrer le nom du produit."
        );

        champNom.focus();

        return;
    }


    if (
        !Number.isFinite(prix) ||
        prix < 0
    ) {

        alert(
            "Le prix unitaire est invalide."
        );

        champPrix.focus();

        return;
    }


    if (
        !Number.isFinite(stock) ||
        stock < 0
    ) {

        alert(
            "Le stock initial est invalide."
        );

        champStock.focus();

        return;
    }


    if (
        !Number.isFinite(minimum) ||
        minimum < 0
    ) {

        alert(
            "Le stock minimum est invalide."
        );

        champMinimum.focus();

        return;
    }


    /*
     * Toujours récupérer la version la plus récente
     * avant de générer le nouvel ID.
     */

    const produits =
        await obtenirProduits(true);


    /*
     * Vérifier les doublons.
     */

    const produitExiste =
        produits.some(
            function (produit) {

                return (
                    produit.actif !== false &&
                    String(produit.nom || "")
                        .trim()
                        .toLowerCase() ===
                    nom.toLowerCase()
                );

            }
        );


    if (produitExiste) {

        alert(
            "Ce produit existe déjà."
        );

        return;
    }


    /*
     * Créer le produit.
     */

    const nouveauProduit = {

        id:
            genererIdProduit(produits),

        nom:
            nom,

        categorie:
            categorie,

        prix:
            prix,

        stock:
            stock,

        minimum:
            minimum,

        unite:
            unite,

        description:
            description,

        actif:
            true,

        created_at:
            new Date().toISOString(),

        synchronise:
            false

    };


    /*
     * EN LIGNE
     * → envoyer directement à Supabase.
     */

    if (
        navigator.onLine &&
        window.supabaseClient
    ) {

        try {

            const donnees =
                preparerProduitSupabase(
                    nouveauProduit
                );


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(PRODUITS_TABLE)
                    .insert(donnees)
                    .select()
                    .single();


            if (error) {

                produitErreur(
                    "Erreur création Supabase :",
                    error
                );

                /*
                 * On garde quand même le produit
                 * localement pour éviter la perte de données.
                 */

                await enregistrerProduitLocal(
                    nouveauProduit
                );


                alert(
                    "Le produit a été enregistré localement, mais Supabase a refusé l'enregistrement.\n\nConsulte la console du navigateur pour le détail."
                );

                return;
            }


            await enregistrerProduitLocal({

                ...data,

                synchronise: true

            });


            alert(
                "Produit enregistré avec succès."
            );


            window.location.href =
                "index.html";


            return;

        } catch (error) {

            produitErreur(
                "Erreur ajout produit :",
                error
            );

        }

    }


    /*
     * HORS LIGNE
     * → IndexedDB.
     */

    await enregistrerProduitLocal(
        nouveauProduit
    );


    alert(
        "Produit enregistré hors ligne.\n\nIl sera synchronisé automatiquement lorsque la connexion Internet sera disponible."
    );


    window.location.href =
        "index.html";
}


/* =========================================================
   AFFICHER LA LISTE
   ========================================================= */

async function chargerProduits() {

    const table =
        document.getElementById(
            "tableProduits"
        );


    if (!table) {
        return;
    }


    /*
     * Sur la page principale, on demande une actualisation
     * depuis Supabase si Internet est disponible.
     */

    const produits =
        await obtenirProduits(true);


    const rechercheElement =
        document.getElementById(
            "recherche"
        );


    const recherche =
        rechercheElement
            ? rechercheElement.value
                .trim()
                .toLowerCase()
            : "";


    const categorieElement =
        document.getElementById(
            "filtreCategorie"
        );


    const categorie =
        categorieElement
            ? categorieElement.value
            : "";


    const produitsActifs =
        produits.filter(
            function (produit) {

                return (
                    produit.actif !== false
                );

            }
        );


    const produitsFiltres =
        produitsActifs.filter(
            function (produit) {

                const nom =
                    String(
                        produit.nom || ""
                    ).toLowerCase();


                const id =
                    String(
                        produit.id || ""
                    ).toLowerCase();


                const correspondRecherche =
                    nom.includes(recherche) ||
                    id.includes(recherche);


                const correspondCategorie =
                    !categorie ||
                    produit.categorie ===
                    categorie;


                return (
                    correspondRecherche &&
                    correspondCategorie
                );

            }
        );


    table.innerHTML = "";


    if (
        produitsFiltres.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    Aucun produit trouvé.

                </td>

            </tr>

        `;


        mettreAJourNombreProduits(
            0
        );

        return;
    }


    produitsFiltres.forEach(
        function (produit) {

            const stock =
                nombre(produit.stock);

            const minimum =
                nombre(produit.minimum);


            let statutStock;


            if (stock <= 0) {

                statutStock = `

                    <span class="badge bg-danger">

                        Rupture

                    </span>

                `;

            }

            else if (
                stock <= minimum
            ) {

                statutStock = `

                    <span
                        class="badge bg-warning text-dark">

                        Stock faible

                    </span>

                `;

            }

            else {

                statutStock = `

                    <span class="badge bg-success">

                        Disponible

                    </span>

                `;

            }


            table.innerHTML += `

                <tr>

                    <td>
                        ${echapperHTML(produit.id)}
                    </td>

                    <td>
                        ${echapperHTML(produit.nom)}
                    </td>

                    <td>
                        ${echapperHTML(produit.categorie)}
                    </td>

                    <td>
                        ${stock}
                    </td>

                    <td>
                        ${minimum}
                    </td>

                    <td>
                        ${echapperHTML(produit.unite)}
                    </td>

                    <td>
                        ${formatFC(produit.prix)}
                    </td>

                    <td>
                        ${statutStock}
                    </td>

                    <td>

                        <a
                            href="detail.html?id=${encodeURIComponent(produit.id)}"
                            class="btn btn-sm btn-info">

                            <i
                                class="fa-solid fa-eye">
                            </i>

                        </a>


                        <a
                            href="modifier.html?id=${encodeURIComponent(produit.id)}"
                            class="btn btn-sm btn-warning">

                            <i
                                class="fa-solid fa-pen">
                            </i>

                        </a>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="supprimerProduit('${String(produit.id).replace(/'/g, "\\'")}')">

                            <i
                                class="fa-solid fa-trash">
                            </i>

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    mettreAJourNombreProduits(
        produitsFiltres.length
    );
}


/* =========================================================
   NOMBRE DE PRODUITS
   ========================================================= */

function mettreAJourNombreProduits(
    nombreProduits
) {

    const element =
        document.getElementById(
            "nombreProduits"
        );


    if (element) {

        element.textContent =
            nombreProduits;

    }
}


/* =========================================================
   SUPPRIMER UN PRODUIT
   =========================================================

   IMPORTANT :
   On ne supprime PAS physiquement la ligne Supabase.

   On passe actif = false.

   Cela protège l'historique des ventes et des mouvements.
   ========================================================= */

async function supprimerProduit(id) {

    const produit =
        await trouverProduit(id);


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return;
    }


    const confirmation =
        confirm(
            `Voulez-vous vraiment désactiver "${produit.nom}" ?\n\nLe produit ne sera plus affiché dans la liste active.`
        );


    if (!confirmation) {
        return;
    }


    const produitDesactive = {

        ...produit,

        actif:
            false,

        synchronise:
            false

    };


    /*
     * EN LIGNE
     */

    if (
        navigator.onLine &&
        window.supabaseClient
    ) {

        try {

            const donnees =
                preparerProduitSupabase(
                    produitDesactive
                );


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(PRODUITS_TABLE)
                    .update(donnees)
                    .eq(
                        "id",
                        id
                    )
                    .select()
                    .single();


            if (error) {

                produitErreur(
                    "Erreur désactivation Supabase :",
                    error
                );

                await enregistrerProduitLocal(
                    produitDesactive
                );

                alert(
                    "Le produit a été désactivé localement, mais la synchronisation Supabase a échoué."
                );

                await chargerProduits();

                return;
            }


            await enregistrerProduitLocal({

                ...data,

                synchronise:
                    true

            });


            alert(
                "Produit désactivé avec succès."
            );


            await chargerProduits();

            return;

        } catch (error) {

            produitErreur(
                "Erreur suppression :",
                error
            );

        }

    }


    /*
     * HORS LIGNE
     */

    await enregistrerProduitLocal(
        produitDesactive
    );


    alert(
        "Produit désactivé hors ligne.\n\nLa modification sera synchronisée automatiquement à la reconnexion."
    );


    await chargerProduits();
}


/* =========================================================
   CHARGER PRODUIT POUR MODIFICATION
   ========================================================= */

async function chargerProduitModification() {

    const form =
        document.getElementById(
            "modifierProduitForm"
        );


    if (!form) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        alert(
            "Aucun produit sélectionné."
        );

        window.location.href =
            "index.html";

        return;
    }


    const produit =
        await trouverProduit(id);


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        window.location.href =
            "index.html";

        return;
    }


    const champId =
        document.getElementById(
            "idProduit"
        );

    const champNom =
        document.getElementById(
            "nom"
        );

    const champCategorie =
        document.getElementById(
            "categorie"
        );

    const champPrix =
        document.getElementById(
            "prix"
        );

    const champStock =
        document.getElementById(
            "stock"
        );

    const champMinimum =
        document.getElementById(
            "minimum"
        );

    const champUnite =
        document.getElementById(
            "unite"
        );

    const champDescription =
        document.getElementById(
            "description"
        );


    if (champId) {
        champId.value = produit.id;
    }

    if (champNom) {
        champNom.value = produit.nom;
    }

    if (champCategorie) {
        champCategorie.value =
            produit.categorie;
    }

    if (champPrix) {
        champPrix.value =
            produit.prix;
    }

    if (champStock) {
        champStock.value =
            produit.stock;
    }

    if (champMinimum) {
        champMinimum.value =
            produit.minimum;
    }

    if (champUnite) {
        champUnite.value =
            produit.unite;
    }

    if (champDescription) {
        champDescription.value =
            produit.description || "";
    }
}


/* =========================================================
   MODIFIER UN PRODUIT
   ========================================================= */

async function modifierProduit(event) {

    if (event) {
        event.preventDefault();
    }


    const champId =
        document.getElementById(
            "idProduit"
        );


    if (!champId) {

        alert(
            "ID produit introuvable."
        );

        return;
    }


    const id =
        champId.value;


    const produit =
        await trouverProduit(id);


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return;
    }


    const champNom =
        document.getElementById(
            "nom"
        );

    const champCategorie =
        document.getElementById(
            "categorie"
        );

    const champPrix =
        document.getElementById(
            "prix"
        );

    const champStock =
        document.getElementById(
            "stock"
        );

    const champMinimum =
        document.getElementById(
            "minimum"
        );

    const champUnite =
        document.getElementById(
            "unite"
        );

    const champDescription =
        document.getElementById(
            "description"
        );


    const nom =
        champNom
            ? champNom.value.trim()
            : "";


    const categorie =
        champCategorie
            ? champCategorie.value
            : "";


    const prix =
        champPrix
            ? Number(champPrix.value)
            : 0;


    const stock =
        champStock
            ? Number(champStock.value)
            : 0;


    const minimum =
        champMinimum
            ? Number(champMinimum.value)
            : 0;


    const unite =
        champUnite
            ? champUnite.value
            : "";


    const description =
        champDescription
            ? champDescription.value.trim()
            : "";


    if (!nom) {

        alert(
            "Le nom du produit est obligatoire."
        );

        if (champNom) {
            champNom.focus();
        }

        return;
    }


    if (
        !Number.isFinite(prix) ||
        prix < 0
    ) {

        alert(
            "Le prix est invalide."
        );

        return;
    }


    if (
        !Number.isFinite(stock) ||
        stock < 0
    ) {

        alert(
            "Le stock est invalide."
        );

        return;
    }


    if (
        !Number.isFinite(minimum) ||
        minimum < 0
    ) {

        alert(
            "Le stock minimum est invalide."
        );

        return;
    }


    /*
     * Vérifier les doublons de nom.
     */

    const produits =
        await obtenirProduits(true);


    const doublon =
        produits.some(
            function (autreProduit) {

                return (
                    String(autreProduit.id) !==
                    String(id) &&

                    autreProduit.actif !== false &&

                    String(
                        autreProduit.nom || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    nom.toLowerCase()
                );

            }
        );


    if (doublon) {

        alert(
            "Un autre produit porte déjà ce nom."
        );

        return;
    }


    const produitModifie = {

        ...produit,

        nom:
            nom,

        categorie:
            categorie,

        prix:
            prix,

        stock:
            stock,

        minimum:
            minimum,

        unite:
            unite,

        description:
            description,

        actif:
            produit.actif !== false,

        synchronise:
            false

    };


    /*
     * EN LIGNE
     */

    if (
        navigator.onLine &&
        window.supabaseClient
    ) {

        try {

            const donnees =
                preparerProduitSupabase(
                    produitModifie
                );


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(PRODUITS_TABLE)
                    .update(donnees)
                    .eq(
                        "id",
                        id
                    )
                    .select()
                    .single();


            if (error) {

                produitErreur(
                    "Erreur modification Supabase :",
                    error
                );

                /*
                 * Conserver localement.
                 */

                await enregistrerProduitLocal(
                    produitModifie
                );


                alert(
                    "Modification enregistrée localement.\n\nLa synchronisation sera faite automatiquement."
                );


                window.location.href =
                    "index.html";

                return;
            }


            await enregistrerProduitLocal({

                ...data,

                synchronise:
                    true

            });


            alert(
                "Produit modifié avec succès."
            );


            window.location.href =
                "index.html";


            return;

        } catch (error) {

            produitErreur(
                "Erreur modification :",
                error
            );

        }

    }


    /*
     * HORS LIGNE
     */

    await enregistrerProduitLocal(
        produitModifie
    );


    alert(
        "Produit modifié hors ligne.\n\nLa modification sera synchronisée automatiquement à la reconnexion."
    );


    window.location.href =
        "index.html";
}


/* =========================================================
   DETAIL PRODUIT
   ========================================================= */

async function chargerDetailProduit() {

    const contenu =
        document.getElementById(
            "detailProduit"
        );


    if (!contenu) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        contenu.innerHTML = `

            <div class="alert alert-danger">

                Aucun produit sélectionné.

            </div>

        `;

        return;
    }


    const produit =
        await trouverProduit(id);


    if (!produit) {

        contenu.innerHTML = `

            <div class="alert alert-danger">

                Produit introuvable.

            </div>

        `;

        return;
    }


    contenu.innerHTML = `

        <div class="row g-3">

            <div class="col-md-6">

                <strong>ID :</strong>

                ${echapperHTML(produit.id)}

            </div>


            <div class="col-md-6">

                <strong>Nom :</strong>

                ${echapperHTML(produit.nom)}

            </div>


            <div class="col-md-6">

                <strong>Catégorie :</strong>

                ${echapperHTML(produit.categorie)}

            </div>


            <div class="col-md-6">

                <strong>Prix :</strong>

                ${formatFC(produit.prix)}

            </div>


            <div class="col-md-6">

                <strong>Stock :</strong>

                ${nombre(produit.stock)}
                ${echapperHTML(produit.unite)}

            </div>


            <div class="col-md-6">

                <strong>Stock minimum :</strong>

                ${nombre(produit.minimum)}
                ${echapperHTML(produit.unite)}

            </div>


            <div class="col-12">

                <strong>État :</strong>

                ${
                    produit.actif === false
                        ? "Désactivé"
                        : "Actif"
                }

            </div>


            <div class="col-12">

                <strong>Description :</strong>

                <p>

                    ${
                        echapperHTML(
                            produit.description ||
                            "Aucune description."
                        )
                    }

                </p>

            </div>

        </div>

    `;
}


/* =========================================================
   DIMINUER LE STOCK
   =========================================================

   Cette fonction est conservée pour compatibilité avec
   l'ancien ERP.

   La gestion définitive des sorties de stock devra passer
   par mouvements_stock.
   ========================================================= */

async function diminuerStockProduit(
    idProduit,
    quantiteVendue
) {

    const produit =
        await trouverProduit(
            idProduit
        );


    if (!produit) {

        return {

            succes:
                false,

            message:
                "Produit introuvable."

        };

    }


    const quantite =
        Number(
            quantiteVendue
        );


    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        return {

            succes:
                false,

            message:
                "Quantité invalide."

        };

    }


    const stockActuel =
        nombre(produit.stock);


    if (
        stockActuel <
        quantite
    ) {

        return {

            succes:
                false,

            message:
                "Stock insuffisant. Stock disponible : " +
                stockActuel +
                " " +
                produit.unite

        };

    }


    produit.stock =
        stockActuel -
        quantite;

    produit.synchronise =
        false;


    await enregistrerProduitLocal(
        produit
    );


    /*
     * Si Internet est disponible,
     * synchroniser immédiatement.
     */

    if (
        navigator.onLine &&
        window.supabaseClient
    ) {

        await synchroniserProduitsLocaux();

    }


    return {

        succes:
            true,

        produit:
            produit

    };
}


/* =========================================================
   INITIALISATION
   ========================================================= */

async function initialiserProduitsERP() {

    if (produitsInitialises) {
        return;
    }


    if (
        produitsInitialisationPromise
    ) {

        return produitsInitialisationPromise;

    }


    produitsInitialisationPromise =
        (async function () {

            try {

                /*
                 * Ouvrir IndexedDB.
                 */

                if (
                    typeof window.ouvrirBaseLocale ===
                    "function"
                ) {

                    await window.ouvrirBaseLocale();

                }


                /*
                 * Synchroniser les modifications
                 * locales avant de charger l'interface.
                 */

                await synchroniserProduitsLocaux();


                /*
                 * Charger les données.
                 */

                await obtenirProduits(
                    true
                );


                produitsInitialises =
                    true;


                produitLog(
                    "✓ Gestion des produits initialisée."
                );


            } catch (error) {

                produitErreur(
                    "Erreur initialisation produits :",
                    error
                );

            }

        })();


    return produitsInitialisationPromise;
}


/* =========================================================
   RECONNEXION INTERNET
   ========================================================= */

window.addEventListener(
    "online",
    async function () {

        produitLog(
            "Connexion Internet détectée."
        );


        await synchroniserProduitsLocaux();


        if (
            document.getElementById(
                "tableProduits"
            )
        ) {

            await chargerProduits();

        }

    }
);


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await initialiserProduitsERP();


        /*
         * Page principale
         */

        if (
            document.getElementById(
                "tableProduits"
            )
        ) {

            await chargerProduits();

        }


        /*
         * Page nouveau produit
         */

        /*
         * Pas de chargement spécifique.
         * ajouterProduit() s'occupe du formulaire.
         */


        /*
         * Page modification
         */

        if (
            document.getElementById(
                "modifierProduitForm"
            )
        ) {

            await chargerProduitModification();

        }


        /*
         * Page détail
         */

        if (
            document.getElementById(
                "detailProduit"
            )
        ) {

            await chargerDetailProduit();

        }

    }
);
