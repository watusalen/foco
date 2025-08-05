import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Questao, NovaQuestao } from '../model/Questao';

/**
 * Repository para operações CRUD da tabela questoes
 */
export class QuestaoRepository extends SupabaseBaseRepository<Questao, NovaQuestao, Partial<Questao>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'questoes');
  }

  /**
   * Buscar questões de um quiz específico
   */
  async findByQuizId(quizId: string): Promise<Questao[]> {
    return this.findWhere({ quiz_id: quizId } as Partial<Questao>);
  }

  /**
   * Buscar questões com informações do quiz (JOIN)
   */
  async findWithQuiz(): Promise<Array<Questao & { quiz: { titulo: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        quizzes!inner (
          titulo
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar questões com quiz: ${error.message}`);
    }

    return data as Array<Questao & { quiz: { titulo: string } }>;
  }

  /**
   * Buscar questão por enunciado
   */
  async findByEnunciado(enunciado: string): Promise<Questao | null> {
    return this.findOneWhere({ enunciado } as Partial<Questao>);
  }

  /**
   * Buscar questão com suas respostas
   */
  async findByIdWithRespostas(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        respostas (
          id,
          usuario_id,
          resposta_dada,
          correta,
          respondido_em
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar questão com respostas: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar questões de um quiz com suas respostas
   */
  async findByQuizIdWithRespostas(quizId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        respostas (
          id,
          usuario_id,
          resposta_dada,
          correta,
          respondido_em
        )
      `)
      .eq('quiz_id', quizId);

    if (error) {
      throw new Error(`Erro ao buscar questões do quiz com respostas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Atualizar questão por enunciado
   */
  async updateByEnunciado(enunciado: string, data: Partial<Questao>): Promise<Questao | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('enunciado', enunciado)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao atualizar questão por enunciado: ${error.message}`);
    }

    return result as Questao;
  }

  /**
   * Deletar questão por enunciado
   */
  async deleteByEnunciado(enunciado: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('enunciado', enunciado);

    if (error) {
      throw new Error(`Erro ao deletar questão por enunciado: ${error.message}`);
    }

    return true;
  }

  /**
   * Contar questões por quiz
   */
  async countByQuizId(quizId: string): Promise<number> {
    return this.count({ quiz_id: quizId } as Partial<Questao>);
  }

  /**
   * Buscar questões por resposta correta
   */
  async findByRespostaCorreta(correta: 'A' | 'B' | 'C' | 'D'): Promise<Questao[]> {
    return this.findWhere({ correta } as Partial<Questao>);
  }

  /**
   * Buscar estatísticas da questão
   */
  async getQuestaoStats(questaoId: string): Promise<{
    totalRespostas: number;
    acertos: number;
    erros: number;
    percentualAcerto: number;
    distribuicaoRespostas: { A: number; B: number; C: number; D: number };
  }> {
    const [respostas, acertos] = await Promise.all([
      this.supabase.from('respostas').select('resposta_usuario, correta').eq('questao_id', questaoId),
      this.supabase.from('respostas').select('*', { count: 'exact', head: true }).eq('questao_id', questaoId).eq('correta', true)
    ]);

    const totalRespostas = respostas.data?.length || 0;
    const totalAcertos = acertos.count || 0;
    const erros = totalRespostas - totalAcertos;
    const percentualAcerto = totalRespostas > 0 ? Math.round((totalAcertos / totalRespostas) * 100) : 0;

    // Calcular distribuição de respostas
    const distribuicaoRespostas = { A: 0, B: 0, C: 0, D: 0 };
    respostas.data?.forEach(resp => {
      if (resp.resposta_usuario && ['A', 'B', 'C', 'D'].includes(resp.resposta_usuario)) {
        distribuicaoRespostas[resp.resposta_usuario as 'A' | 'B' | 'C' | 'D']++;
      }
    });

    return {
      totalRespostas,
      acertos: totalAcertos,
      erros,
      percentualAcerto,
      distribuicaoRespostas
    };
  }

  /**
   * Buscar questões mais difíceis (menor percentual de acerto)
   */
  async findMostDifficult(limit: number = 10): Promise<Array<Questao & { percentualAcerto: number }>> {
    const questoes = await this.findAll();
    
    const questoesWithStats = await Promise.all(
      questoes.map(async (questao) => {
        const stats = await this.getQuestaoStats(questao.id);
        return {
          ...questao,
          percentualAcerto: stats.percentualAcerto
        };
      })
    );

    return questoesWithStats
      .sort((a, b) => a.percentualAcerto - b.percentualAcerto)
      .slice(0, limit);
  }

  /**
   * Buscar questões mais fáceis (maior percentual de acerto)
   */
  async findEasiest(limit: number = 10): Promise<Array<Questao & { percentualAcerto: number }>> {
    const questoes = await this.findAll();
    
    const questoesWithStats = await Promise.all(
      questoes.map(async (questao) => {
        const stats = await this.getQuestaoStats(questao.id);
        return {
          ...questao,
          percentualAcerto: stats.percentualAcerto
        };
      })
    );

    return questoesWithStats
      .sort((a, b) => b.percentualAcerto - a.percentualAcerto)
      .slice(0, limit);
  }

  /**
   * Duplicar questão para outro quiz
   */
  async duplicateToQuiz(questaoId: string, targetQuizId: string): Promise<Questao> {
    const originalQuestao = await this.findById(questaoId);
    
    if (!originalQuestao) {
      throw new Error('Questão não encontrada');
    }

    const { id, quiz_id, ...questaoData } = originalQuestao;

    return this.create({
      ...questaoData,
      quiz_id: targetQuizId
    } as NovaQuestao);
  }

  /**
   * Validar se resposta correta é válida
   */
  validateRespostaCorreta(correta: string): boolean {
    return ['A', 'B', 'C', 'D'].includes(correta);
  }

  /**
   * Buscar questões sem resposta correta definida
   */
  async findWithoutCorrectAnswer(): Promise<Questao[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .is('correta', null);

    if (error) {
      throw new Error(`Erro ao buscar questões sem resposta correta: ${error.message}`);
    }

    return data as Questao[];
  }

  /**
   * Buscar questões respondidas por um usuário
   */
  async findAnsweredByUser(userId: string): Promise<Array<Questao & { resposta_usuario: any }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        respostas!inner (
          resposta_dada,
          correta,
          respondido_em
        )
      `)
      .eq('respostas.usuario_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar questões respondidas pelo usuário: ${error.message}`);
    }

    return data?.map(item => ({
      ...item,
      resposta_usuario: item.respostas?.[0] || null,
      respostas: undefined
    })) as Array<Questao & { resposta_usuario: any }>;
  }

  /**
   * Buscar questões não respondidas por um usuário em um quiz
   */
  async findUnansweredByUserInQuiz(userId: string, quizId: string): Promise<Questao[]> {
    // Primeiro buscar todas as questões do quiz
    const todasQuestoes = await this.findByQuizId(quizId);
    
    // Buscar IDs das questões já respondidas pelo usuário neste quiz
    const { data: questoesRespondidas } = await this.supabase
      .from('respostas')
      .select('questao_id')
      .eq('usuario_id', userId)
      .in('questao_id', todasQuestoes.map(q => q.id));

    const idsRespondidas = questoesRespondidas?.map(r => r.questao_id) || [];

    // Filtrar questões não respondidas
    return todasQuestoes.filter(questao => !idsRespondidas.includes(questao.id));
  }
}
