export type StatusAtividade = 'pendente' | 'em_andamento' | 'concluida';

export interface Atividade {
  id: string;
  cronograma_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  status: StatusAtividade;
}

export interface NovaAtividade {
  cronograma_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  status?: StatusAtividade;
}
