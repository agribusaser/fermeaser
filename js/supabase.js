/*====================================================
 FERME ASHER ERP
 SUPABASE.JS
 CONNEXION CENTRALE SUPABASE
====================================================*/

"use strict";

const SUPABASE_URL =
    "https://szfftdskbbxrufixdjhw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_h7DMy9Vj3F2jx6oPko7ViA_pY-VhXyS";

/*====================================================
 VÉRIFICATION DU SDK SUPABASE
====================================================*/

if (!window.supabase) {

    console.error(
        "ERREUR : Le SDK Supabase n'est pas chargé."
    );

} else {

    /*================================================
     CRÉATION DU CLIENT SUPABASE
    ================================================*/

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log(
        "Ferme Asher ERP : Supabase connecté."
    );
}
