/* =========================================================
   FERME ASHER ERP
   MODULE ÉLEVAGE
   Fichier : js/elevage.js

   ARCHITECTURE :

   ANIMAUX & LOTS
        ↓
   PRODUCTION DES ŒUFS
        ↓
   STOCK ŒUFS POUR INCUBATION
        ↓
   incubation.js
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE

   IMPORTANT :
   - AUCUNE INTERFACE D'INCUBATION ICI
   - incubation.js gère l'incubation
   - elevage.js fournit les lots et le stock d'œufs
========================================================= */

"use strict";


/* =========================================================
   1. OUTILS GÉNÉRAUX
========================================================= */

function genererId(prefixe) {

    return (
        prefixe +
        "-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 10000
        )
    );

}


function obtenirDateAujourdHui() {

    const date =
        new Date();

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


function obtenirUtilisateur() {

    return (
        localStorage.getItem(
            "utilisateur"
        )
        ||
        localStorage.getItem(
            "utilisateurConnecte"
        )
        ||
        "Administrateur"
    );

}


function obtenirDonnees(nom) {

    try {

        const donnees =
            localStorage.getItem(nom);

        if (!donnees) {

            return [];

        }

        const resultat =
            JSON.parse(donnees);

        return Array.isArray(resultat)
            ? resultat
            : [];

    } catch (erreur) {

        console.error(
            "Erreur lecture localStorage :",
            nom,
            erreur
        );

        return [];

    }

}


function sauvegarderDonnees(
    nom,
    donnees
) {

    try {

        localStorage.setItem(
            nom,
            JSON.stringify(donnees)
        );

        return true;

    } catch (erreur) {

        console.error(
            "Erreur sauvegarde localStorage :",
            nom,
            erreur
        );

        alert(
            "Impossible d'enregistrer les données."
        );

        return false;

    }

}


function formaterNombre(nombre) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


function formaterDate(date) {

    if (!date) {

        return "";

    }

    const parties =
        String(date).split("-");

    if (
        parties.length !== 3
    ) {

        return date;

    }

    return (
        parties[2] +
        "/" +
        parties[1] +
        "/" +
        parties[0]
    );

}


/* =========================================================
   2. INITIALISATION DES BASES
========================================================= */

function initialiserElevage() {

    const bases = [

        "animaux",

        "lotsElevage",

        "productionsElevage",

        "stockOeufsIncubation",

        "santeElevage",

        "alimentationElevage",

        "reproductionElevage",

        "croissanceElevage",

        "poussiniere"

    ];


    bases.forEach(
        function (base) {

            if (
                localStorage.getItem(base)
                ===
                null
            ) {

                localStorage.setItem(
                    base,
                    JSON.stringify([])
                );

            }

        }
    );

}


initialiserElevage();


/* =========================================================
   3. ANIMAUX
========================================================= */

function obtenirAnimaux() {

    return obtenirDonnees(
        "animaux"
    );

}


function sauvegarderAnimaux(
    animaux
) {

    return sauvegarderDonnees(
        "animaux",
        animaux
    );

}


function ajouterAnimal(event) {

    if (event) {

        event.preventDefault();

    }


    const typeElement =
        document.getElementById(
            "typeAnimal"
        );

    const raceElement =
        document.getElementById(
            "raceAnimal"
        );

    const quantiteElement =
        document.getElementById(
            "quantiteAnimal"
        );

    const dateElement =
        document.getElementById(
            "dateAnimal"
        );

    const statutElement =
        document.getElementById(
            "statutAnimal"
        );


    const type =
        typeElement
        ? typeElement.value.trim()
        : "";


    const race =
        raceElement
        ? raceElement.value.trim()
        : "";


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const date =
        dateElement
        && dateElement.value
        ? dateElement.value
        : obtenirDateAujourdHui();


    const statut =
        statutElement
        && statutElement.value
        ? statutElement.value
        : "Actif";


    if (!type) {

        alert(
            "Veuillez sélectionner le type d'animal."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        )
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return false;

    }


    const animaux =
        obtenirAnimaux();


    const animal = {

        id:
            genererId(
                "ANI"
            ),

        type:
            type,

        race:
            race ||
            "Non précisée",

        quantite:
            quantite,

        quantiteInitiale:
            quantite,

        date:
            date,

        statut:
            statut,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    animaux.push(
        animal
    );


    sauvegarderAnimaux(
        animaux
    );


    const formulaire =
        document.getElementById(
            "formAnimal"
        );

    if (formulaire) {

        formulaire.reset();

    }


    chargerAnimaux();


    alert(
        "Animal enregistré avec succès."
    );


    return true;

}


function chargerAnimaux() {

    const tableau =
        document.getElementById(
            "listeAnimaux"
        );


    if (!tableau) {

        return;

    }


    const animaux =
        obtenirAnimaux();


    tableau.innerHTML =
        "";


    if (
        animaux.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted">

                    Aucun animal enregistré.

                </td>

            </tr>

        `;

        return;

    }


    animaux
        .slice()
        .reverse()
        .forEach(
            function (animal) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${animal.id || "-"}
                        </td>

                        <td>
                            ${animal.type || "-"}
                        </td>

                        <td>
                            ${animal.race || "-"}
                        </td>

                        <td>
                            ${formaterNombre(
                                animal.quantite
                            )}
                        </td>

                        <td>
                            ${formaterDate(
                                animal.date
                            )}
                        </td>

                        <td>
                            ${animal.statut || "-"}
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   4. LOTS D'ÉLEVAGE
========================================================= */

function obtenirLotsElevage() {

    const lots =
        obtenirDonnees("lotsElevage");

    return Array.isArray(lots)
        ? lots
        : [];

}


/* =========================================================
   SUPABASE — LOTS D'ÉLEVAGE
========================================================= */

function supabaseDisponible() {

    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient !== null
    );

}


/*
 * Convertit un lot Supabase vers le format utilisé
 * par le reste de l'application.
 */
function convertirLotSupabase(lot) {

    return {

        id:
            lot.id,

        code:
            lot.code,

        espece:
            lot.espece,

        type:
            lot.espece,

        race:
            lot.race_type ||
            "Non précisée",

        nom:
            lot.nom_lot,

        nomLot:
            lot.nom_lot,

        dateEntree:
            lot.date_entree,

        date:
            lot.date_entree,

        quantiteInitiale:
            Number(
                lot.quantite_initiale || 0
            ),

        quantiteActuelle:
            Number(
                lot.quantite_actuelle || 0
            ),

        quantite:
            Number(
                lot.quantite_actuelle || 0
            ),

        origine:
            lot.origine || "",

        cout:
            Number(
                lot.cout_acquisition || 0
            ),

        statut:
            lot.statut || "Actif",

        notes:
            lot.notes || "",

        mortalite:
            0,

        transferes:
            0,

        dateCreation:
            lot.created_at || null,

        dateModification:
            lot.updated_at || null

    };

}


/*
 * Charge tous les lots depuis Supabase.
 */
async function chargerLotsSupabase() {

    if (!supabaseDisponible()) {

        console.error(
            "supabaseClient n'est pas disponible."
        );

        return [];

    }


    const {
        data,
        error
    } = await window.supabaseClient
        .from("lots_elevage")
        .select("*")
        .order(
            "id",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Erreur chargement lots Supabase :",
            error
        );

        return [];

    }


    return (
        data || []
    ).map(
        convertirLotSupabase
    );

}


/*
 * Enregistre un lot dans Supabase.
 */
async function enregistrerLotSupabase(
    lot
) {

    if (!supabaseDisponible()) {

        throw new Error(
            "Supabase n'est pas disponible."
        );

    }


    const donnees = {

        code:
            lot.code,

        espece:
            lot.espece,

        race_type:
            lot.race ||
            "Non précisée",

        nom_lot:
            lot.nom,

        date_entree:
            lot.dateEntree,

        quantite_initiale:
            Number(
                lot.quantiteInitiale
            ),

        quantite_actuelle:
            Number(
                lot.quantiteActuelle
            ),

        origine:
            lot.origine ||
            "Achat",

        cout_acquisition:
            Number(
                lot.cout || 0
            ),

        statut:
            lot.statut ||
            "Actif",

        notes:
            lot.notes ||
            ""

    };


    const {
        data,
        error
    } = await window.supabaseClient
        .from("lots_elevage")
        .insert(
            [donnees]
        )
        .select()
        .single();


    if (error) {

        console.error(
            "Erreur insertion lot Supabase :",
            error
        );

        throw error;

    }


    return convertirLotSupabase(
        data
    );

}


/*
 * Supprime un lot dans Supabase.
 */
async function supprimerLotSupabase(
    id
) {

    if (!supabaseDisponible()) {

        throw new Error(
            "Supabase n'est pas disponible."
        );

    }


    const {
        error
    } = await window.supabaseClient
        .from("lots_elevage")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Erreur suppression lot Supabase :",
            error
        );

        throw error;

    }

}


/*
 * Synchronise les anciens lots localStorage
 * vers Supabase.
 *
 * Cela permet de récupérer ton lot actuel de
 * 40 cailles Jumbo.
 */
async function migrerLotsLocauxVersSupabase() {

    if (!supabaseDisponible()) {

        return;

    }


    const anciensLots =
        obtenirDonnees(
            "lotsElevage"
        );


    if (
        anciensLots.length === 0
    ) {

        return;

    }


    console.log(
        "Migration des anciens lots vers Supabase..."
    );


    for (
        const lot of anciensLots
    ) {

        try {

            const {
                data: existant,
                error: erreurRecherche
            } = await window.supabaseClient
                .from("lots_elevage")
                .select("id, code")
                .eq(
                    "code",
                    lot.code
                )
                .maybeSingle();


            if (erreurRecherche) {

                console.error(
                    "Erreur recherche lot :",
                    erreurRecherche
                );

                continue;

            }


            /*
             * Si le code existe déjà,
             * on ne crée pas de doublon.
             */
            if (existant) {

                continue;

            }


            await enregistrerLotSupabase(
                lot
            );


            console.log(
                "Lot migré :",
                lot.code
            );

        }
        catch (erreur) {

            console.error(
                "Erreur migration du lot :",
                lot,
                erreur
            );

        }

    }

}


function sauvegarderLotsElevage(
    lots
) {

    return sauvegarderDonnees(
        "lotsElevage",
        lots
    );

}


function genererCodeLot() {

    const maintenant =
        new Date();

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

    const heure =
        String(
            maintenant.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            maintenant.getMinutes()
        ).padStart(2, "0");

    const seconde =
        String(
            maintenant.getSeconds()
        ).padStart(2, "0");

    const aleatoire =
        Math.floor(
            Math.random() * 900 + 100
        );


    return (
        "LOT-" +
        annee +
        mois +
        jour +
        "-" +
        heure +
        minute +
        seconde +
        "-" +
        aleatoire
    );

}


function obtenirNomLot(lot) {

    if (!lot) {

        return "";

    }

    return (
        lot.nom
        ||
        lot.nomLot
        ||
        ""
    );

}


function obtenirEspeceLot(lot) {

    if (!lot) {

        return "";

    }

    return (
        lot.espece
        ||
        lot.type
        ||
        ""
    );

}


function obtenirQuantiteLot(lot) {

    if (!lot) {

        return 0;

    }

    return Number(
        lot.quantiteActuelle
        ??
        lot.quantite
        ??
        lot.quantiteInitiale
        ??
        0
    );

}


async function enregistrerLot(event) {

    if (event) {

        event.preventDefault();

    }


    const especeElement =
        document.getElementById(
            "lotEspece"
        )
        ||
        document.getElementById(
            "especeLot"
        );


    const raceElement =
        document.getElementById(
            "lotRace"
        )
        ||
        document.getElementById(
            "raceLot"
        );


    const nomElement =
        document.getElementById(
            "lotNom"
        )
        ||
        document.getElementById(
            "nomLot"
        );


    const dateElement =
        document.getElementById(
            "lotDateEntree"
        )
        ||
        document.getElementById(
            "dateEntreeLot"
        );


    const quantiteElement =
        document.getElementById(
            "lotQuantite"
        )
        ||
        document.getElementById(
            "quantiteLot"
        );


    const origineElement =
        document.getElementById(
            "lotOrigine"
        )
        ||
        document.getElementById(
            "origineLot"
        );


    const coutElement =
        document.getElementById(
            "lotCout"
        )
        ||
        document.getElementById(
            "coutLot"
        );


    const statutElement =
        document.getElementById(
            "lotStatut"
        )
        ||
        document.getElementById(
            "statutLot"
        );


    const notesElement =
        document.getElementById(
            "lotNotes"
        )
        ||
        document.getElementById(
            "notesLot"
        );


    const espece =
        especeElement
        ? especeElement.value.trim()
        : "";


    const race =
        raceElement
        ? raceElement.value.trim()
        : "";


    const nom =
        nomElement
        ? nomElement.value.trim()
        : "";


    const dateEntree =
        dateElement
        ? dateElement.value
        : obtenirDateAujourdHui();


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const origine =
        origineElement
        ? origineElement.value
        : "Achat";


    const cout =
        coutElement
        ? Number(
            coutElement.value || 0
        )
        : 0;


    const statut =
        statutElement
        && statutElement.value
        ? statutElement.value
        : "Actif";


    const notes =
        notesElement
        ? notesElement.value.trim()
        : "";


    if (!espece) {

        alert(
            "Veuillez sélectionner l'espèce."
        );

        return false;

    }


    if (!nom) {

        alert(
            "Veuillez saisir le nom du lot."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        )
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité initiale doit être supérieure à zéro."
        );

        return false;

    }


    const lots =
        obtenirLotsElevage();


    const doublon =
        lots.some(
            function (lot) {

                return (
                    String(
                        obtenirNomLot(lot)
                    ).toLowerCase()
                    ===
                    nom.toLowerCase()
                );

            }
        );


    if (doublon) {

        const continuer =
            confirm(

                `Un lot nommé "${nom}" existe déjà.

Voulez-vous quand même créer ce nouveau lot ?`

            );


        if (!continuer) {

            return false;

        }

    }


    const code =
        genererCodeLot();


    const nouveauLot = {

        id:
            code,

        code:
            code,

        espece:
            espece,

        type:
            espece,

        race:
            race ||
            "Non précisée",

        nom:
            nom,

        nomLot:
            nom,

        dateEntree:
            dateEntree,

        date:
            dateEntree,

        quantiteInitiale:
            quantite,

        quantiteActuelle:
            quantite,

        quantite:
            quantite,

        origine:
            origine,

        cout:
            cout,

        statut:
            statut,

        notes:
            notes,

        mortalite:
            0,

        transferes:
            0,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


   /*
 * ENREGISTREMENT PRINCIPAL DANS SUPABASE
 */
try {

   await enregistrerLotSupabase(
    nouveauLot
);

    /*
     * Mettre à jour le cache local
     */
    const lotsSupabase =
        await chargerLotsSupabase();

    sauvegarderLotsElevage(
        lotsSupabase
    );

}
catch (erreur) {

    console.error(
        "Erreur enregistrement lot :",
        erreur
    );

    alert(
        "Impossible d'enregistrer le lot dans Supabase.\n\n" +
        (erreur.message || erreur)
    );

    return false;

}


    const formulaire =
        document.getElementById(
            "formLot"
        );


    if (formulaire) {

        formulaire.reset();

    }


    const modalElement =
        document.getElementById(
            "modalLot"
        );


    if (
        modalElement
        &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        if (modal) {

            modal.hide();

        }

    }


    chargerLots();


    chargerLotsProduction();


    alert(

        `Le lot "${nom}" a été enregistré avec succès.`

    );


    return true;

}


async function chargerLots() {

    const tableau =
        document.getElementById("listeLots");

    if (!tableau) {
        return;
    }

    let lots = [];

    /*
     * SOURCE PRINCIPALE :
     * Supabase
     */
    if (supabaseDisponible()) {

        lots =
            await chargerLotsSupabase();

        /*
         * Mettre à jour le cache local
         * pour les autres fonctions de l'ERP.
         */
        if (Array.isArray(lots)) {

            sauvegarderLotsElevage(lots);

        }

    } else {

        /*
         * Secours : ancien stockage local
         */
        lots =
            obtenirLotsElevage();

    }


    tableau.innerHTML = "";


    if (
        !Array.isArray(lots)
        ||
        lots.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    Aucun lot enregistré.

                </td>

            </tr>

        `;

        mettreAJourStatistiquesLots();

        return;

    }


    lots
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                let couleur =
                    "success";


                if (
                    lot.statut ===
                    "Terminé"
                ) {

                    couleur =
                        "secondary";

                }


                if (
                    lot.statut ===
                    "Transféré"
                ) {

                    couleur =
                        "warning";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>
                            <strong>
                                ${
                                    lot.code ||
                                    lot.id ||
                                    "-"
                                }
                            </strong>
                        </td>

                        <td>
                            ${
                                obtenirEspeceLot(
                                    lot
                                )
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                lot.race ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                obtenirNomLot(
                                    lot
                                )
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterDate(
                                    lot.dateEntree ||
                                    lot.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteInitiale
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    obtenirQuantiteLot(
                                        lot
                                    )
                                )
                            }
                        </td>

                        <td>

                            <span
                                class="badge bg-${couleur}">

                                ${
                                    lot.statut ||
                                    "Actif"
                                }

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="supprimerLot('${lot.id}')">

                                <i
                                    class="fa-solid fa-trash">
                                </i>

                            </button>

                        </td>

                    </tr>

                `;

            });
        mettreAJourStatistiquesLots(lots);

}

async function supprimerLot(id) {

    if (!id) {
        return;
    }

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce lot ?\n\n" +
            "Cette opération supprimera également le lot de Supabase."
        );

    if (!confirmation) {
        return;
    }

    try {

        /*
         * SOURCE PRINCIPALE :
         * Supabase
         */
        if (supabaseDisponible()) {

            await supprimerLotSupabase(id);

            /*
             * Recharger les lots depuis Supabase
             * et mettre à jour le cache local.
             */
            const lots =
                await chargerLotsSupabase();

            sauvegarderLotsElevage(
                lots
            );

        } else {

            /*
             * SECOURS :
             * suppression dans le stockage local
             */
            let lots =
                obtenirLotsElevage();

            lots =
                lots.filter(
                    function (lot) {

                        return (
                            String(lot.id)
                            !==
                            String(id)
                        );

                    }
                );

            sauvegarderLotsElevage(
                lots
            );

        }

        /*
         * Actualiser l'affichage
         */
        await chargerLots();

        chargerLotsProduction();

        chargerLotsAlimentation();

        alert(
            "Lot supprimé avec succès."
        );

    }
    catch (erreur) {

        console.error(
            "Erreur suppression du lot :",
            erreur
        );

        alert(
            "Impossible de supprimer le lot.\n\n" +
            (
                erreur.message ||
                erreur
            )
        );

    }

}

function mettreAJourStatistiquesLots(lotsParametres) {

    const lots =
        Array.isArray(lotsParametres)
            ? lotsParametres
            : [];

    const actifs =
        lots.filter(function (lot) {

            return (
                lot.statut === "Actif"
                ||
                !lot.statut
            );

        });

    const totalAnimaux =
        actifs.reduce(
            function (total, lot) {

                return (
                    total +
                    Number(
                        lot.quantiteActuelle ||
                        lot.quantite ||
                        0
                    )
                );

            },
            0
        );


    /* =========================================
       ANIMAUX
    ========================================= */

    const elementAnimaux =
        document.getElementById(
            "totalAnimaux"
        );

    if (elementAnimaux) {

        elementAnimaux.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    /* =========================================
       NOMBRE DE LOTS
    ========================================= */

    const elementLots =
        document.getElementById(
            "totalLots"
        )
        ||
        document.getElementById(
            "lotsActifs"
        );

    if (elementLots) {

        elementLots.textContent =
            formaterNombre(
                lots.length
            );

    }


    /* =========================================
       ANIMAUX ACTIFS
    ========================================= */

    const elementActifs =
        document.getElementById(
            "animauxActifs"
        );

    if (elementActifs) {

        elementActifs.textContent =
            formaterNombre(
                actifs.length
            );

    }


    /* =========================================
       MORTALITÉ
    ========================================= */

    const elementMortalite =
        document.getElementById(
            "totalMortalite"
        )
        ||
        document.getElementById(
            "mortalite"
        );

    if (elementMortalite) {

        const mortalite =
            lots.reduce(
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

        elementMortalite.textContent =
            formaterNombre(
                mortalite
            );

    }

}

/* =========================================================
   5. LOTS CONNECTÉS À LA PRODUCTION
========================================================= */

function obtenirLotsConnectes() {

    return obtenirLotsElevage();

}


function trouverLotParId(
    lotId
) {

    const lots =
        obtenirLotsConnectes();


    return (
        lots.find(
            function (lot) {

                return (
                    String(lot.id)
                    ===
                    String(lotId)
                );

            }
        )
        ||
        null
    );

}


function chargerLotsProduction() {

    const select =
        document.getElementById(
            "productionLot"
        );


    if (!select) {

        return;

    }


    const ancienneValeur =
        select.value;


    const lots =
        obtenirLotsConnectes();


    select.innerHTML = `

        <option value="">
            Sélectionner un lot
        </option>

    `;


    lots
        .filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        )
        .forEach(
            function (lot) {

                const nom =
                    obtenirNomLot(
                        lot
                    );


                const espece =
                    obtenirEspeceLot(
                        lot
                    );


                const quantite =
                    obtenirQuantiteLot(
                        lot
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lot.id;


                option.dataset.espece =
                    espece;


                option.dataset.nom =
                    nom;


                option.dataset.race =
                    lot.race ||
                    "";


                option.textContent =

                    nom
                    +
                    " — "
                    +
                    espece
                    +
                    " ("
                    +
                    formaterNombre(
                        quantite
                    )
                    +
                    " animaux)";


                select.appendChild(
                    option
                );

            }
        );


    if (ancienneValeur) {

        select.value =
            ancienneValeur;

    }

}


/* =========================================================
   6. PRODUCTION
========================================================= */

function obtenirProductions() {

    return obtenirDonnees(
        "productionsElevage"
    );

}


function sauvegarderProductions(
    productions
) {

    return sauvegarderDonnees(
        "productionsElevage",
        productions
    );

}


/* =========================================================
   STOCK ŒUFS DESTINÉS À L'INCUBATION

   IMPORTANT :

   Cette partie est volontairement conservée ici.

   elevage.js = production crée le stock.

   incubation.js = consomme ce stock.

   Donc :

   production → stockOeufsIncubation
========================================================= */

function obtenirStockOeufsIncubation() {

    return obtenirDonnees(
        "stockOeufsIncubation"
    );

}


function sauvegarderStockOeufsIncubation(
    stock
) {

    return sauvegarderDonnees(
        "stockOeufsIncubation",
        stock
    );

}


function obtenirOeufsDisponiblesPourLot(
    lotId
) {

    const stock =
        obtenirStockOeufsIncubation();


    return stock
        .filter(
            function (ligne) {

                return (

                    String(
                        ligne.lotId
                    )
                    ===
                    String(
                        lotId
                    )

                    &&

                    Number(
                        ligne.quantiteDisponible
                        ||
                        0
                    )
                    >
                    0

                );

            }
        )
        .reduce(
            function (
                total,
                ligne
            ) {

                return (
                    total +
                    Number(
                        ligne.quantiteDisponible
                        ||
                        0
                    )
                );

            },
            0
        );

}


function calculerResteProduction(
    quantite,
    incubation,
    vente,
    consommation,
    autre
) {

    const total =
        Number(
            quantite || 0
        );


    const utilise =
        Number(
            incubation || 0
        )
        +
        Number(
            vente || 0
        )
        +
        Number(
            consommation || 0
        )
        +
        Number(
            autre || 0
        );


    return Math.max(
        0,
        total - utilise
    );

}


function enregistrerProduction(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const lotElement =
        document.getElementById(
            "productionLot"
        );


    const dateElement =
        document.getElementById(
            "productionDate"
        );


    const typeElement =
        document.getElementById(
            "productionType"
        );


    const produitElement =
        document.getElementById(
            "productionProduit"
        );


    const quantiteElement =
        document.getElementById(
            "productionQuantite"
        );


    const uniteElement =
        document.getElementById(
            "productionUnite"
        );


    const incubationElement =
        document.getElementById(
            "productionIncubation"
        );


    const venteElement =
        document.getElementById(
            "productionVente"
        );


    const consommationElement =
        document.getElementById(
            "productionConsommation"
        );


    const autreElement =
        document.getElementById(
            "productionAutre"
        );


    const notesElement =
        document.getElementById(
            "productionNotes"
        );


    const lotId =
        lotElement
        ? lotElement.value
        : "";


    const date =
        dateElement
        && dateElement.value
        ? dateElement.value
        : obtenirDateAujourdHui();


    const type =
        typeElement
        ? typeElement.value
        : "Œufs";


    const produit =
        produitElement
        ? produitElement.value.trim()
        : "";


    const quantite =
        quantiteElement
        ? Number(
            quantiteElement.value
        )
        : 0;


    const unite =
        uniteElement
        ? uniteElement.value
        : "Unité";


    const incubation =
        incubationElement
        ? Number(
            incubationElement.value || 0
        )
        : 0;


    const vente =
        venteElement
        ? Number(
            venteElement.value || 0
        )
        : 0;


    const consommation =
        consommationElement
        ? Number(
            consommationElement.value || 0
        )
        : 0;


    const autre =
        autreElement
        ? Number(
            autreElement.value || 0
        )
        : 0;


    const notes =
        notesElement
        ? notesElement.value.trim()
        : "";


    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot producteur."
        );

        return false;

    }


    const lot =
        trouverLotParId(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot producteur sélectionné est introuvable."
        );

        return false;

    }


    if (
        !Number.isFinite(
            quantite
        )
        ||
        quantite <= 0
    ) {

        alert(
            "La quantité doit être supérieure à zéro."
        );

        return false;

    }


    if (!produit) {

        alert(
            "Veuillez saisir le produit."
        );

        return false;

    }


    if (
        incubation < 0
        ||
        vente < 0
        ||
        consommation < 0
        ||
        autre < 0
    ) {

        alert(
            "Les quantités de répartition ne peuvent pas être négatives."
        );

        return false;

    }


    const totalRepartition =
        incubation +
        vente +
        consommation +
        autre;


    if (
        totalRepartition >
        quantite
    ) {

        alert(

            "Erreur de répartition.\n\n" +

            "Production totale : " +
            formaterNombre(
                quantite
            ) +

            "\nRépartition : " +

            formaterNombre(
                totalRepartition
            )

        );

        return false;

    }


    const productions =
        obtenirProductions();


    const idProduction =
        genererId(
            "PROD"
        );


    /* =====================================================
       ENREGISTREMENT DE LA PRODUCTION

       IMPORTANT :
       Le lot est enregistré par son ID.

       lotId
       lotNom
       espece
       race

       Ainsi la production reste liée au lot même si
       son nom est modifié plus tard.
    ===================================================== */

    const nouvelleProduction = {

        id:
            idProduction,

        date:
            date,

        lotId:
            lot.id,

        lotNom:
            obtenirNomLot(
                lot
            ),

        espece:
            obtenirEspeceLot(
                lot
            ),

        race:
            lot.race ||
            "",

        type:
            type,

        produit:
            produit,

        quantite:
            quantite,

        unite:
            unite,

        repartition: {

            incubation:
                incubation,

            vente:
                vente,

            consommation:
                consommation,

            autre:
                autre,

            reste:
                calculerResteProduction(
                    quantite,
                    incubation,
                    vente,
                    consommation,
                    autre
                )

        },

        notes:
            notes,

        utilisateur:
            obtenirUtilisateur(),

        dateCreation:
            new Date().toISOString()

    };


    productions.push(
        nouvelleProduction
    );


    if (
        !sauvegarderProductions(
            productions
        )
    ) {

        return false;

    }


    /* =====================================================
       STOCK ŒUFS POUR INCUBATION

       Si par exemple :

       Production = 68 œufs
       Incubation = 40

       alors :

       stockOeufsIncubation
       = 40 œufs

       avec :

       lotId = lot.id
       lotNom = nom du lot
       espece = espèce
       race = race
       productionId = production.id

       incubation.js pourra ensuite retrouver
       exactement ce lot.
    ===================================================== */

    if (
        incubation > 0
    ) {

        const stock =
            obtenirStockOeufsIncubation();


        stock.push({

            id:
                genererId(
                    "STKINC"
                ),

            productionId:
                nouvelleProduction.id,

            lotId:
                lot.id,

            lotNom:
                obtenirNomLot(
                    lot
                ),

            espece:
                obtenirEspeceLot(
                    lot
                ),

            race:
                lot.race ||
                "",

            produit:
                produit,

            quantiteInitiale:
                incubation,

            quantiteDisponible:
                incubation,

            quantiteUtilisee:
                0,

            dateProduction:
                date,

            statut:
                "Disponible"

        });


        if (
            !sauvegarderStockOeufsIncubation(
                stock
            )
        ) {

            console.error(
                "La production a été enregistrée mais le stock d'incubation n'a pas pu être sauvegardé."
            );

        }

    }


    const formulaire =
        document.getElementById(
            "formProduction"
        );


    if (formulaire) {

        formulaire.reset();

    }


    const modalElement =
        document.getElementById(
            "modalProduction"
        );


    if (
        modalElement
        &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        if (modal) {

            modal.hide();

        }

    }


    chargerProductions();


    alert(

        "Production enregistrée avec succès.\n\n" +

        "Lot : " +
        obtenirNomLot(
            lot
        ) +

        "\n" +

        "Production : " +
        formaterNombre(
            quantite
        ) +

        " " +
        unite +

        "\n" +

        "Œufs destinés à l'incubation : " +
        formaterNombre(
            incubation
        )

    );


    return true;

}


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


    tableau.innerHTML =
        "";


    if (
        productions.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="10"
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
        .forEach(
            function (production) {

                const repartition =
                    production.repartition
                    ||
                    {};


                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    production.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                production.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.type
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                production.produit
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    production.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                production.unite
                                ||
                                ""
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.incubation
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.vente
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    repartition.reste
                                )
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   7. SANTÉ
========================================================= */

function obtenirSante() {

    return obtenirDonnees(
        "santeElevage"
    );

}


function sauvegarderSante(
    sante
) {

    return sauvegarderDonnees(
        "santeElevage",
        sante
    );

}


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


    tableau.innerHTML =
        "";


    if (
        sante.length === 0
    ) {

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
        .forEach(
            function (item) {

                let couleur =
                    "success";


                if (
                    item.type ===
                    "Maladie"
                ) {

                    couleur =
                        "danger";

                }


                if (
                    item.type ===
                    "Traitement"
                ) {

                    couleur =
                        "warning";

                }


                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.animal
                                ||
                                item.lot
                                ||
                                "-"
                            }
                        </td>

                        <td>

                            <span
                                class="badge bg-${couleur}">

                                ${
                                    item.type
                                    ||
                                    "-"
                                }

                            </span>

                        </td>

                        <td>
                            ${
                                item.description
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.traitement
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.utilisateur
                                ||
                                "-"
                            }
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="supprimerSante('${item.id}')">

                                <i
                                    class="fa-solid fa-trash">
                                </i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        );

}


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
        sante.filter(
            function (item) {

                return (
                    String(item.id)
                    !==
                    String(id)
                );

            }
        );


    sauvegarderSante(
        sante
    );


    chargerSante();

}


/* =========================================================
   8. ALIMENTATION
========================================================= */

function obtenirAlimentation() {

    return obtenirDonnees(
        "alimentationElevage"
    );

}


function sauvegarderAlimentation(
    alimentation
) {

    return sauvegarderDonnees(
        "alimentationElevage",
        alimentation
    );

}


function chargerLotsAlimentation() {

    const select =
        document.getElementById(
            "alimentLot"
        );


    if (!select) {

        return;

    }


    const lots =
        obtenirLotsElevage();


    select.innerHTML = `

        <option value="">
            Sélectionner un lot
        </option>

    `;


    lots
        .filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        )
        .forEach(
            function (lot) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lot.id;


                option.textContent =

                    obtenirNomLot(
                        lot
                    )
                    +
                    " — "
                    +
                    obtenirEspeceLot(
                        lot
                    );


                select.appendChild(
                    option
                );

            }
        );

}


function chargerAlimentation() {

    const tableau =
        document.getElementById(
            "listeAlimentation"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirAlimentation();


    tableau.innerHTML =
        "";


    if (
        donnees.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune alimentation enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lotNom
                                ||
                                item.lot
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.produit
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.quantite
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.unite
                                ||
                                ""
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   9. REPRODUCTION
========================================================= */

function obtenirReproduction() {

    return obtenirDonnees(
        "reproductionElevage"
    );

}


function sauvegarderReproduction(
    donnees
) {

    return sauvegarderDonnees(
        "reproductionElevage",
        donnees
    );

}


function chargerReproduction() {

    const tableau =
        document.getElementById(
            "listeReproduction"
        );


    if (!tableau) {

        return;

    }


    const reproduction =
        obtenirReproduction();


    tableau.innerHTML =
        "";


    if (
        reproduction.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune reproduction enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    reproduction
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lot
                                ||
                                item.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.oeufs
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    item.eclos
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.statut
                                ||
                                "-"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   10. CROISSANCE
========================================================= */

function obtenirCroissance() {

    return obtenirDonnees(
        "croissanceElevage"
    );

}


function sauvegarderCroissance(
    donnees
) {

    return sauvegarderDonnees(
        "croissanceElevage",
        donnees
    );

}


function chargerCroissance() {

    const tableau =
        document.getElementById(
            "listeCroissance"
        );


    if (!tableau) {

        return;

    }


    const donnees =
        obtenirCroissance();


    tableau.innerHTML =
        "";


    if (
        donnees.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucune donnée de croissance.

                </td>

            </tr>

        `;

        return;

    }


    donnees
        .slice()
        .reverse()
        .forEach(
            function (item) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                formaterDate(
                                    item.date
                                )
                            }
                        </td>

                        <td>
                            ${
                                item.lot
                                ||
                                item.lotNom
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.espece
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.poids
                                ||
                                0
                            }
                            kg
                        </td>

                    </tr>

                `;

            }
        );

}


/* =========================================================
   11. POUSSINIÈRE
========================================================= */

function obtenirPoussiniere() {

    return obtenirDonnees(
        "poussiniere"
    );

}


function sauvegarderPoussiniere(
    donnees
) {

    return sauvegarderDonnees(
        "poussiniere",
        donnees
    );

}

function chargerPoussiniere() {

    const tableau =
        document.getElementById(
            "listePoussiniere"
        );

    if (!tableau) {
        return;
    }

    const donnees =
        obtenirPoussiniere();

    tableau.innerHTML = "";

    if (
        !Array.isArray(donnees)
        ||
        donnees.length === 0
    ) {

        tableau.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="text-center text-muted">
                    Aucun lot en poussinière.
                </td>
            </tr>
        `;

        return;
    }

    const administrateur =
        estAdministrateurPoussiniere();

    donnees
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                const ligne =
                    document.createElement(
                        "tr"
                    );

                ligne.innerHTML = `
                    <td>
                        ${lot.id || "-"}
                    </td>

                    <td>
                        ${lot.espece || "-"}
                    </td>

                    <td>
                        ${lot.origine || "-"}
                    </td>

                    <td>
                        ${
                            formaterDate(
                                lot.dateEntree
                            )
                        }
                    </td>

                    <td>
                        ${
                            lot.nombreInitial || 0
                        }
                    </td>

                    <td>
                        ${
                            lot.presents ??
                            lot.nombreInitial ??
                            0
                        }
                    </td>

                    <td>
                        ${
                            lot.mortalite || 0
                        }
                    </td>

                    <td>
                        ${
                            lot.temperature || 0
                        } °C
                    </td>

                    <td>
                        ${
                            lot.statut || "-"
                        }
                    </td>

                    <td
                        class="actions-poussiniere">
                    </td>
                `;

                               const celluleActions =
                    ligne.querySelector(
                        ".actions-poussiniere"
                    );

                if (
                    administrateur
                    &&
                    celluleActions
                ) {

                    /* =========================
                       BOUTON MODIFIER
                       ========================= */

                    const boutonModifier =
                        document.createElement(
                            "button"
                        );

                    boutonModifier.type =
                        "button";

                    boutonModifier.className =
                        "btn btn-sm btn-primary me-1";

                    boutonModifier.innerHTML = `
                        <i class="fa-solid fa-pen-to-square"></i>
                        Modifier
                    `;

                    boutonModifier.addEventListener(
                        "click",
                        function () {

                            modifierLotPoussiniere(
                                lot.id
                            );

                        }
                    );

                    celluleActions.appendChild(
                        boutonModifier
                    );


                    /* =========================
                       BOUTON SUPPRIMER
                       ========================= */

                    const boutonSupprimer =
                        document.createElement(
                            "button"
                        );

                    boutonSupprimer.type =
                        "button";

                    boutonSupprimer.className =
                        "btn btn-sm btn-danger";

                    boutonSupprimer.innerHTML = `
                        <i class="fa-solid fa-trash"></i>
                        Supprimer
                    `;

                    boutonSupprimer.addEventListener(
                        "click",
                        function () {

                            supprimerLotPoussiniere(
                                lot.id
                            );

                        }
                    );

                    celluleActions.appendChild(
                        boutonSupprimer
                    );

                }

                /* =========================
                   AJOUT DE LA LIGNE
                   ========================= */

                tableau.appendChild(
                    ligne
                );

            }
        );
}
    
function ouvrirFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    const date =
        document.getElementById(
            "brooderDate"
        );


    if (
        date
        &&
        !date.value
    ) {

        date.value =
            obtenirDateAujourdHui();

    }

}


function fermerFormulairePoussiniere() {

    const modal =
        document.getElementById(
            "modalPoussiniere"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";

}

function enregistrerPoussiniere(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const espece =
        document.getElementById(
            "brooderEspece"
        )?.value
        ||
        "";


    const origine =
        document.getElementById(
            "brooderOrigine"
        )?.value
        ?.trim()
        ||
        "";


    const nombre =
        Number(
            document.getElementById(
                "brooderNombre"
            )?.value
        );


    const dateEntree =
        document.getElementById(
            "brooderDate"
        )?.value
        ||
        obtenirDateAujourdHui();


    const emplacement =
        document.getElementById(
            "brooderEmplacement"
        )?.value
        ||
        "";


    const temperature =
        Number(
            document.getElementById(
                "brooderTemperature"
            )?.value
            ||
            0
        );


    if (
        !espece
        ||
        !origine
        ||
        !Number.isFinite(
            nombre
        )
        ||
        nombre <= 0
        ||
        !emplacement
    ) {

        alert(
            "Veuillez remplir correctement tous les champs."
        );

        return false;

    }


const poussiniere =
    obtenirPoussiniere();

const editId =
    document.getElementById(
        "brooderEditId"
    )?.value || "";


// =====================================================
// MODE MODIFICATION
// =====================================================

if (editId) {

   if (!estAdministrateurERP()) {

        alert(
            "Seul l'administrateur peut modifier un lot."
        );

        return false;
    }

    const index =
        poussiniere.findIndex(
            function (lot) {
                return lot.id === editId;
            }
        );

    if (index === -1) {

        alert(
            "Lot introuvable."
        );

        return false;
    }

    const ancienLot =
        poussiniere[index];

    poussiniere[index] = {

        ...ancienLot,

        espece:
            espece,

        origine:
            origine,

        emplacement:
            emplacement,

        dateEntree:
            dateEntree,

        nombreInitial:
            nombre,

        temperature:
            temperature,

        dateModification:
            new Date().toISOString()

    };

    sauvegarderPoussiniere(
        poussiniere
    );

    const formulaire =
        document.getElementById(
            "formPoussiniere"
        );

    if (formulaire) {
        formulaire.reset();
    }

    document.getElementById(
        "brooderEditId"
    ).value = "";

    fermerFormulairePoussiniere();

    chargerPoussiniere();

    alert(
        `Lot ${editId} modifié avec succès.`
    );

    return true;

}


// =====================================================
// MODE CRÉATION
// =====================================================

const nouveauLot = {

    id:
        genererId(
            "BRD"
        ),

    espece:
        espece,

    origine:
        origine,

    emplacement:
        emplacement,

    dateEntree:
        dateEntree,

    nombreInitial:
        nombre,

    presents:
        nombre,

    mortalite:
        0,

    transferes:
        0,

    temperature:
        temperature,

    alimentTotal:
        0,

    statut:
        "Actif",

    suivi:
        [],

    dateCreation:
        new Date().toISOString()

};

poussiniere.push(
    nouveauLot
);

sauvegarderPoussiniere(
    poussiniere
);

const formulaire =
    document.getElementById(
        "formPoussiniere"
    );

if (formulaire) {

    formulaire.reset();

}

fermerFormulairePoussiniere();

chargerPoussiniere();

alert(
    `Lot ${nouveauLot.id} créé avec succès.`
);

return true;

}
   
function estAdministrateurPoussiniere() {

    if (
        typeof obtenirRoleERP === "function"
    ) {

        const role =
            obtenirRoleERP();

        return (
            String(role)
                .trim()
                .toLowerCase()
            ===
            "administrateur"
        );

    }

    return false;

}

function modifierLotPoussiniere(id) {

    if (!estAdministrateurERP()) {

        alert(
            "Accès réservé à l'administrateur."
        );

        return;
    }

    const poussiniere =
        obtenirPoussiniere();

    const lot =
        poussiniere.find(
            function (item) {
                return item.id === id;
            }
        );

    if (!lot) {

        alert(
            "Lot introuvable."
        );

        return;
    }

    document.getElementById(
        "brooderEditId"
    ).value = lot.id;

    document.getElementById(
        "brooderEspece"
    ).value =
        lot.espece || "";

    document.getElementById(
        "brooderOrigine"
    ).value =
        lot.origine || "";

    document.getElementById(
        "brooderNombre"
    ).value =
        lot.nombreInitial || 0;

    document.getElementById(
        "brooderDate"
    ).value =
        lot.dateEntree || "";

    document.getElementById(
        "brooderEmplacement"
    ).value =
        lot.emplacement || "";

    document.getElementById(
        "brooderTemperature"
    ).value =
        lot.temperature || 0;

    const titre =
        document.getElementById(
            "titreModalPoussiniere"
        );

    if (titre) {

        titre.innerHTML = `
            <i class="fa-solid fa-pen-to-square"></i>
            Modifier le lot en poussinière
        `;

    }

    const bouton =
        document.getElementById(
            "btnEnregistrerPoussiniere"
        );

    if (bouton) {

        bouton.innerHTML = `
            <i class="fa-solid fa-save"></i>
            Enregistrer les modifications
        `;

    }

    ouvrirFormulairePoussiniere();

}

/* =========================================================
   SUPPRIMER UN LOT DE POUSSINIÈRE
   ADMINISTRATEUR UNIQUEMENT
========================================================= */

function supprimerLotPoussiniere(id) {

    if (!estAdministrateurERP()) {

        alert(
            "Accès réservé à l'administrateur."
        );

        return;
    }

    const poussiniere =
        obtenirPoussiniere();

    const index =
        poussiniere.findIndex(
            function (lot) {
                return lot.id === id;
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

    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer le lot ${lot.id} ?\n\nCette action est définitive.`
        );

    if (!confirmation) {
        return;
    }

    poussiniere.splice(
        index,
        1
    );

    sauvegarderPoussiniere(
        poussiniere
    );

    chargerPoussiniere();

    alert(
        `Lot ${lot.id} supprimé avec succès.`
    );
}

/* =========================================================
   12. TABLEAU DE BORD ÉLEVAGE
========================================================= */

function chargerDashboardElevage() {

    const lots =
        obtenirLotsElevage();


    const productions =
        obtenirProductions();


    const sante =
        obtenirSante();


    const actifs =
        lots.filter(
            function (lot) {

                return (
                    lot.statut ===
                    "Actif"
                    ||
                    !lot.statut
                );

            }
        );


    const totalAnimaux =
        actifs.reduce(
            function (
                total,
                lot
            ) {

                return (
                    total +
                    obtenirQuantiteLot(
                        lot
                    )
                );

            },
            0
        );


    const aujourdHui =
        obtenirDateAujourdHui();


    const productionJour =
        productions
            .filter(
                function (item) {

                    return (
                        item.date
                        ===
                        aujourdHui
                    );

                }
            )
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        Number(
                            item.quantite
                            ||
                            0
                        )
                    );

                },
                0
            );


    const maintenant =
        new Date();


    const mois =
        maintenant.getMonth();


    const annee =
        maintenant.getFullYear();


    const mortaliteMois =
        sante
            .filter(
                function (item) {

                    const date =
                        new Date(
                            item.date
                        );


                    return (

                        date.getMonth()
                        ===
                        mois

                        &&

                        date.getFullYear()
                        ===
                        annee

                        &&

                        (
                            item.type
                            ===
                            "Mortalité"

                            ||

                            item.nature
                            ===
                            "Mortalité"
                        )

                    );

                }
            )
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        Number(
                            item.quantite
                            ||
                            1
                        )
                    );

                },
                0
            );


    const elementAnimaux =
        document.getElementById(
            "totalAnimaux"
        );


    const elementLots =
        document.getElementById(
            "lotsActifs"
        );


    const elementProduction =
        document.getElementById(
            "productionJour"
        );


    const elementMortalite =
        document.getElementById(
            "mortaliteMois"
        );


    if (elementAnimaux) {

        elementAnimaux.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    if (elementLots) {

        elementLots.textContent =
            formaterNombre(
                actifs.length
            );

    }


    if (elementProduction) {

        elementProduction.textContent =
            formaterNombre(
                productionJour
            );

    }


    if (elementMortalite) {

        elementMortalite.textContent =
            formaterNombre(
                mortaliteMois
            );

    }

}


/* =========================================================
   13. ACTIVITÉS RÉCENTES
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


    obtenirAnimaux()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:
                        `${item.quantite || 0} ${
                            item.type ||
                            "animaux"
                        } ajoutés`

                });

            }
        );


    obtenirProductions()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:

                        `Production : ${
                            item.quantite ||
                            0
                        } ${
                            item.unite ||
                            ""
                        } de ${
                            item.produit ||
                            item.type ||
                            ""
                        } — ${
                            item.lotNom ||
                            ""
                        }`

                });

            }
        );


    obtenirAlimentation()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:

                        `Alimentation : ${
                            item.quantite ||
                            0
                        } ${
                            item.unite ||
                            ""
                        } de ${
                            item.produit ||
                            ""
                        }`

                });

            }
        );


    obtenirSante()
        .forEach(
            function (item) {

                activites.push({

                    date:
                        item.date,

                    texte:

                        `Santé : ${
                            item.type ||
                            ""
                        } — ${
                            item.animal ||
                            item.lot ||
                            ""
                        }`

                });

            }
        );


    activites.sort(
        function (a, b) {

            return (
                new Date(
                    b.date
                )
                -
                new Date(
                    a.date
                )
            );

        }
    );


    conteneur.innerHTML =
        "";


    if (
        activites.length === 0
    ) {

        conteneur.innerHTML = `

            <div
                class="text-center text-muted">

                Aucune activité enregistrée.

            </div>

        `;

        return;

    }


    activites
        .slice(
            0,
            10
        )
        .forEach(
            function (activite) {

                conteneur.innerHTML += `

                    <div
                        class="list-group-item
                        d-flex
                        justify-content-between
                        align-items-center">

                        <span>

                            ${
                                activite.texte
                            }

                        </span>

                        <small
                            class="text-muted">

                            ${
                                formaterDate(
                                    activite.date
                                )
                            }

                        </small>

                    </div>

                `;

            }
        );

}


/* =========================================================
   14. SUIVI ÉLEVAGE
========================================================= */

function chargerSuiviElevage() {

    const tableau =
        document.getElementById(
            "listeSuiviElevage"
        );


    if (!tableau) {

        return;

    }


    tableau.innerHTML =
        "";


    const lots =
        obtenirLotsElevage();


    if (
        lots.length === 0
    ) {

        tableau.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    Aucun lot à suivre.

                </td>

            </tr>

        `;

        return;

    }


    lots
        .slice()
        .reverse()
        .forEach(
            function (lot) {

                tableau.innerHTML += `

                    <tr>

                        <td>
                            ${
                                obtenirNomLot(
                                    lot
                                )
                            }
                        </td>

                        <td>
                            ${
                                obtenirEspeceLot(
                                    lot
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.quantiteInitiale
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    obtenirQuantiteLot(
                                        lot
                                    )
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.mortalite
                                )
                            }
                        </td>

                        <td>
                            ${
                                formaterNombre(
                                    lot.transferes
                                )
                            }
                        </td>

                        <td>
                            ${
                                lot.statut ||
                                "Actif"
                            }
                        </td>

                    </tr>

                `;

            }
        );

}

/* =========================================================
   14 BIS. GESTION DES SHIFTS D'ÉLEVAGE
   ---------------------------------------------------------
   Un Shift = service de travail d'un agent
   Jour ou Nuit
   Source principale : Supabase
========================================================= */


/* =========================================================
   VÉRIFIER SUPABASE
========================================================= */

function supabaseDisponiblePourShift() {

    return (
        typeof window.supabaseClient !== "undefined" &&
        window.supabaseClient !== null
    );

}


/* =========================================================
   TEST DE CONNEXION À LA TABLE SHIFTS
========================================================= */

async function testerTableShiftsElevage() {

    if (!supabaseDisponiblePourShift()) {

        console.error(
            "Supabase n'est pas disponible."
        );

        return false;
    }


    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("shifts_elevage")
            .select("id")
            .limit(1);


        if (error) {

            console.error(
                "Erreur accès table shifts_elevage :",
                error
            );

            return false;
        }


        console.log(
            "✓ Connexion à shifts_elevage réussie.",
            data
        );

        return true;

    }
    catch (erreur) {

        console.error(
            "Erreur test shifts_elevage :",
            erreur
        );

        return false;
    }

}


/* =========================================================
   RÉCUPÉRER LE SHIFT EN COURS DE L'AGENT
========================================================= */

async function obtenirShiftEnCours() {

    if (!supabaseDisponiblePourShift()) {

        return null;
    }


    const agent =
        obtenirUtilisateur();


    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("shifts_elevage")
            .select("*")
            .eq("agent_nom", agent)
            .eq("statut", "En cours")
            .order(
                "heure_arrivee",
                {
                    ascending: false
                }
            )
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "Erreur recherche Shift en cours :",
                error
            );

            return null;
        }


        return data || null;

    }
    catch (erreur) {

        console.error(
            "Erreur obtenirShiftEnCours :",
            erreur
        );

        return null;
    }

}


