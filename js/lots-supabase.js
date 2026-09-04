/* =========================================================
   FERME ASHER ERP
   LOTS D'ÉLEVAGE — SUPABASE
   Fichier : js/lots-supabase.js

   SOURCE CENTRALE :
   Supabase → lots_elevage

   Ce fichier remplace progressivement les anciennes
   fonctions lots utilisant localStorage.
========================================================= */

"use strict";


/* =========================================================
   VÉRIFIER SUPABASE
========================================================= */

function lotsSupabaseDisponible() {

    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient !== null
    );

}


/* =========================================================
   CONVERSION SUPABASE → FORMAT ERP
========================================================= */

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
            lot.race_type || "",

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

        utilisateur:
            "",

        dateCreation:
            lot.created_at || null,

        dateModification:
            lot.updated_at || null

    };

}


/* =========================================================
   CHARGER LES LOTS DEPUIS SUPABASE
========================================================= */

async function chargerLotsDepuisSupabase() {

    if (!lotsSupabaseDisponible()) {

        console.error(
            "Supabase n'est pas disponible."
        );

        return [];

    }


    const resultat =
        await supabaseClient
            .from("lots_elevage")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


    if (resultat.error) {

        console.error(
            "Erreur Supabase — lots_elevage :",
            resultat.error
        );

        return [];

    }


    return (
        resultat.data || []
    ).map(
        convertirLotSupabase
    );

}


/* =========================================================
   OBTENIR LES LOTS
   ---------------------------------------------------------
   SUPABASE EST MAINTENANT LA SOURCE PRINCIPALE.
========================================================= */

async function obtenirLotsElevageSupabase() {

    return await chargerLotsDepuisSupabase();

}


/* =========================================================
   MIGRER LES ANCIENS LOTS LOCAUX
   ---------------------------------------------------------
   Permet de récupérer les lots déjà présents dans
   l'ancien localStorage.

   IMPORTANT :
   Le code du lot sert à éviter les doublons.
========================================================= */

async function migrerAnciensLotsVersSupabase() {

    if (!lotsSupabaseDisponible()) {

        return;

    }


    let anciensLots = [];


    try {

        const donnees =
            localStorage.getItem(
                "lotsElevage"
            );


        anciensLots =
            donnees
                ? JSON.parse(donnees)
                : [];


        if (
            !Array.isArray(
                anciensLots
            )
        ) {

            anciensLots = [];

        }

    }
    catch (erreur) {

        console.error(
            "Erreur lecture anciens lots :",
            erreur
        );

        return;

    }


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

        if (!lot) {

            continue;

        }


        const code =
            lot.code ||
            lot.id;


        if (!code) {

            continue;

        }


        try {

            const recherche =
                await supabaseClient
                    .from("lots_elevage")
                    .select("id, code")
                    .eq(
                        "code",
                        code
                    )
                    .maybeSingle();


            if (recherche.error) {

                console.error(
                    "Erreur recherche lot :",
                    recherche.error
                );

                continue;

            }


            /*
             * Le lot existe déjà :
             * ne pas créer de doublon.
             */

            if (
                recherche.data
            ) {

                continue;

            }


            const donnees = {

                code:
                    code,

                espece:
                    lot.espece ||
                    lot.type ||
                    "Non précisée",

                race_type:
                    lot.race ||
                    "Non précisée",

                nom_lot:
                    lot.nom ||
                    lot.nomLot ||
                    "Lot sans nom",

                date_entree:
                    lot.dateEntree ||
                    lot.date ||
                    obtenirDateAujourdHui(),

                quantite_initiale:
                    Number(
                        lot.quantiteInitiale ||
                        lot.quantite ||
                        0
                    ),

                quantite_actuelle:
                    Number(
                        lot.quantiteActuelle ??
                        lot.quantite ??
                        0
                    ),

                origine:
                    lot.origine ||
                    "Achat",

                cout_acquisition:
                    Number(
                        lot.cout ||
                        0
                    ),

                statut:
                    lot.statut ||
                    "Actif",

                notes:
                    lot.notes ||
                    ""

            };


            const insertion =
                await supabaseClient
                    .from("lots_elevage")
                    .insert(
                        [donnees]
                    )
                    .select()
                    .single();


            if (insertion.error) {

                console.error(
                    "Erreur migration lot :",
                    insertion.error
                );

                continue;

            }


            console.log(
                "✓ Lot migré :",
                donnees.nom_lot,
                donnees.code
            );

        }
        catch (erreur) {

            console.error(
                "Erreur migration :",
                erreur
            );

        }

    }

}


