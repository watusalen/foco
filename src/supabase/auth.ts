import { supabase } from './client';
import type { Usuario } from '../model';

/** Representa um usuário autenticado */
export interface AuthUser {
  id: string;     // UUID do usuário
  email: string;  // E-mail do usuário
}

/** Estrutura retornada pela inscrição em eventos de autenticação */
export interface AuthSubscription {
  data: {
    subscription: {
      unsubscribe: () => void; // Cancela a inscrição
    };
  };
}

/**
 * Serviço de autenticação
 * 
 * Fornece métodos para login, cadastro, logout, 
 * verificação de autenticação e observação de mudanças de estado.
 */
export class AuthService {
  
  /** Faz login com e-mail e senha */
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

  /** Cadastra novo usuário e cria perfil na tabela `usuarios` */
  async signUp(email: string, password: string, nome: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(`Erro no cadastro: ${error.message}`);
    }

    // Cria perfil associado
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

  /** Faz logout */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Erro no logout: ${error.message}`);
    }
  }

  /** Retorna o usuário autenticado atual ou `null` */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    return { id: user.id, email: user.email };
  }

  /** Retorna `true` se o usuário está logado */
  async isAuthenticated(): Promise<boolean> {
    return (await this.getCurrentUser()) !== null;
  }

  /**
   * Observa mudanças no estado de autenticação.
   * Executa o callback sempre que o usuário logar ou deslogar.
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): AuthSubscription {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && session.user.email) {
        callback({ id: session.user.id, email: session.user.email });
      } else {
        callback(null);
      }
    });
  }
}
