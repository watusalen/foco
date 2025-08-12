import { AlternativaCorreta } from './Questao';

/** Registro de resposta de um usuário a uma questão */
export interface Resposta {
  id: string;                   // ID único (UUID)
  questao_id: string;           // ID da questão respondida
  usuario_id: string;           // ID do usuário que respondeu
  resposta_dada: AlternativaCorreta; // Alternativa escolhida
  correta: boolean;             // Se a resposta estava correta
  respondido_em: string;        // Data/hora da resposta (ISO 8601)
}

/** Dados para criar uma nova resposta */
export interface NovaResposta {
  questao_id: string;           // ID da questão respondida
  usuario_id: string;           // ID do usuário que respondeu
  resposta_dada: AlternativaCorreta; // Alternativa escolhida
  correta: boolean;             // Se a resposta estava correta
}
