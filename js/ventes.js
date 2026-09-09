/*==================================================
FERME ASHER ERP
VENTES.JS
VERSION 3.0 - SUPABASE
==================================================*/

"use strict";


/*==================================================
CONFIGURATION
==================================================*/

const TABLE_VENTES = "ventes";
const TABLE_PRODUITS = "produits";


/*==================================================
VÉRIFICATION SUPABASE
==================================================*/

function ventesSupabaseDisponible() {

    if (!window.supabaseClient) {

        console.error(
            "Supabase n'est pas disponible."
        );

        return false;
    }

    return true;
}


/*==================================================
DATE DU JOUR
==================================================*/

function obtenirDateVente() {

    const maintenant = new Date();

    const annee =
        maintenant.getFullYear();

    const mois =
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            maintenant.getDate()
        ).padStart(2, "0");

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );
}


/*==================================================
FORMAT MONNAIE
==================================================*/

function formatMonnaie(montant) {

    return (
        Number(montant) || 0
    ).toLocaleString("fr-FR") + " FC";
}


/*==================================================
CHARGER PRODUITS DEPUIS SUPABASE
==================================================*/

async function obtenirProduitsVente() {

    if (!ventesSupabaseDisponible()) {
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
                "Erreur chargement produits :",
                error
            );

            return [];
        }


        return data || [];


    } catch (error) {

        console.error(
            "Erreur obtenirProduitsVente :",
            error
        );

        return [];
    }
}


/*==================================================
CHARGER VENTES DEPUIS SUPABASE
==================================================*/

async function obtenirVentes() {

    if (!ventesSupabaseDisponible()) {
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
                "Erreur chargement ventes :",
                error
            );

            return [];
        }


        return data || [];


    } catch (error) {

        console.error(
            "Erreur obtenirVentes :",
            error
        );

        return [];
    }
}


/*==================================================
INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "FERME ASHER ERP - VENTES VERSION 3.0"
        );


        if (
            !ventesSupabaseDisponible()
        ) {

            alert(
                "Erreur : Supabase n'est pas disponible."
            );

            return;
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


/*==================================================
CHARGER PRODUITS DANS LE FORMULAIRE
==================================================*/

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


/*==================================================
INITIALISER FORMULAIRE
==================================================*/

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


    /*------------------------------------------
    DATE PAR DÉFAUT
    ------------------------------------------*/

    if (
        date &&
        !date.value
    ) {

        date.value =
            obtenirDateVente();
    }


    /*------------------------------------------
    CALCUL VISUEL DU TOTAL
    ------------------------------------------*/

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


    /*------------------------------------------
    PRODUIT CHANGE
    ------------------------------------------*/

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


    /*------------------------------------------
    ENREGISTREMENT
    ------------------------------------------*/

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


/*==================================================
ENREGISTRER VENTE SUPABASE
==================================================*/

