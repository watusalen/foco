import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepositoryInterface } from './BaseRepository';

/**
 * Classe base abstrata para implementação de repositories com Supabase
 */
export abstract class SupabaseBaseRepository<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  implements BaseRepositoryInterface<T, CreateT, UpdateT> {
  
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  /**
   * Criar um novo registro
   */
  async create(data: CreateT): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar registro em ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Buscar registro por ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Erro ao buscar registro em ${this.tableName}: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Buscar todos os registros
   */
  async findAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Erro ao buscar registros em ${this.tableName}: ${error.message}`);
    }

    return data as T[];
  }

  /**
   * Buscar registros com filtros
   */
  async findWhere(filters: Partial<T>): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*');

    // Aplicar filtros dinamicamente
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar registros em ${this.tableName}: ${error.message}`);
    }

    return data as T[];
  }

  /**
   * Buscar um registro com filtros
   */
  async findOneWhere(filters: Partial<T>): Promise<T | null> {
    const results = await this.findWhere(filters);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Atualizar registro por ID
   */
  async updateById(id: string, data: UpdateT): Promise<T | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Erro ao atualizar registro em ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Atualizar registros com filtros
   */
  async updateWhere(filters: Partial<T>, data: UpdateT): Promise<T[]> {
    let query = this.supabase.from(this.tableName).update(data);

    // Aplicar filtros dinamicamente
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Erro ao atualizar registros em ${this.tableName}: ${error.message}`);
    }

    return result as T[];
  }

  /**
   * Deletar registro por ID
   */
  async deleteById(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar registro em ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  /**
   * Deletar registros com filtros
   */
  async deleteWhere(filters: Partial<T>): Promise<number> {
    let query = this.supabase.from(this.tableName).delete();

    // Aplicar filtros dinamicamente
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.select();

    if (error) {
      throw new Error(`Erro ao deletar registros em ${this.tableName}: ${error.message}`);
    }

    return data ? data.length : 0;
  }

  /**
   * Contar registros
   */
  async count(filters?: Partial<T>): Promise<number> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erro ao contar registros em ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Verificar se existe registro
   */
  async exists(filters: Partial<T>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }
}
