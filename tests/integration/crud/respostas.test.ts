/**
 * Testes CRUD específicos para tabela respostas
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela respostas', () => {
  const authService = new AuthService();
  let currentUserId: string;
  let quizId: string;
  let questaoId: string;
  const testIds = {
    respostas: [] as string[],
    questoes: [] as string[],
    quizzes: [] as string[]
  };

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD respostas...');
    const result = await authService.signIn(
      process.env.TEST_USER_EMAIL || 'exemplo@gmail.com',
      process.env.TEST_USER_PASSWORD || '123456'
    );
    
    if (!result?.user?.id) {
      throw new Error('Falha no login para testes');
    }
    
    currentUserId = result.user.id;
    console.log(`✅ Login realizado. User ID: ${currentUserId}`);

    // Criar quiz para as respostas
    const { data: quiz } = await supabase
      .from('quizzes')
      .insert({
        usuario_id: currentUserId,
        titulo: `Quiz para Respostas ${Date.now()}`
      })
      .select()
      .single();
    
    quizId = quiz!.id;
    testIds.quizzes.push(quizId);

    // Criar questão para as respostas
    const { data: questao } = await supabase
      .from('questoes')
      .insert({
        quiz_id: quizId,
        enunciado: 'Qual é a capital do Brasil?',
        alternativa_a: 'São Paulo',
        alternativa_b: 'Rio de Janeiro',
        alternativa_c: 'Brasília',
        alternativa_d: 'Salvador',
        correta: 'C' as const
      })
      .select()
      .single();
    
    questaoId = questao!.id;
    testIds.questoes.push(questaoId);
    
    console.log(`✅ Quiz criado: ID ${quizId}`);
    console.log(`✅ Questão criada: ID ${questaoId}`);
  }, 15000);

  afterAll(async () => {
    console.log('🧹 Limpando respostas de teste...');
    
    // Limpar na ordem correta devido às foreign keys
    if (testIds.respostas.length > 0) {
      await supabase.from('respostas').delete().in('id', testIds.respostas);
      console.log(`✅ ${testIds.respostas.length} resposta(s) removida(s)`);
    }
    
    if (testIds.questoes.length > 0) {
      await supabase.from('questoes').delete().in('id', testIds.questoes);
      console.log(`✅ ${testIds.questoes.length} questão(ões) removida(s)`);
    }
    
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
    it('deve verificar estrutura da tabela respostas', async () => {
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura respostas verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos respostas:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let respostaId: string;

    it('INSERT - deve criar nova resposta', async () => {
      const novaResposta = {
        usuario_id: currentUserId,
        questao_id: questaoId,
        resposta_dada: 'C' as const,
        correta: true
      };

      const { data, error } = await supabase
        .from('respostas')
        .insert(novaResposta)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.usuario_id).toBe(currentUserId);
      expect(data.questao_id).toBe(questaoId);
      expect(data.resposta_dada).toBe('C');
      
      respostaId = data.id;
      testIds.respostas.push(respostaId);
      
      console.log(`✅ Resposta criada: ID ${respostaId} - Escolhida: ${data.resposta_dada}`);
    });

    it('SELECT - deve buscar resposta criada', async () => {
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('id', respostaId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(respostaId);
      expect(data.usuario_id).toBe(currentUserId);
      expect(data.questao_id).toBe(questaoId);
      
      console.log(`✅ Resposta encontrada: Escolhida ${data.resposta_dada}`);
    });

    it('UPDATE - deve atualizar resposta escolhida', async () => {
      const novaEscolha = 'A' as const;
      
      const { data, error } = await supabase
        .from('respostas')
        .update({ 
          resposta_dada: novaEscolha,
          correta: false
        })
        .eq('id', respostaId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.resposta_dada).toBe(novaEscolha);
      
      console.log(`✅ Resposta atualizada para: ${data.resposta_dada}`);
    });

    it('SELECT com filtros - deve buscar respostas do usuário', async () => {
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('usuario_id', currentUserId)
        .order('respondido_em', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontradas ${data!.length} resposta(s) do usuário`);
    });

    it('DELETE - deve excluir resposta', async () => {
      const { error } = await supabase
        .from('respostas')
        .delete()
        .eq('id', respostaId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('respostas')
        .select('*')
        .eq('id', respostaId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.respostas.indexOf(respostaId);
      if (index > -1) {
        testIds.respostas.splice(index, 1);
      }
      
      console.log(`✅ Resposta deletada: ID ${respostaId}`);
    });
  });

  describe('Operações com Relacionamentos Complexos', () => {
    let questoesIds: string[] = [];

    beforeAll(async () => {
      // Criar múltiplas questões para testes mais complexos
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
        }
      ];

      const { data } = await supabase
        .from('questoes')
        .insert(questoes)
        .select();
      
      if (data) {
        questoesIds = data.map(q => q.id);
        testIds.questoes.push(...questoesIds);
      }
    });

    it('JOIN - deve buscar resposta com dados da questão e quiz', async () => {
      // Criar resposta para o teste
      const { data: resposta } = await supabase
        .from('respostas')
        .insert({
          usuario_id: currentUserId,
          questao_id: questoesIds[0],
          resposta_dada: 'B' as const,
          correta: true
        })
        .select()
        .single();
      
      testIds.respostas.push(resposta!.id);

      // Fazer o JOIN completo
      const { data, error } = await supabase
        .from('respostas')
        .select(`
          *,
          questoes (
            id,
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            correta,
            quizzes (
              id,
              titulo
            )
          )
        `)
        .eq('id', resposta!.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.questoes).toBeDefined();
      expect(data.questoes.quizzes).toBeDefined();
      expect(data.questoes.id).toBe(questoesIds[0]);
      expect(data.questoes.quizzes.id).toBe(quizId);
      
      console.log(`✅ JOIN completo realizado: Resposta → Questão → Quiz`);
    });

    it('BULK INSERT - deve registrar respostas para múltiplas questões', async () => {
      const respostas = [
        {
          usuario_id: currentUserId,
          questao_id: questoesIds[0], // 2+2=4, resposta correta B
          resposta_dada: 'B' as const,
          correta: true
        },
        {
          usuario_id: currentUserId,
          questao_id: questoesIds[1], // cor do céu, resposta correta C
          resposta_dada: 'C' as const,
          correta: true
        },
        {
          usuario_id: currentUserId,
          questao_id: questaoId, // capital do Brasil, resposta correta C
          resposta_dada: 'A' as const, // Resposta errada de propósito
          correta: false
        }
      ];

      const { data, error } = await supabase
        .from('respostas')
        .insert(respostas)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(3);
      
      // Adicionar IDs para cleanup
      data!.forEach(r => testIds.respostas.push(r.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} respostas registradas`);
    });

    it('Análise de desempenho - deve calcular acertos e erros', async () => {
      // Buscar todas as respostas do usuário com dados das questões
      const { data, error } = await supabase
        .from('respostas')
        .select(`
          *,
          questoes (
            correta
          )
        `)
        .eq('usuario_id', currentUserId)
        .in('questao_id', [...questoesIds, questaoId]);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      // Calcular acertos e erros
      let acertos = 0;
      let erros = 0;

      data!.forEach(resposta => {
        if (resposta.resposta_dada === resposta.questoes.correta) {
          acertos++;
        } else {
          erros++;
        }
      });

      const total = acertos + erros;
      const percentualAcerto = total > 0 ? (acertos / total * 100).toFixed(1) : '0';

      expect(total).toBeGreaterThan(0);
      
      console.log(`✅ Análise de desempenho: ${acertos}/${total} acertos (${percentualAcerto}%)`);
    });

    it('SELECT por questão específica - deve buscar todas as respostas de uma questão', async () => {
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('questao_id', questoesIds[0])
        .order('respondido_em', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Verificar se todas as respostas são da mesma questão
      data!.forEach(resposta => {
        expect(resposta.questao_id).toBe(questoesIds[0]);
      });
      
      console.log(`✅ Encontradas ${data!.length} resposta(s) para a questão específica`);
    });

    it('UPDATE condicional - deve alterar respostas incorretas', async () => {
      // Buscar uma resposta incorreta
      const { data: respostasIncorretas } = await supabase
        .from('respostas')
        .select(`
          id,
          resposta_dada,
          questoes (
            correta
          )
        `)
        .eq('usuario_id', currentUserId)
        .in('questao_id', [...questoesIds, questaoId]);

      if (respostasIncorretas) {
        const respostaIncorreta = respostasIncorretas.find(
          (r: any) => r.resposta_dada !== r.questoes.correta
        );

        if (respostaIncorreta) {
          const respostaCorreta = (respostaIncorreta as any).questoes.correta;
          
          const { data, error } = await supabase
            .from('respostas')
            .update({ resposta_dada: respostaCorreta })
            .eq('id', respostaIncorreta.id)
            .select()
            .single();

          expect(error).toBeNull();
          expect(data).toBeDefined();
          expect(data.resposta_dada).toBe(respostaCorreta);
          
          console.log(`✅ Resposta corrigida de ${respostaIncorreta.resposta_dada} para ${respostaCorreta}`);
        } else {
          console.log('ℹ️ Todas as respostas já estão corretas');
        }
      }
    });

    it('DELETE por quiz - deve remover todas as respostas de um quiz específico', async () => {
      // Buscar todas as questões do quiz
      const { data: questoesDoQuiz } = await supabase
        .from('questoes')
        .select('id')
        .eq('quiz_id', quizId);

      if (questoesDoQuiz && questoesDoQuiz.length > 0) {
        const idsQuestoes = questoesDoQuiz.map(q => q.id);
        
        // Contar respostas antes da exclusão
        const { count: antesCount } = await supabase
          .from('respostas')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', currentUserId)
          .in('questao_id', idsQuestoes);

        // Excluir respostas do quiz
        const { error } = await supabase
          .from('respostas')
          .delete()
          .eq('usuario_id', currentUserId)
          .in('questao_id', idsQuestoes);

        expect(error).toBeNull();

        // Contar respostas após a exclusão
        const { count: depoisCount } = await supabase
          .from('respostas')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', currentUserId)
          .in('questao_id', idsQuestoes);

        expect(depoisCount).toBe(0);
        
        // Limpar a lista de cleanup já que foram excluídas
        testIds.respostas = [];
        
        console.log(`✅ Exclusão em lote: ${antesCount || 0} respostas removidas do quiz`);
      }
    });
  });
});
