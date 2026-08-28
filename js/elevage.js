/* =========================================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   Fichier : js/elevage.js
========================================================= */


/* =========================================================
   INITIALISATION DES BASES LOCALSTORAGE
========================================================= */

function initialiserElevage() {

    const bases = [
        "animaux",
        "productionsElevage",
        "santeElevage",
        "alimentationElevage",
        "reproductionElevage",
        "croissanceElevage"
    ];

    bases.forEach(function (base) {

        if (!localStorage.getItem(base)) {

            localStorage.setItem(
                base,
                JSON.stringify([])
            );

        }

    });

}


initialiserElevage();



/* =========================================================
   OUTILS GÉNÉRAUX
========================================================= */

function genererId(prefixe) {

    return (
        prefixe +
        "-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 10000)
    );

}


function obtenirDateAujourdHui() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function obtenirUtilisateur() {

    return (
        localStorage.getItem("utilisateur") ||
        localStorage.getItem("utilisateurConnecte") ||
        "Administrateur"
    );

}


function obtenirDonnees(nom) {

    try {

        return JSON.parse(
            localStorage.getItem(nom)
        ) || [];

    } catch (erreur) {

        return [];

    }

}


function sauvegarderDonnees(nom, donnees) {

    localStorage.setItem(
        nom,
        JSON.stringify(donnees)
    );

}


function formaterNombre(nombre) {

    return Number(nombre || 0)
        .toLocaleString("fr-FR");

}



/* =========================================================
   ACCÈS AUX ANIMAUX
========================================================= */

function obtenirAnimaux() {

    return obtenirDonnees("animaux");

}


function sauvegarderAnimaux(animaux) {

    sauvegarderDonnees(
        "animaux",
        animaux
    );

}



/* =========================================================
   MODULE ANIMAUX
========================================================= */

function ajouterAnimal(event) {

    if (event) {

        event.preventDefault();

    }


    const typeElement =
        document.getElementById("typeAnimal");

    const raceElement =
        document.getElementById("raceAnimal");

    const quantiteElement =
        document.getElementById("quantiteAnimal");

    const dateElement =
        document.getElementById("dateAnimal");

    const statutElement =
        document.getElementById("statutAnimal");


    const type =
        typeElement ?
        typeElement.value.trim() :
        "";

    const race =
        raceElement ?
        raceElement.value.trim() :
        "";

    const quantite =
        quantiteElement ?
        Number(quantiteElement.value) :
        0;

    const date =
        dateElement ?
        dateElement.value :
        obtenirDateAujourdHui();

    const statut =
        statutElement ?
        statutElement.value :
        "Actif";


    if (!type) {

        alert("Veuillez sélectionner le type d'animal.");

        return;

    }


    if (quantite <= 0) {

        alert("La quantité doit être supérieure à zéro.");

        return;

    }


    const animaux =
        obtenirAnimaux();


    animaux.push({

        id:
            genererId("ANI"),

        type:
            type,

        race:
            race || "Non précisée",

        quantite:
            quantite,

        quantiteInitiale:
            quantite,

        date:
            date,

        statut:
            statut,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderAnimaux(animaux);


    alert("Animal enregistré avec succès.");

    window.location.reload();

}



/* =========================================================
   CHARGER LES ANIMAUX
========================================================= */

function chargerAnimaux() {

    const tableau =
        document.getElementById("listeAnimaux");


    if (!tableau) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    tableau.innerHTML = "";


    if (animaux.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                colspan="7"
                class="text-center text-muted">

                    Aucun animal enregistré.

                </td>

            </tr>

        `;

        return;

    }


    animaux.forEach(function (animal) {

        let couleur =
            "success";


        if (animal.statut === "Malade") {

            couleur =
                "danger";

        }


        if (animal.statut === "Vendu") {

            couleur =
                "secondary";

        }


        if (animal.statut === "Inactif") {

            couleur =
                "secondary";

        }


        tableau.innerHTML += `

            <tr>

                <td>
                    ${animal.id}
                </td>

                <td>
                    ${animal.type}
                </td>

                <td>
                    ${animal.race}
                </td>

                <td>
                    ${formaterNombre(animal.quantite)}
                </td>

                <td>
                    ${animal.date}
                </td>

                <td>

                    <span
                    class="badge bg-${couleur}">

                        ${animal.statut}

                    </span>

                </td>

                <td>

                    <button
                    class="btn btn-sm btn-danger"
                    onclick="supprimerAnimal('${animal.id}')">

                        <i
                        class="fa-solid fa-trash">

                        </i>

                    </button>

                </td>

            </tr>

        `;

    });

}



/* =========================================================
   SUPPRIMER ANIMAL
========================================================= */

function supprimerAnimal(id) {

    if (
        !confirm(
            "Voulez-vous vraiment supprimer cet enregistrement ?"
        )
    ) {

        return;

    }


    let animaux =
        obtenirAnimaux();


    animaux =
        animaux.filter(function (animal) {

            return animal.id !== id;

        });


    sauvegarderAnimaux(animaux);


    chargerAnimaux();

}



/* =========================================================
   PRODUCTION
========================================================= */

function obtenirProductions() {

    return obtenirDonnees(
        "productionsElevage"
    );

}


function sauvegarderProductions(productions) {

    sauvegarderDonnees(
        "productionsElevage",
        productions
    );

}


function ajouterProduction(event) {

    if (event) {

        event.preventDefault();

    }


    const animalElement =
        document.getElementById(
            "animalProduction"
        );

    const typeElement =
        document.getElementById(
            "typeProduction"
        );

    const quantiteElement =
        document.getElementById(
            "quantiteProduction"
        );

    const uniteElement =
        document.getElementById(
            "uniteProduction"
        );

    const dateElement =
        document.getElementById(
            "dateProduction"
        );


    const animal =
        animalElement ?
        animalElement.value :
        "";

    const type =
        typeElement ?
        typeElement.value :
        "";

    const quantite =
        quantiteElement ?
        Number(quantiteElement.value) :
        0;

    const unite =
        uniteElement ?
        uniteElement.value :
        "Unité";

    const date =
        dateElement ?
        dateElement.value :
        obtenirDateAujourdHui();


    if (!animal) {

        alert("Veuillez sélectionner l'animal.");

        return;

    }


    if (!type) {

        alert("Veuillez indiquer le type de production.");

        return;

    }


    if (quantite <= 0) {

        alert(
            "La quantité produite doit être supérieure à zéro."
        );

        return;

    }


    const productions =
        obtenirProductions();


    productions.push({

        id:
            genererId("PROD"),

        animal:
            animal,

        type:
            type,

        quantite:
            quantite,

        unite:
            unite,

        date:
            date,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderProductions(productions);


    alert(
        "Production enregistrée avec succès."
    );


    window.location.reload();

}



/* =========================================================
   CHARGER PRODUCTIONS
========================================================= */

function chargerProductions() {

    const tableau =
        document.getElementById(
            "listeProductions"
        );


    if (!tableau) {

        return;

    }


    const productions =
        obtenirProductions();


    tableau.innerHTML = "";


    if (productions.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                colspan="7"
                class="text-center text-muted">

                    Aucune production enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    productions
        .slice()
        .reverse()
        .forEach(function (production) {

            tableau.innerHTML += `

                <tr>

                    <td>
                        ${production.date}
                    </td>

                    <td>
                        ${production.animal}
                    </td>

                    <td>
                        ${production.type}
                    </td>

                    <td>
                        ${formaterNombre(production.quantite)}
                    </td>

                    <td>
                        ${production.unite}
                    </td>

                    <td>
                        ${production.utilisateur}
                    </td>

                    <td>

                        <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerProduction('${production.id}')">

                            <i
                            class="fa-solid fa-trash">

                            </i>

                        </button>

                    </td>

                </tr>

            `;

        });

}



/* =========================================================
   SUPPRIMER PRODUCTION
========================================================= */

function supprimerProduction(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cette production ?"
        )
    ) {

        return;

    }


    let productions =
        obtenirProductions();


    productions =
        productions.filter(function (production) {

            return production.id !== id;

        });


    sauvegarderProductions(productions);


    chargerProductions();

}



/* =========================================================
   SANTÉ ANIMALE
========================================================= */

function obtenirSante() {

    return obtenirDonnees(
        "santeElevage"
    );

}


function sauvegarderSante(sante) {

    sauvegarderDonnees(
        "santeElevage",
        sante
    );

}


function ajouterSante(event) {

    if (event) {

        event.preventDefault();

    }


    const animal =
        document.getElementById(
            "animalSante"
        )?.value || "";

    const type =
        document.getElementById(
            "typeSoin"
        )?.value || "";

    const description =
        document.getElementById(
            "descriptionSante"
        )?.value || "";

    const traitement =
        document.getElementById(
            "traitementSante"
        )?.value || "";

    const quantite =
        Number(
            document.getElementById(
                "quantiteSante"
            )?.value
        ) || 0;

    const date =
        document.getElementById(
            "dateSante"
        )?.value ||
        obtenirDateAujourdHui();


    if (!animal || !type) {

        alert(
            "Veuillez sélectionner l'animal et le type d'intervention."
        );

        return;

    }


    const sante =
        obtenirSante();


    sante.push({

        id:
            genererId("SANTE"),

        animal:
            animal,

        type:
            type,

        description:
            description,

        traitement:
            traitement,

        quantite:
            quantite,

        date:
            date,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderSante(sante);


    alert(
        "Suivi sanitaire enregistré avec succès."
    );


    window.location.reload();

}



/* =========================================================
   CHARGER SANTÉ
========================================================= */

function chargerSante() {

    const tableau =
        document.getElementById(
            "listeSante"
        );


    if (!tableau) {

        return;

    }


    const sante =
        obtenirSante();


    tableau.innerHTML = "";


    if (sante.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                colspan="8"
                class="text-center text-muted">

                    Aucun suivi sanitaire enregistré.

                </td>

            </tr>

        `;

        return;

    }


    sante
        .slice()
        .reverse()
        .forEach(function (item) {

            let couleur =
                "success";


            if (item.type === "Maladie") {

                couleur =
                    "danger";

            }


            if (item.type === "Traitement") {

                couleur =
                    "warning";

            }


            tableau.innerHTML += `

                <tr>

                    <td>
                        ${item.date}
                    </td>

                    <td>
                        ${item.animal}
                    </td>

                    <td>

                        <span
                        class="badge bg-${couleur}">

                            ${item.type}

                        </span>

                    </td>

                    <td>
                        ${item.description || "-"}
                    </td>

                    <td>
                        ${item.traitement || "-"}
                    </td>

                    <td>
                        ${formaterNombre(item.quantite)}
                    </td>

                    <td>
                        ${item.utilisateur}
                    </td>

                    <td>

                        <button
                        class="btn btn-sm btn-danger"
                        onclick="supprimerSante('${item.id}')">

                            <i
                            class="fa-solid fa-trash">

                            </i>

                        </button>

                    </td>

                </tr>

            `;

        });

}



/* =========================================================
   SUPPRIMER SANTÉ
========================================================= */

function supprimerSante(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cet enregistrement ?"
        )
    ) {

        return;

    }


    let sante =
        obtenirSante();


    sante =
        sante.filter(function (item) {

            return item.id !== id;

        });


    sauvegarderSante(sante);


    chargerSante();

}



