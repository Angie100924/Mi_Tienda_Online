import { createClient } from "@supabase/supabase-js";

console.log("🔍 Verificando variables de entorno...");
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Anon key (longitud):", import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
