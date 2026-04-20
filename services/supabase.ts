import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Faltam as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. O cliente Supabase não pôde ser inicializado completamente.");
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder-url.supabase.co",
    supabaseAnonKey || "placeholder-key"
);