/* =========================================================
   ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return obtenirDonnees(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(alimentation) {

    sauvegarderDonnees(
        "alimentationElevage",
        alimentation
    );

}



/* =========================================================
   CHARGER LES LOTS DANS ALIMENTATION
========================================================= */

function chargerLotsAlimentation() {

    const select =
        document.getElementById(
            "alimentLot"
        );


    if (!select) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    animaux.forEach(function (animal) {

        select.innerHTML += `

            <option value="${animal.id}">

                ${animal.type}
                -
                ${animal.race}
                (${animal.quantite})

            </option>

        `;

    });

}



/* =========================================================
   ENREGISTRER ALIMENTATION
========================================================= */

function enregistrerAlimentation() {

    const date =
        document.getElementById(
            "alimentDate"
        )?.value ||
        obtenirDateAujourdHui();


    const lot =
        document.getElementById(
            "alimentLot"
        )?.value || "";


    const produit =
        document.getElementById(
            "alimentProduit"
        )?.value.trim() || "";


    const quantite =
        Number(
            document.getElementById(
                "alimentQuantite"
            )?.value
        );


    const unite =
        document.getElementById(
            "alimentUnite"
        )?.value || "Kg";


    const notes =
        document.getElementById(
            "alimentNotes"
        )?.value.trim() || "";


    if (!lot) {

        alert(
            "Veuillez sélectionner un lot."
        );

        return;

    }


    if (!produit) {

        alert(
            "Veuillez indiquer le nom de l'aliment."
        );

        return;

    }


    if (!quantite || quantite <= 0) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;

    }


    const animaux =
        obtenirAnimaux();


    const animal =
        animaux.find(function (item) {

            return item.id === lot;

        });


    const alimentation =
        obtenirAlimentation();


    alimentation.push({

        id:
            genererId("ALIM"),

        date:
            date,

        lot:
            lot,

        lotNom:
            animal ?
            `${animal.type} - ${animal.race}` :
            lot,

        produit:
            produit,

        quantite:
            quantite,

        unite:
            unite,

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderAlimentation(
        alimentation
    );


    alert(
        "Consommation enregistrée avec succès."
    );


    window.location.reload();

}



/* =========================================================
   CHARGER ALIMENTATION
========================================================= */

function chargerAlimentation() {

    const tableau =
        document.getElementById(
            "listeAlimentation"
        );


    const alimentation =
        obtenirAlimentation();


    if (tableau) {

        tableau.innerHTML = "";


        if (alimentation.length === 0) {

            tableau.innerHTML = `

                <tr>

                    <td
                    colspan="7"
                    class="text-center text-muted">

                        Aucune consommation enregistrée.

                    </td>

                </tr>

            `;

        } else {

            alimentation
                .slice()
                .reverse()
                .forEach(function (item) {

                    tableau.innerHTML += `

                        <tr>

                            <td>
                                ${item.date}
                            </td>

                            <td>
                                ${item.lotNom}
                            </td>

                            <td>
                                ${item.produit}
                            </td>

                            <td>
                                ${formaterNombre(item.quantite)}
                            </td>

                            <td>
                                ${item.unite}
                            </td>

                            <td>
                                ${item.notes || "-"}
                            </td>

                            <td>

                                <button
                                class="btn btn-sm btn-danger"
                                onclick="supprimerAlimentation('${item.id}')">

                                    <i
                                    class="fa-solid fa-trash">

                                    </i>

                                </button>

                            </td>

                        </tr>

                    `;

                });

        }

    }


    chargerStatistiquesAlimentation();

}



/* =========================================================
   STATISTIQUES ALIMENTATION
========================================================= */

function chargerStatistiquesAlimentation() {

    const alimentation =
        obtenirAlimentation();


    const aujourdHui =
        obtenirDateAujourdHui();


    const moisActuel =
        aujourdHui.substring(0, 7);


    let consommationJour =
        0;

    let consommationMois =
        0;

    let consommationTotale =
        0;


    const lots =
        new Set();


    alimentation.forEach(function (item) {

        const quantite =
            Number(item.quantite) || 0;


        consommationTotale +=
            quantite;


        lots.add(item.lot);


        if (
            item.date === aujourdHui
        ) {

            consommationJour +=
                quantite;

        }


        if (
            item.date &&
            item.date.substring(0, 7) === moisActuel
        ) {

            consommationMois +=
                quantite;

        }

    });


    const elementJour =
        document.getElementById(
            "alimentJour"
        );

    const elementMois =
        document.getElementById(
            "alimentMois"
        );

    const elementTotal =
        document.getElementById(
            "alimentTotal"
        );

    const elementLots =
        document.getElementById(
            "lotsNourris"
        );


    if (elementJour) {

        elementJour.textContent =
            formaterNombre(consommationJour);

    }


    if (elementMois) {

        elementMois.textContent =
            formaterNombre(consommationMois);

    }


    if (elementTotal) {

        elementTotal.textContent =
            formaterNombre(consommationTotale);

    }


    if (elementLots) {

        elementLots.textContent =
            lots.size;

    }

}



/* =========================================================
   SUPPRIMER ALIMENTATION
========================================================= */

function supprimerAlimentation(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cette consommation ?"
        )
    ) {

        return;

    }


    let alimentation =
        obtenirAlimentation();


    alimentation =
        alimentation.filter(function (item) {

            return item.id !== id;

        });


    sauvegarderAlimentation(
        alimentation
    );


    chargerAlimentation();

}