async function enregistrerVenteSupabase(
    informations
) {

    if (!ventesSupabaseDisponible()) {

        alert(
            "Supabase n'est pas disponible."
        );

        return;
    }


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


    /*------------------------------------------
    VALIDATION PRODUIT
    ------------------------------------------*/

    if (!idProduit) {

        alert(
            "Veuillez sélectionner un produit."
        );

        return;
    }


    /*------------------------------------------
    VALIDATION QUANTITÉ
    ------------------------------------------*/

    if (
        !Number.isFinite(quantite) ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;
    }


    /*------------------------------------------
    VALIDATION PRIX
    ------------------------------------------*/

    if (
        !Number.isFinite(prix) ||
        prix < 0
    ) {

        alert(
            "Le prix est invalide."
        );

        return;
    }


    /*------------------------------------------
    RECHERCHER PRODUIT
    ------------------------------------------*/

    const {
        data: produit,
        error: erreurProduit
    } =
        await window.supabaseClient
            .from(TABLE_PRODUITS)
            .select("*")
            .eq("id", idProduit)
            .single();


    if (
        erreurProduit ||
        !produit
    ) {

        console.error(
            "Produit introuvable :",
            erreurProduit
        );

        alert(
            "Produit introuvable."
        );

        return;
    }


    /*------------------------------------------
    VÉRIFIER STOCK
    ------------------------------------------*/

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


    /*------------------------------------------
    CALCUL LOCAL DE CONTRÔLE
    ------------------------------------------*/

    let totalCalcule =
        quantite *
        prix;


    totalCalcule -=
        remise;


    if (totalCalcule < 0) {
        totalCalcule = 0;
    }


    console.log(
        "Total calculé côté interface :",
        totalCalcule
    );


    /*------------------------------------------
    UTILISATEUR CONNECTÉ
    ------------------------------------------*/

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


    /*------------------------------------------
    CRÉER LA VENTE
    ------------------------------------------*/

    const nouvelleVente = {

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

        /*
         * Le trigger Supabase recalcule
         * automatiquement ce champ.
         */
        total:
            totalCalcule,

        paiement:
            paiement || null,

        utilisateur:
            utilisateurNom
    };


    console.log(
        "Enregistrement vente :",
        nouvelleVente
    );


    /*------------------------------------------
    INSERT SUPABASE
    ------------------------------------------*/

    const {
        data: venteEnregistree,
        error: erreurVente
    } =
        await window.supabaseClient
            .from(TABLE_VENTES)
            .insert(
                nouvelleVente
            )
            .select()
            .single();


    if (erreurVente) {

        console.error(
            "Erreur enregistrement vente :",
            erreurVente
        );


        alert(
            "Impossible d'enregistrer la vente.\n\n" +
            erreurVente.message
        );


        return;
    }


    /*------------------------------------------
    DIMINUER LE STOCK
    ------------------------------------------*/

    const nouveauStock =
        stockDisponible -
        quantite;


    const {
        error: erreurStock
    } =
        await window.supabaseClient
            .from(TABLE_PRODUITS)
            .update({
                stock: nouveauStock
            })
            .eq("id", produit.id);


    if (erreurStock) {

        console.error(
            "Erreur mise à jour stock :",
            erreurStock
        );


        /*
         * ATTENTION :
         * La vente est déjà enregistrée.
         *
         * On signale clairement
         * l'anomalie.
         */

        alert(
            "La vente a été enregistrée, " +
            "mais le stock n'a pas pu être mis à jour.\n\n" +
            "Erreur : " +
            erreurStock.message
        );


        return;
    }


    /*------------------------------------------
    JOURNAL D'ACTION
    ------------------------------------------*/

    await enregistrerActionVente(
        venteEnregistree
    );


    /*------------------------------------------
    MESSAGE SUCCÈS
    ------------------------------------------*/

    alert(
        "Vente enregistrée avec succès.\n\n" +

        "Produit : " +
        produit.nom +

        "\nQuantité : " +
        quantite +

        "\nTotal : " +
        formatMonnaie(
            Number(
                venteEnregistree.total
            )
        )
    );


    /*------------------------------------------
    RECHARGER
    ------------------------------------------*/

    await chargerVentes();

    await chargerProduitsVente();


    formulaireVenteReinitialiser();


}


/*==================================================
JOURNAL DES ACTIONS
==================================================*/

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


/*==================================================
RÉINITIALISER FORMULAIRE
==================================================*/

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


/*==================================================
CHARGER LES VENTES DANS LE TABLEAU
==================================================*/

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


    /*------------------------------------------
    ACTIONS BOUTONS
    ------------------------------------------*/

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


    /*------------------------------------------
    RECHERCHER VENTE
    ------------------------------------------*/

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


    /*------------------------------------------
    PROTECTION DOUBLE ANNULATION
    ------------------------------------------*/

    if (
        vente.statut ===
        "Annulée"
    ) {

        alert(
            "Cette vente est déjà annulée."
        );

        return;
    }


    /*------------------------------------------
    RECHERCHER PRODUIT
    ------------------------------------------*/

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


    /*------------------------------------------
    REMETTRE LE STOCK
    ------------------------------------------*/

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


    /*------------------------------------------
    ANNULER LA VENTE
    ------------------------------------------*/

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


        /*
         * Le stock a déjà été remis.
         * Il faut signaler clairement
         * cette anomalie.
         */

        alert(
            "Le stock a été remis, mais la vente n'a pas pu être annulée.\n\n" +
            erreurAnnulation.message
        );

        return;
    }


    /*------------------------------------------
    JOURNAL
    ------------------------------------------*/

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


            /* VENTES */

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


            /* PRODUITS / STOCK */

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
    "Ferme Asher ERP - Ventes.js Version 3.0 Supabase chargé."
);
