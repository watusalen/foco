import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { Texto, NovoTexto } from '../model/Texto';

/**
 * Repository para operações CRUD da tabela textos
 */
export class TextoRepository extends SupabaseBaseRepository<Texto, NovoTexto, Partial<Texto>> {
  
  constructor(supabase: SupabaseClient) {
    super(supabase, 'textos');
  }

  /**
   * Buscar textos de um usuário específico
   */
  async findByUserId(userId: string): Promise<Texto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar textos do usuário: ${error.message}`);
    }

    return data as Texto[];
  }

  /**
   * Buscar textos salvos de um usuário
   */
  async findSavedByUserId(userId: string): Promise<Texto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('usuario_id', userId)
      .eq('salvo', true)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar textos salvos: ${error.message}`);
    }

    return data as Texto[];
  }

  /**
   * Buscar textos por tipo
   */
  async findByUserIdAndType(userId: string, tipo: 'texto' | 'resumo'): Promise<Texto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('usuario_id', userId)
      .eq('tipo', tipo)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar textos por tipo: ${error.message}`);
    }

    return data as Texto[];
  }

  /**
   * Atualizar status de salvo
   */
  async toggleSaved(id: string): Promise<Texto | null> {
    // Primeiro busca o status atual
    const { data: current, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('salvo')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar status atual: ${fetchError.message}`);
    }

    // Inverte o status
    const novoStatus = !current.salvo;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ salvo: novoStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status de salvo: ${error.message}`);
    }

    return data as Texto;
  }

  /**
   * Buscar texto com suas conversas
   */
  async findByIdWithConversas(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        conversas (
          id,
          prompt,
          resposta,
          criado_em
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar texto com conversas: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar textos de um usuário com suas conversas
   */
  async findByUserIdWithConversas(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        conversas (
          id,
          prompt,
          resposta,
          criado_em
        )
      `)
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar textos com conversas: ${error.message}`);
    }

    return data || [];
  }
}
