/* =========================================================
   FERME ASHER ERP
   GESTION DES PRODUITS
   ========================================================= */


/* =========================================================
   CONSTANTE LOCALSTORAGE
   ========================================================= */

const PRODUITS_KEY = "produits";


/* =========================================================
   LECTURE SECURISEE DES PRODUITS
   ========================================================= */

function lireProduits() {

    try {

        const donnees = localStorage.getItem(PRODUITS_KEY);

        if (!donnees) {
            return null;
        }

        const produits = JSON.parse(donnees);

        if (!Array.isArray(produits)) {
            return null;
        }

        return produits;

    } catch (erreur) {

        console.error(
            "Erreur de lecture des produits :",
            erreur
        );

        return null;

    }

}


/* =========================================================
   INITIALISATION DES PRODUITS
   ========================================================= */

function initialiserProduits() {

    const produitsExistants = lireProduits();


    if (produitsExistants !== null) {

        return;

    }


    const produitsParDefaut = [

        {
            id: "PROD0001",
            nom: "Œufs de caille",
            categorie: "Élevage",
            prix: 9000,
            stock: 0,
            minimum: 5,
            unite: "Plateau",
            description: "Plateau de 15 œufs de caille",
            actif: true,
            dateCreation: new Date().toISOString()
        },

        {
            id: "PROD0002",
            nom: "Cailles",
            categorie: "Élevage",
            prix: 6000,
            stock: 0,
            minimum: 10,
            unite: "Unité",
            description: "Caille vivante",
            actif: true,
            dateCreation: new Date().toISOString()
        },

        {
            id: "PROD0003",
            nom: "Soja",
            categorie: "Agriculture",
            prix: 0,
            stock: 0,
            minimum: 0,
            unite: "Kg",
            description: "Soja produit à la ferme",
            actif: true,
            dateCreation: new Date().toISOString()
        }

    ];


    localStorage.setItem(
        PRODUITS_KEY,
        JSON.stringify(produitsParDefaut)
    );

}


/* =========================================================
   OBTENIR TOUS LES PRODUITS
   ========================================================= */

function obtenirProduits() {

    initialiserProduits();

    const produits = lireProduits();

    return produits || [];

}


/* =========================================================
   ENREGISTRER LES PRODUITS
   ========================================================= */

function enregistrerProduits(produits) {

    localStorage.setItem(
        PRODUITS_KEY,
        JSON.stringify(produits)
    );

}


/* =========================================================
   GENERER UN ID PRODUIT UNIQUE
   ========================================================= */

function genererIdProduit() {

    const produits = obtenirProduits();


    let numeroMaximum = 0;


    produits.forEach(function (produit) {

        if (!produit.id) {
            return;
        }


        const numero = parseInt(
            String(produit.id)
                .replace("PROD", ""),
            10
        );


        if (
            !isNaN(numero) &&
            numero > numeroMaximum
        ) {

            numeroMaximum = numero;

        }

    });


    const nouveauNumero =
        numeroMaximum + 1;


    return (
        "PROD" +
        String(nouveauNumero)
            .padStart(4, "0")
    );

}


/* =========================================================
   TROUVER UN PRODUIT
   ========================================================= */

function trouverProduit(id) {

    const produits = obtenirProduits();

    return produits.find(
        produit =>
            String(produit.id) === String(id)
    );

}


/* =========================================================
   AJOUTER UN PRODUIT
   ========================================================= */