/* =========================================================
   CHARGER LA PAGE ANIMAUX & LOTS
========================================================= */

async function chargerLots() {

    const tableau =
        document.getElementById(
            "listeLots"
        );


    /*
     * Si nous ne sommes pas sur la page
     * Animaux & Lots, rien à afficher.
     */

    if (!tableau) {

        return;

    }


    tableau.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="text-center text-muted py-4">

                Chargement des lots...

            </td>

        </tr>

    `;


    /*
     * 1. Migrer les anciennes données
     */

    await migrerAnciensLotsVersSupabase();


    /*
     * 2. Charger Supabase
     */

    const lots =
        await chargerLotsDepuisSupabase();


    /*
     * 3. Sauvegarder une copie locale temporaire
     *
     * Cela permet aux anciens modules de continuer
     * à fonctionner pendant la migration générale.
     */

    try {

        localStorage.setItem(
            "lotsElevage",
            JSON.stringify(
                lots
            )
        );

    }
    catch (erreur) {

        console.warn(
            "Impossible de mettre à jour le cache local.",
            erreur
        );

    }


    tableau.innerHTML =
        "";


    /*
     * Aucun lot
     */

    if (
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


        mettreAJourStatistiquesLots(
            lots
        );

        return;

    }


    /*
     * Afficher les lots
     */

    lots.forEach(
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
                            lot.espece ||
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
                            lot.nom ||
                            lot.nomLot ||
                            "-"
                        }

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
                            formaterNombre(
                                lot.quantiteInitiale
                            )
                        }

                    </td>


                    <td>

                        ${
                            formaterNombre(
                                lot.quantiteActuelle
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
                            onclick="supprimerLot('${lot.id}')"
                            title="Supprimer">

                            <i
                                class="fa-solid fa-trash">
                            </i>

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    mettreAJourStatistiquesLots(
        lots
    );


    /*
     * Production doit utiliser les mêmes lots.
     */

    chargerLotsProduction();

}


/* =========================================================
   STATISTIQUES LOTS
========================================================= */

function mettreAJourStatistiquesLots(
    lotsParametres
) {

    const lots =
        Array.isArray(
            lotsParametres
        )
        ? lotsParametres
        : [];


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
                    Number(
                        lot.quantiteActuelle ||
                        lot.quantite ||
                        0
                    )
                );

            },
            0
        );


    /*
     * Animaux
     */

    const elementAnimaux =
        document.getElementById(
            "totalAnimaux"
        );


    if (
        elementAnimaux
    ) {

        elementAnimaux.textContent =
            formaterNombre(
                totalAnimaux
            );

    }


    /*
     * Lots
     */

    const elementLots =
        document.getElementById(
            "totalLots"
        );


    if (
        elementLots
    ) {

        elementLots.textContent =
            actifs.length;

    }


    /*
     * Certaines versions de ta page utilisent
     * lotsActifs.
     */

    const elementLotsActifs =
        document.getElementById(
            "lotsActifs"
        );


    if (
        elementLotsActifs
    ) {

        elementLotsActifs.textContent =
            actifs.length;

    }


    /*
     * Ancienne version possible : element "lots"
     */

    const elementLotsGenerique =
        document.getElementById(
            "lots"
        );


    if (
        elementLotsGenerique
    ) {

        elementLotsGenerique.textContent =
            actifs.length;

    }

}


/* =========================================================
   OBTENIR LOTS POUR LES AUTRES MODULES
========================================================= */

async function chargerLotsPourSelect(
    selectId
) {

    const select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    const ancienneValeur =
        select.value;


    const lots =
        await chargerLotsDepuisSupabase();


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


                option.dataset.espece =
                    lot.espece ||
                    "";


                option.dataset.nom =
                    lot.nom ||
                    "";


                option.dataset.race =
                    lot.race ||
                    "";


                option.textContent =

                    (
                        lot.nom ||
                        "Lot sans nom"
                    )

                    +

                    " — "

                    +

                    (
                        lot.espece ||
                        ""
                    )

                    +

                    " ("

                    +

                    formaterNombre(
                        lot.quantiteActuelle
                    )

                    +

                    " animaux)";


                select.appendChild(
                    option
                );

            }
        );


    if (
        ancienneValeur
    ) {

        select.value =
            ancienneValeur;

    }

}


/* =========================================================
   LOTS → PRODUCTION
========================================================= */

async function chargerLotsProduction() {

    await chargerLotsPourSelect(
        "productionLot"
    );

}


/* =========================================================
   OBTENIR LES LOTS CONNECTÉS
========================================================= */

async function obtenirLotsConnectes() {

    return await chargerLotsDepuisSupabase();

}


/* =========================================================
   TROUVER UN LOT
========================================================= */

async function trouverLotParId(
    lotId
) {

    if (
        !lotsSupabaseDisponible()
    ) {

        return null;

    }


    const resultat =
        await supabaseClient
            .from("lots_elevage")
            .select("*")
            .eq(
                "id",
                lotId
            )
            .maybeSingle();


    if (
        resultat.error
    ) {

        console.error(
            "Erreur recherche lot :",
            resultat.error
        );

        return null;

    }


    return resultat.data
        ? convertirLotSupabase(
            resultat.data
        )
        : null;

}


/* =========================================================
   ENREGISTRER UN NOUVEAU LOT
========================================================= */

async function enregistrerLot(event) {

    if (event) {

        event.preventDefault();

    }


    if (
        !lotsSupabaseDisponible()
    ) {

        alert(
            "Supabase n'est pas disponible.\n\n" +
            "Vérifie supabase.js et la Publishable Key."
        );

        return false;

    }


    const espece =
        document.getElementById(
            "lotEspece"
        )?.value.trim()
        || "";


    const race =
        document.getElementById(
            "lotRace"
        )?.value.trim()
        || "Non précisée";


    const nom =
        document.getElementById(
            "lotNom"
        )?.value.trim()
        || "";


    const dateEntree =
        document.getElementById(
            "lotDateEntree"
        )?.value
        || obtenirDateAujourdHui();


    const quantite =
        Number(
            document.getElementById(
                "lotQuantite"
            )?.value
        );


    const origine =
        document.getElementById(
            "lotOrigine"
        )?.value
        || "Achat";


    const cout =
        Number(
            document.getElementById(
                "lotCout"
            )?.value
            || 0
        );


    const statut =
        document.getElementById(
            "lotStatut"
        )?.value
        || "Actif";


    const notes =
        document.getElementById(
            "lotNotes"
        )?.value.trim()
        || "";


    /*
     * VALIDATION
     */

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


    /*
     * CODE UNIQUE
     */

    const code =
        genererCodeLot();


    /*
     * Vérifier le nom dans Supabase.
     */

    const doublon =
        await supabaseClient
            .from("lots_elevage")
            .select("id, nom_lot, code")
            .ilike(
                "nom_lot",
                nom
            )
            .maybeSingle();


    if (
        doublon.data
    ) {

        const continuer =
            confirm(

                `Un lot nommé "${nom}" existe déjà.\n\n` +
                "Voulez-vous quand même créer ce nouveau lot ?"

            );


        if (!continuer) {

            return false;

        }

    }


    /*
     * DONNÉES SUPABASE
     */

    const donnees = {

        code:
            code,

        espece:
            espece,

        race_type:
            race,

        nom_lot:
            nom,

        date_entree:
            dateEntree,

        quantite_initiale:
            quantite,

        quantite_actuelle:
            quantite,

        origine:
            origine,

        cout_acquisition:
            cout,

        statut:
            statut,

        notes:
            notes

    };


    /*
     * INSERTION
     */

    const resultat =
        await supabaseClient
            .from("lots_elevage")
            .insert(
                [donnees]
            )
            .select()
            .single();


    if (
        resultat.error
    ) {

        console.error(
            "Erreur création lot :",
            resultat.error
        );


        alert(

            "Impossible d'enregistrer le lot.\n\n" +

            resultat.error.message

        );


        return false;

    }


    /*
     * Mettre à jour le cache local
     * pour les anciens modules.
     */

    try {

        const lots =
            await chargerLotsDepuisSupabase();


        localStorage.setItem(
            "lotsElevage",
            JSON.stringify(
                lots
            )
        );

    }
    catch (erreur) {

        console.warn(
            "Cache local non mis à jour.",
            erreur
        );

    }


    /*
     * Réinitialiser le formulaire.
     */

    const formulaire =
        document.getElementById(
            "formLot"
        );


    if (
        formulaire
    ) {

        formulaire.reset();

    }


    /*
     * Fermer le modal.
     */

    const modalElement =
        document.getElementById(
            "modalLot"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (
            modal
        ) {

            modal.hide();

        }

    }


    /*
     * Actualiser.
     */

    await chargerLots();


    alert(

        `Le lot "${nom}" a été enregistré avec succès.\n\n` +

        `Code : ${code}\n` +

        `Quantité : ${formaterNombre(
            quantite
        )}`

    );


    return true;

}


/* =========================================================
   SUPPRIMER UN LOT
========================================================= */

async function supprimerLot(
    id
) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce lot ?"
        );


    if (
        !confirmation
    ) {

        return;

    }


    if (
        !lotsSupabaseDisponible()
    ) {

        alert(
            "Supabase n'est pas disponible."
        );

        return;

    }


    const resultat =
        await supabaseClient
            .from("lots_elevage")
            .delete()
            .eq(
                "id",
                id
            );


    if (
        resultat.error
    ) {

        console.error(
            "Erreur suppression lot :",
            resultat.error
        );


        alert(
            "Impossible de supprimer le lot.\n\n" +
            resultat.error.message
        );

        return;

    }


    /*
     * Actualiser le cache.
     */

    const lots =
        await chargerLotsDepuisSupabase();


    localStorage.setItem(
        "lotsElevage",
        JSON.stringify(
            lots
        )
    );


    await chargerLots();


    alert(
        "Le lot a été supprimé."
    );

}


/* =========================================================
   COMPATIBILITÉ
========================================================= */

function obtenirDateAujourdhui() {

    const date =
        new Date();


    return (

        date.getFullYear()

        +

        "-"

        +

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        )

        +

        "-"

        +

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    );

}


/* =========================================================
   EXPORTS
========================================================= */

window.chargerLots =
    chargerLots;

window.enregistrerLot =
    enregistrerLot;

window.supprimerLot =
    supprimerLot;

window.chargerLotsProduction =
    chargerLotsProduction;

window.obtenirLotsConnectes =
    obtenirLotsConnectes;

window.trouverLotParId =
    trouverLotParId;

window.obtenirLotsElevageSupabase =
    obtenirLotsElevageSupabase;


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
         * Seulement si la page possède
         * la liste des lots.
         */

        if (
            document.getElementById(
                "listeLots"
            )
        ) {

            await chargerLots();

        }

        /*
         * Production
         */

        await chargerLotsProduction();


        console.log(
            "✓ lots-supabase.js chargé."
        );

    }
);
