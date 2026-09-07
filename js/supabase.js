/*====================================================
 FERME ASHER ERP
 SUPABASE — CLIENT CENTRAL
====================================================*/

"use strict";

const SUPABASE_URL = "https://szfftdskbbxrufixdjhw.supabase.co";

const SUPABASE_KEY = "sb_publishable_h7DMy9Vj3F2jx6oPko7ViA_pY-VhXyS";

/* Création du client Supabase */
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* Rend le client disponible globalement */
window.supabaseClient = supabaseClient;

console.log("Supabase connecté :", SUPABASE_URL);
