/**
 * Alternativa correta de uma questão.
 */
export type AlternativaCorreta = 'A' | 'B' | 'C' | 'D';

/**
 * Questão cadastrada em um quiz.
 */
export interface Questao {
  id: string;
  quiz_id: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  correta: AlternativaCorreta;
}

/**
 * Dados para criar uma nova questão.
 */
export interface NovaQuestao {
  quiz_id: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  correta: AlternativaCorreta;
}
