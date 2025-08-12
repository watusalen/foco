/**
 * Status possível para uma atividade.
 */
export type StatusAtividade = 'pendente' | 'em_andamento' | 'concluida';

/**
 * Atividade registrada no cronograma.
 */
export interface Atividade {
  id: string;
  cronograma_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  status: StatusAtividade;
}

/**
 * Dados necessários para criar uma nova atividade.
 */
export interface NovaAtividade {
  cronograma_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  status: StatusAtividade;
}
