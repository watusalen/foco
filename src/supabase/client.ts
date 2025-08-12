import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

/**
 * Cliente do Supabase configurado a partir das variáveis de ambiente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
