import { BaseCrud } from './BaseCrud';
import { Resposta, NovaResposta } from '../model/Resposta';
import { RespostaRepository } from '../repository/RespostaRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com respostas
 */
export class RespostaCrud extends BaseCrud<Resposta, NovaResposta> {
  private respostaRepository: RespostaRepository;

  constructor() {
    const respostaRepository = new RespostaRepository(supabase);
    super(respostaRepository);
    this.respostaRepository = respostaRepository;
  }

  /**
   * Buscar respostas de um usuário
   */
  async buscarPorUsuario(usuarioId: string): Promise<Resposta[]> {
    return await this.respostaRepository.findByUserId(usuarioId);
  }

  /**
   * Buscar respostas de uma questão
   */
  async buscarPorQuestao(questaoId: string): Promise<Resposta[]> {
    return await this.respostaRepository.findByQuestaoId(questaoId);
  }

  /**
   * Criar resposta com validação automática
   */
  async criarComValidacao(questaoId: string, usuarioId: string, respostaDada: 'A' | 'B' | 'C' | 'D'): Promise<Resposta> {
    return await this.respostaRepository.createWithValidation(questaoId, usuarioId, respostaDada);
  }

  /**
   * Buscar apenas respostas corretas do usuário
   */
  async buscarCorretasPorUsuario(usuarioId: string): Promise<Resposta[]> {
    return await this.respostaRepository.findCorrectByUserId(usuarioId);
  }

  /**
   * Buscar apenas respostas incorretas do usuário
   */
  async buscarIncorretasPorUsuario(usuarioId: string): Promise<Resposta[]> {
    return await this.respostaRepository.findIncorrectByUserId(usuarioId);
  }

  /**
   * Obter estatísticas do usuário
   */
  async obterEstatisticas(usuarioId: string): Promise<{
    totalRespostas: number;
    acertos: number;
    erros: number;
    percentualAcerto: number;
  }> {
    return await this.respostaRepository.getUserStats(usuarioId);
  }
}
