import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Progresso, NovoProgresso } from '../model/Progresso';

/**
 * Repository para operações CRUD da tabela progresso
 */
export class ProgressoRepository extends SupabaseBaseRepository<Progresso, NovoProgresso, Partial<Progresso>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'progresso');
  }

  /**
   * Buscar progresso de um usuário específico
   */
  async findByUserId(userId: string): Promise<Progresso[]> {
    return this.findWhere({ usuario_id: userId } as Partial<Progresso>);
  }

  /**
   * Buscar progresso com informações do usuário (JOIN)
   */
  async findWithUser(): Promise<Array<Progresso & { usuario: { nome: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        usuarios!inner (
          nome
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar progresso com usuário: ${error.message}`);
    }

    return data as Array<Progresso & { usuario: { nome: string } }>;
  }

  /**
   * Buscar progresso de um usuário em uma data específica
   */
  async findByUserAndDate(userId: string, data: string): Promise<Progresso[]> {
    return this.findWhere({ usuario_id: userId, data } as Partial<Progresso>);
  }

  /**
   * Buscar progresso de um usuário em um período
   */
  async findByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<Progresso[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('usuario_id', userId)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar progresso por período: ${error.message}`);
    }

    return data as Progresso[];
  }

  /**
   * Buscar progresso dos últimos N dias de um usuário
   */
  async findLastDays(userId: string, days: number): Promise<Progresso[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    return this.findByUserAndDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  /**
   * Atualizar horas estudadas por usuário e data
   */
  async updateHorasByUserAndDate(userId: string, data: string, horasEstudadas: number): Promise<Progresso | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({ horas_estudadas: horasEstudadas })
      .eq('usuario_id', userId)
      .eq('data', data)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao atualizar horas estudadas: ${error.message}`);
    }

    return result as Progresso;
  }

  /**
   * Deletar progresso por usuário e data
   */
  async deleteByUserAndDate(userId: string, data: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('usuario_id', userId)
      .eq('data', data);

    if (error) {
      throw new Error(`Erro ao deletar progresso: ${error.message}`);
    }

    return true;
  }

  /**
   * Calcular total de horas estudadas por usuário
   */
  async getTotalHorasByUserId(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('horas_estudadas')
      .eq('usuario_id', userId);

    if (error) {
      throw new Error(`Erro ao calcular total de horas: ${error.message}`);
    }

    return data?.reduce((total, registro) => total + registro.horas_estudadas, 0) || 0;
  }

  /**
   * Calcular total de horas estudadas por usuário em um período
   */
  async getTotalHorasByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<number> {
    const progressos = await this.findByUserAndDateRange(userId, startDate, endDate);
    return progressos.reduce((total, p) => total + (p.horas_estudadas || 0), 0);
  }

  /**
   * Obter média de horas estudadas por dia de um usuário
   */
  async getAverageHourasByUserId(userId: string): Promise<number> {
    const progressos = await this.findByUserId(userId);
    if (progressos.length === 0) return 0;

    const totalHoras = progressos.reduce((total, p) => total + (p.horas_estudadas || 0), 0);
    return Math.round((totalHoras / progressos.length) * 100) / 100; // 2 casas decimais
  }

  /**
   * Buscar dias com mais horas estudadas de um usuário
   */
  async getTopStudyDays(userId: string, limit: number = 10): Promise<Progresso[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('usuario_id', userId)
      .order('horas_estudadas', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar dias com mais horas: ${error.message}`);
    }

    return data as Progresso[];
  }

  /**
   * Verificar se usuário estudou em uma data específica
   */
  async hasStudiedOnDate(userId: string, data: string): Promise<boolean> {
    return this.exists({ usuario_id: userId, data } as Partial<Progresso>);
  }

  /**
   * Contar dias de estudo de um usuário
   */
  async countStudyDays(userId: string): Promise<number> {
    return this.count({ usuario_id: userId } as Partial<Progresso>);
  }

  /**
   * Obter estatísticas de progresso de um usuário
   */
  async getUserProgressStats(userId: string): Promise<{
    totalHoras: number;
    totalDias: number;
    mediaHorasPorDia: number;
    melhorDia: { data: string; horas: number } | null;
    ultimosDias: number;
    horasUltimosDias: number;
  }> {
    const [progressos, ultimosProgressos, topDays] = await Promise.all([
      this.findByUserId(userId),
      this.findLastDays(userId, 7),
      this.getTopStudyDays(userId, 1)
    ]);

    const totalHoras = progressos.reduce((total, p) => total + (p.horas_estudadas || 0), 0);
    const totalDias = progressos.length;
    const mediaHorasPorDia = totalDias > 0 ? Math.round((totalHoras / totalDias) * 100) / 100 : 0;
    const horasUltimosDias = ultimosProgressos.reduce((total, p) => total + (p.horas_estudadas || 0), 0);
    
    const melhorDia = topDays.length > 0 ? {
      data: topDays[0].data || '',
      horas: topDays[0].horas_estudadas || 0
    } : null;

    return {
      totalHoras,
      totalDias,
      mediaHorasPorDia,
      melhorDia,
      ultimosDias: 7,
      horasUltimosDias
    };
  }

  /**
   * Buscar progresso de hoje para um usuário
   */
  async getTodayProgress(userId: string): Promise<Progresso | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.findOneWhere({ usuario_id: userId, data: today } as Partial<Progresso>);
  }

  /**
   * Criar ou atualizar progresso de hoje
   */
  async upsertTodayProgress(userId: string, horasEstudadas: number): Promise<Progresso> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getTodayProgress(userId);

    if (existing) {
      // Atualizar existente
      const updated = await this.updateById(existing.id, { horas_estudadas: horasEstudadas } as Partial<Progresso>);
      return updated!;
    } else {
      // Criar novo
      return this.create({
        usuario_id: userId,
        data: today,
        horas_estudadas: horasEstudadas
      } as NovoProgresso);
    }
  }
}
