import { supabase, AuthService } from '../supabase';

// Instância do serviço de autenticação
export const authService = new AuthService();

// Exporta cliente Supabase para uso geral
export { supabase };
