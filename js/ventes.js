"use strict";

const TABLE_VENTES = "ventes";
const TABLE_PRODUITS = "produits";

function ventesSupabaseDisponible() {
    if (!window.supabaseClient) {
        console.error("Supabase n'est pas disponible.");
        return false;
    }
    return true;
}

function obtenirDateVente() {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
    const jour = String(maintenant.getDate()).padStart(2, "0");

    return annee + "-" + mois + "-" + jour;
}

function formatMonnaie(montant) {
    return (Number(montant) || 0).toLocaleString("fr-FR") + " FC";
}

async function obtenirProduitsVente() {
    try {
        const produitsLocaux =
            await lireToutLocalement("produits");

        const produitsActifs =
            produitsLocaux
                .filter(function (produit) {
                    return produit.actif !== false;
                })
                .sort(function (a, b) {
                    return String(a.nom || "").localeCompare(
                        String(b.nom || ""),
                        "fr"
                    );
                });

        if (produitsActifs.length > 0) {
            console.log(
                "✓ Produits chargés depuis IndexedDB :",
                produitsActifs.length
            );
            return produitsActifs;
        }
    } catch (error) {
        console.warn(
            "Lecture IndexedDB produits impossible :",
            error
        );
    }

    if (!window.supabaseClient) {
        console.warn(
            "Supabase indisponible et aucun produit local."
        );
        return [];
    }

    try {
        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(TABLE_PRODUITS)
                .select("*")
                .eq("actif", true)
                .order("nom", {
                    ascending: true
                });

        if (error) {
            console.error(
                "Erreur chargement produits Supabase :",
                error
            );
            return [];
        }

        if (!data || data.length === 0) {
            console.warn(
                "Aucun produit trouvé dans Supabase."
            );
            return [];
        }

        for (const produit of data) {
            await enregistrerLocalement(
                "produits",
                {
                    ...produit,
                    synchronise: true
                }
            );
        }

        console.log(
            "✓ Produits Supabase enregistrés dans IndexedDB :",
            data.length
        );

        return data;

    } catch (error) {
        console.error(
            "Erreur accès Supabase produits :",
            error
        );
        return [];
    }
}

async function obtenirVentes() {
    try {
        const ventesLocales =
            await lireToutLocalement("ventes");

        if (
            ventesLocales &&
            ventesLocales.length > 0
        ) {
            ventesLocales.sort(
                function (a, b) {
                    const dateA =
                        new Date(
                            a.created_at ||
                            a.date ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.created_at ||
                            b.date ||
                            0
                        ).getTime();

                    return dateB - dateA;
                }
            );

            console.log(
                "✓ Ventes chargées depuis IndexedDB :",
                ventesLocales.length
            );

            return ventesLocales;
        }

    } catch (error) {
        console.warn(
            "Lecture IndexedDB ventes impossible :",
            error
        );
    }

    if (!window.supabaseClient) {
        console.warn(
            "Supabase indisponible et aucune vente locale."
        );
        return [];
    }

    try {
        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(TABLE_VENTES)
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            console.error(
                "Erreur chargement ventes Supabase :",
                error
            );
            return [];
        }

        const ventes = data || [];

        for (const vente of ventes) {
            await enregistrerLocalement(
                "ventes",
                {
                    ...vente,
                    id: String(vente.id),
                    synchronise: true
                }
            );
        }

        console.log(
            "✓ Ventes Supabase enregistrées dans IndexedDB :",
            ventes.length
        );

        return ventes;

    } catch (error) {
        console.error(
            "Erreur accès Supabase ventes :",
            error
        );
        return [];
    }
}

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "FERME ASHER ERP - VENTES VERSION 4.0"
        );

        console.log(
            "Initialisation du module Ventes..."
        );

        if (window.supabaseClient) {
            console.log(
                "✓ Supabase disponible."
            );
        } else {
            console.warn(
                "⚠ Supabase indisponible : fonctionnement hors ligne."
            );
        }

        await chargerProduitsVente();

        initialiserFormulaireVente();

        await chargerVentes();

        initialiserRechercheVentes();

        initialiserFiltreDate();

        initialiserTempsReelVentes();

        console.log(
            "Module Ventes prêt."
        );
    }
);

