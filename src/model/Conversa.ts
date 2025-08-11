/**
 * Interface para representar uma conversa/interação sobre um texto
 */
export interface Conversa {
  id: string;
  texto_id: string;
  prompt: string;
  resposta: string;
  criado_em: string;
}

/**
 * Interface para criação de nova conversa
 */
export interface NovaConversa {
  texto_id: string;
  prompt: string;
  resposta: string;
}