/* =========================================================
   DÉMARRER UN SHIFT
   ---------------------------------------------------------
   Cette fonction sera appelée par le futur bouton
   "DÉMARRER LE SHIFT".
========================================================= */

async function demarrerShiftElevage(typeShift) {

    if (!supabaseDisponiblePourShift()) {

        alert(
            "Supabase n'est pas disponible."
        );

        return null;
    }


    const agent =
        obtenirUtilisateur();


    const type =
        String(
            typeShift || ""
        ).trim();


    /* -----------------------------------------------------
       VÉRIFICATION DU TYPE DE SHIFT
    ----------------------------------------------------- */

    if (
        type !== "Jour" &&
        type !== "Nuit"
    ) {

        alert(
            "Veuillez sélectionner le type de Shift : Jour ou Nuit."
        );

        return null;
    }


    /* -----------------------------------------------------
       VÉRIFIER S'IL EXISTE DÉJÀ UN SHIFT
    ----------------------------------------------------- */

    const shiftExistant =
        await obtenirShiftEnCours();


    if (shiftExistant) {

        alert(
            "Un Shift est déjà en cours pour cet agent.\n\n" +
            "Vous devez terminer ce Shift avant d'en démarrer un autre."
        );

        console.warn(
            "Shift déjà en cours :",
            shiftExistant
        );

        return shiftExistant;
    }


    /* -----------------------------------------------------
       CRÉATION DU SHIFT
    ----------------------------------------------------- */

    const nouveauShift = {

        agent_nom:
            agent,

        date_shift:
            obtenirDateAujourdHui(),

        type_shift:
            type,

        statut:
            "En cours"

    };


    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("shifts_elevage")
            .insert(
                [nouveauShift]
            )
            .select()
            .single();


        if (error) {

            console.error(
                "Erreur création Shift :",
                error
            );

            alert(
                "Impossible de démarrer le Shift.\n\n" +
                (error.message || error)
            );

            return null;
        }


        console.log(
            "✓ SHIFT DÉMARRÉ :",
            data
        );


        /* -------------------------------------------------
           MÉMORISER UNIQUEMENT L'ID DU SHIFT ACTIF
           -------------------------------------------------
           Cela sert à l'interface pendant le service.
           La donnée officielle reste dans Supabase.
        ------------------------------------------------- */

        if (data && data.id) {

            localStorage.setItem(
                "shiftElevageActif",
                data.id
            );

        }


        return data;

    }
    catch (erreur) {

        console.error(
            "Erreur demarrerShiftElevage :",
            erreur
        );

        alert(
            "Une erreur est survenue lors du démarrage du Shift."
        );

        return null;
    }

}


