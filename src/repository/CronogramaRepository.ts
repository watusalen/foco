import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Cronograma, NovoCronograma } from '../model/Cronograma';

/**
 * Repository para operações CRUD da tabela cronogramas
 */
export class CronogramaRepository extends SupabaseBaseRepository<Cronograma, NovoCronograma, Partial<Cronograma>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'cronogramas');
  }

  /**
   * Buscar cronogramas de um usuário específico
   */
  async findByUserId(userId: string): Promise<Cronograma[]> {
    return this.findWhere({ usuario_id: userId } as Partial<Cronograma>);
  }

  /**
   * Buscar cronogramas com informações do usuário (JOIN)
   */
  async findWithUser(): Promise<Array<Cronograma & { usuario: { nome: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        usuarios!inner (
          nome
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar cronogramas com usuário: ${error.message}`);
    }

    return data as Array<Cronograma & { usuario: { nome: string } }>;
  }

  /**
   * Buscar cronograma por título
   */
  async findByTitle(titulo: string): Promise<Cronograma | null> {
    return this.findOneWhere({ titulo } as Partial<Cronograma>);
  }

  /**
   * Buscar cronograma com suas atividades
   */
  async findByIdWithActivities(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        atividades (
          id,
          titulo,
          descricao,
          data_inicio,
          data_fim,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar cronograma com atividades: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar cronogramas de um usuário com suas atividades
   */
  async findByUserIdWithActivities(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        atividades (
          id,
          titulo,
          descricao,
          data_inicio,
          data_fim,
          status
        )
      `)
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar cronogramas do usuário com atividades: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Atualizar cronograma por título
   */
  async updateByTitle(titulo: string, data: Partial<Cronograma>): Promise<Cronograma | null> {
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
      throw new Error(`Erro ao atualizar cronograma por título: ${error.message}`);
    }

    return result as Cronograma;
  }

  /**
   * Deletar cronograma por título
   */
  async deleteByTitle(titulo: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('titulo', titulo);

    if (error) {
      throw new Error(`Erro ao deletar cronograma por título: ${error.message}`);
    }

    return true;
  }

  /**
   * Buscar cronogramas criados em um período
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Cronograma[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar cronogramas por período: ${error.message}`);
    }

    return data as Cronograma[];
  }

  /**
   * Contar cronogramas por usuário
   */
  async countByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId } as Partial<Cronograma>);
  }

  /**
   * Buscar cronogramas mais recentes
   */
  async findRecent(limit: number = 10): Promise<Cronograma[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar cronogramas recentes: ${error.message}`);
    }

    return data as Cronograma[];
  }

  /**
   * Buscar estatísticas do cronograma
   */
  async getCronogramaStats(cronogramaId: string): Promise<{
    totalAtividades: number;
    atividadesPendentes: number;
    atividadesEmAndamento: number;
    atividadesConcluidas: number;
  }> {
    const [total, pendentes, emAndamento, concluidas] = await Promise.all([
      this.supabase.from('atividades').select('*', { count: 'exact', head: true }).eq('cronograma_id', cronogramaId),
      this.supabase.from('atividades').select('*', { count: 'exact', head: true }).eq('cronograma_id', cronogramaId).eq('status', 'pendente'),
      this.supabase.from('atividades').select('*', { count: 'exact', head: true }).eq('cronograma_id', cronogramaId).eq('status', 'em_andamento'),
      this.supabase.from('atividades').select('*', { count: 'exact', head: true }).eq('cronograma_id', cronogramaId).eq('status', 'concluida')
    ]);

    return {
      totalAtividades: total.count || 0,
      atividadesPendentes: pendentes.count || 0,
      atividadesEmAndamento: emAndamento.count || 0,
      atividadesConcluidas: concluidas.count || 0
    };
  }
}
