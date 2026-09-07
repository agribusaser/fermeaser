/*====================================================
 FERME ASHER ERP
 SUPABASE.JS
 CONNEXION CENTRALE SUPABASE
====================================================*/

"use strict";

/*====================================================
 CONFIGURATION SUPABASE
====================================================*/

const SUPABASE_URL =
    "https://szfftdskbbxrufixdjhw.supabase.co";

const SUPABASE_KEY =
    "TON_MÊME_CLÉ_PUBLISHABLE_ACTUELLE";

/*====================================================
 VÉRIFICATION DU SDK
====================================================*/

if (!window.supabase) {

    console.error(
        "ERREUR : Le SDK Supabase n'est pas chargé."
    );

} else {

    /*================================================
     CRÉATION DU CLIENT CENTRAL
    =================================================*/

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    /*================================================
     RENDRE LE CLIENT DISPONIBLE À TOUT L'ERP
    =================================================*/

    window.supabaseClient =
        supabaseClient;

    console.log(
        "Ferme Asher ERP : Supabase connecté."
    );
}
