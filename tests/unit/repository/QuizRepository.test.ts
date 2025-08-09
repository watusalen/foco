import { QuizRepository } from '../../../src/repository/QuizRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Quiz, NovoQuiz } from '../../../src/model/Quiz';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('QuizRepository', () => {
  let quizRepository: QuizRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let createdQuizzes: Quiz[] = [];

  beforeAll(async () => {
    quizRepository = new QuizRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Quiz Teste',
      email: `quiz.test.${Date.now()}@exemplo.com`
    });
  });

  afterAll(async () => {
    // Limpar quizzes criados durante os testes
    for (const quiz of createdQuizzes) {
      try {
        await quizRepository.deleteById(quiz.id);
      } catch (error) {
        console.warn(`Erro ao limpar quiz ${quiz.id}:`, error);
      }
    }

    // Limpar usuário de teste
    try {
      await usuarioRepository.deleteById(testUser.id);
    } catch (error) {
      console.warn(`Erro ao limpar usuário ${testUser.id}:`, error);
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar um quiz com dados válidos', async () => {
      const novoQuiz: NovoQuiz = {
        usuario_id: testUser.id,
        titulo: `Quiz Teste ${Date.now()}`
      };

      const resultado = await quizRepository.create(novoQuiz);
      createdQuizzes.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.titulo).toBe(novoQuiz.titulo);
      expect(resultado.criado_em).toBeDefined();
    });

    test('findById() - deve buscar quiz por ID válido', async () => {
      // Criar quiz para teste
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz FindById ${Date.now()}`
      });
      createdQuizzes.push(quizCriado);

      // Buscar por ID
      const resultado = await quizRepository.findById(quizCriado.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(quizCriado.id);
      expect(resultado!.titulo).toBe(quizCriado.titulo);
      expect(resultado!.usuario_id).toBe(testUser.id);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await quizRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar quizzes', async () => {
      // Criar alguns quizzes para teste
      const quiz1 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz FindAll 1 ${Date.now()}`
      });
      const quiz2 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz FindAll 2 ${Date.now()}`
      });
      createdQuizzes.push(quiz1, quiz2);

      const resultado = await quizRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se os quizzes criados estão na lista
      const ids = resultado.map(q => q.id);
      expect(ids).toContain(quiz1.id);
      expect(ids).toContain(quiz2.id);
    });

    test('updateById() - deve atualizar quiz existente', async () => {
      // Criar quiz para teste
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz Update Original ${Date.now()}`
      });
      createdQuizzes.push(quizCriado);

      // Atualizar título
      const novoTitulo = `Quiz Update Modificado ${Date.now()}`;
      const resultado = await quizRepository.updateById(quizCriado.id, { 
        titulo: novoTitulo
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(quizCriado.id);
      expect(resultado!.titulo).toBe(novoTitulo);
      expect(resultado!.usuario_id).toBe(testUser.id); // Não deve mudar
    });

    test('deleteById() - deve deletar quiz existente', async () => {
      // Criar quiz para teste
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz Delete ${Date.now()}`
      });

      // Deletar quiz
      const deletado = await quizRepository.deleteById(quizCriado.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await quizRepository.findById(quizCriado.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByUserId() - deve buscar quizzes de um usuário específico', async () => {
      // Contar quizzes existentes antes
      const quizzesAntes = await quizRepository.findByUserId(testUser.id);
      const countAntes = quizzesAntes.length;

      // Criar quizzes para o usuário de teste
      const quiz1 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz User 1 ${Date.now()}`
      });
      const quiz2 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz User 2 ${Date.now()}`
      });
      createdQuizzes.push(quiz1, quiz2);

      const resultado = await quizRepository.findByUserId(testUser.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(q => q.usuario_id === testUser.id)).toBe(true);
      
      // Verificar se os novos quizzes estão presentes
      const ids = resultado.map(q => q.id);
      expect(ids).toContain(quiz1.id);
      expect(ids).toContain(quiz2.id);
    });

    test('findByTitle() - deve buscar quiz por título', async () => {
      const tituloUnico = `Quiz Title Único ${Date.now()}`;
      
      // Criar quiz com título específico
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: tituloUnico
      });
      createdQuizzes.push(quizCriado);

      const resultado = await quizRepository.findByTitle(tituloUnico);

      expect(resultado).toBeDefined();
      expect(resultado!.titulo).toBe(tituloUnico);
      expect(resultado!.usuario_id).toBe(testUser.id);
      expect(resultado!.id).toBe(quizCriado.id);
    });

    test('findByTitle() - deve retornar null para título inexistente', async () => {
      const tituloInexistente = `Quiz Inexistente ${Date.now()}`;
      
      const resultado = await quizRepository.findByTitle(tituloInexistente);

      expect(resultado).toBeNull();
    });

    test('updateByTitle() - deve atualizar quiz por título', async () => {
      const tituloOriginal = `Quiz Update Title Original ${Date.now()}`;
      
      // Criar quiz para teste
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: tituloOriginal
      });
      createdQuizzes.push(quizCriado);

      // Atualizar por título
      const novoTitulo = `Quiz Update Title Modificado ${Date.now()}`;
      const resultado = await quizRepository.updateByTitle(tituloOriginal, { 
        titulo: novoTitulo
      });

      expect(resultado).toBeDefined();
      expect(resultado!.titulo).toBe(novoTitulo);
      expect(resultado!.id).toBe(quizCriado.id);
    });

    test('deleteByTitle() - deve deletar quiz por título', async () => {
      const tituloDelete = `Quiz Delete Title ${Date.now()}`;
      
      // Criar quiz para teste
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: tituloDelete
      });

      // Deletar por título
      const deletado = await quizRepository.deleteByTitle(tituloDelete);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await quizRepository.findByTitle(tituloDelete);
      expect(resultado).toBeNull();
    });

    test('countByUserId() - deve contar quizzes do usuário', async () => {
      // Contar antes de criar novos
      const countAntes = await quizRepository.countByUserId(testUser.id);

      // Criar alguns quizzes
      const quiz1 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz Count 1 ${Date.now()}`
      });
      const quiz2 = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: `Quiz Count 2 ${Date.now()}`
      });
      createdQuizzes.push(quiz1, quiz2);

      const countDepois = await quizRepository.countByUserId(testUser.id);

      expect(countDepois - countAntes).toBe(2);
    });

    test('findWhere() - deve buscar quizzes com filtros', async () => {
      const timestamp = Date.now();
      const tituloFiltro = `Quiz Filter ${timestamp}`;
      
      // Criar quiz com título específico para filtro
      const quizCriado = await quizRepository.create({
        usuario_id: testUser.id,
        titulo: tituloFiltro
      });
      createdQuizzes.push(quizCriado);

      const resultado = await quizRepository.findWhere({ titulo: tituloFiltro });

      expect(resultado.length).toBe(1);
      expect(resultado[0].titulo).toBe(tituloFiltro);
      expect(resultado[0].id).toBe(quizCriado.id);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar quiz com usuario_id inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(quizRepository.create({
        usuario_id: idUsuarioInexistente,
        titulo: `Quiz Erro ${Date.now()}`
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar quiz inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await quizRepository.updateById(idInexistente, { 
        titulo: 'Título Atualizado'
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar quiz inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await quizRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByUserId() - deve retornar array vazio para usuário sem quizzes', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await quizRepository.findByUserId(idUsuarioInexistente);

      expect(resultado).toEqual([]);
    });

    test('updateByTitle() - deve retornar null para título inexistente', async () => {
      const tituloInexistente = `Quiz Inexistente Update ${Date.now()}`;
      
      const resultado = await quizRepository.updateByTitle(tituloInexistente, { 
        titulo: 'Novo Título'
      });

      expect(resultado).toBeNull();
    });

    test('countByUserId() - deve retornar 0 para usuário sem quizzes', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await quizRepository.countByUserId(idUsuarioInexistente);

      expect(resultado).toBe(0);
    });
  });
});
