import { SupabaseBaseRepository } from '../repository/SupabaseBaseRepository';

/**
 * Classe base para operações CRUD simples
 */
export abstract class BaseCrud<T, TCreate> {
  constructor(protected repository: SupabaseBaseRepository<T>) {}

  /**
   * Criar novo registro
   */
  async criar(dados: TCreate): Promise<T> {
    return await this.repository.create(dados as Partial<T>);
  }

  /**
   * Buscar por ID
   */
  async buscarPorId(id: string): Promise<T | null> {
    return await this.repository.findById(id);
  }

  /**
   * Listar todos
   */
  async listarTodos(): Promise<T[]> {
    return await this.repository.findAll();
  }

  /**
   * Atualizar por ID
   */
  async atualizar(id: string, dados: Partial<T>): Promise<T | null> {
    return await this.repository.updateById(id, dados);
  }

  /**
   * Excluir por ID
   */
  async excluir(id: string): Promise<void> {
    await this.repository.deleteById(id);
  }

  /**
   * Buscar com filtros
   */
  async buscarComFiltros(filtros: Partial<T>): Promise<T[]> {
    return await this.repository.findWhere(filtros);
  }
}
