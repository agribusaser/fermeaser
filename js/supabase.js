/*====================================================
 FERME ASHER ERP
 SUPABASE.JS
 CONNEXION CENTRALE SUPABASE
====================================================*/

"use strict";

const SUPABASE_URL =
    "https://szfftdskbbxrufixdjhw.supabase.co";

const SUPABASE_KEY =
    "TA_CLE_PUBLISHABLE_ICI";


// Vérification du SDK Supabase
if (!window.supabase) {

    console.error(
        "ERREUR : Le SDK Supabase n'est pas chargé."
    );

} else {

    // Création du client Supabase
    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    // Rend le client disponible pour tous les fichiers JS
    window.supabaseClient =
        supabaseClient;

    console.log(
        "Ferme Asher ERP : Supabase connecté."
    );
}
