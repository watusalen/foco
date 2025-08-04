export interface Cronograma {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao?: string;
  criado_em: string;
}

export interface NovoCronograma {
  usuario_id: string;
  titulo: string;
  descricao?: string;
}
