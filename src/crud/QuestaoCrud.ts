import { BaseCrud } from './BaseCrud';
import { Questao, NovaQuestao } from '../model/Questao';
import { QuestaoRepository } from '../repository/QuestaoRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com questões
 */
export class QuestaoCrud extends BaseCrud<Questao, NovaQuestao> {
  private questaoRepository: QuestaoRepository;

  constructor() {
    const questaoRepository = new QuestaoRepository(supabase);
    super(questaoRepository);
    this.questaoRepository = questaoRepository;
  }

  /**
   * Buscar questões de um quiz
   */
  async buscarPorQuiz(quizId: string): Promise<Questao[]> {
    return await this.questaoRepository.findByQuizId(quizId);
  }

  /**
   * Buscar questão por enunciado
   */
  async buscarPorEnunciado(enunciado: string): Promise<Questao | null> {
    return await this.questaoRepository.findByEnunciado(enunciado);
  }

  /**
   * Buscar questões por resposta correta
   */
  async buscarPorRespostaCorreta(resposta: 'A' | 'B' | 'C' | 'D'): Promise<Questao[]> {
    return await this.questaoRepository.findByRespostaCorreta(resposta);
  }
}
