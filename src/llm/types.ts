/**
 * Tipos usados pelo agente inteligente LLM.
 */

/** Meta principal informada pelo usuário. */
export interface MetaUsuario {
  objetivo: string;
  tempoDisponivel: string; // ex: "2 horas por dia"
  prazo?: string; // ex: "30 dias"
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
}

/** Quiz gerado pelo agente. */
export interface QuizGerado {
  titulo: string;
  tema: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  questoes: QuestaoGerada[];
}

/** Questão de um quiz. */
export interface QuestaoGerada {
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  correta: 'A' | 'B' | 'C' | 'D';
}

/** Cronograma gerado pelo agente. */
export interface CronogramaGerado {
  titulo: string;
  objetivo: string;
  duracaoTotal: string;
  atividades: AtividadeGerada[];
}

/** Atividade dentro de um cronograma. */
export interface AtividadeGerada {
  titulo: string;
  descricao: string;
  ordem: number;
  estimativaHoras: number;
  prioridade: 'baixa' | 'media' | 'alta';
}

/** Meta específica gerada pelo agente. */
export interface MetaGerada {
  titulo: string;
  descricao: string;
  valorEsperado: number;
  unidadeMedida: string;
  prazoFinal: string;
}

/** Resposta completa do agente, com metas, cronograma e quizzes. */
export interface PlanoCompleto {
  meta: MetaGerada;
  cronograma: CronogramaGerado;
  quizzes: QuizGerado[];
}