async function chargerProduitsVente() {

    const select =
        document.getElementById(
            "produit"
        );

    if (!select) {
        return;
    }

    const produits =
        await obtenirProduitsVente();

    select.innerHTML = `
        <option value="">
            Sélectionner un produit
        </option>
    `;

    if (produits.length === 0) {
        select.innerHTML += `
            <option value="" disabled>
                Aucun produit disponible
            </option>
        `;
        return;
    }

    produits.forEach(
        function (produit) {

            const stock =
                Number(
                    produit.stock
                ) || 0;

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                produit.id;

            option.textContent =
                `${produit.nom} — Stock : ${stock} ${produit.unite || ""}`;

            option.dataset.prix =
                Number(
                    produit.prix
                ) || 0;

            option.dataset.stock =
                stock;

            option.dataset.unite =
                produit.unite || "";

            select.appendChild(
                option
            );
        }
    );
}

function initialiserFormulaireVente() {

    const formulaire =
        document.getElementById(
            "venteForm"
        );

    if (!formulaire) {
        return;
    }

    const client =
        document.getElementById(
            "client"
        );

    const telephone =
        document.getElementById(
            "telephone"
        );

    const produit =
        document.getElementById(
            "produit"
        );

    const quantite =
        document.getElementById(
            "quantite"
        );

    const prix =
        document.getElementById(
            "prix"
        );

    const remise =
        document.getElementById(
            "remise"
        );

    const paiement =
        document.getElementById(
            "paiement"
        );

    const date =
        document.getElementById(
            "date"
        );

    const total =
        document.getElementById(
            "total"
        );

    if (
        date &&
        !date.value
    ) {
        date.value =
            obtenirDateVente();
    }

    function calculerTotal() {

        const qte =
            Number(
                quantite.value
            ) || 0;

        const prixUnitaire =
            Number(
                prix.value
            ) || 0;

        const montantRemise =
            Number(
                remise.value
            ) || 0;

        let montant =
            qte *
            prixUnitaire;

        montant -=
            montantRemise;

        if (montant < 0) {
            montant = 0;
        }

        if (total) {
            total.textContent =
                formatMonnaie(
                    montant
                );
        }

        return montant;
    }

    if (produit) {
        produit.addEventListener(
            "change",
            function () {

                const option =
                    produit.options[
                        produit.selectedIndex
                    ];

                if (!option.value) {
                    prix.value = "";
                    calculerTotal();
                    return;
                }

                prix.value =
                    option.dataset.prix || 0;

                calculerTotal();
            }
        );
    }

    if (quantite) {
        quantite.addEventListener(
            "input",
            calculerTotal
        );
    }

    if (prix) {
        prix.addEventListener(
            "input",
            calculerTotal
        );
    }

    if (remise) {
        remise.addEventListener(
            "input",
            calculerTotal
        );
    }

    formulaire.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await enregistrerVenteSupabase({

                client:
                    client
                        ? client.value.trim()
                        : "",

                telephone:
                    telephone
                        ? telephone.value.trim()
                        : "",

                idProduit:
                    produit
                        ? produit.value
                        : "",

                quantite:
                    quantite
                        ? Number(
                            quantite.value
                        )
                        : 0,

                prix:
                    prix
                        ? Number(
                            prix.value
                        )
                        : 0,

                remise:
                    remise
                        ? Number(
                            remise.value
                        ) || 0
                        : 0,

                paiement:
                    paiement
                        ? paiement.value
                        : "",

                date:
                    date && date.value
                        ? date.value
                        : obtenirDateVente()
            });
        }
    );
}

