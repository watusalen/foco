/**
 * Interface base para operações CRUD genéricas
 */
export interface BaseRepositoryInterface<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  /**
   * Criar um novo registro
   */
  create(data: CreateT): Promise<T>;

  /**
   * Buscar registro por ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Buscar todos os registros
   */
  findAll(): Promise<T[]>;

  /**
   * Buscar registros com filtros
   */
  findWhere(filters: Partial<T>): Promise<T[]>;

  /**
   * Buscar um registro com filtros
   */
  findOneWhere(filters: Partial<T>): Promise<T | null>;

  /**
   * Atualizar registro por ID
   */
  updateById(id: string, data: UpdateT): Promise<T | null>;

  /**
   * Atualizar registros com filtros
   */
  updateWhere(filters: Partial<T>, data: UpdateT): Promise<T[]>;

  /**
   * Deletar registro por ID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Deletar registros com filtros
   */
  deleteWhere(filters: Partial<T>): Promise<number>;

  /**
   * Contar registros
   */
  count(filters?: Partial<T>): Promise<number>;

  /**
   * Verificar se existe registro
   */
  exists(filters: Partial<T>): Promise<boolean>;
}