/* =========================================================
   REPRODUCTION
========================================================= */

function obtenirReproduction() {

    return obtenirDonnees(
        "reproductionElevage"
    );

}


function sauvegarderReproduction(reproduction) {

    sauvegarderDonnees(
        "reproductionElevage",
        reproduction
    );

}



/* =========================================================
   CHARGER LOTS REPRODUCTION
========================================================= */

function chargerLotsReproduction() {

    const select =
        document.getElementById(
            "reproductionLot"
        );


    if (!select) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    animaux.forEach(function (animal) {

        select.innerHTML += `

            <option value="${animal.id}">

                ${animal.type}
                -
                ${animal.race}

            </option>

        `;

    });

}



/* =========================================================
   ENREGISTRER REPRODUCTION
========================================================= */

function enregistrerReproduction() {

    const lot =
        document.getElementById(
            "reproductionLot"
        )?.value || "";


    const type =
        document.getElementById(
            "reproductionType"
        )?.value.trim() || "";


    const date =
        document.getElementById(
            "reproductionDate"
        )?.value ||
        obtenirDateAujourdHui();


    const datePrevue =
        document.getElementById(
            "reproductionDatePrevue"
        )?.value || "";


    const oeufs =
        Number(
            document.getElementById(
                "reproductionOeufs"
            )?.value
        );


    const couveuse =
        document.getElementById(
            "reproductionCouveuse"
        )?.value.trim() || "";


    const statut =
        document.getElementById(
            "reproductionStatut"
        )?.value ||
        "En incubation";


    const notes =
        document.getElementById(
            "reproductionNotes"
        )?.value.trim() || "";


    if (!lot) {

        alert(
            "Veuillez sélectionner un lot parent."
        );

        return;

    }


    if (!type) {

        alert(
            "Veuillez indiquer le type d'œufs."
        );

        return;

    }


    if (!datePrevue) {

        alert(
            "Veuillez indiquer la date prévue d'éclosion."
        );

        return;

    }


    if (!oeufs || oeufs <= 0) {

        alert(
            "Le nombre d'œufs doit être supérieur à zéro."
        );

        return;

    }


    const animaux =
        obtenirAnimaux();


    const animal =
        animaux.find(function (item) {

            return item.id === lot;

        });


    const reproduction =
        obtenirReproduction();


    reproduction.push({

        id:
            genererId("INC"),

        lot:
            lot,

        lotNom:
            animal ?
            `${animal.type} - ${animal.race}` :
            lot,

        type:
            type,

        date:
            date,

        datePrevue:
            datePrevue,

        oeufs:
            oeufs,

        eclos:
            0,

        couveuse:
            couveuse,

        statut:
            statut,

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderReproduction(
        reproduction
    );


    alert(
        "Incubation enregistrée avec succès."
    );


    window.location.reload();

}



/* =========================================================
   CHARGER REPRODUCTION
========================================================= */

function chargerReproduction() {

    const tableau =
        document.getElementById(
            "listeReproduction"
        );


    const reproduction =
        obtenirReproduction();


    if (tableau) {

        tableau.innerHTML = "";


        if (reproduction.length === 0) {

            tableau.innerHTML = `

                <tr>

                    <td
                    colspan="9"
                    class="text-center text-muted">

                        Aucune incubation enregistrée.

                    </td>

                </tr>

            `;

        } else {

            reproduction
                .slice()
                .reverse()
                .forEach(function (item) {

                    let couleur =
                        "warning";


                    if (
                        item.statut === "Terminé"
                    ) {

                        couleur =
                            "success";

                    }


                    tableau.innerHTML += `

                        <tr>

                            <td>
                                ${item.id}
                            </td>

                            <td>
                                ${item.lotNom}
                            </td>

                            <td>
                                ${item.type}
                            </td>

                            <td>
                                ${item.date}
                            </td>

                            <td>
                                ${item.datePrevue}
                            </td>

                            <td>
                                ${formaterNombre(item.oeufs)}
                            </td>

                            <td>
                                ${formaterNombre(item.eclos)}
                            </td>

                            <td>

                                <span
                                class="badge bg-${couleur}">

                                    ${item.statut}

                                </span>

                            </td>

                            <td>

                                <button
                                class="btn btn-sm btn-primary"
                                onclick="enregistrerEclosion('${item.id}')">

                                    <i
                                    class="fa-solid fa-feather">

                                    </i>

                                </button>


                                <button
                                class="btn btn-sm btn-danger"
                                onclick="supprimerReproduction('${item.id}')">

                                    <i
                                    class="fa-solid fa-trash">

                                    </i>

                                </button>

                            </td>

                        </tr>

                    `;

                });

        }

    }


    chargerStatistiquesReproduction();

}



/* =========================================================
   ENREGISTRER ÉCLOSION
========================================================= */

function enregistrerEclosion(id) {

    let reproduction =
        obtenirReproduction();


    const index =
        reproduction.findIndex(function (item) {

            return item.id === id;

        });


    if (index === -1) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    const resultat =
        prompt(
            "Combien d'animaux ont éclos ?",
            reproduction[index].eclos || 0
        );


    if (resultat === null) {

        return;

    }


    const eclos =
        Number(resultat);


    if (
        isNaN(eclos) ||
        eclos < 0 ||
        eclos > Number(reproduction[index].oeufs)
    ) {

        alert(
            "Veuillez entrer une quantité valide."
        );

        return;

    }


    reproduction[index].eclos =
        eclos;


    reproduction[index].statut =
        "Terminé";


    sauvegarderReproduction(
        reproduction
    );


    chargerReproduction();

}



/* =========================================================
   SUPPRIMER REPRODUCTION
========================================================= */

function supprimerReproduction(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cette incubation ?"
        )
    ) {

        return;

    }


    let reproduction =
        obtenirReproduction();


    reproduction =
        reproduction.filter(function (item) {

            return item.id !== id;

        });


    sauvegarderReproduction(
        reproduction
    );


    chargerReproduction();

}



