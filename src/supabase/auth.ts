import { supabase } from './client';
import type { Usuario } from '../model';

export interface AuthUser {
  id: string;
  email: string;
}

export class AuthService {
  
  /**
   * Faz login com email e senha
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Erro no login: ${error.message}`);
    }

    return data;
  }

  /**
   * Cadastra novo usuário
   */
  async signUp(email: string, password: string, nome: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(`Erro no cadastro: ${error.message}`);
    }

    // Criar o perfil do usuário na tabela usuarios
    if (data.user) {
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          nome,
          email,
        });

      if (profileError) {
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }
    }

    return data;
  }

  /**
   * Faz logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Erro no logout: ${error.message}`);
    }
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) return null;

    return {
      id: user.id,
      email: user.email,
    };
  }

  /**
   * Verifica se o usuário está logado
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
        });
      } else {
        callback(null);
      }
    });
  }
}