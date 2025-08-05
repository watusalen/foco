import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Meta, NovaMeta } from '../model/Meta';

/**
 * Repository para operações CRUD da tabela metas
 */
export class MetaRepository extends SupabaseBaseRepository<Meta, NovaMeta, Partial<Meta>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'metas');
  }

  /**
   * Buscar metas de um usuário específico
   */
  async findByUserId(userId: string): Promise<Meta[]> {
    return this.findWhere({ usuario_id: userId } as Partial<Meta>);
  }

  /**
   * Buscar metas com informações do usuário (JOIN)
   */
  async findWithUser(): Promise<Array<Meta & { usuario: { nome: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        usuarios!inner (
          nome
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar metas com usuário: ${error.message}`);
    }

    return data as Array<Meta & { usuario: { nome: string } }>;
  }

  /**
   * Buscar meta por título
   */
  async findByTitle(titulo: string): Promise<Meta | null> {
    return this.findOneWhere({ titulo } as Partial<Meta>);
  }

  /**
   * Buscar metas atingidas
   */
  async findAchieved(): Promise<Meta[]> {
    return this.findWhere({ atingida: true } as Partial<Meta>);
  }

  /**
   * Buscar metas não atingidas
   */
  async findNotAchieved(): Promise<Meta[]> {
    return this.findWhere({ atingida: false } as Partial<Meta>);
  }

  /**
   * Buscar metas atingidas de um usuário
   */
  async findAchievedByUserId(userId: string): Promise<Meta[]> {
    return this.findWhere({ usuario_id: userId, atingida: true } as Partial<Meta>);
  }

  /**
   * Buscar metas não atingidas de um usuário
   */
  async findNotAchievedByUserId(userId: string): Promise<Meta[]> {
    return this.findWhere({ usuario_id: userId, atingida: false } as Partial<Meta>);
  }

  /**
   * Buscar metas que vencem hoje
   */
  async findDueToday(): Promise<Meta[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('data_limite', today)
      .eq('atingida', false);

    if (error) {
      throw new Error(`Erro ao buscar metas que vencem hoje: ${error.message}`);
    }

    return data as Meta[];
  }

  /**
   * Buscar metas em atraso (vencidas e não atingidas)
   */
  async findOverdue(): Promise<Meta[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('data_limite', today)
      .eq('atingida', false)
      .not('data_limite', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar metas em atraso: ${error.message}`);
    }

    return data as Meta[];
  }

  /**
   * Buscar metas próximas do vencimento
   */
  async findDueSoon(days: number = 7): Promise<Meta[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('data_limite', today.toISOString().split('T')[0])
      .lte('data_limite', futureDate.toISOString().split('T')[0])
      .eq('atingida', false)
      .not('data_limite', 'is', null)
      .order('data_limite', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar metas próximas do vencimento: ${error.message}`);
    }

    return data as Meta[];
  }

  /**
   * Marcar meta como atingida por título
   */
  async markAsAchievedByTitle(titulo: string): Promise<Meta | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({ atingida: true })
      .eq('titulo', titulo)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao marcar meta como atingida: ${error.message}`);
    }

    return result as Meta;
  }

  /**
   * Marcar meta como atingida por ID
   */
  async markAsAchieved(id: string): Promise<Meta | null> {
    return this.updateById(id, { atingida: true } as Partial<Meta>);
  }

  /**
   * Marcar meta como não atingida por ID
   */
  async markAsNotAchieved(id: string): Promise<Meta | null> {
    return this.updateById(id, { atingida: false } as Partial<Meta>);
  }

  /**
   * Deletar meta por título
   */
  async deleteByTitle(titulo: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('titulo', titulo);

    if (error) {
      throw new Error(`Erro ao deletar meta por título: ${error.message}`);
    }

    return true;
  }

  /**
   * Contar metas atingidas por usuário
   */
  async countAchievedByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId, atingida: true } as Partial<Meta>);
  }

  /**
   * Contar metas não atingidas por usuário
   */
  async countNotAchievedByUserId(userId: string): Promise<number> {
    return this.count({ usuario_id: userId, atingida: false } as Partial<Meta>);
  }

  /**
   * Obter estatísticas de metas de um usuário
   */
  async getUserMetaStats(userId: string): Promise<{
    total: number;
    atingidas: number;
    naoAtingidas: number;
    percentualAtingido: number;
    proximasVencimento: number;
    vencidas: number;
  }> {
    const [total, atingidas, proximasVencimento, vencidas] = await Promise.all([
      this.count({ usuario_id: userId } as Partial<Meta>),
      this.countAchievedByUserId(userId),
      this.findDueSoon(7).then(metas => metas.filter(m => m.usuario_id === userId).length),
      this.findOverdue().then(metas => metas.filter(m => m.usuario_id === userId).length)
    ]);

    const naoAtingidas = total - atingidas;
    const percentualAtingido = total > 0 ? Math.round((atingidas / total) * 100) : 0;

    return {
      total,
      atingidas,
      naoAtingidas,
      percentualAtingido,
      proximasVencimento,
      vencidas
    };
  }

  /**
   * Buscar metas por faixa de valor esperado
   */
  async findByValueRange(minValue: number, maxValue: number): Promise<Meta[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('valor_esperado', minValue)
      .lte('valor_esperado', maxValue)
      .not('valor_esperado', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar metas por faixa de valor: ${error.message}`);
    }

    return data as Meta[];
  }
}
