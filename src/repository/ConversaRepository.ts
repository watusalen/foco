import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Conversa, NovaConversa } from '../model/Conversa';

/**
 * Repository para operações CRUD da tabela conversas
 */
export class ConversaRepository extends SupabaseBaseRepository<Conversa, NovaConversa, Partial<Conversa>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'conversas');
  }

  /**
   * Buscar conversas de um texto específico
   */
  async findByTextoId(textoId: string): Promise<Conversa[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('texto_id', textoId)
      .order('criado_em', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar conversas do texto: ${error.message}`);
    }

    return data as Conversa[];
  }

  /**
   * Buscar conversas com informações do texto (JOIN)
   */
  async findWithTexto(): Promise<Array<Conversa & { texto: { titulo: string } }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        textos!inner (
          titulo
        )
      `);

    if (error) {
      throw new Error(`Erro ao buscar conversas com texto: ${error.message}`);
    }

    return data as Array<Conversa & { texto: { titulo: string } }>;
  }

  /**
   * Contar conversas de um texto
   */
  async countByTextoId(textoId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('texto_id', textoId);

    if (error) {
      throw new Error(`Erro ao contar conversas: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Buscar última conversa de um texto
   */
  async findLatestByTextoId(textoId: string): Promise<Conversa | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('texto_id', textoId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar última conversa: ${error.message}`);
    }

    return data as Conversa;
  }
}
