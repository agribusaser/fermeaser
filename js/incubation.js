/* ============================================================
   FERME ASHER ERP
   MODULE : INCUBATION
   Fichier : /js/incubation.js
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* ============================================================
       CONFIGURATION
       ============================================================ */

    const STORAGE = {
        LOTS: "fermeaser_lots",
        PRODUCTIONS: "fermeaser_productions",
        INCUBATIONS: "fermeaser_incubations",
        POUSSINIERES: "fermeaser_poussiniere",
        TRANSFERTS: "fermeaser_transferts"
    };

    const ESPECES = {
        "Cailles": {
            duree: 17,
            poussiniere: 35
        },
        "Poules": {
            duree: 21,
            poussiniere: 42
        },
        "Poulets": {
            duree: 21,
            poussiniere: 42
        },
        "Canards": {
            duree: 28,
            poussiniere: 35
        },
        "Pintades": {
            duree: 28,
            poussiniere: 35
        },
        "Dindes": {
            duree: 28,
            poussiniere: 42
        }
    };


    /* ============================================================
       OUTILS
       ============================================================ */

    function getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Erreur lecture localStorage :", key, error);
            return [];
        }
    }


    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }


    function generateId(prefix) {
        return (
            prefix +
            "-" +
            new Date().getTime() +
            "-" +
            Math.floor(Math.random() * 1000)
        );
    }


    function formatDate(date) {

        if (!date) return "";

        const d = new Date(date);

        if (isNaN(d.getTime())) return "";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    }


    function dateForInput(date) {

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return "";
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function addDays(dateString, days) {

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return null;
        }

        date.setDate(date.getDate() + Number(days));

        return date;
    }


    function getToday() {
        return dateForInput(new Date());
    }


    /* ============================================================
       INITIALISATION
       ============================================================ */

    let lots = getData(STORAGE.LOTS);
    let productions = getData(STORAGE.PRODUCTIONS);
    let incubations = getData(STORAGE.INCUBATIONS);
    let poussieres = getData(STORAGE.POUSSINIERES);
    let transferts = getData(STORAGE.TRANSFERTS);


    /* ============================================================
       RECHERCHE DES ELEMENTS HTML
       ============================================================ */

    function findElement(selectors) {

        for (const selector of selectors) {

            const element = document.querySelector(selector);

            if (element) {
                return element;
            }
        }

        return null;
    }


    const btnNouvelle = findElement([
        "#btnNouvelleIncubation",
        "#nouvelleIncubation",
        "[data-action='nouvelle-incubation']",
        "button[data-bs-target='#modalIncubation']"
    ]);


    const modal = findElement([
        "#modalIncubation",
        "#incubationModal",
        ".modal-incubation"
    ]);


    const form = findElement([
        "#formIncubation",
        "#incubationForm",
        "form[data-form='incubation']"
    ]);


    /* ============================================================
       CHAMPS DU FORMULAIRE
       ============================================================ */

    const champEspece = findElement([
        "#espece",
        "#incubationEspece",
        "#incubation_espece",
        "[name='espece']"
    ]);


    const champLot = findElement([
        "#lotOrigine",
        "#lotorigine",
        "#lotOrigineIncubation",
        "#incubationLot",
        "[name='lotOrigine']",
        "[name='lot']"
    ]);


    const champCouveuse = findElement([
        "#couveuse",
        "#incubationCouveuse",
        "[name='couveuse']"
    ]);


    const champOeufs = findElement([
        "#nombreOeufs",
        "#nbOeufs",
        "#oeufs",
        "#incubationOeufs",
        "[name='nombreOeufs']",
        "[name='oeufs']"
    ]);


    const champDate = findElement([
        "#dateEntree",
        "#dateIncubation",
        "#incubationDate",
        "[name='dateEntree']",
        "[name='date']"
    ]);


    const champDuree = findElement([
        "#dureeIncubation",
        "#duree",
        "#incubationDuree",
        "[name='dureeIncubation']"
    ]);


    const champNotes = findElement([
        "#notes",
        "#incubationNotes",
        "[name='notes']"
    ]);


    const btnEnregistrer = findElement([
        "#btnEnregistrerIncubation",
        "#enregistrerIncubation",
        "button[type='submit'][data-action='enregistrer-incubation']"
    ]);


    const btnAnnuler = findElement([
        "#btnAnnulerIncubation",
        "#annulerIncubation",
        "[data-action='annuler-incubation']"
    ]);


    const btnFermer = findElement([
        "#fermerIncubation",
        "[data-action='fermer-incubation']",
        "#modalIncubation .btn-close",
        "#modalIncubation [data-bs-dismiss='modal']"
    ]);


    /* ============================================================
       ZONE ECLOSION PREVUE
       ============================================================ */

    const zoneEclosion = findElement([
        "#eclosionPrevue",
        "#dateEclosion",
        "#incubationEclosion",
        "[data-eclosion]"
    ]);


    function afficherEclosion() {

        if (!champDate || !champDuree || !zoneEclosion) {
            return;
        }

        if (!champDate.value || !champDuree.value) {

            zoneEclosion.textContent = "-";
            return;
        }

        const date = addDays(
            champDate.value,
            champDuree.value
        );

        if (!date) {
            zoneEclosion.textContent = "-";
            return;
        }

        zoneEclosion.textContent = formatDate(date);
    }


    /* ============================================================
       ESPECES
       ============================================================ */

    function chargerDureeEspece() {

        if (!champEspece || !champDuree) {
            return;
        }

        const espece = champEspece.value;

        if (!ESPECES[espece]) {
            champDuree.value = "";
            afficherEclosion();
            return;
        }

        champDuree.value = ESPECES[espece].duree;

        afficherEclosion();
    }


    /* ============================================================
       INITIALISER LES ESPECES
       ============================================================ */

    function initialiserEspeces() {

        if (!champEspece) {
            return;
        }

        /*
         * On ne remplit le select que s'il est vide.
         */

        if (champEspece.options.length <= 1) {

            champEspece.innerHTML =
                `<option value="">Sélectionner</option>`;

            Object.keys(ESPECES).forEach(espece => {

                const option = document.createElement("option");

                option.value = espece;
                option.textContent = espece;

                champEspece.appendChild(option);
            });
        }
    }


    /* ============================================================
       CALCUL DES ŒUFS DISPONIBLES
       ============================================================ */

    function getOeufsDisponibles(lotId) {

        if (!lotId) {
            return 0;
        }

        /*
         * Cherche le lot.
         */

        const lot = lots.find(
            l =>
                String(l.id) === String(lotId) ||
                String(l.ID) === String(lotId) ||
                String(lotId) === String(l.idLot)
        );


        /*
         * Œufs produits.
         */

        const produits = productions.filter(p => {

            const idLot =
                p.lotId ??
                p.lot ??
                p.idLot ??
                p.lotOrigine;

            return String(idLot) === String(lotId);
        });


        let totalProduits = 0;

        produits.forEach(p => {

            totalProduits += Number(
                p.oeufs ??
                p.nombreOeufs ??
                p.quantite ??
                p.production ??
                0
            );
        });


        /*
         * Œufs déjà utilisés dans des incubations.
         */

        const dejaIncubes = incubations
            .filter(i => {

                const idLot =
                    i.lotOrigineId ??
                    i.lotId ??
                    i.lotOrigine ??
                    i.lot;

                return String(idLot) === String(lotId);
            })
            .reduce((total, i) => {

                return total + Number(
                    i.nombreOeufs ??
                    i.oeufs ??
                    i.quantiteOeufs ??
                    0
                );

            }, 0);


        /*
         * Certains systèmes peuvent déjà avoir un stock
         * d'œufs directement dans le lot.
         */

        let stockLot = 0;

        if (lot) {

            stockLot = Number(
                lot.oeufsDisponibles ??
                lot.oeufs ??
                lot.stockOeufs ??
                0
            );
        }


        /*
         * On prend le stock direct du lot s'il existe.
         * Sinon on calcule à partir de la production.
         */

        let disponible;

        if (stockLot > 0) {
            disponible = stockLot - dejaIncubes;
        } else {
            disponible = totalProduits - dejaIncubes;
        }


        return Math.max(0, disponible);
    }


    /* ============================================================
       AFFICHER LES LOTS
       ============================================================ */

    function chargerLots() {

        if (!champLot) {
            return;
        }

        champLot.innerHTML =
            `<option value="">Sélectionner un lot</option>`;


        lots.forEach(lot => {

            const id =
                lot.id ??
                lot.ID ??
                lot.idLot;

            const nom =
                lot.nom ??
                lot.nomLot ??
                lot.lot ??
                lot.reference ??
                `Lot ${id}`;

            const espece =
                lot.espece ??
                lot.specie ??
                "";


            const oeufsDisponibles =
                getOeufsDisponibles(id);


            /*
             * Seuls les lots ayant des œufs disponibles
             * sont proposés.
             */

            if (oeufsDisponibles <= 0) {
                return;
            }


            const option = document.createElement("option");

            option.value = id;

            option.textContent =
                `${nom}${espece ? " — " + espece : ""} — ${oeufsDisponibles} œufs`;

            option.dataset.stock = oeufsDisponibles;

            champLot.appendChild(option);
        });
    }


    /* ============================================================
       STOCK DISPONIBLE SOUS LE CHAMP ŒUFS
       ============================================================ */

    function afficherStockDisponible() {

        if (!champLot) {
            return;
        }

        const option =
            champLot.options[champLot.selectedIndex];

        if (!option || !option.value) {
            afficherMessageStock(0);
            return;
        }

        const stock =
            getOeufsDisponibles(option.value);

        afficherMessageStock(stock);


        if (champOeufs) {

            champOeufs.max = stock;

            /*
             * Si l'utilisateur avait entré une valeur
             * supérieure au stock disponible.
             */

            if (Number(champOeufs.value) > stock) {
                champOeufs.value = stock;
            }
        }
    }


    function afficherMessageStock(stock) {

        let zone = document.querySelector(
            "#stockOeufsDisponible"
        );


        if (!zone && champOeufs) {

            zone = document.createElement("small");

            zone.id = "stockOeufsDisponible";

            zone.className =
                "form-text text-muted d-block mt-1";

            champOeufs.parentElement.appendChild(zone);
        }


        if (zone) {

            zone.textContent =
                `Stock disponible : ${stock} œuf${stock > 1 ? "s" : ""}`;
        }
    }


    /* ============================================================
       COUVEUSES
       ============================================================ */

    function chargerCouveuses() {

        if (!champCouveuse) {
            return;
        }

        /*
         * Si les couveuses existent déjà dans le HTML,
         * nous les conservons.
         */

        if (champCouveuse.options.length > 1) {
            return;
        }

        const couveuses = [
            {
                id: "COUVEUSE-1056",
                nom: "Couveuse 1056 œufs",
                capacite: 1056
            },
            {
                id: "COUVEUSE-500",
                nom: "Couveuse 500 œufs",
                capacite: 500
            },
            {
                id: "COUVEUSE-300",
                nom: "Couveuse 300 œufs",
                capacite: 300
            }
        ];


        champCouveuse.innerHTML =
            `<option value="">Sélectionner une couveuse</option>`;


        couveuses.forEach(couveuse => {

            const option =
                document.createElement("option");

            option.value = couveuse.id;

            option.textContent =
                couveuse.nom;

            option.dataset.capacite =
                couveuse.capacite;

            champCouveuse.appendChild(option);
        });
    }


    /* ============================================================
       VERIFICATION CAPACITE COUVEUSE
       ============================================================ */

    function verifierCapacite() {

        if (!champCouveuse || !champOeufs) {
            return true;
        }

        const option =
            champCouveuse.options[
                champCouveuse.selectedIndex
            ];

        if (!option || !option.value) {
            return true;
        }

        const capacite =
            Number(option.dataset.capacite || 0);

        const oeufs =
            Number(champOeufs.value || 0);

        if (capacite > 0 && oeufs > capacite) {

            alert(
                `Cette couveuse peut contenir au maximum ${capacite} œufs.`
            );

            champOeufs.value = capacite;

            return false;
        }

        return true;
    }


    /* ============================================================
       GENERATION DU LOT D'INCUBATION
       ============================================================ */

    function genererReferenceIncubation() {

        const annee =
            new Date().getFullYear();

        const numero =
            String(incubations.length + 1)
                .padStart(3, "0");

        return `INC-${annee}-${numero}`;
    }


    /* ============================================================
       ENREGISTRER L'INCUBATION
       ============================================================ */

    function enregistrerIncubation(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }


        /*
         * Vérification des champs.
         */

        if (!champEspece ||
            !champLot ||
            !champCouveuse ||
            !champOeufs ||
            !champDate ||
            !champDuree) {

            console.error({
                champEspece,
                champLot,
                champCouveuse,
                champOeufs,
                champDate,
                champDuree
            });

            alert(
                "Erreur technique : certains champs du formulaire d'incubation sont introuvables."
            );

            return false;
        }


        const espece =
            champEspece.value.trim();

        const lotId =
            champLot.value;

        const couveuse =
            champCouveuse.value;

        const nombreOeufs =
            Number(champOeufs.value);

        const dateEntree =
            champDate.value;

        const duree =
            Number(champDuree.value);


        /*
         * Validation.
         */

        if (!espece) {
            alert("Veuillez sélectionner l'espèce.");
            return false;
        }


        if (!lotId) {
            alert("Veuillez sélectionner le lot d'origine.");
            return false;
        }


        if (!couveuse) {
            alert("Veuillez sélectionner une couveuse.");
            return false;
        }


        if (!nombreOeufs || nombreOeufs <= 0) {
            alert("Veuillez saisir un nombre d'œufs valide.");
            return false;
        }


        if (!dateEntree) {
            alert("Veuillez sélectionner la date d'entrée.");
            return false;
        }


        if (!duree || duree <= 0) {
            alert("Veuillez sélectionner la durée d'incubation.");
            return false;
        }


        const stock =
            getOeufsDisponibles(lotId);


        if (nombreOeufs > stock) {

            alert(
                `Impossible d'enregistrer cette incubation.\n\n` +
                `Œufs demandés : ${nombreOeufs}\n` +
                `Œufs disponibles : ${stock}`
            );

            return false;
        }


        if (!verifierCapacite()) {
            return false;
        }


        const dateEclosion =
            addDays(dateEntree, duree);


        /*
         * Recherche du lot d'origine.
         */

        const lot = lots.find(l => {

            const id =
                l.id ??
                l.ID ??
                l.idLot;

            return String(id) === String(lotId);
        });


        /*
         * Création de l'incubation.
         */

        const incubation = {

            id: generateId("INC"),

            reference:
                genererReferenceIncubation(),

            espece: espece,

            lotOrigineId: lotId,

            lotOrigine:
                lot?.nom ??
                lot?.nomLot ??
                lot?.lot ??
                "",

            couveuseId: couveuse,

            couveuse:
                champCouveuse.options[
                    champCouveuse.selectedIndex
                ]?.textContent || "",

            nombreOeufs: nombreOeufs,

            oeufs: nombreOeufs,

            dateEntree: dateEntree,

            dureeIncubation: duree,

            dateEclosion:
                dateEclosion
                    ? dateForInput(dateEclosion)
                    : null,

            statut: "En incubation",

            tauxEclosionPrevu: 80,

            poussinsPrevus:
                Math.round(nombreOeufs * 0.80),

            notes:
                champNotes
                    ? champNotes.value.trim()
                    : "",

            dateCreation:
                new Date().toISOString()
        };


        /*
         * Ajout.
         */

        incubations.push(incubation);

        saveData(
            STORAGE.INCUBATIONS,
            incubations
        );


        /*
         * Mise à jour du lot d'origine.
         *
         * On conserve un stock d'œufs disponibles.
         */

        if (lot) {

            const nouveauStock =
                Math.max(
                    0,
                    stock - nombreOeufs
                );

            lot.oeufsDisponibles =
                nouveauStock;

            lot.stockOeufs =
                nouveauStock;

            saveData(
                STORAGE.LOTS,
                lots
            );
        }


        /*
         * Réinitialiser le formulaire.
         */

        reinitialiserFormulaire();


        /*
         * Fermer le modal.
         */

        fermerModal();


        /*
         * Rafraîchir la page.
         */

        afficherIncubations();

        actualiserStatistiques();


        alert(
            `Incubation ${incubation.reference} enregistrée avec succès.\n\n` +
            `${nombreOeufs} œufs de ${espece}\n` +
            `Éclosion prévue : ${formatDate(incubation.dateEclosion)}`
        );


        return true;
    }


    /* ============================================================
       AFFICHAGE DES INCUBATIONS
       ============================================================ */

    function afficherIncubations() {

        const tbody =
            document.querySelector(
                "#tableIncubations tbody"
            ) ||
            document.querySelector(
                "#incubationsTable tbody"
            ) ||
            document.querySelector(
                "table[data-table='incubations'] tbody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = "";


        incubations.forEach(incubation => {

            const tr =
                document.createElement("tr");


            const statut =
                calculerStatut(incubation);


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        incubation.reference ||
                        incubation.id
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        incubation.espece
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        incubation.lotOrigine || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        incubation.couveuse || "-"
                    )}
                </td>

                <td>
                    ${Number(
                        incubation.nombreOeufs || 0
                    )}
                </td>

                <td>
                    ${formatDate(
                        incubation.dateEntree
                    )}
                </td>

                <td>
                    ${formatDate(
                        incubation.dateEclosion
                    )}
                </td>

                <td>
                    <span class="badge bg-success">
                        ${escapeHtml(statut)}
                    </span>
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary me-1"
                        data-incubation-view="${incubation.id}">
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        data-incubation-delete="${incubation.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>
            `;


            tbody.appendChild(tr);
        });


        /*
         * Boutons supprimer.
         */

        tbody
            .querySelectorAll(
                "[data-incubation-delete]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        supprimerIncubation(
                            this.dataset.incubationDelete
                        );
                    }
                );
            });
    }


    /* ============================================================
       STATUT
       ============================================================ */

    function calculerStatut(incubation) {

        if (!incubation.dateEclosion) {
            return incubation.statut ||
                "En incubation";
        }


        const aujourdHui =
            new Date();

        const eclosion =
            new Date(incubation.dateEclosion);


        if (
            incubation.statut === "Éclos"
        ) {
            return "Éclos";
        }


        if (aujourdHui >= eclosion) {
            return "Éclosion à traiter";
        }


        return "En incubation";
    }


    /* ============================================================
       SUPPRIMER UNE INCUBATION
       ============================================================ */

    function supprimerIncubation(id) {

        const incubation =
            incubations.find(
                i => String(i.id) === String(id)
            );


        if (!incubation) {
            return;
        }


        const confirmation =
            confirm(
                `Supprimer l'incubation ${incubation.reference} ?`
            );


        if (!confirmation) {
            return;
        }


        /*
         * Restaurer les œufs dans le lot d'origine.
         */

        const lot =
            lots.find(l => {

                const lotId =
                    l.id ??
                    l.ID ??
                    l.idLot;

                return String(lotId) ===
                    String(incubation.lotOrigineId);
            });


        if (lot) {

            const stock =
                Number(
                    lot.oeufsDisponibles ??
                    lot.stockOeufs ??
                    0
                );


            lot.oeufsDisponibles =
                stock +
                Number(
                    incubation.nombreOeufs || 0
                );


            lot.stockOeufs =
                lot.oeufsDisponibles;


            saveData(
                STORAGE.LOTS,
                lots
            );
        }


        incubations =
            incubations.filter(
                i =>
                    String(i.id) !== String(id)
            );


        saveData(
            STORAGE.INCUBATIONS,
            incubations
        );


        afficherIncubations();

        actualiserStatistiques();
    }


    /* ============================================================
       STATISTIQUES
       ============================================================ */

    function actualiserStatistiques() {

        const actifs =
            incubations.filter(
                i =>
                    calculerStatut(i) ===
                    "En incubation"
            );


        const oeufs =
            actifs.reduce(
                (total, i) =>
                    total +
                    Number(
                        i.nombreOeufs || 0
                    ),
                0
            );


        const eclosions =
            incubations.filter(i => {

                if (!i.dateEclosion) {
                    return false;
                }

                const date =
                    new Date(i.dateEclosion);

                const today =
                    new Date();

                return (
                    date >=
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                    )
                );
            }).length;


        const poussins =
            incubations
                .filter(
                    i =>
                        i.statut === "Éclos"
                )
                .reduce(
                    (total, i) =>
                        total +
                        Number(
                            i.poussinsEclos ||
                            i.poussinsPrevus ||
                            0
                        ),
                    0
                );


        const elementActifs =
            document.querySelector(
                "#incubationsActives"
            );

        const elementOeufs =
            document.querySelector(
                "#oeufsIncubation"
            );

        const elementEclosions =
            document.querySelector(
                "#eclosionsPrevues"
            );

        const elementPoussins =
            document.querySelector(
                "#poussinsEclos"
            );


        if (elementActifs) {
            elementActifs.textContent =
                actifs.length;
        }

        if (elementOeufs) {
            elementOeufs.textContent =
                oeufs;
        }

        if (elementEclosions) {
            elementEclosions.textContent =
                eclosions;
        }

        if (elementPoussins) {
            elementPoussins.textContent =
                poussins;
        }
    }


    /* ============================================================
       OUVRIR MODAL
       ============================================================ */

    function ouvrirModal() {

        if (!modal) {
            console.error(
                "Modal incubation introuvable."
            );
            return;
        }


        modal.classList.add("show");

        modal.style.display = "block";

        modal.removeAttribute("aria-hidden");

        document.body.classList.add(
            "modal-open"
        );


        let backdrop =
            document.querySelector(
                ".incubation-modal-backdrop"
            );


        if (!backdrop) {

            backdrop =
                document.createElement("div");

            backdrop.className =
                "incubation-modal-backdrop modal-backdrop fade show";

            document.body.appendChild(backdrop);
        }


        initialiserFormulaire();
    }


    /* ============================================================
       FERMER MODAL
       ============================================================ */

    function fermerModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove("show");

        modal.style.display = "none";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );


        const backdrop =
            document.querySelector(
                ".incubation-modal-backdrop"
            );


        if (backdrop) {
            backdrop.remove();
        }
    }


    /* ============================================================
       RESET FORMULAIRE
       ============================================================ */

    function reinitialiserFormulaire() {

        if (!form) {
            return;
        }


        form.reset();


        if (champDate) {
            champDate.value =
                getToday();
        }


        if (zoneEclosion) {
            zoneEclosion.textContent =
                "-";
        }


        afficherStockDisponible();
    }


    /* ============================================================
       INITIALISATION FORMULAIRE
       ============================================================ */

    function initialiserFormulaire() {

        initialiserEspeces();

        chargerCouveuses();

        chargerLots();


        if (champDate && !champDate.value) {
            champDate.value =
                getToday();
        }


        afficherStockDisponible();

        afficherEclosion();
    }


    /* ============================================================
       ESCAPE HTML
       ============================================================ */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ============================================================
       EVENEMENTS
       ============================================================ */

    if (btnNouvelle) {

        btnNouvelle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                ouvrirModal();
            }
        );
    }


    if (btnAnnuler) {

        btnAnnuler.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                fermerModal();
            }
        );
    }


    if (btnFermer) {

        btnFermer.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                fermerModal();
            }
        );
    }


    if (champEspece) {

        champEspece.addEventListener(
            "change",
            function () {

                chargerDureeEspece();

                chargerLots();
            }
        );
    }


    if (champLot) {

        champLot.addEventListener(
            "change",
            function () {

                afficherStockDisponible();
            }
        );
    }


    if (champDate) {

        champDate.addEventListener(
            "change",
            afficherEclosion
        );
    }


    if (champDuree) {

        champDuree.addEventListener(
            "change",
            afficherEclosion
        );
    }


    if (champOeufs) {

        champOeufs.addEventListener(
            "input",
            verifierCapacite
        );
    }


    if (champCouveuse) {

        champCouveuse.addEventListener(
            "change",
            verifierCapacite
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            enregistrerIncubation
        );
    }


    if (btnEnregistrer) {

        btnEnregistrer.addEventListener(
            "click",
            enregistrerIncubation
        );
    }


    /*
     * Fermer avec ESC.
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                fermerModal();
            }
        }
    );


    /* ============================================================
       INITIALISATION GENERALE
       ============================================================ */

    initialiserFormulaire();

    afficherIncubations();

    actualiserStatistiques();


    console.log(
        "✓ Module Incubation Ferme Asher chargé."
    );

});

<script src="../../js/elevage.js"></script>
<script src="../../js/incubation.js"></script>