/* =========================================================
   EXPORTS SHIFT
========================================================= */

window.testerTableShiftsElevage =
    testerTableShiftsElevage;

window.obtenirShiftEnCours =
    obtenirShiftEnCours;

window.demarrerShiftElevage =
    demarrerShiftElevage;


/* =========================================================
   FIN GESTION DES SHIFTS
========================================================= */

/* =========================================================
   14 TER. BÂTIMENTS D'ÉLEVAGE
   ---------------------------------------------------------
   Charge les bâtiments actifs depuis Supabase
   et les affiche dans le Shift en cours.
========================================================= */

/* =========================================================
   14 TER. BÂTIMENTS DU SHIFT
   ---------------------------------------------------------
   Charge les bâtiments actifs depuis Supabase.
   Affiche les bâtiments affectés au Shift.
   Permet de sélectionner plusieurs bâtiments.
========================================================= */

/* =========================================================
   14 TER. BÂTIMENTS DU SHIFT
   ---------------------------------------------------------
   Charge les bâtiments actifs depuis Supabase.
   Affiche les bâtiments affectés au Shift.
   Permet de sélectionner plusieurs bâtiments.
========================================================= */

async function chargerBatimentsElevage() {

    if (!supabaseDisponiblePourShift()) {

        console.error(
            "Supabase n'est pas disponible pour les bâtiments."
        );

        return [];
    }

    const zoneShift =
        document.getElementById(
            "zoneShiftEnCours"
        );

    if (!zoneShift) {

        console.warn(
            "zoneShiftEnCours est introuvable."
        );

        return [];
    }

    try {

        /* =================================================
           1. RÉCUPÉRER LE SHIFT EN COURS
        ================================================= */

        const shift =
            await obtenirShiftEnCours();

        if (!shift) {

            console.warn(
                "Aucun Shift en cours."
            );

            return [];
        }


        /* =================================================
           2. CHARGER LES BÂTIMENTS ACTIFS
        ================================================= */

        const {
            data: batiments,
            error: erreurBatiments
        } = await window.supabaseClient
            .from("batiments_elevage")
            .select(
                "id, nom, type_batiment, capacite_animaux, actif, observations"
            )
            .eq(
                "actif",
                true
            )
            .order(
                "nom",
                {
                    ascending: true
                }
            );


        if (erreurBatiments) {

            console.error(
                "Erreur chargement bâtiments :",
                erreurBatiments
            );

            return [];
        }


        const listeBatiments =
            Array.isArray(batiments)
                ? batiments
                : [];


        /* =================================================
           3. CHARGER LES BÂTIMENTS DÉJÀ AFFECTÉS AU SHIFT
        ================================================= */

        const {
            data: affectations,
            error: erreurAffectations
        } = await window.supabaseClient
            .from("shifts_elevage_batiments")
            .select("batiment_id")
            .eq(
                "shift_id",
                shift.id
            );


        if (erreurAffectations) {

            console.error(
                "Erreur chargement affectations bâtiments :",
                erreurAffectations
            );

            return [];
        }


        const batimentsAffectes =
            Array.isArray(affectations)
                ? affectations.map(
                    function (ligne) {
                        return String(
                            ligne.batiment_id
                        );
                    }
                )
                : [];


        /* =================================================
           4. ZONE D'AFFICHAGE
        ================================================= */

        let zoneBatiments =
            document.getElementById(
                "zoneBatimentsElevage"
            );


        if (!zoneBatiments) {

            zoneBatiments =
                document.createElement(
                    "div"
                );

            zoneBatiments.id =
                "zoneBatimentsElevage";

            zoneBatiments.className =
                "mt-4";

            zoneShift.appendChild(
                zoneBatiments
            );
        }


        /* =================================================
           5. CONSTRUCTION DE L'INTERFACE
        ================================================= */

        let html = `

            <div class="card border-0 shadow-sm">

                <div class="card-header bg-light">

                    <strong>
                        <i class="fa-solid fa-warehouse me-2"></i>
                        Bâtiments à gérer pendant ce Shift
                    </strong>

                </div>

                <div class="card-body">

        `;


        if (listeBatiments.length === 0) {

            html += `

                <div class="alert alert-warning mb-0">

                    Aucun bâtiment actif n'est disponible.

                </div>

            `;

        } else {

            html += `

                <div class="row g-3">

            `;


            listeBatiments.forEach(
                function (batiment) {

                    const idBatiment =
                        String(
                            batiment.id
                        );

                    const estSelectionne =
                        batimentsAffectes.includes(
                            idBatiment
                        );


                    html += `

                        <div class="col-md-6">

                            <div class="border rounded p-3 h-100">

                                <div class="form-check">

                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        value="${idBatiment}"
                                        id="batimentShift_${idBatiment}"
                                        ${
                                            estSelectionne
                                                ? "checked"
                                                : ""
                                        }
                                    >

                                    <label
                                        class="form-check-label w-100"
                                        for="batimentShift_${idBatiment}"
                                    >

                                        <strong>
                                            ${
                                                batiment.nom ||
                                                "Bâtiment sans nom"
                                            }
                                        </strong>

                                        <div class="small text-muted mt-1">

                                            Type :
                                            ${
                                                batiment.type_batiment ||
                                                "-"
                                            }

                                            <br>

                                            Capacité :
                                            ${
                                                batiment.capacite_animaux ??
                                                0
                                            }
                                            animaux

                                        </div>

                                    </label>

                                </div>

                            </div>

                        </div>

                    `;

                }
            );


            html += `

                </div>

                <div class="mt-3">

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="btnEnregistrerBatimentsShift"
                    >

                        <i class="fa-solid fa-save me-2"></i>

                        Enregistrer les bâtiments du Shift

                    </button>

                </div>

            `;
        }


        html += `

                </div>

            </div>

        `;


        zoneBatiments.innerHTML =
            html;


        /* =================================================
           6. CONNECTER LE BOUTON
        ================================================= */

        const bouton =
            document.getElementById(
                "btnEnregistrerBatimentsShift"
            );


        if (bouton) {

            bouton.addEventListener(
                "click",
                enregistrerBatimentsDuShift
            );

        }


        console.log(
            "✓ Bâtiments du Shift chargés :",
            listeBatiments
        );

        console.log(
            "✓ Bâtiments déjà affectés :",
            batimentsAffectes
        );


        return listeBatiments;

    }
    catch (erreur) {

        console.error(
            "Erreur chargerBatimentsElevage :",
            erreur
        );

        return [];
    }
}


