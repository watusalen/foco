import { BaseCrud } from './BaseCrud';
import { Progresso, NovoProgresso } from '../model/Progresso';
import { ProgressoRepository } from '../repository/ProgressoRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com progresso
 */
export class ProgressoCrud extends BaseCrud<Progresso, NovoProgresso> {
  private progressoRepository: ProgressoRepository;

  constructor() {
    const progressoRepository = new ProgressoRepository(supabase);
    super(progressoRepository);
    this.progressoRepository = progressoRepository;
  }

  /**
   * Buscar progresso de um usuário
   */
  async buscarPorUsuario(usuarioId: string): Promise<Progresso[]> {
    return await this.progressoRepository.findByUserId(usuarioId);
  }

  /**
   * Buscar progresso por usuário e período
   */
  async buscarPorPeriodo(usuarioId: string, dataInicio: string, dataFim: string): Promise<Progresso[]> {
    return await this.progressoRepository.findByUserAndDateRange(usuarioId, dataInicio, dataFim);
  }

  /**
   * Buscar progresso específico por usuário e data
   */
  async buscarPorData(usuarioId: string, data: string): Promise<Progresso[]> {
    return await this.progressoRepository.findByUserAndDate(usuarioId, data);
  }
}