async function enregistrerVenteSupabase(
    informations
) {

    const {
        client,
        telephone,
        idProduit,
        quantite,
        prix,
        remise,
        paiement,
        date
    } = informations;


    /* =========================================
       VALIDATION PRODUIT
    ========================================= */

    if (!idProduit) {

        alert(
            "Veuillez sélectionner un produit."
        );

        return;
    }


    /* =========================================
       VALIDATION QUANTITÉ
    ========================================= */

    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;
    }


    /* =========================================
       VALIDATION PRIX
    ========================================= */

    if (
        !Number.isFinite(prix) ||
        prix < 0
    ) {

        alert(
            "Le prix est invalide."
        );

        return;
    }


    /* =========================================
       RECHERCHER LE PRODUIT LOCALEMENT
    ========================================= */

    let produit = null;


   try {

    const produitsLocaux =
        await lireToutLocalement("produits");

    produit =
        produitsLocaux.find(
            element =>
                String(element.id) ===
                String(idProduit)
        ) || null;

    if (produit) {

        console.log(
            "✓ Produit trouvé localement :",
            produit
        );

    }

} catch (error) {

    console.error(
        "Erreur lecture produits locaux :",
        error
    );
}


    /* =========================================
       SI PAS DE PRODUIT LOCAL,
       ESSAYER SUPABASE
    ========================================= */

    if (
        !produit &&
        navigator.onLine &&
        window.supabaseClient
    ) {

        try {

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(TABLE_PRODUITS)
                    .select("*")
                    .eq("id", idProduit)
                    .single();


            if (!error) {

                produit = data;

            }

        } catch (error) {

            console.error(
                "Erreur recherche produit Supabase :",
                error
            );

        }

    }


    /* =========================================
       PRODUIT INTROUVABLE
    ========================================= */

    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return;
    }


    /* =========================================
       VÉRIFIER LE STOCK LOCAL
    ========================================= */

    const stockDisponible =
        Number(
            produit.stock
        ) || 0;


    if (
        quantite >
        stockDisponible
    ) {

        alert(
            "Stock insuffisant.\n\n" +

            "Produit : " +
            produit.nom +

            "\nStock disponible : " +
            stockDisponible +

            " " +
            (
                produit.unite ||
                ""
            )
        );

        return;
    }


    /* =========================================
       CALCUL TOTAL
    ========================================= */

    let totalCalcule =
        quantite *
        prix;


    totalCalcule -=
        remise;


    if (totalCalcule < 0) {

        totalCalcule = 0;

    }


    /* =========================================
       UTILISATEUR
    ========================================= */

    let utilisateurNom =
        null;


    if (
        typeof obtenirUtilisateurERP ===
        "function"
    ) {

        const utilisateur =
            obtenirUtilisateurERP();


        if (utilisateur) {

            utilisateurNom =
                utilisateur.nom;

        }

    }


    /* =========================================
       ID UNIQUE DE LA VENTE
    ========================================= */

    const idVente =
        "VENTE-" +
        new Date()
            .toISOString()
            .replace(
                /[-:.TZ]/g,
                ""
            ) +
        "-" +
        crypto
            .randomUUID()
            .slice(
                0,
                8
            );


    /* =========================================
       CRÉER LA VENTE
    ========================================= */

    const nouvelleVente = {

        id:
            idVente,

        date:
            date ||
            obtenirDateVente(),

        client:
            client || null,

        telephone:
            telephone || null,

        produit:
            produit.nom,

        produit_id:
            String(
                produit.id
            ),

        quantite:
            quantite,

        prix_unitaire:
            prix,

        remise:
            remise,

        total:
            totalCalcule,

        paiement:
            paiement || null,

        utilisateur:
            utilisateurNom,

        created_at:
            new Date().toISOString(),

        synchronise:
            false

    };


    /* =========================================
       NOUVEAU STOCK LOCAL
    ========================================= */

    const nouveauStock =
        stockDisponible -
        quantite;


    const produitMisAJour = {

        ...produit,

        stock:
            nouveauStock,

        synchronise:
            false

    };


    /* =========================================
       ENREGISTREMENT LOCAL
    ========================================= */

    try {

        await enregistrerLocalement(
            "ventes",
            nouvelleVente
        );


        await enregistrerLocalement(
            "produits",
            produitMisAJour
        );


        console.log(
            "✓ Vente enregistrée localement :",
            idVente
        );


    } catch (error) {

        console.error(
            "Erreur enregistrement local :",
            error
        );


        alert(
            "Impossible d'enregistrer la vente localement."
        );

        return;
    }


    /* =========================================
       AJOUTER LA VENTE À LA FILE
    ========================================= */

    try {

        await ajouterFileSynchronisation(
            "ventes",
            "INSERT",
            nouvelleVente
        );


        /* =====================================
           AJOUTER LA MODIFICATION DU STOCK
        ===================================== */

        await ajouterFileSynchronisation(
            "produits",
            "UPDATE",
            produitMisAJour
        );


        console.log(
            "✓ Vente et stock ajoutés à la file de synchronisation."
        );


    } catch (error) {

        console.error(
            "Erreur file de synchronisation :",
            error
        );

        alert(
            "La vente est enregistrée localement, " +
            "mais elle n'a pas pu être ajoutée à la file de synchronisation."
        );

        return;
    }


    /* =========================================
       SI INTERNET EST ABSENT
    ========================================= */

    if (
        !navigator.onLine
    ) {

        alert(

            "Vente enregistrée hors ligne.\n\n" +

            "Produit : " +
            produit.nom +

            "\nQuantité : " +
            quantite +

            "\nTotal : " +
            formatMonnaie(
                totalCalcule
            ) +

            "\n\nLa vente sera synchronisée " +
            "automatiquement lorsque Internet reviendra."

        );


        await chargerVentes();

        await chargerProduitsVente();

        formulaireVenteReinitialiser();

        return;
    }


    /* =========================================
       INTERNET DISPONIBLE
       
       POUR L'INSTANT :
       garder le comportement Supabase
       séparé.
    ========================================= */

    console.log(
        "Internet disponible."
    );

    console.log(
        "Vente locale créée :",
        idVente
    );

    console.log(
        "Synchronisation Supabase sera traitée par le moteur de synchronisation."
    );


    alert(

        "Vente enregistrée localement.\n\n" +

        "Elle est prête à être synchronisée."

    );


    await chargerVentes();

    await chargerProduitsVente();

    formulaireVenteReinitialiser();

}

