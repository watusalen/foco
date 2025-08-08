import { BaseCrud } from './BaseCrud';
import { Cronograma, NovoCronograma } from '../model/Cronograma';
import { CronogramaRepository } from '../repository/CronogramaRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com cronogramas
 */
export class CronogramaCrud extends BaseCrud<Cronograma, NovoCronograma> {
  private cronogramaRepository: CronogramaRepository;

  constructor() {
    const cronogramaRepository = new CronogramaRepository(supabase);
    super(cronogramaRepository);
    this.cronogramaRepository = cronogramaRepository;
  }

  /**
   * Buscar cronogramas de um usuário
   */
  async buscarPorUsuario(usuarioId: string): Promise<Cronograma[]> {
    return await this.cronogramaRepository.findByUserId(usuarioId);
  }

  /**
   * Buscar cronograma por título
   */
  async buscarPorTitulo(titulo: string): Promise<Cronograma | null> {
    return await this.cronogramaRepository.findByTitle(titulo);
  }
}
