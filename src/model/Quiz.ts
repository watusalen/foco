export interface Quiz {
  id: string;
  usuario_id: string;
  titulo: string;
  criado_em: string;
}

export interface NovoQuiz {
  usuario_id: string;
  titulo: string;
}