async function enregistrerActionVente(
    vente
) {

    if (
        !window.supabaseClient
    ) {
        return;
    }

    try {

        let utilisateur =
            null;

        if (
            typeof obtenirUtilisateurERP ===
            "function"
        ) {
            utilisateur =
                obtenirUtilisateurERP();
        }

        const {
            error
        } =
            await window.supabaseClient
                .from("journal_actions")
                .insert({

                    utilisateur_id:
                        utilisateur
                            ? utilisateur.id
                            : null,

                    utilisateur_nom:
                        utilisateur
                            ? utilisateur.nom
                            : vente.utilisateur,

                    role_utilisateur:
                        utilisateur
                            ? utilisateur.role
                            : null,

                    module:
                        "Ventes",

                    action:
                        "ajouter",

                    table_concernee:
                        "ventes",

                    enregistrement_id:
                        vente.id
                            ? String(
                                vente.id
                            )
                            : null,

                    description:
                        "Nouvelle vente enregistrée : " +
                        (
                            vente.produit ||
                            ""
                        ),

                    details:
                        vente
                });

        if (error) {
            console.error(
                "Erreur journal action :",
                error
            );
        }

    } catch (error) {

        console.error(
            "Erreur enregistrerActionVente :",
            error
        );
    }
}

function formulaireVenteReinitialiser() {

    const formulaire =
        document.getElementById(
            "venteForm"
        );

    if (!formulaire) {
        return;
    }

    formulaire.reset();

    const date =
        document.getElementById(
            "date"
        );

    if (date) {
        date.value =
            obtenirDateVente();
    }

    const total =
        document.getElementById(
            "total"
        );

    if (total) {
        total.textContent =
            formatMonnaie(0);
    }
}

