import { BaseCrud } from './BaseCrud';
import { Meta, NovaMeta } from '../model/Meta';
import { MetaRepository } from '../repository/MetaRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com metas
 */
export class MetaCrud extends BaseCrud<Meta, NovaMeta> {
  private metaRepository: MetaRepository;

  constructor() {
    const metaRepository = new MetaRepository(supabase);
    super(metaRepository);
    this.metaRepository = metaRepository;
  }

  /**
   * Buscar metas de um usuário
   */
  async buscarPorUsuario(usuarioId: string): Promise<Meta[]> {
    return await this.metaRepository.findByUserId(usuarioId);
  }

  /**
   * Buscar metas por título
   */
  async buscarPorTitulo(titulo: string): Promise<Meta | null> {
    return await this.metaRepository.findByTitle(titulo);
  }

  /**
   * Marcar meta como atingida
   */
  async marcarComoAtingida(id: string): Promise<Meta | null> {
    return await this.metaRepository.updateById(id, { atingida: true });
  }
}
