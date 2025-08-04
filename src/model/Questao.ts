export type AlternativaCorreta = 'A' | 'B' | 'C' | 'D';

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

export interface NovaQuestao {
  quiz_id: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  correta: AlternativaCorreta;
}
