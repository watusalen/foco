import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Usuario, NovoUsuario } from '../model/Usuario';

/**
 * Repository para operações CRUD da tabela usuarios
 */
export class UsuarioRepository extends SupabaseBaseRepository<Usuario, NovoUsuario, Partial<Usuario>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'usuarios');
  }

  /**
   * Buscar usuário por email (único)
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.findOneWhere({ email } as Partial<Usuario>);
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email } as Partial<Usuario>);
  }

  /**
   * Buscar usuários criados em um período
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Usuario[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários por período: ${error.message}`);
    }

    return data as Usuario[];
  }

  /**
   * Buscar usuários com seus cronogramas (JOIN)
   */
  async findWithCronogramas(): Promise<Array<Usuario & { cronogramas: any[] }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        cronogramas (
          id,
          titulo,
          descricao,
          criado_em
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar usuários com cronogramas: ${error.message}`);
    }

    return data as Array<Usuario & { cronogramas: any[] }>;
  }

  /**
   * Buscar usuário com todos os relacionamentos
   */
  async findByIdWithRelations(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        cronogramas (
          id,
          titulo,
          descricao,
          criado_em,
          atividades (
            id,
            titulo,
            status,
            data_inicio,
            data_fim
          )
        ),
        metas (
          id,
          titulo,
          valor_esperado,
          data_limite,
          atingida
        ),
        progresso (
          id,
          data,
          horas_estudadas
        ),
        quizzes (
          id,
          titulo,
          criado_em
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário com relacionamentos: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar estatísticas do usuário
   */
  async getUserStats(userId: string): Promise<{
    totalCronogramas: number;
    totalMetas: number;
    metasAtingidas: number;
    totalHorasEstudadas: number;
    totalQuizzes: number;
  }> {
    const [cronogramas, metas, metasAtingidas, progresso, quizzes] = await Promise.all([
      this.supabase.from('cronogramas').select('*', { count: 'exact', head: true }).eq('usuario_id', userId),
      this.supabase.from('metas').select('*', { count: 'exact', head: true }).eq('usuario_id', userId),
      this.supabase.from('metas').select('*', { count: 'exact', head: true }).eq('usuario_id', userId).eq('atingida', true),
      this.supabase.from('progresso').select('horas_estudadas').eq('usuario_id', userId),
      this.supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('usuario_id', userId)
    ]);

    const totalHoras = progresso.data?.reduce((sum, p) => sum + p.horas_estudadas, 0) || 0;

    return {
      totalCronogramas: cronogramas.count || 0,
      totalMetas: metas.count || 0,
      metasAtingidas: metasAtingidas.count || 0,
      totalHorasEstudadas: totalHoras,
      totalQuizzes: quizzes.count || 0
    };
  }

  /**
   * Atualizar usuário por email
   */
  async updateByEmail(email: string, data: Partial<Usuario>): Promise<Usuario | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao atualizar usuário por email: ${error.message}`);
    }

    return result as Usuario;
  }

  /**
   * Deletar usuário por email
   */
  async deleteByEmail(email: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('email', email);

    if (error) {
      throw new Error(`Erro ao deletar usuário por email: ${error.message}`);
    }

    return true;
  }

  /**
   * Buscar usuários com paginação
   */
  async findWithPagination(page: number = 1, limit: number = 10): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [{ data, error }, { count }] = await Promise.all([
      this.supabase
        .from(this.tableName)
        .select('*')
        .order('criado_em', { ascending: false })
        .range(offset, offset + limit - 1),
      this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
    ]);

    if (error) {
      throw new Error(`Erro ao buscar usuários com paginação: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Usuario[],
      total,
      page,
      limit,
      totalPages
    };
  }
}
