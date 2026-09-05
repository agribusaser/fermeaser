/* =========================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   FICHIER : js/incubation.js

   CHAÎNE :

   ANIMAUX & LOTS
        ↓
   PRODUCTION ŒUFS
        ↓
   INCUBATION
        ↓
   ÉCLOSION
        ↓
   POUSSINIÈRE
        ↓
   NOUVEAU LOT

   SOURCE DE DONNÉES :
   SUPABASE
========================================================= */

"use strict";


/* =========================================================
   DURÉES D'INCUBATION
========================================================= */

const DUREES_INCUBATION = {

    "Cailles": 17,
    "Caille": 17,

    "Poules": 21,
    "Poule": 21,

    "Poulets": 21,
    "Poulet": 21,

    "Canards": 28,
    "Canard": 28,

    "Pintades": 28,
    "Pintade": 28,

    "Dindes": 28,
    "Dinde": 28

};


/* =========================================================
   UTILITAIRES
========================================================= */

function incubationGenererId() {

    return (
        "INC-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


function incubationDateAujourdhui() {

    const d = new Date();

    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


function incubationAjouterJours(
    date,
    jours
) {

    if (!date || !jours) {

        return "";

    }

    const d =
        new Date(
            date + "T00:00:00"
        );

    d.setDate(
        d.getDate() +
        Number(jours)
    );

    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


function incubationFormaterDate(date) {

    if (!date) {

        return "-";

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


function incubationFormaterNombre(nombre) {

    return Number(
        nombre || 0
    ).toLocaleString(
        "fr-FR"
    );

}


function incubationUtilisateur() {

    return (
        localStorage.getItem("utilisateur") ||
        localStorage.getItem("utilisateurConnecte") ||
        "Administrateur"
    );

}


/* =========================================================
   VÉRIFICATION SUPABASE
========================================================= */

function incubationVerifierSupabase() {

    if (
        typeof supabaseClient === "undefined"
    ) {

        alert(
            "Supabase n'est pas chargé."
        );

        console.error(
            "supabaseClient est introuvable."
        );

        return false;

    }

    return true;

}


/* =========================================================
   CHARGER LES LOTS DEPUIS SUPABASE
========================================================= */

async function chargerLotsIncubation() {

    const select =
        document.getElementById(
            "incubationLot"
        );

    if (!select) {

        return;

    }

    if (
        !incubationVerifierSupabase()
    ) {

        return;

    }

    select.innerHTML = `
        <option value="">
            Chargement des lots...
        </option>
    `;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("lots_elevage")
            .select(`
                id,
                code,
                espece,
                race_type,
                nom_lot,
                quantite_actuelle,
                statut
            `)
            .order(
                "id",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erreur chargement lots :",
            error
        );

        select.innerHTML = `
            <option value="">
                Erreur de chargement
            </option>
        `;

        return;

    }


    const lotsActifs =
        (data || []).filter(
            function (lot) {

                return (
                    !lot.statut ||
                    lot.statut === "Actif"
                );

            }
        );


    select.innerHTML = `
        <option value="">
            Sélectionner le lot
        </option>
    `;


    if (
        lotsActifs.length === 0
    ) {

        select.innerHTML = `
            <option value="">
                Aucun lot disponible
            </option>
        `;

        return;

    }


    lotsActifs.forEach(
        function (lot) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                lot.id;

            option.dataset.espece =
                lot.espece || "";

            option.dataset.race =
                lot.race_type || "";

            option.dataset.nom =
                lot.nom_lot || "";

            option.textContent =

                (
                    lot.nom_lot ||
                    "Lot sans nom"
                ) +

                " — " +

                (
                    lot.espece ||
                    "-"
                ) +

                (
                    lot.race_type
                        ? " | " +
                          lot.race_type
                        : ""
                ) +

                " | " +

                incubationFormaterNombre(
                    lot.quantite_actuelle
                ) +

                " animaux";

            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   RÉCUPÉRER UN LOT
========================================================= */

async function incubationObtenirLot(
    lotId
) {

    if (
        !lotId ||
        !incubationVerifierSupabase()
    ) {

        return null;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("lots_elevage")
            .select(`
                id,
                code,
                espece,
                race_type,
                nom_lot,
                quantite_actuelle,
                statut
            `)
            .eq(
                "id",
                lotId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Erreur recherche lot :",
            error
        );

        return null;

    }


    return data || null;

}


/* =========================================================
   CHARGER LES INCUBATIONS
========================================================= */

async function chargerIncubations() {

    const tableau =
        document.getElementById(
            "listeIncubations"
        );

    if (!tableau) {

        return;

    }

    if (
        !incubationVerifierSupabase()
    ) {

        return;

    }


    tableau.innerHTML = `
        <tr>
            <td
                colspan="9"
                class="text-center text-muted py-4"
            >
                Chargement...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("incubations")
            .select("*")
            .order(
                "date_entree",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erreur chargement incubations :",
            error
        );

        tableau.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-danger py-4"
                >
                    Erreur de chargement des incubations.
                </td>
            </tr>
        `;

        return;

    }


    tableau.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        tableau.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-muted py-4"
                >
                    Aucune incubation enregistrée.
                </td>
            </tr>
        `;

        actualiserStatistiquesIncubation(
            []
        );

        return;

    }


    data.forEach(
        function (incubation) {

            let badge =
                "bg-primary";


            if (
                incubation.statut ===
                "Éclos"
            ) {

                badge =
                    "bg-success";

            }

            else if (
                incubation.statut ===
                "Terminé"
            ) {

                badge =
                    "bg-secondary";

            }

            else if (
                incubation.statut ===
                "Annulé"
            ) {

                badge =
                    "bg-danger";

            }


            const ligne =
                document.createElement(
                    "tr"
                );


            ligne.innerHTML = `

                <td>
                    <strong>
                        ${incubation.id}
                    </strong>
                </td>

                <td>
                    ${incubation.espece || "-"}
                </td>

                <td>
                    ${
                        incubation.lot_nom ||
                        "-"
                    }
                </td>

                <td>
                    ${
                        incubation.couveuse ||
                        "-"
                    }
                </td>

                <td>
                    ${
                        incubation.oeufs_initial ||
                        0
                    }
                </td>

                <td>
                    ${
                        incubationFormaterDate(
                            incubation.date_entree
                        )
                    }
                </td>

                <td>
                    ${
                        incubationFormaterDate(
                            incubation.date_eclosion
                        )
                    }
                </td>

                <td>

                    <span
                        class="badge ${badge}"
                    >

                        ${
                            incubation.statut ||
                            "En incubation"
                        }

                    </span>

                </td>

                <td class="text-center">

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="
                            voirDetailsIncubation(
                                '${incubation.id}'
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-success"
                        onclick="
                            ouvrirSuiviIncubation(
                                '${incubation.id}'
                            )
                        "
                    >

                        <i
                            class="fa-solid fa-clipboard-check"
                        ></i>

                    </button>

                </td>

            `;


            tableau.appendChild(
                ligne
            );

        }
    );


    actualiserStatistiquesIncubation(
        data
    );

}


/* =========================================================
   STATISTIQUES
========================================================= */

function actualiserStatistiquesIncubation(
    incubations
) {

    incubations =
        Array.isArray(
            incubations
        )
            ? incubations
            : [];


    const total =
        incubations.length;


    const actives =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "En incubation"
                );

            }
        ).length;


    const ecloses =
        incubations.filter(
            function (item) {

                return (
                    item.statut ===
                    "Éclos" ||
                    item.statut ===
                    "Éclosion"
                );

            }
        ).length;


    const totalOeufs =
        incubations.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.oeufs_initial ||
                        0
                    )
                );

            },
            0
        );


    const elements = {

        "totalIncubations":
            total,

        "incubationsActives":
            actives,

        "incubationsEcloses":
            ecloses,

        "totalOeufsIncubes":
            totalOeufs,

        "oeufsIncubation":
            totalOeufs

    };


    Object.keys(
        elements
    ).forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.textContent =
                    incubationFormaterNombre(
                        elements[id]
                    );

            }

        }
    );

}


/* =========================================================
   DURÉE D'INCUBATION
========================================================= */

function chargerDureeIncubation() {

    const espece =
        document.getElementById(
            "incubationEspece"
        );

    const duree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !espece ||
        !duree
    ) {

        return;

    }


    const valeur =
        DUREES_INCUBATION[
            espece.value
        ];


    if (!valeur) {

        return;

    }


    if (
        duree.tagName === "SELECT"
    ) {

        duree.innerHTML = `
            <option value="${valeur}">
                ${valeur} jours
            </option>
        `;

    }
    else {

        duree.value =
            valeur;

    }


    afficherEclosionIncubation();

}


/* =========================================================
   DATE D'ÉCLOSION
========================================================= */

function afficherEclosionIncubation() {

    const date =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
        );


    const duree =
        document.getElementById(
            "incubationDuree"
        );


    if (
        !date ||
        !duree
    ) {

        return;

    }


    const dateEclosion =
        incubationAjouterJours(
            date.value,
            Number(
                duree.value
            )
        );


    let zone =
        document.getElementById(
            "eclosionPrevue"
        );


    if (!zone) {

        zone =
            document.getElementById(
                "incubationEclosionPrevue"
            );

    }


    if (
        zone &&
        zone.tagName !== "INPUT"
    ) {

        zone.innerHTML =
            dateEclosion

                ? "📅 <strong>Éclosion prévue :</strong> " +
                  incubationFormaterDate(
                      dateEclosion
                  )

                : "📅 Éclosion prévue : -";

    }

}


/* =========================================================
   CAPACITÉ DE LA COUVEUSE
========================================================= */

function obtenirCapaciteCouveuse(
    valeur
) {

    const texte =
        String(
            valeur || ""
        );


    const correspondance =
        texte.match(
            /(\d[\d\s]*)/
        );


    if (
        !correspondance
    ) {

        return 0;

    }


    return Number(
        correspondance[1]
            .replace(
                /\s/g,
                ""
            )
    );

}


function verifierCapaciteIncubation() {

    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        );

    const oeufs =
        document.getElementById(
            "incubationOeufs"
        );


    if (
        !couveuse ||
        !oeufs
    ) {

        return true;

    }


    const capacite =
        obtenirCapaciteCouveuse(
            couveuse.value
        );


    const quantite =
        Number(
            oeufs.value || 0
        );


    if (
        capacite > 0 &&
        quantite > capacite
    ) {

        oeufs.setCustomValidity(
            "La quantité dépasse la capacité de la couveuse."
        );

        return false;

    }


    oeufs.setCustomValidity(
        ""
    );

    return true;

}


/* =========================================================
   OUVRIR MODAL
========================================================= */

async function ouvrirModalIncubation() {

    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (!modal) {

        console.error(
            "Modal incubation introuvable."
        );

        return;

    }


    const date =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
        );


    if (
        date &&
        !date.value
    ) {

        date.value =
            incubationDateAujourdhui();

    }


    await chargerLotsIncubation();

    chargerDureeIncubation();

    afficherEclosionIncubation();


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                );

        instance.show();

    }

}


/* =========================================================
   FERMER MODAL
========================================================= */

function fermerModalIncubation() {

    const modal =
        document.getElementById(
            "modalIncubation"
        );


    if (!modal) {

        return;

    }


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal.getInstance(
                modal
            );


        if (instance) {

            instance.hide();

            return;

        }

    }


    modal.style.display =
        "none";

}


/* =========================================================
   ENREGISTRER INCUBATION
========================================================= */

async function enregistrerIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    if (
        !incubationVerifierSupabase()
    ) {

        return false;

    }


    const espece =
        document.getElementById(
            "incubationEspece"
        )?.value ||
        "";


    const lotId =
        document.getElementById(
            "incubationLot"
        )?.value ||
        "";


    const couveuse =
        document.getElementById(
            "incubationCouveuse"
        )?.value ||
        "";


    const oeufs =
        Number(
            document.getElementById(
                "incubationOeufs"
            )?.value ||
            0
        );


    const dateElement =
        document.getElementById(
            "incubationDateEntree"
        ) ||
        document.getElementById(
            "incubationDate"
        );


    const dateEntree =
        dateElement?.value ||
        incubationDateAujourdhui();


    const duree =
        Number(
            document.getElementById(
                "incubationDuree"
            )?.value ||
            DUREES_INCUBATION[
                espece
            ] ||
            0
        );


    /* -----------------------------------------------------
       VALIDATIONS
    ----------------------------------------------------- */

    if (!espece) {

        alert(
            "Veuillez sélectionner l'espèce."
        );

        return false;

    }


    if (!lotId) {

        alert(
            "Veuillez sélectionner le lot d'origine."
        );

        return false;

    }


    if (!couveuse) {

        alert(
            "Veuillez sélectionner la couveuse."
        );

        return false;

    }


    if (
        !oeufs ||
        oeufs <= 0
    ) {

        alert(
            "Le nombre d'œufs doit être supérieur à zéro."
        );

        return false;

    }


    if (!dateEntree) {

        alert(
            "Veuillez indiquer la date d'entrée."
        );

        return false;

    }


    if (
        !duree ||
        duree <= 0
    ) {

        alert(
            "La durée d'incubation est incorrecte."
        );

        return false;

    }


    if (
        !verifierCapaciteIncubation()
    ) {

        alert(
            "La quantité d'œufs dépasse la capacité de la couveuse."
        );

        return false;

    }


    /* -----------------------------------------------------
       RÉCUPÉRER LE LOT
    ----------------------------------------------------- */

    const lot =
        await incubationObtenirLot(
            lotId
        );


    if (!lot) {

        alert(
            "Le lot d'origine est introuvable."
        );

        return false;

    }


    /* -----------------------------------------------------
       VÉRIFIER L'ESPÈCE
    ----------------------------------------------------- */

    if (
        lot.espece &&
        lot.espece !== espece
    ) {

        const continuer =
            confirm(
                "Attention : l'espèce du lot (" +
                lot.espece +
                ") ne correspond pas à l'espèce sélectionnée (" +
                espece +
                ").\n\nContinuer ?"
            );

        if (!continuer) {

            return false;

        }

    }


    /* -----------------------------------------------------
       CALCUL ÉCLOSION
    ----------------------------------------------------- */

    const dateEclosion =
        incubationAjouterJours(
            dateEntree,
            duree
        );


    /* -----------------------------------------------------
       ID
    ----------------------------------------------------- */

    const id =
        incubationGenererId();


    /* -----------------------------------------------------
       DONNÉES
    ----------------------------------------------------- */

    const nouvelleIncubation = {

        id:

            id,

        lot_id:

            Number(
                lot.id
            ),

        lot_nom:

            lot.nom_lot ||
            "",

        espece:

            espece,

        race:

            lot.race_type ||
            "",

        couveuse:

            couveuse,

        oeufs_initial:

            oeufs,

        oeufs_retires:

            0,

        oeufs_non_fecondes:

            0,

        embryons_morts:

            0,

        poussins_eclos:

            0,

        date_entree:

            dateEntree,

        duree:

            duree,

        date_eclosion:

            dateEclosion,

        statut:

            "En incubation",

        production_id:

            null,

        lot_parent_id:

            Number(
                lot.id
            ),

        brooder_cree:

            false,

        notes:

            document.getElementById(
                "incubationNotes"
            )?.value ||
            "",

        utilisateur:

            incubationUtilisateur()

    };


    /* -----------------------------------------------------
       INSERTION SUPABASE
    ----------------------------------------------------- */

    const {
        data,
        error
    } =
        await supabaseClient
            .from("incubations")
            .insert(
                nouvelleIncubation
            )
            .select()
            .single();


    if (error) {

        console.error(
            "Erreur insertion incubation :",
            error
        );

        alert(
            "Impossible d'enregistrer l'incubation.\n\n" +
            error.message
        );

        return false;

    }


    /* -----------------------------------------------------
       SUCCÈS
    ----------------------------------------------------- */

    const formulaire =
        document.getElementById(
            "formIncubation"
        );


    if (formulaire) {

        formulaire.reset();

    }


    fermerModalIncubation();

    await chargerIncubations();


    alert(

        "Incubation enregistrée avec succès.\n\n" +

        "ID : " +
        data.id +

        "\nLot : " +
        (
            data.lot_nom ||
            "-"
        ) +

        "\nŒufs : " +
        data.oeufs_initial +

        "\nÉclosion prévue : " +
        incubationFormaterDate(
            data.date_eclosion
        )

    );


    return true;

}


/* =========================================================
   DÉTAILS INCUBATION
========================================================= */

async function voirDetailsIncubation(
    id
) {

    if (
        !incubationVerifierSupabase()
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("incubations")
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (error || !data) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    alert(

        "INCUBATION " +
        data.id +

        "\n\n" +

        "Lot d'origine : " +
        (
            data.lot_nom ||
            "-"
        ) +

        "\n" +

        "Lot ID : " +
        (
            data.lot_id ||
            "-"
        ) +

        "\n" +

        "Espèce : " +
        (
            data.espece ||
            "-"
        ) +

        "\n" +

        "Race : " +
        (
            data.race ||
            "-"
        ) +

        "\n" +

        "Œufs incubés : " +
        (
            data.oeufs_initial ||
            0
        ) +

        "\n" +

        "Couveuse : " +
        (
            data.couveuse ||
            "-"
        ) +

        "\n" +

        "Date entrée : " +
        incubationFormaterDate(
            data.date_entree
        ) +

        "\n" +

        "Éclosion prévue : " +
        incubationFormaterDate(
            data.date_eclosion
        ) +

        "\n" +

        "Statut : " +
        (
            data.statut ||
            "-"
        )

    );

}


/* =========================================================
   SUIVI INCUBATION
========================================================= */

async function ouvrirSuiviIncubation(
    id
) {

    if (
        !incubationVerifierSupabase()
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("incubations")
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        error ||
        !data
    ) {

        alert(
            "Incubation introuvable."
        );

        return;

    }


    const champId =
        document.getElementById(
            "suiviIncubationId"
        );

    const champRetires =
        document.getElementById(
            "oeufsRetires"
        );

    const champNonFecondes =
        document.getElementById(
            "oeufsNonFecondes"
        );

    const champMorts =
        document.getElementById(
            "embryonsMorts"
        );

    const champEclos =
        document.getElementById(
            "poussinsEclosInput"
        );


    if (champId) {

        champId.value =
            data.id;

    }

    if (champRetires) {

        champRetires.value =
            data.oeufs_retires || 0;

    }

    if (champNonFecondes) {

        champNonFecondes.value =
            data.oeufs_non_fecondes || 0;

    }

    if (champMorts) {

        champMorts.value =
            data.embryons_morts || 0;

    }

    if (champEclos) {

        champEclos.value =
            data.poussins_eclos || 0;

    }


    const modal =
        document.getElementById(
            "modalSuiviIncubation"
        );


    if (
        modal &&
        typeof bootstrap !==
        "undefined"
    ) {

        bootstrap.Modal
            .getOrCreateInstance(
                modal
            )
            .show();

    }

}


/* =========================================================
   ENREGISTRER LE SUIVI
========================================================= */

async function enregistrerSuiviIncubation(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const id =
        document.getElementById(
            "suiviIncubationId"
        )?.value;


    const oeufsRetires =
        Number(
            document.getElementById(
                "oeufsRetires"
            )?.value ||
            0
        );


    const oeufsNonFecondes =
        Number(
            document.getElementById(
                "oeufsNonFecondes"
            )?.value ||
            0
        );


    const embryonsMorts =
        Number(
            document.getElementById(
                "embryonsMorts"
            )?.value ||
            0
        );


    const poussinsEclos =
        Number(
            document.getElementById(
                "poussinsEclosInput"
            )?.value ||
            0
        );


    if (!id) {

        alert(
            "Incubation introuvable."
        );

        return false;

    }


    const {
        data: incubation,
        error: erreurLecture
    } =
        await supabaseClient
            .from("incubations")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (
        erreurLecture ||
        !incubation
    ) {

        alert(
            "Impossible de récupérer l'incubation."
        );

        return false;

    }


    const totalSorties =

        oeufsRetires +
        oeufsNonFecondes +
        embryonsMorts +
        poussinsEclos;


    if (
        totalSorties >
        Number(
            incubation.oeufs_initial
        )
    ) {

        alert(
            "Erreur : le total des sorties dépasse le nombre initial d'œufs."
        );

        return false;

    }


    let statut =
        "En incubation";


    if (
        poussinsEclos > 0
    ) {

        statut =
            "Éclosion";

    }


    if (
        totalSorties ===
        Number(
            incubation.oeufs_initial
        )
    ) {

        statut =
            "Terminé";

    }


    const {
        error
    } =
        await supabaseClient
            .from("incubations")
            .update({

                oeufs_retires:
                    oeufsRetires,

                oeufs_non_fecondes:
                    oeufsNonFecondes,

                embryons_morts:
                    embryonsMorts,

                poussins_eclos:
                    poussinsEclos,

                statut:
                    statut,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Erreur mise à jour incubation :",
            error
        );

        alert(
            "Impossible d'enregistrer le suivi.\n\n" +
            error.message
        );

        return false;

    }


    fermerSuiviIncubation();

    await chargerIncubations();


    alert(
        "Suivi de l'incubation enregistré avec succès."
    );


    return true;

}


/* =========================================================
   FERMER SUIVI
========================================================= */

function fermerSuiviIncubation() {

    const modal =
        document.getElementById(
            "modalSuiviIncubation"
        );


    if (!modal) {

        return;

    }


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const instance =
            bootstrap.Modal.getInstance(
                modal
            );


        if (instance) {

            instance.hide();

            return;

        }

    }


    modal.style.display =
        "none";

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await chargerLotsIncubation();

        chargerDureeIncubation();

        afficherEclosionIncubation();

        await chargerIncubations();

        console.log(
            "✓ incubation.js connecté à Supabase."
        );

    }
);


/* =========================================================
   EXPORTS GLOBAUX
========================================================= */

window.ouvrirModalIncubation =
    ouvrirModalIncubation;

window.fermerModalIncubation =
    fermerModalIncubation;

window.enregistrerIncubation =
    enregistrerIncubation;

window.chargerLotsIncubation =
    chargerLotsIncubation;

window.chargerIncubations =
    chargerIncubations;

window.chargerDureeIncubation =
    chargerDureeIncubation;

window.afficherEclosionIncubation =
    afficherEclosionIncubation;

window.verifierCapaciteIncubation =
    verifierCapaciteIncubation;

window.voirDetailsIncubation =
    voirDetailsIncubation;

window.ouvrirSuiviIncubation =
    ouvrirSuiviIncubation;

window.enregistrerSuiviIncubation =
    enregistrerSuiviIncubation;

window.fermerSuiviIncubation =
    fermerSuiviIncubation;