async function chargerVentes() {

    const table =
        document.getElementById(
            "tableVentes"
        );

    if (!table) {
        return;
    }

    const ventes =
        await obtenirVentes();

    const recherche =
        document.getElementById(
            "recherche"
        );

    const filtreDate =
        document.getElementById(
            "filtreDate"
        );

    const texteRecherche =
        recherche
            ? recherche.value
                .trim()
                .toLowerCase()
            : "";

    const dateRecherche =
        filtreDate
            ? filtreDate.value
            : "";

    const ventesFiltrees =
        ventes.filter(
            function (vente) {

                const correspondRecherche =
                    !texteRecherche ||

                    String(
                        vente.client ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    ) ||

                    String(
                        vente.produit ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        texteRecherche
                    );

                const correspondDate =
                    !dateRecherche ||
                    vente.date ===
                    dateRecherche;

                return (
                    correspondRecherche &&
                    correspondDate
                );
            }
        );

    table.innerHTML = "";

    if (
        ventesFiltrees.length === 0
    ) {

        table.innerHTML = `

<tr>

<td
colspan="9"
class="text-center text-muted py-4">

Aucune vente trouvée.

</td>

</tr>

`;

    }

    ventesFiltrees.forEach(
        function (vente) {

            const statut =
                vente.statut ||
                "Validée";

            const badgeStatut =
                statut === "Annulée"
                    ? "danger"
                    : "success";

            const ligne =
                document.createElement(
                    "tr"
                );

            ligne.innerHTML = `

<td>
${vente.id || ""}
</td>

<td>
${vente.date || ""}
</td>

<td>
${vente.client || ""}
</td>

<td>
${vente.produit || ""}
</td>

<td>
${Number(
    vente.quantite
) || 0}
</td>

<td>
${formatMonnaie(
    vente.total
)}
</td>

<td>
${vente.paiement || ""}
</td>

<td>

<span class="badge bg-${badgeStatut}">

${statut}

</span>

</td>

<td>

<button
type="button"
class="btn btn-primary btn-sm"
data-action="voir"
data-id="${vente.id}"
title="Voir">

<i class="fa-solid fa-eye"></i>

</button>

<button
type="button"
class="btn btn-secondary btn-sm"
data-action="imprimer"
data-id="${vente.id}"
title="Facture">

<i class="fa-solid fa-print"></i>

</button>

${
    statut !== "Annulée"
    ? `

<button
type="button"
class="btn btn-danger btn-sm"
data-action="annuler"
data-id="${vente.id}"
title="Annuler">

<i class="fa-solid fa-ban"></i>

</button>

`
    : ""
}

</td>

`;

            table.appendChild(
                ligne
            );

        }
    );

    table
        .querySelectorAll(
            "button[data-action]"
        )
        .forEach(
            function (bouton) {

                bouton.addEventListener(
                    "click",
                    function () {

                        const action =
                            bouton.dataset.action;

                        const id =
                            bouton.dataset.id;

                        if (
                            action ===
                            "voir"
                        ) {

                            voirVente(id);

                        }

                        if (
                            action ===
                            "imprimer"
                        ) {

                            imprimerFacture(id);

                        }

                        if (
                            action ===
                            "annuler"
                        ) {

                            annulerVente(id);

                        }

                    }
                );

            }
        );

    const nombreVentes =
        document.getElementById(
            "nombreVentes"
        );

    if (nombreVentes) {

        nombreVentes.textContent =
            ventesFiltrees.length;

    }
}


/*==================================================
RECHERCHE
==================================================*/

function initialiserRechercheVentes() {

    const recherche =
        document.getElementById(
            "recherche"
        );

    if (!recherche) {
        return;
    }

    recherche.addEventListener(
        "input",
        chargerVentes
    );
}


/*==================================================
FILTRE DATE
==================================================*/

function initialiserFiltreDate() {

    const filtreDate =
        document.getElementById(
            "filtreDate"
        );

    if (!filtreDate) {
        return;
    }

    filtreDate.addEventListener(
        "change",
        chargerVentes
    );
}


/*==================================================
VOIR UNE VENTE
==================================================*/

async function voirVente(
    idVente
) {

    const ventes =
        await obtenirVentes();

    const vente =
        ventes.find(
            function (v) {

                return String(v.id) ===
                    String(idVente);

            }
        );

    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;
    }

    alert(

        "DÉTAILS DE LA VENTE\n\n" +

        "ID : " +
        vente.id +

        "\nDate : " +
        vente.date +

        "\nClient : " +
        (
            vente.client ||
            "-"
        ) +

        "\nTéléphone : " +
        (
            vente.telephone ||
            "-"
        ) +

        "\nProduit : " +
        (
            vente.produit ||
            "-"
        ) +

        "\nQuantité : " +
        (
            vente.quantite ||
            0
        ) +

        "\nPrix unitaire : " +
        formatMonnaie(
            vente.prix_unitaire
        ) +

        "\nRemise : " +
        formatMonnaie(
            vente.remise
        ) +

        "\nTotal : " +
        formatMonnaie(
            vente.total
        ) +

        "\nPaiement : " +
        (
            vente.paiement ||
            "-"
        )

    );
}