/* =========================================================
   ENREGISTRER LES BÂTIMENTS DU SHIFT
========================================================= */

async function enregistrerBatimentsDuShift() {

    if (!supabaseDisponiblePourShift()) {

        alert(
            "Supabase n'est pas disponible."
        );

        return false;
    }


    try {

        /* =================================================
           1. RÉCUPÉRER LE SHIFT
        ================================================= */

        const shift =
            await obtenirShiftEnCours();


        if (!shift) {

            alert(
                "Aucun Shift en cours."
            );

            return false;
        }


        /* =================================================
           2. RÉCUPÉRER LES CASES COCHÉES
        ================================================= */

        const cases =
            document.querySelectorAll(
                '#zoneBatimentsElevage input[type="checkbox"]:checked'
            );


        const batimentIds =
            Array.from(
                cases
            ).map(
                function (caseElement) {

                    return caseElement.value;

                }
            );


        /* =================================================
           3. SUPPRIMER LES ANCIENNES AFFECTATIONS
        ================================================= */

        const {
            error: erreurSuppression
        } = await window.supabaseClient
            .from("shifts_elevage_batiments")
            .delete()
            .eq(
                "shift_id",
                shift.id
            );


        if (erreurSuppression) {

            console.error(
                "Erreur suppression anciennes affectations :",
                erreurSuppression
            );

            alert(
                "Impossible de mettre à jour les bâtiments du Shift."
            );

            return false;
        }


        /* =================================================
           4. AJOUTER LES NOUVELLES AFFECTATIONS
        ================================================= */

        if (batimentIds.length > 0) {

            const nouvellesAffectations =
                batimentIds.map(
                    function (batimentId) {

                        return {

                            shift_id:
                                shift.id,

                            batiment_id:
                                batimentId

                        };

                    }
                );


            const {
                error: erreurInsertion
            } = await window.supabaseClient
                .from("shifts_elevage_batiments")
                .insert(
                    nouvellesAffectations
                );


            if (erreurInsertion) {

                console.error(
                    "Erreur enregistrement bâtiments du Shift :",
                    erreurInsertion
                );

                alert(
                    "Impossible d'enregistrer les bâtiments sélectionnés."
                );

                return false;
            }
        }


        console.log(
            "✓ Bâtiments du Shift enregistrés :",
            batimentIds
        );


        alert(
            batimentIds.length > 0
                ? "Les bâtiments du Shift ont été enregistrés avec succès."
                : "Aucun bâtiment n'est affecté à ce Shift."
        );


        /* =================================================
           5. RECHARGER L'AFFICHAGE
        ================================================= */

        await chargerBatimentsElevage();


        return true;

    }
    catch (erreur) {

        console.error(
            "Erreur enregistrerBatimentsDuShift :",
            erreur
        );

        alert(
            "Une erreur est survenue lors de l'enregistrement."
        );

        return false;
    }
}

