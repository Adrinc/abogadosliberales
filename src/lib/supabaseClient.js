import { createClient } from '@supabase/supabase-js';

// Preferir variables de entorno (Vite/Astro). Si no existen, usar los valores proporcionados.
const SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_URL
  ? import.meta.env.PUBLIC_SUPABASE_URL
  : 'https://cbl-supabase.cbluna-dev.com';

const SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  ? import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MjM4MDAwLAogICJleHAiOiAxODczMDA0NDAwCn0.qKqYn2vjtHqKqyt1FAghuIjvNsyr9b1ElpVfvJg6zJ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

export default supabase;