/* =========================================================
   STATISTIQUES REPRODUCTION
========================================================= */

function chargerStatistiquesReproduction() {

    const reproduction =
        obtenirReproduction();


    let oeufsActifs =
        0;

    let incubationsActives =
        0;

    let totalEclos =
        0;

    let totalOeufsTermines =
        0;


    reproduction.forEach(function (item) {

        if (
            item.statut === "En incubation"
        ) {

            oeufsActifs +=
                Number(item.oeufs) || 0;

            incubationsActives++;

        }


        totalEclos +=
            Number(item.eclos) || 0;


        if (
            item.statut === "Terminé"
        ) {

            totalOeufsTermines +=
                Number(item.oeufs) || 0;

        }

    });


    let taux =
        0;


    if (
        totalOeufsTermines > 0
    ) {

        taux =
            (
                totalEclos /
                totalOeufsTermines
            ) * 100;

    }


    const oeufsElement =
        document.getElementById(
            "oeufsIncubation"
        );

    const incubationElement =
        document.getElementById(
            "incubationsActives"
        );

    const eclosElement =
        document.getElementById(
            "totalEclosions"
        );

    const tauxElement =
        document.getElementById(
            "tauxEclosion"
        );


    if (oeufsElement) {

        oeufsElement.textContent =
            formaterNombre(oeufsActifs);

    }


    if (incubationElement) {

        incubationElement.textContent =
            incubationsActives;

    }


    if (eclosElement) {

        eclosElement.textContent =
            formaterNombre(totalEclos);

    }


    if (tauxElement) {

        tauxElement.textContent =
            taux.toFixed(1) + " %";

    }

}



/* =========================================================
   CROISSANCE
========================================================= */

function obtenirCroissance() {

    return obtenirDonnees(
        "croissanceElevage"
    );

}


function sauvegarderCroissance(croissance) {

    sauvegarderDonnees(
        "croissanceElevage",
        croissance
    );

}



/* =========================================================
   CHARGER LOTS CROISSANCE
========================================================= */

function chargerLotsCroissance() {

    const select =
        document.getElementById(
            "croissanceLot"
        );


    if (!select) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    select.innerHTML = `

        <option value="">

            Sélectionner un lot

        </option>

    `;


    animaux.forEach(function (animal) {

        select.innerHTML += `

            <option value="${animal.id}">

                ${animal.type}
                -
                ${animal.race}

            </option>

        `;

    });

}



/* =========================================================
   ENREGISTRER CROISSANCE
========================================================= */

function enregistrerCroissance() {

    const date =
        document.getElementById(
            "croissanceDate"
        )?.value ||
        obtenirDateAujourdHui();


    const lot =
        document.getElementById(
            "croissanceLot"
        )?.value || "";


    const nombre =
        Number(
            document.getElementById(
                "croissanceNombre"
            )?.value
        );


    const poids =
        Number(
            document.getElementById(
                "croissancePoids"
            )?.value
        );


    const notes =
        document.getElementById(
            "croissanceNotes"
        )?.value.trim() || "";


    if (!lot) {

        alert(
            "Veuillez sélectionner un lot."
        );

        return;

    }


    if (!nombre || nombre <= 0) {

        alert(
            "Le nombre d'animaux doit être supérieur à zéro."
        );

        return;

    }


    if (!poids || poids <= 0) {

        alert(
            "Le poids doit être supérieur à zéro."
        );

        return;

    }


    const animaux =
        obtenirAnimaux();


    const animal =
        animaux.find(function (item) {

            return item.id === lot;

        });


    const poidsMoyen =
        poids / nombre;


    const croissance =
        obtenirCroissance();


    croissance.push({

        id:
            genererId("CROI"),

        date:
            date,

        lot:
            lot,

        lotNom:
            animal ?
            `${animal.type} - ${animal.race}` :
            lot,

        nombre:
            nombre,

        poids:
            poids,

        poidsMoyen:
            poidsMoyen,

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur()

    });


    sauvegarderCroissance(
        croissance
    );


    alert(
        "Mesure de croissance enregistrée avec succès."
    );


    window.location.reload();

}



/* =========================================================
   CHARGER CROISSANCE
========================================================= */

function chargerCroissance() {

    const tableau =
        document.getElementById(
            "listeCroissance"
        );


    const croissance =
        obtenirCroissance();


    if (tableau) {

        tableau.innerHTML = "";


        if (croissance.length === 0) {

            tableau.innerHTML = `

                <tr>

                    <td
                    colspan="7"
                    class="text-center text-muted">

                        Aucune mesure enregistrée.

                    </td>

                </tr>

            `;

        } else {

            croissance
                .slice()
                .reverse()
                .forEach(function (item) {

                    tableau.innerHTML += `

                        <tr>

                            <td>
                                ${item.date}
                            </td>

                            <td>
                                ${item.lotNom}
                            </td>

                            <td>
                                ${formaterNombre(item.nombre)}
                            </td>

                            <td>
                                ${Number(item.poids).toFixed(2)} Kg
                            </td>

                            <td>
                                ${Number(item.poidsMoyen).toFixed(3)} Kg
                            </td>

                            <td>
                                ${item.notes || "-"}
                            </td>

                            <td>

                                <button
                                class="btn btn-sm btn-danger"
                                onclick="supprimerCroissance('${item.id}')">

                                    <i
                                    class="fa-solid fa-trash">

                                    </i>

                                </button>

                            </td>

                        </tr>

                    `;

                });

        }

    }


    chargerStatistiquesCroissance();

}



/* =========================================================
   STATISTIQUES CROISSANCE
========================================================= */

function chargerStatistiquesCroissance() {

    const croissance =
        obtenirCroissance();


    const lots =
        new Set();


    let totalPoidsMoyen =
        0;


    croissance.forEach(function (item) {

        lots.add(item.lot);

        totalPoidsMoyen +=
            Number(item.poidsMoyen) || 0;

    });


    const moyenne =
        croissance.length > 0 ?
        totalPoidsMoyen / croissance.length :
        0;


    const poidsElement =
        document.getElementById(
            "poidsMoyenGeneral"
        );

    const lotsElement =
        document.getElementById(
            "lotsMesures"
        );

    const mesuresElement =
        document.getElementById(
            "nombreMesures"
        );


    if (poidsElement) {

        poidsElement.textContent =
            moyenne.toFixed(3) + " Kg";

    }


    if (lotsElement) {

        lotsElement.textContent =
            lots.size;

    }


    if (mesuresElement) {

        mesuresElement.textContent =
            croissance.length;

    }

}