window.chargerBatimentsElevage =
    chargerBatimentsElevage;

window.enregistrerBatimentsDuShift =
    enregistrerBatimentsDuShift;

/* =========================================================
   15. COMPATIBILITÉ
========================================================= */

/*
 * Certaines anciennes pages de ton ERP utilisent
 * getDataLocale() et sauvegarderDataLocale().
 *
 * On conserve ces noms comme alias.
 */

function getDataLocale(
    cle
) {

    return obtenirDonnees(
        cle
    );

}


function sauvegarderDataLocale(
    cle,
    donnees
) {

    return sauvegarderDonnees(
        cle,
        donnees
    );

}


function obtenirDateAujourdhui() {

    return obtenirDateAujourdHui();

}


/* =========================================================
   16. EXPORTS GLOBAUX
   ---------------------------------------------------------
   Nécessaire pour les onclick présents dans tes pages HTML.
========================================================= */

window.genererId =
    genererId;

window.obtenirUtilisateur =
    obtenirUtilisateur;

window.obtenirDateAujourdHui =
    obtenirDateAujourdHui;

window.formaterNombre =
    formaterNombre;

window.formaterDate =
    formaterDate;


/* ANIMAUX */

window.obtenirAnimaux =
    obtenirAnimaux;

window.ajouterAnimal =
    ajouterAnimal;

