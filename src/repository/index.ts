/**
 * Pasta repository: responsável por implementar o acesso e manipulação dos dados no banco.
 */

// Interfaces e classes base
export { BaseRepositoryInterface } from './BaseRepository';
export { SupabaseBaseRepository } from './SupabaseBaseRepository';

// Repositories específicos
export { UsuarioRepository } from './UsuarioRepository';
export { CronogramaRepository } from './CronogramaRepository';
export { AtividadeRepository } from './AtividadeRepository';
export { MetaRepository } from './MetaRepository';
export { ProgressoRepository } from './ProgressoRepository';
export { QuizRepository } from './QuizRepository';
export { QuestaoRepository } from './QuestaoRepository';
export { RespostaRepository } from './RespostaRepository';
