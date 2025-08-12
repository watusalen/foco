/**
 * Exportações centralizadas do módulo de autenticação e conexão com o Supabase.
 * 
 * Este arquivo facilita o import em outros módulos, evitando caminhos longos
 * e concentrando as referências principais.
 */

// Instância configurada do Supabase
export { supabase } from './client';

// Serviço de autenticação
export { AuthService } from './auth';

// Tipos auxiliares relacionados à autenticação
export type { AuthUser, AuthSubscription } from './auth';