window.chargerAnimaux =
    chargerAnimaux;


/* LOTS */

window.obtenirLotsElevage =
    obtenirLotsElevage;
window.supprimerLotPoussiniere =
    supprimerLotPoussiniere;

window.obtenirLotsConnectes =
    obtenirLotsConnectes;

window.enregistrerLot =
    enregistrerLot;

window.chargerLots =
    chargerLots;

window.supprimerLot =
    supprimerLot;

window.chargerLotsProduction =
    chargerLotsProduction;


/* PRODUCTION */

window.obtenirProductions =
    obtenirProductions;

window.enregistrerProduction =
    enregistrerProduction;

window.chargerProductions =
    chargerProductions;

window.obtenirStockOeufsIncubation =
    obtenirStockOeufsIncubation;

window.sauvegarderStockOeufsIncubation =
    sauvegarderStockOeufsIncubation;

window.obtenirOeufsDisponiblesPourLot =
    obtenirOeufsDisponiblesPourLot;


/* SANTÉ */

window.obtenirSante =
    obtenirSante;

window.chargerSante =
    chargerSante;

window.supprimerSante =
    supprimerSante;


/* ALIMENTATION */

window.obtenirAlimentation =
    obtenirAlimentation;

window.chargerAlimentation =
    chargerAlimentation;

