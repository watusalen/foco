/**
 * Testes CRUD específicos para tabela quizzes
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela quizzes', () => {
  const authService = new AuthService();
  let currentUserId: string;
  const testIds: string[] = [];

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD quizzes...');
    const result = await authService.signIn(
      process.env.TEST_USER_EMAIL || 'exemplo@gmail.com',
      process.env.TEST_USER_PASSWORD || '123456'
    );
    
    if (!result?.user?.id) {
      throw new Error('Falha no login para testes');
    }
    
    currentUserId = result.user.id;
    console.log(`✅ Login realizado. User ID: ${currentUserId}`);
  }, 15000);

  afterAll(async () => {
    console.log('🧹 Limpando quizzes de teste...');
    
    if (testIds.length > 0) {
      await supabase.from('quizzes').delete().in('id', testIds);
      console.log(`✅ ${testIds.length} quiz(zes) removido(s)`);
    }
    
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela quizzes', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura quizzes verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos quizzes:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let quizId: string;

    it('INSERT - deve criar novo quiz', async () => {
      const novoQuiz = {
        usuario_id: currentUserId,
        titulo: `Quiz Teste CRUD ${Date.now()}`
      };

      const { data, error } = await supabase
        .from('quizzes')
        .insert(novoQuiz)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoQuiz.titulo);
      expect(data.usuario_id).toBe(currentUserId);
      
      quizId = data.id;
      testIds.push(quizId);
      
      console.log(`✅ Quiz criado: ID ${quizId}`);
    });

    it('SELECT - deve buscar quiz criado', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(quizId);
      expect(data.usuario_id).toBe(currentUserId);
      
      console.log(`✅ Quiz encontrado: ${data.titulo}`);
    });

    it('UPDATE - deve atualizar quiz', async () => {
      const novoTitulo = `Quiz Atualizado ${Date.now()}`;
      
      const { data, error } = await supabase
        .from('quizzes')
        .update({ titulo: novoTitulo })
        .eq('id', quizId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoTitulo);
      
      console.log(`✅ Quiz atualizado: ${data.titulo}`);
    });

    it('SELECT com filtros - deve buscar quizzes do usuário', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('usuario_id', currentUserId)
        .order('criado_em', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontrados ${data!.length} quiz(zes) do usuário`);
    });

    it('DELETE - deve excluir quiz', async () => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.indexOf(quizId);
      if (index > -1) {
        testIds.splice(index, 1);
      }
      
      console.log(`✅ Quiz deletado: ID ${quizId}`);
    });
  });

  describe('Operações Avançadas', () => {
    it('BULK INSERT - deve criar múltiplos quizzes', async () => {
      const quizzes = [
        {
          usuario_id: currentUserId,
          titulo: `Quiz Matemática ${Date.now()}`
        },
        {
          usuario_id: currentUserId,
          titulo: `Quiz História ${Date.now()}`
        },
        {
          usuario_id: currentUserId,
          titulo: `Quiz Ciências ${Date.now()}`
        }
      ];

      const { data, error } = await supabase
        .from('quizzes')
        .insert(quizzes)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(3);
      
      // Adicionar IDs para cleanup
      data!.forEach(q => testIds.push(q.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} quizzes criados`);
    });

    it('SELECT com paginação - deve buscar quizzes com limite', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('usuario_id', currentUserId)
        .order('criado_em', { ascending: false })
        .limit(2);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeLessThanOrEqual(2);
      
      console.log(`✅ Paginação testada: ${data!.length} quiz(zes) retornado(s)`);
    });

    it('UPDATE BULK - deve atualizar títulos de múltiplos quizzes', async () => {
      // Buscar alguns quizzes de teste
      const { data: quizzesParaAtualizar } = await supabase
        .from('quizzes')
        .select('id')
        .eq('usuario_id', currentUserId)
        .in('id', testIds)
        .limit(2);

      if (quizzesParaAtualizar && quizzesParaAtualizar.length > 0) {
        const novoSufixo = ` [ATUALIZADO ${Date.now()}]`;
        
        for (const quiz of quizzesParaAtualizar) {
          // Buscar título atual
          const { data: quizAtual } = await supabase
            .from('quizzes')
            .select('titulo')
            .eq('id', quiz.id)
            .single();
          
          if (quizAtual) {
            await supabase
              .from('quizzes')
              .update({ titulo: quizAtual.titulo + novoSufixo })
              .eq('id', quiz.id);
          }
        }

        // Verificar atualizações
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .in('id', quizzesParaAtualizar.map(q => q.id));

        expect(error).toBeNull();
        expect(data).toBeDefined();
        
        // Verificar se todos os títulos contêm o sufixo
        data!.forEach(quiz => {
          expect(quiz.titulo).toContain('[ATUALIZADO');
        });
        
        console.log(`✅ Update em lote realizado: ${data!.length} quizzes atualizados`);
      }
    });

    it('SELECT com contagem - deve contar total de quizzes do usuário', async () => {
      const { count, error } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', currentUserId);

      expect(error).toBeNull();
      expect(count).toBeDefined();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
      
      console.log(`✅ Total de quizzes do usuário: ${count}`);
    });
  });
});
