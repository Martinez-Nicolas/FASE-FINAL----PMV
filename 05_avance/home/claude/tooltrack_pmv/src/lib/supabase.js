import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.\n' +
    'Copia .env.example como .env y rellena con tus credenciales de Supabase.'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
