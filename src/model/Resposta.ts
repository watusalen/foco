import { AlternativaCorreta } from './Questao';

export interface Resposta {
  id: string;
  questao_id: string;
  usuario_id: string;
  resposta_dada: AlternativaCorreta;
  correta: boolean;
  respondido_em: string;
}

export interface NovaResposta {
  questao_id: string;
  usuario_id: string;
  resposta_dada: AlternativaCorreta;
  correta: boolean;
}
