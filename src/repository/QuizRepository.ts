import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Quiz, NovoQuiz } from '../model/Quiz';

/**
 * Repository para operações CRUD da tabela quizzes
 */
export class QuizRepository extends SupabaseBaseRepository<Quiz, NovoQuiz, Partial<Quiz>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'quizzes');
  }

  /**
   * Buscar quizzes de um usuário específico
   */
  async findByUserId(userId: string): Promise<Quiz[]> {
    return this.findWhere({ usuario_id: userId } as Partial<Quiz>);
  }

  /**
   * Buscar quiz por título
   */
  async findByTitle(titulo: string): Promise<Quiz | null> {
    return this.findOneWhere({ titulo } as Partial<Quiz>);
  }

  /**
   * Buscar quiz com suas questões
   */
  async findByIdWithQuestoes(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        questoes (
          id,
          enunciado,
          alternativa_a,
          alternativa_b,
          alternativa_c,
          alternativa_d,
          correta
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar quiz com questões: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar quizzes de um usuário com suas questões
   */
  async findByUserIdWithQuestoes(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        questoes (
          id,
          enunciado,
          alternativa_a,
          alternativa_b,
          alternativa_c,
          alternativa_d,
          correta
        )
      `)
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar quizzes do usuário com questões: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar quizzes criados em um período
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar quizzes por período: ${error.message}`);
    }

    return data as Quiz[];
  }

  /**
   * Atualizar quiz por título
   */
  async updateByTitle(titulo: string, data: Partial<Quiz>): Promise<Quiz | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('titulo', titulo)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao atualizar quiz por título: ${error.message}`);
    }

    return result as Quiz;
  }

  /**
   * Deletar quiz por título
   */
  async deleteByTitle(titulo: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('titulo', titulo);

    if (error) {
      throw new Error(`Erro ao deletar quiz por título: ${error.message}`);
    }

    return true;
  }

  /**
   * Contar quizzes por usuário
   */
  async countByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId } as Partial<Quiz>);
  }

  /**
   * Buscar quizzes mais recentes
   */
  async findRecent(limit: number = 10): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar quizzes recentes: ${error.message}`);
    }

    return data as Quiz[];
  }

  /**
   * Buscar estatísticas do quiz
   */
  async getQuizStats(quizId: string): Promise<{
    totalQuestoes: number;
    totalRespostas: number;
    acertos: number;
    erros: number;
    percentualAcerto: number;
  }> {
    // Primeiro buscar IDs das questões do quiz
    const { data: questoesIds } = await this.supabase
      .from('questoes')
      .select('id')
      .eq('quiz_id', quizId);

    const questoesIdList = questoesIds?.map(q => q.id) || [];

    const [questoes, respostas, acertos] = await Promise.all([
      this.supabase.from('questoes').select('*', { count: 'exact', head: true }).eq('quiz_id', quizId),
      questoesIdList.length > 0 
        ? this.supabase.from('respostas').select('*', { count: 'exact', head: true }).in('questao_id', questoesIdList)
        : Promise.resolve({ count: 0 }),
      questoesIdList.length > 0 
        ? this.supabase.from('respostas').select('*', { count: 'exact', head: true }).eq('correta', true).in('questao_id', questoesIdList)
        : Promise.resolve({ count: 0 })
    ]);

    const totalQuestoes = questoes.count || 0;
    const totalRespostas = respostas.count || 0;
    const totalAcertos = acertos.count || 0;
    const erros = totalRespostas - totalAcertos;
    const percentualAcerto = totalRespostas > 0 ? Math.round((totalAcertos / totalRespostas) * 100) : 0;

    return {
      totalQuestoes,
      totalRespostas,
      acertos: totalAcertos,
      erros,
      percentualAcerto
    };
  }

  /**
   * Buscar quizzes com estatísticas resumidas
   */
  async findWithStats(userId?: string): Promise<Array<Quiz & { stats: any }>> {
    const baseQuery = userId 
      ? this.supabase.from(this.tableName).select('*').eq('usuario_id', userId)
      : this.supabase.from(this.tableName).select('*');

    const { data: quizzes, error } = await baseQuery;

    if (error) {
      throw new Error(`Erro ao buscar quizzes: ${error.message}`);
    }

    if (!quizzes) return [];

    // Buscar estatísticas para cada quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const stats = await this.getQuizStats(quiz.id);
        return { ...quiz, stats };
      })
    );

    return quizzesWithStats;
  }

  /**
   * Buscar quiz completo (com questões e estatísticas)
   */
  async findCompleteById(id: string): Promise<any | null> {
    const [quiz, stats] = await Promise.all([
      this.findByIdWithQuestoes(id),
      this.getQuizStats(id)
    ]);

    if (!quiz) return null;

    return {
      ...quiz,
      stats
    };
  }

  /**
   * Verificar se usuário é proprietário do quiz
   */
  async isOwner(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.findById(quizId);
    return quiz?.usuario_id === userId;
  }

  /**
   * Duplicar quiz (criar cópia com novas questões)
   */
  async duplicateQuiz(quizId: string, newTitle: string, userId: string): Promise<Quiz> {
    const originalQuiz = await this.findByIdWithQuestoes(quizId);
    
    if (!originalQuiz) {
      throw new Error('Quiz não encontrado');
    }

    // Criar novo quiz
    const newQuiz = await this.create({
      usuario_id: userId,
      titulo: newTitle
    } as NovoQuiz);

    // Duplicar questões se existirem
    if (originalQuiz.questoes && originalQuiz.questoes.length > 0) {
      const newQuestoes = originalQuiz.questoes.map((q: any) => ({
        quiz_id: newQuiz.id,
        enunciado: q.enunciado,
        alternativa_a: q.alternativa_a,
        alternativa_b: q.alternativa_b,
        alternativa_c: q.alternativa_c,
        alternativa_d: q.alternativa_d,
        correta: q.correta
      }));

      await this.supabase
        .from('questoes')
        .insert(newQuestoes);
    }

    return newQuiz;
  }

  /**
   * Buscar quizzes populares (com mais respostas)
   */
  async findPopular(limit: number = 10): Promise<Array<Quiz & { total_respostas: number }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        questoes!inner (
          respostas (count)
        )
      `)
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar quizzes populares: ${error.message}`);
    }

    // Processar dados para calcular total de respostas
    const processedData = data?.map(quiz => {
      const totalRespostas = quiz.questoes?.reduce((total: number, questao: any) => 
        total + (questao.respostas?.[0]?.count || 0), 0) || 0;
      
      return {
        ...quiz,
        total_respostas: totalRespostas,
        questoes: undefined // Remover questões do resultado final
      };
    }).sort((a, b) => b.total_respostas - a.total_respostas);

    return processedData || [];
  }
}
