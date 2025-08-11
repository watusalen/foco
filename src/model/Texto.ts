/**
 * Interface para representar um texto gerado pela IA
 */
export interface Texto {
  id: string;
  usuario_id: string;
  titulo: string;
  conteudo: string;
  tipo: 'texto' | 'resumo';
  prompt_original: string;
  salvo: boolean;
  criado_em: string;
  atualizado_em?: string;
}

/**
 * Interface para criação de novo texto
 */
export interface NovoTexto {
  usuario_id: string;
  titulo: string;
  conteudo: string;
  tipo: 'texto' | 'resumo';
  prompt_original: string;
  salvo?: boolean;
}
