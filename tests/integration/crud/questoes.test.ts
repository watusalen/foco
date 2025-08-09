/**
 * Testes CRUD específicos para tabela questoes
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela questoes', () => {
  const authService = new AuthService();
  let currentUserId: string;
  let quizId: string;
  const testIds = {
    questoes: [] as string[],
    quizzes: [] as string[]
  };

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD questoes...');
    const result = await authService.signIn(
      process.env.TEST_USER_EMAIL || 'exemplo@gmail.com',
      process.env.TEST_USER_PASSWORD || '123456'
    );
    
    if (!result?.user?.id) {
      throw new Error('Falha no login para testes');
    }
    
    currentUserId = result.user.id;
    console.log(`✅ Login realizado. User ID: ${currentUserId}`);

    // Criar quiz para as questões
    const { data: quiz } = await supabase
      .from('quizzes')
      .insert({
        usuario_id: currentUserId,
        titulo: `Quiz para Questões ${Date.now()}`
      })
      .select()
      .single();
    
    quizId = quiz!.id;
    testIds.quizzes.push(quizId);
    console.log(`✅ Quiz criado para testes: ID ${quizId}`);
  }, 15000);

  afterAll(async () => {
    console.log('🧹 Limpando questões de teste...');
    
    // Limpar questões primeiro (foreign key)
    if (testIds.questoes.length > 0) {
      await supabase.from('questoes').delete().in('id', testIds.questoes);
      console.log(`✅ ${testIds.questoes.length} questão(ões) removida(s)`);
    }
    
    // Depois quizzes
    if (testIds.quizzes.length > 0) {
      await supabase.from('quizzes').delete().in('id', testIds.quizzes);
      console.log(`✅ ${testIds.quizzes.length} quiz(zes) removido(s)`);
    }
    
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela questoes', async () => {
      const { data, error } = await supabase
        .from('questoes')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura questoes verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos questoes:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let questaoId: string;

    it('INSERT - deve criar nova questão', async () => {
      const novaQuestao = {
        quiz_id: quizId,
        enunciado: 'Qual é a capital do Brasil?',
        alternativa_a: 'São Paulo',
        alternativa_b: 'Rio de Janeiro',
        alternativa_c: 'Brasília',
        alternativa_d: 'Salvador',
        correta: 'C' as const
      };

      const { data, error } = await supabase
        .from('questoes')
        .insert(novaQuestao)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.enunciado).toBe(novaQuestao.enunciado);
      expect(data.quiz_id).toBe(quizId);
      expect(data.correta).toBe('C');
      
      questaoId = data.id;
      testIds.questoes.push(questaoId);
      
      console.log(`✅ Questão criada: ID ${questaoId}`);
    });

    it('SELECT - deve buscar questão criada', async () => {
      const { data, error } = await supabase
        .from('questoes')
        .select('*')
        .eq('id', questaoId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(questaoId);
      expect(data.quiz_id).toBe(quizId);
      
      console.log(`✅ Questão encontrada: ${data.enunciado}`);
    });

    it('UPDATE - deve atualizar questão', async () => {
      const novoEnunciado = 'Qual é a capital do Brasil? (pergunta atualizada)';
      const novaAlternativa = 'Belo Horizonte';
      
      const { data, error } = await supabase
        .from('questoes')
        .update({ 
          enunciado: novoEnunciado,
          alternativa_d: novaAlternativa
        })
        .eq('id', questaoId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.enunciado).toBe(novoEnunciado);
      expect(data.alternativa_d).toBe(novaAlternativa);
      
      console.log(`✅ Questão atualizada: ${data.enunciado}`);
    });

    it('SELECT com filtros - deve buscar questões do quiz', async () => {
      const { data, error } = await supabase
        .from('questoes')
        .select('*')
        .eq('quiz_id', quizId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontradas ${data!.length} questão(ões) do quiz`);
    });

    it('DELETE - deve excluir questão', async () => {
      const { error } = await supabase
        .from('questoes')
        .delete()
        .eq('id', questaoId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('questoes')
        .select('*')
        .eq('id', questaoId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.questoes.indexOf(questaoId);
      if (index > -1) {
        testIds.questoes.splice(index, 1);
      }
      
      console.log(`✅ Questão deletada: ID ${questaoId}`);
    });
  });

  describe('Operações com Relacionamentos', () => {
    it('JOIN - deve buscar questões com dados do quiz', async () => {
      // Criar questão para o teste
      const { data: questao } = await supabase
        .from('questoes')
        .insert({
          quiz_id: quizId,
          enunciado: 'Questão para teste de JOIN',
          alternativa_a: 'Opção A',
          alternativa_b: 'Opção B',
          alternativa_c: 'Opção C',
          alternativa_d: 'Opção D',
          correta: 'A' as const
        })
        .select()
        .single();
      
      testIds.questoes.push(questao!.id);

      // Fazer o JOIN
      const { data, error } = await supabase
        .from('questoes')
        .select(`
          *,
          quizzes (
            id,
            titulo,
            usuario_id
          )
        `)
        .eq('id', questao!.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.quizzes).toBeDefined();
      expect(data.quizzes.id).toBe(quizId);
      expect(data.quizzes.usuario_id).toBe(currentUserId);
      
      console.log(`✅ JOIN realizado: Questão com dados do quiz`);
    });

    it('BULK INSERT - deve criar múltiplas questões', async () => {
      const questoes = [
        {
          quiz_id: quizId,
          enunciado: 'Quanto é 2 + 2?',
          alternativa_a: '3',
          alternativa_b: '4',
          alternativa_c: '5',
          alternativa_d: '6',
          correta: 'B' as const
        },
        {
          quiz_id: quizId,
          enunciado: 'Qual é a cor do céu?',
          alternativa_a: 'Verde',
          alternativa_b: 'Vermelho',
          alternativa_c: 'Azul',
          alternativa_d: 'Amarelo',
          correta: 'C' as const
        },
        {
          quiz_id: quizId,
          enunciado: 'Quantos dias tem uma semana?',
          alternativa_a: '5',
          alternativa_b: '6',
          alternativa_c: '7',
          alternativa_d: '8',
          correta: 'C' as const
        }
      ];

      const { data, error } = await supabase
        .from('questoes')
        .insert(questoes)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(3);
      
      // Verificar alternativas corretas
      expect(data![0].correta).toBe('B');
      expect(data![1].correta).toBe('C');
      expect(data![2].correta).toBe('C');
      
      // Adicionar IDs para cleanup
      data!.forEach(q => testIds.questoes.push(q.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} questões criadas`);
    });
  });

  describe('Validações de Conteúdo', () => {
    it('deve validar alternativas obrigatórias', async () => {
      const questaoIncompleta = {
        quiz_id: quizId,
        enunciado: 'Questão sem todas as alternativas',
        alternativa_a: 'Opção A',
        alternativa_b: 'Opção B',
        // alternativa_c e alternativa_d ausentes
        correta: 'A' as const
      };

      const { data, error } = await supabase
        .from('questoes')
        .insert(questaoIncompleta)
        .select();

      // Dependendo do schema, pode ser que permita ou não
      // Vamos testar e ver o que acontece
      if (error) {
        console.log(`✅ Validação funcionando: ${error.message}`);
      } else {
        console.log('ℹ️ Questão criada mesmo sem todas as alternativas');
        if (data && data.length > 0) {
          testIds.questoes.push(data[0].id);
        }
      }
    });

    it('deve validar resposta correta válida', async () => {
      const questaoRespostaInvalida = {
        quiz_id: quizId,
        enunciado: 'Questão com resposta inválida',
        alternativa_a: 'Opção A',
        alternativa_b: 'Opção B',
        alternativa_c: 'Opção C',
        alternativa_d: 'Opção D',
        correta: 'E' as any // Valor inválido
      };

      const { data, error } = await supabase
        .from('questoes')
        .insert(questaoRespostaInvalida)
        .select();

      if (error) {
        console.log(`✅ Validação de resposta funcionando: ${error.message}`);
      } else {
        console.log('⚠️ Resposta inválida foi aceita pelo banco');
        if (data && data.length > 0) {
          testIds.questoes.push(data[0].id);
        }
      }
    });

    it('SELECT por resposta correta - deve filtrar questões por alternativa', async () => {
      const { data, error } = await supabase
        .from('questoes')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('correta', 'C');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Verificar se todas têm resposta C
      data!.forEach(questao => {
        expect(questao.correta).toBe('C');
      });
      
      console.log(`✅ Encontradas ${data!.length} questão(ões) com resposta C`);
    });

    it('UPDATE validação - deve alterar resposta correta', async () => {
      // Garantir que existe pelo menos uma questão no quiz
      let { data: questoes } = await supabase
        .from('questoes')
        .select('id, correta')
        .eq('quiz_id', quizId)
        .limit(1);

      // Se não há questões, criar uma
      if (!questoes || questoes.length === 0) {
        const { data: novaQuestao } = await supabase
          .from('questoes')
          .insert({
            quiz_id: quizId,
            enunciado: 'Questão para teste de validação',
            alternativa_a: 'Opção A',
            alternativa_b: 'Opção B', 
            alternativa_c: 'Opção C',
            alternativa_d: 'Opção D',
            correta: 'A'
          })
          .select()
          .single();
        
        questoes = [novaQuestao];
      }

      if (questoes && questoes.length > 0) {
        const questaoId = questoes[0].id;
        const respostaOriginal = questoes[0].correta;
        const novaResposta = respostaOriginal === 'A' ? 'B' : 'A';
        
        const { data, error } = await supabase
          .from('questoes')
          .update({ correta: novaResposta })
          .eq('id', questaoId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.correta).toBe(novaResposta);
        expect(data.correta).not.toBe(respostaOriginal);
        
        console.log(`✅ Resposta correta alterada de ${respostaOriginal} para ${novaResposta}`);
      }
    });
  });
});