window.chargerLotsAlimentation =
    chargerLotsAlimentation;


/* REPRODUCTION */

window.obtenirReproduction =
    obtenirReproduction;

window.chargerReproduction =
    chargerReproduction;


/* CROISSANCE */

window.obtenirCroissance =
    obtenirCroissance;

window.chargerCroissance =
    chargerCroissance;


/* POUSSINIÈRE */

window.obtenirPoussiniere =
    obtenirPoussiniere;

window.enregistrerPoussiniere =
    enregistrerPoussiniere;

window.chargerPoussiniere =
    chargerPoussiniere;

window.ouvrirFormulairePoussiniere =
    ouvrirFormulairePoussiniere;

window.fermerFormulairePoussiniere =
    fermerFormulairePoussiniere;

window.modifierLotPoussiniere =
    modifierLotPoussiniere;

window.supprimerLotPoussiniere =
    supprimerLotPoussiniere;

/* TABLEAU DE BORD */

window.chargerDashboardElevage =
    chargerDashboardElevage;

window.chargerActivitesRecentes =
    chargerActivitesRecentes;

window.chargerSuiviElevage =
    chargerSuiviElevage;


/* COMPATIBILITÉ */

window.getDataLocale =
    getDataLocale;

window.sauvegarderDataLocale =
    sauvegarderDataLocale;

window.obtenirDateAujourdhui =
    obtenirDateAujourdhui;

/* =========================================================
   BOUTON NOUVEAU LOT POUSSINIÈRE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const bouton =
        document.getElementById(
            "btnNouveauLotPoussiniere"
        );

    if (bouton) {

        bouton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                ouvrirFormulairePoussiniere();

            }
        );

    }

});

/* =========================================================
   17. INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * ANIMAUX
         */

        chargerAnimaux();


        /*
         * LOTS
         */

              chargerLots()
            .then(
                function () {

                    chargerLotsProduction();

                }
            )
            .catch(
                function (erreur) {

                    console.error(
                        "Erreur chargement des lots :",
                        erreur
                    );

                }
            );


        /*
         * PRODUCTION
         */

        chargerProductions();


        /*
         * AUTRES MODULES
         */

        chargerSante();

        chargerAlimentation();

        chargerLotsAlimentation();

        chargerReproduction();

        chargerCroissance();

        chargerPoussiniere();


        /*
         * TABLEAU DE BORD
         */

        chargerDashboardElevage();

        chargerActivitesRecentes();

        chargerSuiviElevage();


        console.log(
            "✓ Ferme Asher ERP — elevage.js chargé."
        );

        console.log(
            "✓ Incubation séparée dans incubation.js."
        );

    }
);


/* =========================================================
   FIN ELEVAGE.JS
========================================================= */