function ajouterProduit(event) {

    event.preventDefault();


    /* =============================================
       RECUPERATION DES CHAMPS
    ============================================= */

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


    /* =============================================
       VERIFICATION DES CHAMPS
    ============================================= */

    if (
        !champNom ||
        !champCategorie ||
        !champPrix ||
        !champStock ||
        !champMinimum ||
        !champUnite ||
        !champDescription
    ) {

        console.error(
            "Un ou plusieurs champs du formulaire sont introuvables."
        );

        alert(
            "Erreur : certains champs du formulaire sont introuvables."
        );

        return;

    }


    /* =============================================
       RECUPERATION DES VALEURS
    ============================================= */

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


    /* =============================================
       VALIDATIONS
    ============================================= */

    if (!nom) {

        alert(
            "Veuillez entrer le nom du produit."
        );

        champNom.focus();

        return;

    }


    if (
        isNaN(prix) ||
        prix < 0
    ) {

        alert(
            "Le prix unitaire est invalide."
        );

        champPrix.focus();

        return;

    }


    if (
        isNaN(stock) ||
        stock < 0
    ) {

        alert(
            "Le stock initial est invalide."
        );

        champStock.focus();

        return;

    }


    if (
        isNaN(minimum) ||
        minimum < 0
    ) {

        alert(
            "Le stock minimum est invalide."
        );

        champMinimum.focus();

        return;

    }


    /* =============================================
       RECUPERATION DES PRODUITS
    ============================================= */

    const produits =
        obtenirProduits();


    /* =============================================
       VERIFICATION DOUBLON
    ============================================= */

    const produitExiste =
        produits.some(
            produit =>
                produit.nom
                    .trim()
                    .toLowerCase()
                ===
                nom.toLowerCase()
        );


    if (produitExiste) {

        alert(
            "Ce produit existe déjà."
        );

        return;

    }


    /* =============================================
       CREATION DU PRODUIT
    ============================================= */

    const nouveauProduit = {

        id: genererIdProduit(),

        nom: nom,

        categorie: categorie,

        prix: prix,

        stock: stock,

        minimum: minimum,

        unite: unite,

        description: description,

        actif: true,

        dateCreation:
            new Date().toISOString()

    };


    /* =============================================
       ENREGISTREMENT
    ============================================= */

    produits.push(
        nouveauProduit
    );


    enregistrerProduits(
        produits
    );


    /* =============================================
       VERIFICATION
    ============================================= */

    const produitsVerification =
        obtenirProduits();


    const produitEnregistre =
        produitsVerification.find(
            produit =>
                produit.id ===
                nouveauProduit.id
        );


    if (!produitEnregistre) {

        alert(
            "Erreur : le produit n'a pas pu être enregistré."
        );

        return;

    }


    alert(
        "Produit enregistré avec succès."
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   CHARGER LA LISTE DES PRODUITS
   ========================================================= */

function chargerProduits() {

    const table =
        document.getElementById(
            "tableProduits"
        );


    if (!table) {
        return;
    }


    const produits =
        obtenirProduits();


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


    const produitsFiltres =
        produits.filter(
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
                    nom.includes(recherche)
                    ||
                    id.includes(recherche);


                const correspondCategorie =
                    !categorie
                    ||
                    produit.categorie ===
                    categorie;


                return (
                    correspondRecherche
                    &&
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


        mettreAJourNombreProduits(0);

        return;

    }


    produitsFiltres.forEach(
        function (produit) {


            const stock =
                Number(produit.stock) || 0;

            const minimum =
                Number(produit.minimum) || 0;


            let statutStock = "";


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
                    <span class="badge bg-warning text-dark">
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
                        ${produit.id}
                    </td>

                    <td>
                        ${produit.nom}
                    </td>

                    <td>
                        ${produit.categorie}
                    </td>

                    <td>
                        ${stock}
                    </td>

                    <td>
                        ${minimum}
                    </td>

                    <td>
                        ${produit.unite}
                    </td>

                    <td>

                        ${Number(
                            produit.prix
                        ).toLocaleString(
                            "fr-FR"
                        )} FC

                    </td>

                    <td>

                        ${statutStock}

                    </td>

                    <td>

                        <a
                            href="detail.html?id=${produit.id}"
                            class="btn btn-sm btn-info">

                            <i class="fa-solid fa-eye"></i>

                        </a>


                        <a
                            href="modifier.html?id=${produit.id}"
                            class="btn btn-sm btn-warning">

                            <i class="fa-solid fa-pen"></i>

                        </a>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="supprimerProduit('${produit.id}')">

                            <i class="fa-solid fa-trash"></i>

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
   METTRE A JOUR LE NOMBRE DE PRODUITS
   ========================================================= */

function mettreAJourNombreProduits(nombre) {

    const element =
        document.getElementById(
            "nombreProduits"
        );


    if (element) {

        element.textContent = nombre;

    }

}


/* =========================================================
   SUPPRIMER UN PRODUIT
   ========================================================= */

function supprimerProduit(id) {

    const produit =
        trouverProduit(id);


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        return;

    }


    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer "${produit.nom}" ?`
        );


    if (!confirmation) {
        return;
    }


    const produits =
        obtenirProduits();


    const nouveauxProduits =
        produits.filter(
            produit =>
                String(produit.id) !==
                String(id)
        );


    enregistrerProduits(
        nouveauxProduits
    );


    alert(
        "Produit supprimé avec succès."
    );


    chargerProduits();

}


/* =========================================================
   CHARGER PRODUIT POUR MODIFICATION
   ========================================================= */

function chargerProduitModification() {

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
        trouverProduit(id);


    if (!produit) {

        alert(
            "Produit introuvable."
        );

        window.location.href =
            "index.html";

        return;

    }


    document.getElementById(
        "idProduit"
    ).value = produit.id;


    document.getElementById(
        "nom"
    ).value = produit.nom;


    document.getElementById(
        "categorie"
    ).value = produit.categorie;


    document.getElementById(
        "prix"
    ).value = produit.prix;


    document.getElementById(
        "stock"
    ).value = produit.stock;


    document.getElementById(
        "minimum"
    ).value = produit.minimum;


    document.getElementById(
        "unite"
    ).value = produit.unite;


    document.getElementById(
        "description"
    ).value =
        produit.description || "";

}


/* =========================================================
   MODIFIER PRODUIT
   ========================================================= */

function modifierProduit(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "idProduit"
        ).value;


    const produits =
        obtenirProduits();


    const index =
        produits.findIndex(
            produit =>
                String(produit.id) ===
                String(id)
        );


    if (index === -1) {

        alert(
            "Produit introuvable."
        );

        return;

    }


    const nom =
        document.getElementById(
            "nom"
        ).value.trim();


    if (!nom) {

        alert(
            "Le nom du produit est obligatoire."
        );

        return;

    }


    produits[index].nom = nom;

    produits[index].categorie =
        document.getElementById(
            "categorie"
        ).value;

    produits[index].prix =
        Number(
            document.getElementById(
                "prix"
            ).value
        );

    produits[index].stock =
        Number(
            document.getElementById(
                "stock"
            ).value
        );

    produits[index].minimum =
        Number(
            document.getElementById(
                "minimum"
            ).value
        );

    produits[index].unite =
        document.getElementById(
            "unite"
        ).value;

    produits[index].description =
        document.getElementById(
            "description"
        ).value.trim();


    enregistrerProduits(
        produits
    );


    alert(
        "Produit modifié avec succès."
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   DETAIL PRODUIT
   ========================================================= */

function chargerDetailProduit() {

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


    const produit =
        trouverProduit(id);


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

                ${produit.id}

            </div>


            <div class="col-md-6">

                <strong>Nom :</strong>

                ${produit.nom}

            </div>


            <div class="col-md-6">

                <strong>Catégorie :</strong>

                ${produit.categorie}

            </div>


            <div class="col-md-6">

                <strong>Prix :</strong>

                ${Number(
                    produit.prix
                ).toLocaleString("fr-FR")} FC

            </div>


            <div class="col-md-6">

                <strong>Stock :</strong>

                ${produit.stock}
                ${produit.unite}

            </div>


            <div class="col-md-6">

                <strong>Stock minimum :</strong>

                ${produit.minimum}
                ${produit.unite}

            </div>


            <div class="col-12">

                <strong>Description :</strong>

                <p>

                    ${
                        produit.description ||
                        "Aucune description."
                    }

                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   DIMINUER LE STOCK APRES UNE VENTE
   ========================================================= */

function diminuerStockProduit(
    idProduit,
    quantiteVendue
) {

    const produits =
        obtenirProduits();


    const index =
        produits.findIndex(
            produit =>
                String(produit.id) ===
                String(idProduit)
        );


    if (index === -1) {

        return {

            succes: false,

            message:
                "Produit introuvable."

        };

    }


    const stockActuel =
        Number(
            produits[index].stock
        ) || 0;


    const quantite =
        Number(
            quantiteVendue
        );


    if (
        !Number.isFinite(quantite)
        ||
        quantite <= 0
    ) {

        return {

            succes: false,

            message:
                "Quantité invalide."

        };

    }


    if (
        stockActuel < quantite
    ) {

        return {

            succes: false,

            message:
                "Stock insuffisant. Stock disponible : " +
                stockActuel +
                " " +
                produits[index].unite

        };

    }


    produits[index].stock =
        stockActuel - quantite;


    enregistrerProduits(
        produits
    );


    return {

        succes: true,

        produit:
            produits[index]

    };

}


/* =========================================================
   INITIALISATION AUTOMATIQUE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initialiserProduits();

        chargerProduits();

        chargerProduitModification();

        chargerDetailProduit();

    }
);