/*==================================================
IMPRIMER FACTURE
==================================================*/

async function imprimerFacture(
    idVente
) {

    const ventes =
        await obtenirVentes();

    const vente =
        ventes.find(
            function (v) {

                return String(v.id) ===
                    String(idVente);

            }
        );

    if (!vente) {

        alert(
            "Vente introuvable."
        );

        return;
    }

    const facture =
        window.open(
            "",
            "_blank"
        );

    if (!facture) {

        alert(
            "Le navigateur a bloqué la fenêtre d'impression."
        );

        return;
    }

    facture.document.write(`

<!DOCTYPE html>

<html lang="fr">

<head>

<meta charset="UTF-8">

<title>
Facture ${vente.id}
</title>

<style>

body{

font-family:Arial,sans-serif;

padding:40px;

}

h1{

margin-bottom:5px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:30px;

}

th,
td{

border:1px solid #000;

padding:10px;

text-align:left;

}

.total{

margin-top:20px;

font-size:20px;

font-weight:bold;

}

</style>

</head>

<body>

<h1>
FERME ASHER ERP
</h1>

<p>
<strong>Facture :</strong>
${vente.id}
</p>

<p>
<strong>Date :</strong>
${vente.date}
</p>

<p>
<strong>Client :</strong>
${vente.client || "-"}
</p>

<table>

<thead>

<tr>

<th>Produit</th>
<th>Quantité</th>
<th>Prix</th>
<th>Remise</th>
<th>Total</th>

</tr>

</thead>

<tbody>

<tr>

<td>
${vente.produit || ""}
</td>

<td>
${vente.quantite || 0}
</td>

<td>
${formatMonnaie(
    vente.prix_unitaire
)}
</td>

<td>
${formatMonnaie(
    vente.remise
)}
</td>

<td>
${formatMonnaie(
    vente.total
)}
</td>

</tr>

</tbody>

</table>

<p class="total">

TOTAL :

${formatMonnaie(
    vente.total
)}

</p>

<script>

window.onload = function(){

window.print();

};

<\/script>

</body>

</html>

`);

    facture.document.close();
}


/*==================================================
ANNULER UNE VENTE
==================================================*/

async function annulerVente(
    idVente
) {

    if (!ventesSupabaseDisponible()) {
        return;
    }

    const confirmation =
        confirm(

            "Voulez-vous vraiment annuler cette vente ?\n\n" +

            "Le stock sera remis automatiquement."

        );

    if (!confirmation) {
        return;
    }

    const {
        data: vente,
        error: erreurVente
    } =
        await window.supabaseClient
            .from(TABLE_VENTES)
            .select("*")
            .eq("id", idVente)
            .single();

    if (
        erreurVente ||
        !vente
    ) {

        alert(
            "Vente introuvable."
        );

        return;
    }

    if (
        vente.statut ===
        "Annulée"
    ) {

        alert(
            "Cette vente est déjà annulée."
        );

        return;
    }

    if (!vente.produit_id) {

        alert(
            "Cette vente ne possède pas de produit associé."
        );

        return;
    }

    const {
        data: produit,
        error: erreurProduit
    } =
        await window.supabaseClient
            .from(TABLE_PRODUITS)
            .select("*")
            .eq(
                "id",
                vente.produit_id
            )
            .single();

    if (
        erreurProduit ||
        !produit
    ) {

        alert(
            "Produit associé à la vente introuvable."
        );

        return;
    }

    const stockActuel =
        Number(
            produit.stock
        ) || 0;

    const nouveauStock =
        stockActuel +
        Number(
            vente.quantite
        );

    const {
        error: erreurStock
    } =
        await window.supabaseClient
            .from(TABLE_PRODUITS)
            .update({
                stock: nouveauStock
            })
            .eq(
                "id",
                produit.id
            );

    if (erreurStock) {

        console.error(
            "Erreur remise stock :",
            erreurStock
        );

        alert(
            "Impossible de remettre le stock.\n\n" +
            erreurStock.message
        );

        return;
    }

    const {
        data: venteModifiee,
        error: erreurAnnulation
    } =
        await window.supabaseClient
            .from(TABLE_VENTES)
            .update({
                statut: "Annulée"
            })
            .eq(
                "id",
                idVente
            )
            .select()
            .single();

    if (erreurAnnulation) {

        console.error(
            "Erreur annulation vente :",
            erreurAnnulation
        );

        alert(
            "Le stock a été remis, mais la vente n'a pas pu être annulée.\n\n" +
            erreurAnnulation.message
        );

        return;
    }

    await enregistrerActionVenteAnnulation(
        venteModifiee
    );

    alert(
        "Vente annulée avec succès.\n\n" +
        "Le stock a été remis."
    );

    await chargerVentes();

    await chargerProduitsVente();
}


