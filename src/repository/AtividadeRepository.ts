import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Atividade, NovaAtividade } from '../model/Atividade';

/**
 * Repository para operações CRUD da tabela atividades
 */
export class AtividadeRepository extends SupabaseBaseRepository<Atividade, NovaAtividade, Partial<Atividade>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'atividades');
  }

  /**
   * Buscar atividades de um cronograma específico
   */
  async findByCronogramaId(cronogramaId: string): Promise<Atividade[]> {
    return this.findWhere({ cronograma_id: cronogramaId } as Partial<Atividade>);
  }

  /**
   * Buscar atividades com informações do cronograma (JOIN)
   */
  async findWithCronograma(): Promise<Array<Atividade & { cronograma: { titulo: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        cronogramas!inner (
          titulo
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar atividades com cronograma: ${error.message}`);
    }

    return data as Array<Atividade & { cronograma: { titulo: string } }>;
  }

  /**
   * Buscar atividade por título
   */
  async findByTitle(titulo: string): Promise<Atividade | null> {
    return this.findOneWhere({ titulo } as Partial<Atividade>);
  }

  /**
   * Buscar atividades por status
   */
  async findByStatus(status: 'pendente' | 'em_andamento' | 'concluida'): Promise<Atividade[]> {
    return this.findWhere({ status } as Partial<Atividade>);
  }

  /**
   * Buscar atividades por período
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Atividade[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('data_inicio', startDate)
      .lte('data_inicio', endDate)
      .order('data_inicio', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar atividades por período: ${error.message}`);
    }

    return data as Atividade[];
  }

  /**
   * Buscar atividades que vencem hoje
   */
  async findDueToday(): Promise<Atividade[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('data_fim', today)
      .neq('status', 'concluida');

    if (error) {
      throw new Error(`Erro ao buscar atividades que vencem hoje: ${error.message}`);
    }

    return data as Atividade[];
  }

  /**
   * Buscar atividades em atraso
   */
  async findOverdue(): Promise<Atividade[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('data_fim', today)
      .neq('status', 'concluida')
      .not('data_fim', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar atividades em atraso: ${error.message}`);
    }

    return data as Atividade[];
  }

  /**
   * Atualizar status da atividade por título
   */
  async updateStatusByTitle(titulo: string, status: 'pendente' | 'em_andamento' | 'concluida'): Promise<Atividade | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({ status })
      .eq('titulo', titulo)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao atualizar status da atividade: ${error.message}`);
    }

    return result as Atividade;
  }

  /**
   * Deletar atividade por título
   */
  async deleteByTitle(titulo: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('titulo', titulo);

    if (error) {
      throw new Error(`Erro ao deletar atividade por título: ${error.message}`);
    }

    return true;
  }

  /**
   * Marcar atividade como concluída
   */
  async markAsCompleted(id: string): Promise<Atividade | null> {
    return this.updateById(id, { status: 'concluida' } as Partial<Atividade>);
  }

  /**
   * Marcar atividade como em andamento
   */
  async markAsInProgress(id: string): Promise<Atividade | null> {
    return this.updateById(id, { status: 'em_andamento' } as Partial<Atividade>);
  }

  /**
   * Contar atividades por status em um cronograma
   */
  async countByStatusInCronograma(cronogramaId: string, status: 'pendente' | 'em_andamento' | 'concluida'): Promise<number> {
    return this.count({ cronograma_id: cronogramaId, status } as Partial<Atividade>);
  }

  /**
   * Buscar atividades próximas do vencimento
   */
  async findDueSoon(days: number = 7): Promise<Atividade[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('data_fim', today.toISOString().split('T')[0])
      .lte('data_fim', futureDate.toISOString().split('T')[0])
      .neq('status', 'concluida')
      .not('data_fim', 'is', null)
      .order('data_fim', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar atividades próximas do vencimento: ${error.message}`);
    }

    return data as Atividade[];
  }

  /**
   * Buscar atividades de um usuário (através do cronograma)
   */
  async findByUserId(userId: string): Promise<Array<Atividade & { cronograma: any }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        cronogramas!inner (
          id,
          titulo,
          usuario_id
        )
      `)
      .eq('cronogramas.usuario_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar atividades do usuário: ${error.message}`);
    }

    return data as Array<Atividade & { cronograma: any }>;
  }
}
