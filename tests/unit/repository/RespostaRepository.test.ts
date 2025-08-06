import { RespostaRepository } from '../../../src/repository/RespostaRepository';
import { QuestaoRepository } from '../../../src/repository/QuestaoRepository';
import { QuizRepository } from '../../../src/repository/QuizRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Resposta, NovaResposta } from '../../../src/model/Resposta';
import { Questao } from '../../../src/model/Questao';
import { Quiz } from '../../../src/model/Quiz';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('RespostaRepository', () => {
  let respostaRepository: RespostaRepository;
  let questaoRepository: QuestaoRepository;
  let quizRepository: QuizRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let testQuiz: Quiz;
  let testQuestao: Questao;
  let createdRespostas: Resposta[] = [];

  beforeAll(async () => {
    respostaRepository = new RespostaRepository(supabase);
    questaoRepository = new QuestaoRepository(supabase);
    quizRepository = new QuizRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Resposta Teste',
      email: `resposta.test.${Date.now()}@exemplo.com`
    });

    // Criar quiz de teste
    testQuiz = await quizRepository.create({
      usuario_id: testUser.id,
      titulo: `Quiz Resposta Teste ${Date.now()}`
    });

    // Criar questão de teste
    testQuestao = await questaoRepository.create({
      quiz_id: testQuiz.id,
      enunciado: `Questão para testes de resposta ${Date.now()}`,
      alternativa_a: 'Resposta A',
      alternativa_b: 'Resposta B',
      alternativa_c: 'Resposta C',
      alternativa_d: 'Resposta D',
      correta: 'B'
    });
  });

  afterAll(async () => {
    // Limpar respostas criadas durante os testes
    for (const resposta of createdRespostas) {
      try {
        await respostaRepository.deleteById(resposta.id);
      } catch (error) {
        console.warn(`Erro ao limpar resposta ${resposta.id}:`, error);
      }
    }

    // Limpar dados de teste
    try {
      await questaoRepository.deleteById(testQuestao.id);
      await quizRepository.deleteById(testQuiz.id);
      await usuarioRepository.deleteById(testUser.id);
    } catch (error) {
      console.warn(`Erro ao limpar dados de teste:`, error);
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar uma resposta com dados válidos', async () => {
      const novaResposta: NovaResposta = {
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      };

      const resultado = await respostaRepository.create(novaResposta);
      createdRespostas.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.questao_id).toBe(testQuestao.id);
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.resposta_dada).toBe(novaResposta.resposta_dada);
      expect(resultado.correta).toBe(novaResposta.correta);
      expect(resultado.respondido_em).toBeDefined();
    });

    test('findById() - deve buscar resposta por ID válido', async () => {
      // Criar resposta para teste
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      createdRespostas.push(respostaCriada);

      // Buscar por ID
      const resultado = await respostaRepository.findById(respostaCriada.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(respostaCriada.id);
      expect(resultado!.resposta_dada).toBe('B');
      expect(resultado!.correta).toBe(true);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar respostas', async () => {
      // Criar algumas respostas para teste
      const resposta1 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      const resposta2 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'C',
        correta: false
      });
      createdRespostas.push(resposta1, resposta2);

      const resultado = await respostaRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se as respostas criadas estão na lista
      const ids = resultado.map(r => r.id);
      expect(ids).toContain(resposta1.id);
      expect(ids).toContain(resposta2.id);
    });

    test('updateById() - deve atualizar resposta existente', async () => {
      // Criar resposta para teste
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      createdRespostas.push(respostaCriada);

      // Atualizar resposta
      const resultado = await respostaRepository.updateById(respostaCriada.id, { 
        resposta_dada: 'B',
        correta: true
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(respostaCriada.id);
      expect(resultado!.resposta_dada).toBe('B');
      expect(resultado!.correta).toBe(true);
      expect(resultado!.questao_id).toBe(testQuestao.id); // Não deve mudar
    });

    test('deleteById() - deve deletar resposta existente', async () => {
      // Criar resposta para teste
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'D',
        correta: false
      });

      // Deletar resposta
      const deletado = await respostaRepository.deleteById(respostaCriada.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await respostaRepository.findById(respostaCriada.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByUserId() - deve buscar respostas de um usuário específico', async () => {
      // Contar respostas existentes antes
      const respostasAntes = await respostaRepository.findByUserId(testUser.id);
      const countAntes = respostasAntes.length;

      // Criar respostas para o usuário de teste
      const resposta1 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      const resposta2 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      createdRespostas.push(resposta1, resposta2);

      const resultado = await respostaRepository.findByUserId(testUser.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(r => r.usuario_id === testUser.id)).toBe(true);
      
      // Verificar se as novas respostas estão presentes
      const ids = resultado.map(r => r.id);
      expect(ids).toContain(resposta1.id);
      expect(ids).toContain(resposta2.id);
    });

    test('findByQuestaoId() - deve buscar respostas de uma questão específica', async () => {
      // Contar respostas existentes antes
      const respostasAntes = await respostaRepository.findByQuestaoId(testQuestao.id);
      const countAntes = respostasAntes.length;

      // Criar resposta para a questão de teste
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'C',
        correta: false
      });
      createdRespostas.push(respostaCriada);

      const resultado = await respostaRepository.findByQuestaoId(testQuestao.id);

      expect(resultado.length).toBe(countAntes + 1);
      expect(resultado.every(r => r.questao_id === testQuestao.id)).toBe(true);
      
      // Verificar se a nova resposta está presente
      const ids = resultado.map(r => r.id);
      expect(ids).toContain(respostaCriada.id);
    });

    test('findByUserAndQuestao() - deve buscar resposta específica por usuário e questão', async () => {
      // Criar resposta específica
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'D',
        correta: false
      });
      createdRespostas.push(respostaCriada);

      const resultado = await respostaRepository.findByUserAndQuestao(testUser.id, testQuestao.id);

      expect(resultado).toBeDefined();
      expect(resultado!.usuario_id).toBe(testUser.id);
      expect(resultado!.questao_id).toBe(testQuestao.id);
      // Verificar se é uma resposta válida (pode ser qualquer uma das respostas criadas)
      expect(['A', 'B', 'C', 'D']).toContain(resultado!.resposta_dada);
    });

    test('findByUserAndQuestao() - deve retornar null para combinação inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.findByUserAndQuestao(idUsuarioInexistente, testQuestao.id);

      expect(resultado).toBeNull();
    });

    test('findCorrectByUserId() - deve buscar apenas respostas corretas do usuário', async () => {
      // Criar respostas corretas e incorretas
      const respostaCorreta = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      const respostaIncorreta = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      createdRespostas.push(respostaCorreta, respostaIncorreta);

      const resultado = await respostaRepository.findCorrectByUserId(testUser.id);

      expect(resultado.every(r => r.correta === true)).toBe(true);
      expect(resultado.every(r => r.usuario_id === testUser.id)).toBe(true);
      
      const ids = resultado.map(r => r.id);
      expect(ids).toContain(respostaCorreta.id);
      expect(ids).not.toContain(respostaIncorreta.id);
    });

    test('findIncorrectByUserId() - deve buscar apenas respostas incorretas do usuário', async () => {
      // Criar respostas corretas e incorretas
      const respostaCorreta = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      const respostaIncorreta = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      createdRespostas.push(respostaCorreta, respostaIncorreta);

      const resultado = await respostaRepository.findIncorrectByUserId(testUser.id);

      expect(resultado.every(r => r.correta === false)).toBe(true);
      expect(resultado.every(r => r.usuario_id === testUser.id)).toBe(true);
      
      const ids = resultado.map(r => r.id);
      expect(ids).toContain(respostaIncorreta.id);
      expect(ids).not.toContain(respostaCorreta.id);
    });

    test('createWithValidation() - deve criar resposta com validação automática', async () => {
      // Testar resposta correta
      const respostaCorreta = await respostaRepository.createWithValidation(testUser.id, testQuestao.id, 'B');
      createdRespostas.push(respostaCorreta);

      expect(respostaCorreta.resposta_dada).toBe('B');
      expect(respostaCorreta.correta).toBe(true); // B é a resposta correta da testQuestao

      // Testar resposta incorreta
      const respostaIncorreta = await respostaRepository.createWithValidation(testUser.id, testQuestao.id, 'A');
      createdRespostas.push(respostaIncorreta);

      expect(respostaIncorreta.resposta_dada).toBe('A');
      expect(respostaIncorreta.correta).toBe(false); // A não é a resposta correta
    });

    test('countCorrectByUserId() - deve contar acertos do usuário', async () => {
      // Contar antes de criar novas
      const countAntes = await respostaRepository.countCorrectByUserId(testUser.id);

      // Criar respostas (algumas corretas, outras não)
      const resposta1 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      const resposta2 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      const resposta3 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      createdRespostas.push(resposta1, resposta2, resposta3);

      const countDepois = await respostaRepository.countCorrectByUserId(testUser.id);

      expect(countDepois).toBe(countAntes + 2); // Duas respostas corretas adicionadas
    });

    test('countIncorrectByUserId() - deve contar erros do usuário', async () => {
      // Contar antes de criar novas
      const countAntes = await respostaRepository.countIncorrectByUserId(testUser.id);

      // Criar respostas (algumas corretas, outras não)
      const resposta1 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      const resposta2 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      const resposta3 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'C',
        correta: false
      });
      createdRespostas.push(resposta1, resposta2, resposta3);

      const countDepois = await respostaRepository.countIncorrectByUserId(testUser.id);

      expect(countDepois).toBe(countAntes + 2); // Duas respostas incorretas adicionadas
    });

    test('getUserStats() - deve calcular estatísticas do usuário', async () => {
      // Criar respostas conhecidas para cálculo
      const resposta1 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      const resposta2 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      });
      const resposta3 = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'B',
        correta: true
      });
      createdRespostas.push(resposta1, resposta2, resposta3);

      const stats = await respostaRepository.getUserStats(testUser.id);

      expect(stats.totalRespostas).toBeGreaterThanOrEqual(3);
      expect(stats.acertos).toBeGreaterThanOrEqual(2);
      expect(stats.erros).toBeGreaterThanOrEqual(1);
      expect(stats.percentualAcerto).toBeGreaterThan(0);
      expect(stats.percentualAcerto).toBeLessThanOrEqual(100);
    });

    test('findWhere() - deve buscar respostas com filtros', async () => {
      // Criar resposta com características específicas
      const respostaCriada = await respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: testUser.id,
        resposta_dada: 'D',
        correta: false
      });
      createdRespostas.push(respostaCriada);

      const resultado = await respostaRepository.findWhere({ 
        resposta_dada: 'D',
        correta: false
      });

      expect(resultado.some(r => r.id === respostaCriada.id)).toBe(true);
      expect(resultado.every(r => r.resposta_dada === 'D')).toBe(true);
      expect(resultado.every(r => r.correta === false)).toBe(true);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar resposta com questao_id inexistente', async () => {
      const idQuestaoInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(respostaRepository.create({
        questao_id: idQuestaoInexistente,
        usuario_id: testUser.id,
        resposta_dada: 'A',
        correta: false
      })).rejects.toThrow();
    });

    test('create() - deve falhar ao tentar criar resposta com usuario_id inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(respostaRepository.create({
        questao_id: testQuestao.id,
        usuario_id: idUsuarioInexistente,
        resposta_dada: 'A',
        correta: false
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar resposta inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.updateById(idInexistente, { 
        resposta_dada: 'B'
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar resposta inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByUserId() - deve retornar array vazio para usuário sem respostas', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.findByUserId(idUsuarioInexistente);

      expect(resultado).toEqual([]);
    });

    test('findByQuestaoId() - deve retornar array vazio para questão sem respostas', async () => {
      const idQuestaoInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.findByQuestaoId(idQuestaoInexistente);

      expect(resultado).toEqual([]);
    });

    test('countCorrectByUserId() - deve retornar 0 para usuário sem acertos', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.countCorrectByUserId(idUsuarioInexistente);

      expect(resultado).toBe(0);
    });

    test('countIncorrectByUserId() - deve retornar 0 para usuário sem erros', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await respostaRepository.countIncorrectByUserId(idUsuarioInexistente);

      expect(resultado).toBe(0);
    });

    test('createWithValidation() - deve falhar com questao_id inexistente', async () => {
      const idQuestaoInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(respostaRepository.createWithValidation(
        testUser.id, 
        idQuestaoInexistente, 
        'A'
      )).rejects.toThrow();
    });
  });
});
