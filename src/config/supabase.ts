import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string; // 👈 aquí el cambio

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase URL o Key no están configurados en .env");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
