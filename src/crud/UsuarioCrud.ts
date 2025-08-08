import { BaseCrud } from './BaseCrud';
import { Usuario, NovoUsuario } from '../model/Usuario';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com usuários
 */
export class UsuarioCrud extends BaseCrud<Usuario, NovoUsuario> {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    const usuarioRepository = new UsuarioRepository(supabase);
    super(usuarioRepository);
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Buscar usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByEmail(email);
  }
}