/* =========================================================
   SUPPRIMER CROISSANCE
========================================================= */

function supprimerCroissance(id) {

    if (
        !confirm(
            "Voulez-vous supprimer cette mesure ?"
        )
    ) {

        return;

    }


    let croissance =
        obtenirCroissance();


    croissance =
        croissance.filter(function (item) {

            return item.id !== id;

        });


    sauvegarderCroissance(
        croissance
    );


    chargerCroissance();

}



/* =========================================================
   TABLEAU DE BORD ÉLEVAGE
========================================================= */

function chargerDashboardElevage() {

    const animaux =
        obtenirAnimaux();

    const productions =
        obtenirProductions();

    const sante =
        obtenirSante();


    const aujourdHui =
        obtenirDateAujourdHui();


    let totalAnimaux =
        0;


    animaux.forEach(function (animal) {

        if (
            animal.statut !== "Vendu"
        ) {

            totalAnimaux +=
                Number(animal.quantite) || 0;

        }

    });


    const animauxMalades =
        animaux
            .filter(function (animal) {

                return animal.statut === "Malade";

            })
            .reduce(function (total, animal) {

                return (
                    total +
                    (Number(animal.quantite) || 0)
                );

            }, 0);


    const productionJour =
        productions
            .filter(function (production) {

                return (
                    production.date === aujourdHui
                );

            })
            .reduce(function (total, production) {

                return (
                    total +
                    (Number(production.quantite) || 0)
                );

            }, 0);


    const totalElement =
        document.getElementById(
            "totalAnimaux"
        );

    const maladeElement =
        document.getElementById(
            "animauxMalades"
        );

    const productionElement =
        document.getElementById(
            "productionJour"
        );

    const suiviElement =
        document.getElementById(
            "nbSuiviSante"
        );


    if (totalElement) {

        totalElement.textContent =
            formaterNombre(totalAnimaux);

    }


    if (maladeElement) {

        maladeElement.textContent =
            formaterNombre(animauxMalades);

    }


    if (productionElement) {

        productionElement.textContent =
            formaterNombre(productionJour);

    }


    if (suiviElement) {

        suiviElement.textContent =
            sante.length;

    }

}



/* =========================================================
   SUIVI GÉNÉRAL ÉLEVAGE
========================================================= */

function chargerSuiviElevage() {

    const animaux =
        obtenirAnimaux();

    const productions =
        obtenirProductions();

    const alimentation =
        obtenirAlimentation();

    const sante =
        obtenirSante();


    let totalAnimaux =
        0;


    animaux.forEach(function (animal) {

        totalAnimaux +=
            Number(animal.quantite) || 0;

    });


    let productionTotale =
        0;


    productions.forEach(function (production) {

        productionTotale +=
            Number(production.quantite) || 0;

    });


    let mortalite =
        0;


    /*
       Les mortalités seront comptées si un
       enregistrement de santé contient le
       type "Mortalité".
    */

    sante.forEach(function (item) {

        if (
            item.type === "Mortalité"
        ) {

            mortalite +=
                Number(item.quantite) || 0;

        }

    });


    let alimentationTotale =
        0;


    alimentation.forEach(function (item) {

        if (
            item.unite === "Kg"
        ) {

            alimentationTotale +=
                Number(item.quantite) || 0;

        }

    });


    const suiviAnimaux =
        document.getElementById(
            "suiviAnimaux"
        );

    const suiviProduction =
        document.getElementById(
            "suiviProduction"
        );

    const suiviMortalite =
        document.getElementById(
            "suiviMortalite"
        );

    const suiviAlimentation =
        document.getElementById(
            "suiviAlimentation"
        );


    if (suiviAnimaux) {

        suiviAnimaux.textContent =
            formaterNombre(totalAnimaux);

    }


    if (suiviProduction) {

        suiviProduction.textContent =
            formaterNombre(productionTotale);

    }


    if (suiviMortalite) {

        suiviMortalite.textContent =
            formaterNombre(mortalite);

    }


    if (suiviAlimentation) {

        suiviAlimentation.textContent =
            formaterNombre(alimentationTotale)
            + " Kg";

    }


    chargerResumeLotsSuivi(
        animaux,
        productions,
        alimentation
    );


    chargerActivitesRecentes();

}



/* =========================================================
   RÉSUMÉ DES LOTS
========================================================= */

function chargerResumeLotsSuivi(
    animaux,
    productions,
    alimentation
) {

    const tableau =
        document.getElementById(
            "listeSuiviLots"
        );


    if (!tableau) {

        return;

    }


    tableau.innerHTML = "";


    if (animaux.length === 0) {

        tableau.innerHTML = `

            <tr>

                <td
                colspan="7"
                class="text-center text-muted">

                    Aucun lot enregistré.

                </td>

            </tr>

        `;

        return;

    }


    animaux.forEach(function (animal) {

        const productionLot =
            productions
                .filter(function (production) {

                    return (
                        production.animal === animal.id ||
                        production.animal === animal.type
                    );

                })
                .reduce(function (total, production) {

                    return (
                        total +
                        (Number(production.quantite) || 0)
                    );

                }, 0);


        const alimentationLot =
            alimentation
                .filter(function (item) {

                    return item.lot === animal.id;

                })
                .reduce(function (total, item) {

                    if (
                        item.unite === "Kg"
                    ) {

                        return (
                            total +
                            (Number(item.quantite) || 0)
                        );

                    }

                    return total;

                }, 0);


        tableau.innerHTML += `

            <tr>

                <td>
                    ${animal.type}
                    -
                    ${animal.race}
                </td>

                <td>
                    ${animal.type}
                </td>

                <td>
                    ${formaterNombre(
                        animal.quantiteInitiale ||
                        animal.quantite
                    )}
                </td>

                <td>
                    ${formaterNombre(
                        animal.quantite
                    )}
                </td>

                <td>
                    ${formaterNombre(
                        productionLot
                    )}
                </td>

                <td>
                    ${formaterNombre(
                        alimentationLot
                    )} Kg
                </td>

                <td>

                    <span
                    class="badge bg-success">

                        ${animal.statut}

                    </span>

                </td>

            </tr>

        `;

    });

}



/* =========================================================
   ACTIVITÉS RÉCENTES
========================================================= */

function chargerActivitesRecentes() {

    const conteneur =
        document.getElementById(
            "listeActivites"
        );


    if (!conteneur) {

        return;

    }


    const activites =
        [];


    obtenirAnimaux().forEach(function (item) {

        activites.push({

            date:
                item.date,

            texte:
                `${item.quantite} ${item.type} ajoutés`

        });

    });


    obtenirProductions().forEach(function (item) {

        activites.push({

            date:
                item.date,

            texte:
                `Production : ${item.quantite} ${item.unite} de ${item.type}`

        });

    });


    obtenirAlimentation().forEach(function (item) {

        activites.push({

            date:
                item.date,

            texte:
                `Alimentation : ${item.quantite} ${item.unite} de ${item.produit}`

        });

    });


    obtenirSante().forEach(function (item) {

        activites.push({

            date:
                item.date,

            texte:
                `Santé : ${item.type} - ${item.animal}`

        });

    });


    activites.sort(function (a, b) {

        return (
            new Date(b.date) -
            new Date(a.date)
        );

    });


    conteneur.innerHTML = "";


    if (activites.length === 0) {

        conteneur.innerHTML = `

            <div
            class="text-center text-muted">

                Aucune activité enregistrée.

            </div>

        `;

        return;

    }


    activites
        .slice(0, 10)
        .forEach(function (activite) {

            conteneur.innerHTML += `

                <div
                class="list-group-item
                d-flex
                justify-content-between
                align-items-center">

                    <span>

                        ${activite.texte}

                    </span>

                    <small
                    class="text-muted">

                        ${activite.date}

                    </small>

                </div>

            `;

        });

}