/*==================================================
JOURNAL ANNULATION
==================================================*/

async function enregistrerActionVenteAnnulation(
    vente
) {

    try {

        let utilisateur =
            null;

        if (
            typeof obtenirUtilisateurERP ===
            "function"
        ) {

            utilisateur =
                obtenirUtilisateurERP();
        }

        const {
            error
        } =
            await window.supabaseClient
                .from("journal_actions")
                .insert({

                    utilisateur_id:
                        utilisateur
                            ? utilisateur.id
                            : null,

                    utilisateur_nom:
                        utilisateur
                            ? utilisateur.nom
                            : vente.utilisateur,

                    role_utilisateur:
                        utilisateur
                            ? utilisateur.role
                            : null,

                    module:
                        "Ventes",

                    action:
                        "annuler",

                    table_concernee:
                        "ventes",

                    enregistrement_id:
                        String(
                            vente.id
                        ),

                    description:
                        "Vente annulée : " +
                        (
                            vente.produit ||
                            ""
                        ),

                    details:
                        vente
                });

        if (error) {

            console.error(
                "Erreur journal annulation :",
                error
            );

        }

    } catch (error) {

        console.error(
            "Erreur journal annulation :",
            error
        );

    }
}


/*==================================================
TEMPS RÉEL VENTES
==================================================*/

let channelVentesERP = null;


function initialiserTempsReelVentes() {

    if (
        !ventesSupabaseDisponible()
    ) {
        return;
    }

    if (channelVentesERP) {

        try {

            window.supabaseClient
                .removeChannel(
                    channelVentesERP
                );

        } catch (error) {

            console.warn(
                "Impossible de supprimer l'ancien canal.",
                error
            );

        }
    }

    channelVentesERP =
        window.supabaseClient
            .channel(
                "module-ventes-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "ventes"
                },
                async function () {

                    console.log(
                        "Ventes modifiées en temps réel."
                    );

                    await chargerVentes();

                }
            )

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "produits"
                },
                async function () {

                    console.log(
                        "Produits / stocks modifiés en temps réel."
                    );

                    await chargerProduitsVente();

                }
            )

            .subscribe(
                function (status) {

                    console.log(
                        "Realtime Module Ventes :",
                        status
                    );

                }
            );
}

/*==================================================
EXPORT GLOBAL
==================================================*/

window.obtenirVentes =
    obtenirVentes;

window.obtenirProduitsVente =
    obtenirProduitsVente;

window.chargerVentes =
    chargerVentes;

window.chargerProduitsVente =
    chargerProduitsVente;

window.enregistrerVenteSupabase =
    enregistrerVenteSupabase;

window.voirVente =
    voirVente;

window.imprimerFacture =
    imprimerFacture;

window.annulerVente =
    annulerVente;

window.formatMonnaie =
    formatMonnaie;


/*==================================================
FIN
==================================================*/

console.log(
    "Ferme Asher ERP - Ventes.js Version 4.0 Offline First chargé."
);

