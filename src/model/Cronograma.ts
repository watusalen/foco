/** Cronograma existente no sistema */
export interface Cronograma {
  id: string;           // ID único (UUID)
  usuario_id: string;   // ID do usuário dono
  titulo: string;       // Nome do cronograma
  descricao?: string;   // Descrição opcional
  criado_em: string;    // Data/hora de criação (ISO 8601)
}

/** Dados para criar um novo cronograma */
export interface NovoCronograma {
  usuario_id: string;   // ID do usuário dono
  titulo: string;       // Nome do cronograma
  descricao?: string;   // Descrição opcional
}