/* =========================================================
   INITIALISATION AUTOMATIQUE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        chargerAnimaux();

        chargerProductions();

        chargerSante();

        chargerAlimentation();

        chargerReproduction();

        chargerCroissance();

        chargerDashboardElevage();

        chargerSuiviElevage();

    }
);

/* =========================================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   GESTION INCUBATION + POUSSINIÈRE
   ========================================================= */


/* =========================================================
   OUTILS GÉNÉRAUX
   ========================================================= */

function getDataLocale(cle) {

    try {

        return JSON.parse(localStorage.getItem(cle)) || [];

    } catch (erreur) {

        console.error("Erreur lecture localStorage :", cle, erreur);

        return [];

    }

}


function sauvegarderDataLocale(cle, donnees) {

    localStorage.setItem(
        cle,
        JSON.stringify(donnees)
    );

}


function genererId(prefixe, donnees) {

    const annee = new Date().getFullYear();

    const numero = String(
        donnees.length + 1
    ).padStart(3, "0");

    return `${prefixe}-${annee}-${numero}`;

}


function obtenirDateAujourdhui() {

    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();

    const mois = String(
        aujourdHui.getMonth() + 1
    ).padStart(2, "0");

    const jour = String(
        aujourdHui.getDate()
    ).padStart(2, "0");

    return `${annee}-${mois}-${jour}`;

}


function formaterDate(date) {

    if (!date) {

        return "";

    }

    const parties = date.split("-");

    if (parties.length !== 3) {

        return date;

    }

    return `${parties[2]}/${parties[1]}/${parties[0]}`;

}


/* =========================================================
   INCUBATION
   ========================================================= */


/* -----------------------------------------
   OUVRIR LE FORMULAIRE
----------------------------------------- */

function ouvrirFormulaireIncubation() {

    const modal = document.getElementById(
        "modalIncubation"
    );

    if (!modal) return;

    modal.style.display = "flex";

    const champDate = document.getElementById(
        "incubationDate"
    );

    if (champDate && !champDate.value) {

        champDate.value =
            obtenirDateAujourdhui();

    }

}


/* -----------------------------------------
   FERMER LE FORMULAIRE
----------------------------------------- */

function fermerFormulaireIncubation() {

    const modal = document.getElementById(
        "modalIncubation"
    );

    if (!modal) return;

    modal.style.display = "none";

}


/* -----------------------------------------
   CALCUL DATE D'ÉCLOSION
----------------------------------------- */

function calculerDateEclosion(
    dateEntree,
    duree
) {

    if (!dateEntree || !duree) {

        return "";

    }

    const date = new Date(
        `${dateEntree}T00:00:00`
    );

    date.setDate(
        date.getDate() + Number(duree)
    );

    const annee = date.getFullYear();

    const mois = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const jour = String(
        date.getDate()
    ).padStart(2, "0");

    return `${annee}-${mois}-${jour}`;

}


/* -----------------------------------------
   ENREGISTRER UNE INCUBATION
----------------------------------------- */

function enregistrerIncubation(event) {

    event.preventDefault();


    const espece = document.getElementById(
        "incubationEspece"
    ).value.trim();


    const lot = document.getElementById(
        "incubationLot"
    ).value.trim();


    const couveuse = document.getElementById(
        "incubationCouveuse"
    ).value;


    const oeufs = Number(
        document.getElementById(
            "incubationOeufs"
        ).value
    );


    const dateEntree = document.getElementById(
        "incubationDate"
    ).value;


    const duree = Number(
        document.getElementById(
            "incubationDuree"
        ).value
    );


    if (
        !espece ||
        !lot ||
        !couveuse ||
        oeufs <= 0 ||
        !dateEntree ||
        duree <= 0
    ) {

        alert(
            "Veuillez remplir correctement tous les champs."
        );

        return;

    }


    const incubations = getDataLocale(
        "incubations"
    );


    const dateEclosion =
        calculerDateEclosion(
            dateEntree,
            duree
        );


    const nouvelleIncubation = {

        id: genererId(
            "INC",
            incubations
        ),

        espece: espece,

        lot: lot,

        couveuse: couveuse,

        oeufsInitial: oeufs,

        oeufsRetires: 0,

        oeufsNonFecondes: 0,

        embryonsMorts: 0,

        poussinsEclos: 0,

        dateEntree: dateEntree,

        duree: duree,

        dateEclosion: dateEclosion,

        statut: "En incubation",

        brooderCree: false,

        dateCreation: new Date().toISOString()

    };


    incubations.push(
        nouvelleIncubation
    );


    sauvegarderDataLocale(
        "incubations",
        incubations
    );


    alert(
        `Incubation ${nouvelleIncubation.id} créée avec succès.`
    );


    document.getElementById(
        "formIncubation"
    ).reset();


    fermerFormulaireIncubation();


    chargerIncubations();

}


/* -----------------------------------------
   CHARGER LES INCUBATIONS
----------------------------------------- */

function chargerIncubations() {

    const tableau = document.getElementById(
        "listeIncubations"
    );


    if (!tableau) {

        return;

    }


    const incubations = getDataLocale(
        "incubations"
    );


    tableau.innerHTML = "";


    incubations.forEach(function (incubation) {

        let badgeStatut = "bg-success";


        if (
            incubation.statut === "Terminée"
        ) {

            badgeStatut = "bg-secondary";

        }


        if (
            incubation.statut === "Éclosion"
        ) {

            badgeStatut = "bg-warning text-dark";

        }


        const ligne = document.createElement(
            "tr"
        );


        ligne.innerHTML = `

            <td>${incubation.id}</td>

            <td>${incubation.espece}</td>

            <td>${incubation.lot}</td>

            <td>${incubation.couveuse}</td>

            <td>${incubation.oeufsInitial}</td>

            <td>
                ${formaterDate(
                    incubation.dateEntree
                )}
            </td>

            <td>
                ${formaterDate(
                    incubation.dateEclosion
                )}
            </td>

            <td>

                <span class="badge ${badgeStatut}">

                    ${incubation.statut}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-sm btn-primary"
                    onclick="ouvrirSuiviIncubation('${incubation.id}')">

                    <i class="fa-solid fa-clipboard-check"></i>

                    Suivi

                </button>

            </td>

        `;


        tableau.appendChild(
            ligne
        );

    });


    mettreAJourStatistiquesIncubation();

}


/* -----------------------------------------
   STATISTIQUES INCUBATION
----------------------------------------- */

