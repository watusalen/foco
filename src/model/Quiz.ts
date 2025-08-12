/**
 * Quiz cadastrado no sistema.
 */
export interface Quiz {
  id: string;
  usuario_id: string;
  titulo: string;
  criado_em: string;
}

/**
 * Dados para criar um novo quiz.
 */
export interface NovoQuiz {
  usuario_id: string;
  titulo: string;
}
