/* =========================================================
   FERME ASHER ERP
   GESTION DES PRODUITS
   ========================================================= */


/* =========================================================
   CONSTANTES
   ========================================================= */

const PRODUITS_KEY = "fermeaser_produits";


/* =========================================================
   INITIALISATION
   ========================================================= */

function initialiserProduits() {

    const produits = JSON.parse(
        localStorage.getItem(PRODUITS_KEY)
    );

    if (!produits) {

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

}


/* =========================================================
   RECUPERER TOUS LES PRODUITS
   ========================================================= */

function obtenirProduits() {

    initialiserProduits();

    return JSON.parse(
        localStorage.getItem(PRODUITS_KEY)
    ) || [];

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
   GENERER ID PRODUIT
   ========================================================= */

function genererIdProduit() {

    const produits = obtenirProduits();

    let numero = 1;

    if (produits.length > 0) {

        const dernierProduit =
            produits[produits.length - 1];

        const dernierNumero =
            parseInt(
                dernierProduit.id.replace("PROD", "")
            );

        numero = dernierNumero + 1;

    }

    return "PROD" +
        String(numero).padStart(4, "0");

}


/* =========================================================
   TROUVER PRODUIT
   ========================================================= */

function trouverProduit(id) {

    const produits = obtenirProduits();

    return produits.find(
        produit => produit.id === id
    );

}


/* =========================================================
   AJOUTER UN PRODUIT
   ========================================================= */

function ajouterProduit(event) {

    event.preventDefault();

    const nom =
        document.getElementById("nom").value.trim();

    const categorie =
        document.getElementById("categorie").value;

    const prix =
        Number(
            document.getElementById("prix").value
        );

    const stock =
        Number(
            document.getElementById("stock").value
        );

    const minimum =
        Number(
            document.getElementById("minimum").value
        );

    const unite =
        document.getElementById("unite").value;

    const description =
        document
            .getElementById("description")
            .value
            .trim();


    if (!nom) {

        alert(
            "Veuillez entrer le nom du produit."
        );

        return;

    }


    const produits = obtenirProduits();


    const produitExiste = produits.some(
        produit =>
            produit.nom.toLowerCase() ===
            nom.toLowerCase()
    );


    if (produitExiste) {

        alert(
            "Ce produit existe déjà."
        );

        return;

    }


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


    produits.push(nouveauProduit);

    enregistrerProduits(produits);


    alert(
        "Produit enregistré avec succès."
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   CHARGER LISTE DES PRODUITS
   ========================================================= */

function chargerProduits() {

    const table =
        document.getElementById("tableProduits");


    if (!table) {

        return;

    }


    const produits =
        obtenirProduits();


    const rechercheElement =
        document.getElementById("recherche");


    const recherche =
        rechercheElement
            ? rechercheElement.value.toLowerCase()
            : "";


    const categorieElement =
        document.getElementById("filtreCategorie");


    const categorie =
        categorieElement
            ? categorieElement.value
            : "";


    const produitsFiltres =
        produits.filter(produit => {


            const correspondRecherche =

                produit.nom
                    .toLowerCase()
                    .includes(recherche)

                ||

                produit.id
                    .toLowerCase()
                    .includes(recherche);


            const correspondCategorie =

                !categorie

                ||

                produit.categorie === categorie;


            return
                correspondRecherche
                &&
                correspondCategorie;

        });


    table.innerHTML = "";


    if (produitsFiltres.length === 0) {

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


    produitsFiltres.forEach(produit => {


        let statutStock = "";


        if (produit.stock <= 0) {

            statutStock = `
                <span class="badge bg-danger">
                    Rupture
                </span>
            `;

        }

        else if (
            produit.stock <= produit.minimum
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

                    ${produit.stock}

                </td>


                <td>

                    ${produit.minimum}

                </td>


                <td>

                    ${produit.unite}

                </td>


                <td>

                    ${Number(produit.prix)
                        .toLocaleString("fr-FR")
                    } FC

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
                        class="btn btn-sm btn-danger"
                        onclick="supprimerProduit('${produit.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });


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
   SUPPRIMER PRODUIT
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
            `Voulez-vous vraiment supprimer :

${produit.nom} ?`
        );


    if (!confirmation) {

        return;

    }


    let produits =
        obtenirProduits();


    produits =
        produits.filter(
            produit => produit.id !== id
        );


    enregistrerProduits(produits);


    alert(
        "Produit supprimé avec succès."
    );


    chargerProduits();

}


/* =========================================================
   CHARGER PRODUIT A MODIFIER
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
    ).value = produit.description || "";

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
            produit => produit.id === id
        );


    if (index === -1) {

        alert(
            "Produit introuvable."
        );

        return;

    }


    produits[index].nom =
        document.getElementById(
            "nom"
        ).value.trim();


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


    enregistrerProduits(produits);


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

                ${Number(produit.prix)
                    .toLocaleString("fr-FR")
                } FC

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
                        produit.description
                        ||
                        "Aucune description."
                    }

                </p>

            </div>

        </div>

    `;

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
