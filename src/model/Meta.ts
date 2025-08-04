export interface Meta {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao?: string;
  valor_esperado?: number;
  data_limite?: string;
  atingida: boolean;
}

export interface NovaMeta {
  usuario_id: string;
  titulo: string;
  descricao?: string;
  valor_esperado?: number;
  data_limite?: string;
}