function mettreAJourStatistiquesIncubation() {

    const incubations = getDataLocale(
        "incubations"
    );


    const actives = incubations.filter(
        function (incubation) {

            return incubation.statut !== "Terminée";

        }
    );


    const totalOeufs =
        actives.reduce(
            function (total, incubation) {

                return (
                    total +
                    Number(
                        incubation.oeufsInitial || 0
                    )
                );

            },
            0
        );


    const aujourdHui =
        obtenirDateAujourdhui();


    const eclosionsPrevues =
        incubations.filter(
            function (incubation) {

                return (
                    incubation.dateEclosion === aujourdHui &&
                    incubation.statut !== "Terminée"
                );

            }
        ).length;


    const totalPoussins =
        incubations.reduce(
            function (total, incubation) {

                return (
                    total +
                    Number(
                        incubation.poussinsEclos || 0
                    )
                );

            },
            0
        );


    const elementActives =
        document.getElementById(
            "incubationsActives"
        );


    const elementOeufs =
        document.getElementById(
            "oeufsIncubation"
        );


    const elementPrevues =
        document.getElementById(
            "eclosionsPrevues"
        );


    const elementPoussins =
        document.getElementById(
            "poussinsEclos"
        );


    if (elementActives) {

        elementActives.textContent =
            actives.length;

    }


    if (elementOeufs) {

        elementOeufs.textContent =
            totalOeufs;

    }


    if (elementPrevues) {

        elementPrevues.textContent =
            eclosionsPrevues;

    }


    if (elementPoussins) {

        elementPoussins.textContent =
            totalPoussins;

    }

}


/* -----------------------------------------
   OUVRIR LE SUIVI D'UNE INCUBATION
----------------------------------------- */

function ouvrirSuiviIncubation(id) {

    const incubations = getDataLocale(
        "incubations"
    );


    const incubation =
        incubations.find(
            function (element) {

                return element.id === id;

            }
        );


    if (!incubation) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    document.getElementById(
        "suiviIncubationId"
    ).value = incubation.id;


    document.getElementById(
        "oeufsRetires"
    ).value =
        incubation.oeufsRetires || 0;


    document.getElementById(
        "oeufsNonFecondes"
    ).value =
        incubation.oeufsNonFecondes || 0;


    document.getElementById(
        "embryonsMorts"
    ).value =
        incubation.embryonsMorts || 0;


    document.getElementById(
        "poussinsEclosInput"
    ).value =
        incubation.poussinsEclos || 0;


    const modal =
        document.getElementById(
            "modalSuiviIncubation"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


/* -----------------------------------------
   FERMER LE SUIVI
----------------------------------------- */

function fermerSuiviIncubation() {

    const modal =
        document.getElementById(
            "modalSuiviIncubation"
        );


    if (!modal) return;


    modal.style.display = "none";

}


/* -----------------------------------------
   ENREGISTRER LE SUIVI
----------------------------------------- */

function enregistrerSuiviIncubation(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "suiviIncubationId"
        ).value;


    const oeufsRetires =
        Number(
            document.getElementById(
                "oeufsRetires"
            ).value
        );


    const oeufsNonFecondes =
        Number(
            document.getElementById(
                "oeufsNonFecondes"
            ).value
        );


    const embryonsMorts =
        Number(
            document.getElementById(
                "embryonsMorts"
            ).value
        );


    const poussinsEclos =
        Number(
            document.getElementById(
                "poussinsEclosInput"
            ).value
        );


    const incubations =
        getDataLocale(
            "incubations"
        );


    const index =
        incubations.findIndex(
            function (element) {

                return element.id === id;

            }
        );


    if (index === -1) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    const incubation =
        incubations[index];


    const totalSorties =
        oeufsRetires +
        oeufsNonFecondes +
        embryonsMorts +
        poussinsEclos;


    if (
        totalSorties >
        Number(incubation.oeufsInitial)
    ) {

        alert(
            "Erreur : le total des œufs retirés, non fécondés, morts et poussins éclos dépasse le nombre initial d'œufs."
        );

        return;

    }


    incubation.oeufsRetires =
        oeufsRetires;


    incubation.oeufsNonFecondes =
        oeufsNonFecondes;


    incubation.embryonsMorts =
        embryonsMorts;


    incubation.poussinsEclos =
        poussinsEclos;


    if (poussinsEclos > 0) {

        incubation.statut =
            "Éclosion";

    }


    if (
        totalSorties ===
        Number(incubation.oeufsInitial)
    ) {

        incubation.statut =
            "Terminée";

    }


    incubations[index] =
        incubation;


    sauvegarderDataLocale(
        "incubations",
        incubations
    );


    fermerSuiviIncubation();


    chargerIncubations();


    alert(
        "Suivi de l'incubation enregistré avec succès."
    );

}


/* =========================================================
   POUSSINIÈRE / BROODER
   ========================================================= */


/* -----------------------------------------
   OUVRIR FORMULAIRE
----------------------------------------- */

function ouvrirFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) return;


    modal.style.display = "flex";


    const date =
        document.getElementById(
            "brooderDate"
        );


    if (date && !date.value) {

        date.value =
            obtenirDateAujourdhui();

    }

}


/* -----------------------------------------
   FERMER FORMULAIRE
----------------------------------------- */

function fermerFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) return;


    modal.style.display = "none";

}


/* -----------------------------------------
   CRÉER LOT POUSSINIÈRE
----------------------------------------- */

function enregistrerPoussiniere(event) {

    event.preventDefault();


    const espece =
        document.getElementById(
            "brooderEspece"
        ).value;


    const origine =
        document.getElementById(
            "brooderOrigine"
        ).value.trim();


    const nombre =
        Number(
            document.getElementById(
                "brooderNombre"
            ).value
        );


    const dateEntree =
        document.getElementById(
            "brooderDate"
        ).value;


    const emplacement =
        document.getElementById(
            "brooderEmplacement"
        ).value;


    const temperature =
        Number(
            document.getElementById(
                "brooderTemperature"
            ).value || 0
        );


    if (
        !espece ||
        !origine ||
        nombre <= 0 ||
        !dateEntree ||
        !emplacement
    ) {

        alert(
            "Veuillez remplir correctement tous les champs."
        );

        return;

    }


    const poussiniere =
        getDataLocale(
            "poussiniere"
        );


    const nouveauLot = {

        id: genererId(
            "BRD",
            poussiniere
        ),

        espece: espece,

        origine: origine,

        emplacement: emplacement,

        dateEntree: dateEntree,

        nombreInitial: nombre,

        presents: nombre,

        mortalite: 0,

        transferes: 0,

        temperature: temperature,

        alimentTotal: 0,

        statut: "Actif",

        suivi: [],

        dateCreation:
            new Date().toISOString()

    };


    poussiniere.push(
        nouveauLot
    );


    sauvegarderDataLocale(
        "poussiniere",
        poussiniere
    );


    document.getElementById(
        "formPoussiniere"
    ).reset();


    fermerFormulairePoussiniere();


    chargerPoussiniere();


    alert(
        `Lot ${nouveauLot.id} créé avec succès.`
    );

}


/* -----------------------------------------
   CHARGER LA POUSSINIÈRE
----------------------------------------- */

