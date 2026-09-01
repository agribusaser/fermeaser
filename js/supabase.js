const SUPABASE_URL = "https://szfftdskbbxrufixdjhw.supabase.co";

// Mets ici ta Publishable Key Supabase
const SUPABASE_KEY = "TA_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
