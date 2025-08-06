import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Resposta, NovaResposta } from '../model/Resposta';

/**
 * Repository para operações CRUD da tabela respostas
 */
export class RespostaRepository extends SupabaseBaseRepository<Resposta, NovaResposta, Partial<Resposta>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'respostas');
  }

  /**
   * Buscar respostas de um usuário específico
   */
  async findByUserId(userId: string): Promise<Resposta[]> {
    return this.findWhere({ usuario_id: userId } as Partial<Resposta>);
  }

  /**
   * Buscar respostas de uma questão específica
   */
  async findByQuestaoId(questaoId: string): Promise<Resposta[]> {
    return this.findWhere({ questao_id: questaoId } as Partial<Resposta>);
  }

  /**
   * Buscar resposta específica de um usuário para uma questão
   */
  async findByUserAndQuestao(userId: string, questaoId: string): Promise<Resposta | null> {
    return this.findOneWhere({ usuario_id: userId, questao_id: questaoId } as Partial<Resposta>);
  }

  /**
   * Buscar respostas corretas de um usuário
   */
  async findCorrectByUserId(userId: string): Promise<Resposta[]> {
    return this.findWhere({ usuario_id: userId, correta: true } as Partial<Resposta>);
  }

  /**
   * Buscar respostas incorretas de um usuário
   */
  async findIncorrectByUserId(userId: string): Promise<Resposta[]> {
    return this.findWhere({ usuario_id: userId, correta: false } as Partial<Resposta>);
  }

  /**
   * Buscar respostas de um usuário em um quiz específico
   */
  async findByUserInQuiz(userId: string, quizId: string): Promise<Array<Resposta & { questao: any }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        questoes!inner (
          id,
          quiz_id,
          enunciado,
          correta
        )
      `)
      .eq('usuario_id', userId)
      .eq('questoes.quiz_id', quizId);

    if (error) {
      throw new Error(`Erro ao buscar respostas do usuário no quiz: ${error.message}`);
    }

    return data as Array<Resposta & { questao: any }>;
  }

  /**
   * Registrar nova resposta com validação automática
   */
  async createWithValidation(
    userId: string, 
    questaoId: string, 
    respostaUsuario: 'A' | 'B' | 'C' | 'D'
  ): Promise<Resposta> {
    // Buscar a questão para saber a resposta correta
    const { data: questao, error: questaoError } = await this.supabase
      .from('questoes')
      .select('correta')
      .eq('id', questaoId)
      .single();

    if (questaoError) {
      throw new Error(`Erro ao buscar questão: ${questaoError.message}`);
    }

    const correta = questao?.correta === respostaUsuario;

    return this.create({
      usuario_id: userId,
      questao_id: questaoId,
      resposta_dada: respostaUsuario,
      correta
    } as NovaResposta);
  }

  /**
   * Atualizar resposta existente
   */
  async updateResposta(
    userId: string, 
    questaoId: string, 
    novaResposta: 'A' | 'B' | 'C' | 'D'
  ): Promise<Resposta | null> {
    // Buscar a questão para saber a resposta correta
    const { data: questao } = await this.supabase
      .from('questoes')
      .select('correta')
      .eq('id', questaoId)
      .single();

    const correta = questao?.correta === novaResposta;

    const filters = { usuario_id: userId, questao_id: questaoId } as Partial<Resposta>;
    const updateData = { 
      resposta_dada: novaResposta, 
      correta,
      respondido_em: new Date().toISOString()
    } as Partial<Resposta>;

    const updated = await this.updateWhere(filters, updateData);
    return updated.length > 0 ? updated[0] : null;
  }

  /**
   * Deletar resposta específica
   */
  async deleteByUserAndQuestao(userId: string, questaoId: string): Promise<boolean> {
    const filters = { usuario_id: userId, questao_id: questaoId } as Partial<Resposta>;
    const deleted = await this.deleteWhere(filters);
    return deleted > 0;
  }

  /**
   * Contar acertos de um usuário
   */
  async countCorrectByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId, correta: true } as Partial<Resposta>);
  }

  /**
   * Contar erros de um usuário
   */
  async countIncorrectByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId, correta: false } as Partial<Resposta>);
  }

  /**
   * Obter estatísticas de um usuário
   */
  async getUserStats(userId: string): Promise<{
    totalRespostas: number;
    acertos: number;
    erros: number;
    percentualAcerto: number;
  }> {
    const [total, acertos] = await Promise.all([
      this.count({ usuario_id: userId } as Partial<Resposta>),
      this.countCorrectByUserId(userId)
    ]);

    const erros = total - acertos;
    const percentualAcerto = total > 0 ? Math.round((acertos / total) * 100) : 0;

    return {
      totalRespostas: total,
      acertos,
      erros,
      percentualAcerto
    };
  }

  /**
   * Obter estatísticas de um usuário em um quiz específico
   */
  async getUserQuizStats(userId: string, quizId: string): Promise<{
    totalRespostas: number;
    acertos: number;
    erros: number;
    percentualAcerto: number;
    completed: boolean;
    totalQuestoes: number;
  }> {
    const respostasQuiz = await this.findByUserInQuiz(userId, quizId);
    const acertos = respostasQuiz.filter(r => r.correta).length;
    const total = respostasQuiz.length;
    const erros = total - acertos;
    const percentualAcerto = total > 0 ? Math.round((acertos / total) * 100) : 0;

    // Buscar total de questões do quiz
    const { count: totalQuestoes } = await this.supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    const completed = total === (totalQuestoes || 0);

    return {
      totalRespostas: total,
      acertos,
      erros,
      percentualAcerto,
      completed,
      totalQuestoes: totalQuestoes || 0
    };
  }

  /**
   * Buscar respostas por data
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Resposta[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('respondido_em', startDate)
      .lte('respondido_em', endDate)
      .order('respondido_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar respostas por período: ${error.message}`);
    }

    return data as Resposta[];
  }

  /**
   * Buscar últimas respostas de um usuário
   */
  async findRecentByUserId(userId: string, limit: number = 10): Promise<Array<Resposta & { questao: any }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        questoes (
          enunciado,
          correta,
          quizzes (
            titulo
          )
        )
      `)
      .eq('usuario_id', userId)
      .order('respondido_em', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar respostas recentes: ${error.message}`);
    }

    return data as Array<Resposta & { questao: any }>;
  }

  /**
   * Verificar se usuário já respondeu uma questão
   */
  async hasAnswered(userId: string, questaoId: string): Promise<boolean> {
    return this.exists({ usuario_id: userId, questao_id: questaoId } as Partial<Resposta>);
  }

  /**
   * Buscar distribuição de respostas para uma questão
   */
  async getQuestionDistribution(questaoId: string): Promise<{
    A: number;
    B: number;
    C: number;
    D: number;
    total: number;
  }> {
    const respostas = await this.findByQuestaoId(questaoId);
    
    const distribution = { A: 0, B: 0, C: 0, D: 0, total: respostas.length };
    
    respostas.forEach(resp => {
      if (resp.resposta_dada && ['A', 'B', 'C', 'D'].includes(resp.resposta_dada)) {
        distribution[resp.resposta_dada as 'A' | 'B' | 'C' | 'D']++;
      }
    });

    return distribution;
  }

  /**
   * Buscar questões mais erradas por um usuário
   */
  async findMostMissedQuestions(userId: string, limit: number = 10): Promise<Array<{ questao: any; respostas: Resposta[] }>> {
    const respostasIncorretas = await this.findIncorrectByUserId(userId);
    
    // Agrupar por questão
    const questoesMap = new Map<string, Resposta[]>();
    respostasIncorretas.forEach(resp => {
      const questaoId = resp.questao_id;
      if (!questoesMap.has(questaoId)) {
        questoesMap.set(questaoId, []);
      }
      questoesMap.get(questaoId)!.push(resp);
    });

    // Buscar informações das questões
    const result = await Promise.all(
      Array.from(questoesMap.entries()).map(async ([questaoId, respostas]) => {
        const { data: questao } = await this.supabase
          .from('questoes')
          .select(`
            *,
            quizzes (
              titulo
            )
          `)
          .eq('id', questaoId)
          .single();

        return {
          questao,
          respostas
        };
      })
    );

    // Ordenar por quantidade de erros
    return result
      .sort((a, b) => b.respostas.length - a.respostas.length)
      .slice(0, limit);
  }

  /**
   * Obter progresso em quizzes para um usuário
   */
  async getQuizProgress(userId: string): Promise<Array<{
    quiz: any;
    totalQuestoes: number;
    respondidasCorretas: number;
    respondidasIncorretas: number;
    naoRespondidas: number;
    percentualCompleto: number;
    percentualAcerto: number;
  }>> {
    // Buscar todos os quizzes que o usuário já respondeu
    const { data: quizzesData, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        questoes (
          id,
          respostas!inner (
            usuario_id,
            correta
          )
        )
      `)
      .eq('questoes.respostas.usuario_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar progresso em quizzes: ${error.message}`);
    }

    return quizzesData?.map(quiz => {
      const questoes = quiz.questoes || [];
      const totalQuestoes = questoes.length;
      const respondidasCorretas = questoes.filter((q: any) => 
        q.respostas?.some((r: any) => r.usuario_id === userId && r.correta)
      ).length;
      const respondidasIncorretas = questoes.filter((q: any) => 
        q.respostas?.some((r: any) => r.usuario_id === userId && !r.correta)
      ).length;
      const totalRespondidas = respondidasCorretas + respondidasIncorretas;
      const naoRespondidas = totalQuestoes - totalRespondidas;
      const percentualCompleto = totalQuestoes > 0 ? Math.round((totalRespondidas / totalQuestoes) * 100) : 0;
      const percentualAcerto = totalRespondidas > 0 ? Math.round((respondidasCorretas / totalRespondidas) * 100) : 0;

      return {
        quiz: {
          id: quiz.id,
          titulo: quiz.titulo,
          criado_em: quiz.criado_em
        },
        totalQuestoes,
        respondidasCorretas,
        respondidasIncorretas,
        naoRespondidas,
        percentualCompleto,
        percentualAcerto
      };
    }) || [];
  }
}