function chargerPoussiniere() {

    const tableau =
        document.getElementById(
            "listePoussiniere"
        );


    if (!tableau) {

        return;

    }


    const poussiniere =
        getDataLocale(
            "poussiniere"
        );


    tableau.innerHTML = "";


    poussiniere.forEach(
        function (lot) {

            let badgeStatut =
                "bg-success";


            if (
                lot.statut === "Transféré"
            ) {

                badgeStatut =
                    "bg-secondary";

            }


            const ligne =
                document.createElement(
                    "tr"
                );


            ligne.innerHTML = `

                <td>${lot.id}</td>

                <td>${lot.espece}</td>

                <td>${lot.origine}</td>

                <td>
                    ${formaterDate(
                        lot.dateEntree
                    )}
                </td>

                <td>
                    ${lot.nombreInitial}
                </td>

                <td>
                    ${lot.presents}
                </td>

                <td>
                    ${lot.mortalite}
                </td>

                <td>
                    ${lot.temperature || 0} °C
                </td>

                <td>

                    <span class="badge ${badgeStatut}">

                        ${lot.statut}

                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-sm btn-primary"
                        onclick="ouvrirSuiviPoussiniere('${lot.id}')">

                        <i class="fa-solid fa-clipboard-check"></i>

                        Suivi

                    </button>

                </td>

            `;


            tableau.appendChild(
                ligne
            );

        }
    );


    mettreAJourStatistiquesPoussiniere();

}


/* -----------------------------------------
   STATISTIQUES POUSSINIÈRE
----------------------------------------- */

function mettreAJourStatistiquesPoussiniere() {

    const poussiniere =
        getDataLocale(
            "poussiniere"
        );


    const lotsActifs =
        poussiniere.filter(
            function (lot) {

                return lot.statut === "Actif";

            }
        );


    const presents =
        lotsActifs.reduce(
            function (total, lot) {

                return (
                    total +
                    Number(
                        lot.presents || 0
                    )
                );

            },
            0
        );


    const mortalite =
        poussiniere.reduce(
            function (total, lot) {

                return (
                    total +
                    Number(
                        lot.mortalite || 0
                    )
                );

            },
            0
        );


    const transferes =
        poussiniere.reduce(
            function (total, lot) {

                return (
                    total +
                    Number(
                        lot.transferes || 0
                    )
                );

            },
            0
        );


    const elementLots =
        document.getElementById(
            "brooderLotsActifs"
        );


    const elementPresents =
        document.getElementById(
            "brooderPoussinsPresents"
        );


    const elementMortalite =
        document.getElementById(
            "brooderMortalite"
        );


    const elementTransferes =
        document.getElementById(
            "brooderTransferes"
        );


    if (elementLots) {

        elementLots.textContent =
            lotsActifs.length;

    }


    if (elementPresents) {

        elementPresents.textContent =
            presents;

    }


    if (elementMortalite) {

        elementMortalite.textContent =
            mortalite;

    }


    if (elementTransferes) {

        elementTransferes.textContent =
            transferes;

    }

}


/* -----------------------------------------
   OUVRIR SUIVI JOURNALIER
----------------------------------------- */

function ouvrirSuiviPoussiniere(id) {

    const poussiniere =
        getDataLocale(
            "poussiniere"
        );


    const lot =
        poussiniere.find(
            function (element) {

                return element.id === id;

            }
        );


    if (!lot) {

        alert(
            "Lot introuvable."
        );

        return;

    }


    document.getElementById(
        "suiviBrooderId"
    ).value = id;


    document.getElementById(
        "brooderMorts"
    ).value = 0;


    document.getElementById(
        "brooderTransfert"
    ).value = 0;


    document.getElementById(
        "brooderAliment"
    ).value = 0;


    document.getElementById(
        "brooderTempJour"
    ).value =
        lot.temperature || "";


    const modal =
        document.getElementById(
            "modalSuiviPoussiniere"
        );


    if (modal) {

        modal.style.display = "flex";

    }

}


/* -----------------------------------------
   FERMER SUIVI JOURNALIER
----------------------------------------- */

function fermerSuiviPoussiniere() {

    const modal =
        document.getElementById(
            "modalSuiviPoussiniere"
        );


    if (!modal) return;


    modal.style.display = "none";

}


/* -----------------------------------------
   ENREGISTRER SUIVI JOURNALIER
----------------------------------------- */

function enregistrerSuiviPoussiniere(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "suiviBrooderId"
        ).value;


    const morts =
        Number(
            document.getElementById(
                "brooderMorts"
            ).value
        );


    const transfert =
        Number(
            document.getElementById(
                "brooderTransfert"
            ).value
        );


    const aliment =
        Number(
            document.getElementById(
                "brooderAliment"
            ).value
        );


    const temperature =
        Number(
            document.getElementById(
                "brooderTempJour"
            ).value
        );


    const poussiniere =
        getDataLocale(
            "poussiniere"
        );


    const index =
        poussiniere.findIndex(
            function (element) {

                return element.id === id;

            }
        );


    if (index === -1) {

        alert(
            "Lot introuvable."
        );

        return;

    }


    const lot =
        poussiniere[index];


    const totalSortie =
        morts + transfert;


    if (
        totalSortie >
        Number(lot.presents)
    ) {

        alert(
            `Erreur : le lot contient seulement ${lot.presents} animaux présents.`
        );

        return;

    }


    lot.presents =
        Number(lot.presents) -
        totalSortie;


    lot.mortalite =
        Number(lot.mortalite || 0) +
        morts;


    lot.transferes =
        Number(lot.transferes || 0) +
        transfert;


    lot.alimentTotal =
        Number(lot.alimentTotal || 0) +
        aliment;


    lot.temperature =
        temperature;


    if (
        Number(lot.presents) === 0
    ) {

        lot.statut =
            "Transféré";

    }


    if (!lot.suivi) {

        lot.suivi = [];

    }


    lot.suivi.push({

        date:
            obtenirDateAujourdhui(),

        morts: morts,

        transfert: transfert,

        aliment: aliment,

        temperature: temperature,

        presentsApresSuivi:
            lot.presents

    });


    poussiniere[index] =
        lot;


    sauvegarderDataLocale(
        "poussiniere",
        poussiniere
    );


    fermerSuiviPoussiniere();


    chargerPoussiniere();


    alert(
        "Suivi journalier enregistré avec succès."
    );

}


/* =========================================================
   INITIALISATION DES PAGES
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* -----------------------------------------
           PAGE INCUBATION
        ----------------------------------------- */

        const formIncubation =
            document.getElementById(
                "formIncubation"
            );


        if (formIncubation) {

            formIncubation.addEventListener(
                "submit",
                enregistrerIncubation
            );

        }


        const formSuiviIncubation =
            document.getElementById(
                "formSuiviIncubation"
            );


        if (formSuiviIncubation) {

            formSuiviIncubation.addEventListener(
                "submit",
                enregistrerSuiviIncubation
            );

        }


        if (
            document.getElementById(
                "listeIncubations"
            )
        ) {

            chargerIncubations();

        }



        /* -----------------------------------------
           PAGE POUSSINIÈRE
        ----------------------------------------- */

        const formPoussiniere =
            document.getElementById(
                "formPoussiniere"
            );


        if (formPoussiniere) {

            formPoussiniere.addEventListener(
                "submit",
                enregistrerPoussiniere
            );

        }


        const formSuiviPoussiniere =
            document.getElementById(
                "formSuiviPoussiniere"
            );


        if (formSuiviPoussiniere) {

            formSuiviPoussiniere.addEventListener(
                "submit",
                enregistrerSuiviPoussiniere
            );

        }


        if (
            document.getElementById(
                "listePoussiniere"
            )
        ) {

            chargerPoussiniere();

        }

    }
);
