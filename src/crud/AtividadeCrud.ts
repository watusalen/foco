import { BaseCrud } from './BaseCrud';
import { Atividade, NovaAtividade } from '../model/Atividade';
import { AtividadeRepository } from '../repository/AtividadeRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com atividades
 */
export class AtividadeCrud extends BaseCrud<Atividade, NovaAtividade> {
  private atividadeRepository: AtividadeRepository;

  constructor() {
    const atividadeRepository = new AtividadeRepository(supabase);
    super(atividadeRepository);
    this.atividadeRepository = atividadeRepository;
  }

  /**
   * Buscar atividades de um cronograma
   */
  async buscarPorCronograma(cronogramaId: string): Promise<Atividade[]> {
    return await this.atividadeRepository.findByCronogramaId(cronogramaId);
  }

  /**
   * Buscar atividades por status
   */
  async buscarPorStatus(status: 'pendente' | 'em_andamento' | 'concluida'): Promise<Atividade[]> {
    return await this.atividadeRepository.findByStatus(status);
  }

  /**
   * Marcar atividade como concluída
   */
  async marcarConcluida(id: string): Promise<Atividade | null> {
    return await this.atividadeRepository.updateById(id, { status: 'concluida' });
  }
}
