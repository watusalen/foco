import { QuestaoRepository } from '../../../src/repository/QuestaoRepository';
import { QuizRepository } from '../../../src/repository/QuizRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Questao, NovaQuestao } from '../../../src/model/Questao';
import { Quiz } from '../../../src/model/Quiz';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('QuestaoRepository', () => {
  let questaoRepository: QuestaoRepository;
  let quizRepository: QuizRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let testQuiz: Quiz;
  let createdQuestoes: Questao[] = [];

  beforeAll(async () => {
    questaoRepository = new QuestaoRepository(supabase);
    quizRepository = new QuizRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Questao Teste',
      email: `questao.test.${Date.now()}@exemplo.com`
    });

    // Criar quiz de teste
    testQuiz = await quizRepository.create({
      usuario_id: testUser.id,
      titulo: `Quiz Questao Teste ${Date.now()}`
    });
  });

  afterAll(async () => {
    // Limpar questões criadas durante os testes
    for (const questao of createdQuestoes) {
      try {
        await questaoRepository.deleteById(questao.id);
      } catch (error) {
        console.warn(`Erro ao limpar questão ${questao.id}:`, error);
      }
    }

    // Limpar quiz e usuário de teste
    try {
      await quizRepository.deleteById(testQuiz.id);
      await usuarioRepository.deleteById(testUser.id);
    } catch (error) {
      console.warn(`Erro ao limpar dados de teste:`, error);
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar uma questão com dados válidos', async () => {
      const novaQuestao: NovaQuestao = {
        quiz_id: testQuiz.id,
        enunciado: `Qual a resposta correta? ${Date.now()}`,
        alternativa_a: 'Opção A',
        alternativa_b: 'Opção B',
        alternativa_c: 'Opção C',
        alternativa_d: 'Opção D',
        correta: 'A'
      };

      const resultado = await questaoRepository.create(novaQuestao);
      createdQuestoes.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.quiz_id).toBe(testQuiz.id);
      expect(resultado.enunciado).toBe(novaQuestao.enunciado);
      expect(resultado.alternativa_a).toBe(novaQuestao.alternativa_a);
      expect(resultado.alternativa_b).toBe(novaQuestao.alternativa_b);
      expect(resultado.alternativa_c).toBe(novaQuestao.alternativa_c);
      expect(resultado.alternativa_d).toBe(novaQuestao.alternativa_d);
      expect(resultado.correta).toBe(novaQuestao.correta);
    });

    test('findById() - deve buscar questão por ID válido', async () => {
      // Criar questão para teste
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `FindById Test ${Date.now()}`,
        alternativa_a: 'A1',
        alternativa_b: 'B1',
        alternativa_c: 'C1',
        alternativa_d: 'D1',
        correta: 'B'
      });
      createdQuestoes.push(questaoCriada);

      // Buscar por ID
      const resultado = await questaoRepository.findById(questaoCriada.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(questaoCriada.id);
      expect(resultado!.enunciado).toBe(questaoCriada.enunciado);
      expect(resultado!.correta).toBe('B');
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await questaoRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar questões', async () => {
      // Criar algumas questões para teste
      const questao1 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `FindAll Test 1 ${Date.now()}`,
        alternativa_a: 'A1',
        alternativa_b: 'B1',
        alternativa_c: 'C1',
        alternativa_d: 'D1',
        correta: 'A'
      });
      const questao2 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `FindAll Test 2 ${Date.now()}`,
        alternativa_a: 'A2',
        alternativa_b: 'B2',
        alternativa_c: 'C2',
        alternativa_d: 'D2',
        correta: 'C'
      });
      createdQuestoes.push(questao1, questao2);

      const resultado = await questaoRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se as questões criadas estão na lista
      const ids = resultado.map(q => q.id);
      expect(ids).toContain(questao1.id);
      expect(ids).toContain(questao2.id);
    });

    test('updateById() - deve atualizar questão existente', async () => {
      // Criar questão para teste
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Update Original ${Date.now()}`,
        alternativa_a: 'Original A',
        alternativa_b: 'Original B',
        alternativa_c: 'Original C',
        alternativa_d: 'Original D',
        correta: 'A'
      });
      createdQuestoes.push(questaoCriada);

      // Atualizar enunciado e resposta correta
      const novoEnunciado = `Update Modificado ${Date.now()}`;
      const resultado = await questaoRepository.updateById(questaoCriada.id, { 
        enunciado: novoEnunciado,
        correta: 'D'
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(questaoCriada.id);
      expect(resultado!.enunciado).toBe(novoEnunciado);
      expect(resultado!.correta).toBe('D');
      expect(resultado!.quiz_id).toBe(testQuiz.id); // Não deve mudar
    });

    test('deleteById() - deve deletar questão existente', async () => {
      // Criar questão para teste
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Delete Test ${Date.now()}`,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'A'
      });

      // Deletar questão
      const deletado = await questaoRepository.deleteById(questaoCriada.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await questaoRepository.findById(questaoCriada.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByQuizId() - deve buscar questões de um quiz específico', async () => {
      // Contar questões existentes antes
      const questoesAntes = await questaoRepository.findByQuizId(testQuiz.id);
      const countAntes = questoesAntes.length;

      // Criar questões para o quiz de teste
      const questao1 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Quiz Test 1 ${Date.now()}`,
        alternativa_a: 'A1',
        alternativa_b: 'B1',
        alternativa_c: 'C1',
        alternativa_d: 'D1',
        correta: 'A'
      });
      const questao2 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Quiz Test 2 ${Date.now()}`,
        alternativa_a: 'A2',
        alternativa_b: 'B2',
        alternativa_c: 'C2',
        alternativa_d: 'D2',
        correta: 'B'
      });
      createdQuestoes.push(questao1, questao2);

      const resultado = await questaoRepository.findByQuizId(testQuiz.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(q => q.quiz_id === testQuiz.id)).toBe(true);
      
      // Verificar se as novas questões estão presentes
      const ids = resultado.map(q => q.id);
      expect(ids).toContain(questao1.id);
      expect(ids).toContain(questao2.id);
    });

    test('findByEnunciado() - deve buscar questão por enunciado', async () => {
      const enunciadoUnico = `Enunciado único ${Date.now()}`;
      
      // Criar questão com enunciado específico
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: enunciadoUnico,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'C'
      });
      createdQuestoes.push(questaoCriada);

      const resultado = await questaoRepository.findByEnunciado(enunciadoUnico);

      expect(resultado).toBeDefined();
      expect(resultado!.enunciado).toBe(enunciadoUnico);
      expect(resultado!.quiz_id).toBe(testQuiz.id);
      expect(resultado!.id).toBe(questaoCriada.id);
    });

    test('findByEnunciado() - deve retornar null para enunciado inexistente', async () => {
      const enunciadoInexistente = `Enunciado inexistente ${Date.now()}`;
      
      const resultado = await questaoRepository.findByEnunciado(enunciadoInexistente);

      expect(resultado).toBeNull();
    });

    test('findByRespostaCorreta() - deve buscar questões por resposta correta', async () => {
      const timestamp = Date.now();
      
      // Criar questões com diferentes respostas corretas
      const questaoA = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Resposta A ${timestamp}`,
        alternativa_a: 'Correta A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'A'
      });
      const questaoB = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Resposta B ${timestamp}`,
        alternativa_a: 'A',
        alternativa_b: 'Correta B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'B'
      });
      createdQuestoes.push(questaoA, questaoB);

      const resultadoA = await questaoRepository.findByRespostaCorreta('A');
      const resultadoB = await questaoRepository.findByRespostaCorreta('B');

      expect(resultadoA.some(q => q.id === questaoA.id)).toBe(true);
      expect(resultadoB.some(q => q.id === questaoB.id)).toBe(true);
      expect(resultadoA.every(q => q.correta === 'A')).toBe(true);
      expect(resultadoB.every(q => q.correta === 'B')).toBe(true);
    });

    test('updateByEnunciado() - deve atualizar questão por enunciado', async () => {
      const enunciadoOriginal = `Update Enunciado Original ${Date.now()}`;
      
      // Criar questão para teste
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: enunciadoOriginal,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'A'
      });
      createdQuestoes.push(questaoCriada);

      // Atualizar por enunciado
      const novaAlternativaA = 'Nova alternativa A';
      const resultado = await questaoRepository.updateByEnunciado(enunciadoOriginal, { 
        alternativa_a: novaAlternativaA,
        correta: 'B'
      });

      expect(resultado).toBeDefined();
      expect(resultado!.alternativa_a).toBe(novaAlternativaA);
      expect(resultado!.correta).toBe('B');
      expect(resultado!.id).toBe(questaoCriada.id);
    });

    test('deleteByEnunciado() - deve deletar questão por enunciado', async () => {
      const enunciadoDelete = `Delete Enunciado ${Date.now()}`;
      
      // Criar questão para teste
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: enunciadoDelete,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'D'
      });

      // Deletar por enunciado
      const deletado = await questaoRepository.deleteByEnunciado(enunciadoDelete);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await questaoRepository.findByEnunciado(enunciadoDelete);
      expect(resultado).toBeNull();
    });

    test('countByQuizId() - deve contar questões do quiz', async () => {
      // Contar antes de criar novas
      const countAntes = await questaoRepository.countByQuizId(testQuiz.id);

      // Criar algumas questões
      const questao1 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Count Test 1 ${Date.now()}`,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'A'
      });
      const questao2 = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: `Count Test 2 ${Date.now()}`,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'B'
      });
      createdQuestoes.push(questao1, questao2);

      const countDepois = await questaoRepository.countByQuizId(testQuiz.id);

      expect(countDepois).toBe(countAntes + 2);
    });

    test('findWhere() - deve buscar questões com filtros', async () => {
      const timestamp = Date.now();
      const enunciadoFiltro = `Filter Test ${timestamp}`;
      
      // Criar questão com enunciado específico para filtro
      const questaoCriada = await questaoRepository.create({
        quiz_id: testQuiz.id,
        enunciado: enunciadoFiltro,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'C'
      });
      createdQuestoes.push(questaoCriada);

      const resultado = await questaoRepository.findWhere({ enunciado: enunciadoFiltro });

      expect(resultado.length).toBe(1);
      expect(resultado[0].enunciado).toBe(enunciadoFiltro);
      expect(resultado[0].id).toBe(questaoCriada.id);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar questão com quiz_id inexistente', async () => {
      const idQuizInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(questaoRepository.create({
        quiz_id: idQuizInexistente,
        enunciado: `Erro Test ${Date.now()}`,
        alternativa_a: 'A',
        alternativa_b: 'B',
        alternativa_c: 'C',
        alternativa_d: 'D',
        correta: 'A'
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar questão inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await questaoRepository.updateById(idInexistente, { 
        enunciado: 'Enunciado Atualizado'
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar questão inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await questaoRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByQuizId() - deve retornar array vazio para quiz sem questões', async () => {
      const idQuizInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await questaoRepository.findByQuizId(idQuizInexistente);

      expect(resultado).toEqual([]);
    });

    test('updateByEnunciado() - deve retornar null para enunciado inexistente', async () => {
      const enunciadoInexistente = `Enunciado inexistente update ${Date.now()}`;
      
      const resultado = await questaoRepository.updateByEnunciado(enunciadoInexistente, { 
        correta: 'D'
      });

      expect(resultado).toBeNull();
    });

    test('countByQuizId() - deve retornar 0 para quiz sem questões', async () => {
      const idQuizInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await questaoRepository.countByQuizId(idQuizInexistente);

      expect(resultado).toBe(0);
    });
  });
});
