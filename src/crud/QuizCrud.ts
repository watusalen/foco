import { BaseCrud } from './BaseCrud';
import { Quiz, NovoQuiz } from '../model/Quiz';
import { QuizRepository } from '../repository/QuizRepository';
import { supabase } from '../supabase';

/**
 * CRUD para operações com quizzes
 */
export class QuizCrud extends BaseCrud<Quiz, NovoQuiz> {
  private quizRepository: QuizRepository;

  constructor() {
    const quizRepository = new QuizRepository(supabase);
    super(quizRepository);
    this.quizRepository = quizRepository;
  }

  /**
   * Buscar quizzes de um usuário
   */
  async buscarPorUsuario(usuarioId: string): Promise<Quiz[]> {
    return await this.quizRepository.findByUserId(usuarioId);
  }

  /**
   * Buscar quiz por título
   */
  async buscarPorTitulo(titulo: string): Promise<Quiz | null> {
    return await this.quizRepository.findByTitle(titulo);
  }
}
