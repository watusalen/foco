/**
 * Testes CRUD específicos para tabela cronogramas
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela cronogramas', () => {
  const authService = new AuthService();
  let currentUserId: string;
  const testIds: string[] = [];

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD cronogramas...');
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
    console.log('🧹 Limpando cronogramas de teste...');
    
    if (testIds.length > 0) {
      await supabase.from('cronogramas').delete().in('id', testIds);
      console.log(`✅ ${testIds.length} cronograma(s) removido(s)`);
    }
    
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela cronogramas', async () => {
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura cronogramas verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos cronogramas:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let cronogramaId: string;

    it('INSERT - deve criar novo cronograma', async () => {
      const novoCronograma = {
        usuario_id: currentUserId,
        titulo: `Cronograma Teste ${Date.now()}`,
        descricao: 'Cronograma para testes automatizados'
      };

      const { data, error } = await supabase
        .from('cronogramas')
        .insert(novoCronograma)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoCronograma.titulo);
      expect(data.usuario_id).toBe(currentUserId);
      
      cronogramaId = data.id;
      testIds.push(cronogramaId);
      
      console.log(`✅ Cronograma criado: ID ${cronogramaId}`);
    });

    it('SELECT - deve buscar cronograma criado', async () => {
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('id', cronogramaId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(cronogramaId);
      expect(data.usuario_id).toBe(currentUserId);
      
      console.log(`✅ Cronograma encontrado: ${data.titulo}`);
    });

    it('UPDATE - deve atualizar cronograma', async () => {
      const novoTitulo = `Cronograma Atualizado ${Date.now()}`;
      const novaDescricao = 'Descrição atualizada via teste';
      
      const { data, error } = await supabase
        .from('cronogramas')
        .update({ 
          titulo: novoTitulo,
          descricao: novaDescricao
        })
        .eq('id', cronogramaId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoTitulo);
      expect(data.descricao).toBe(novaDescricao);
      
      console.log(`✅ Cronograma atualizado: ${data.titulo}`);
    });

    it('SELECT com filtros - deve buscar cronogramas do usuário', async () => {
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('usuario_id', currentUserId)
        .order('criado_em', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontrados ${data!.length} cronograma(s) do usuário`);
    });

    it('DELETE - deve excluir cronograma', async () => {
      const { error } = await supabase
        .from('cronogramas')
        .delete()
        .eq('id', cronogramaId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('id', cronogramaId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.indexOf(cronogramaId);
      if (index > -1) {
        testIds.splice(index, 1);
      }
      
      console.log(`✅ Cronograma deletado: ID ${cronogramaId}`);
    });
  });

  describe('Operações Avançadas', () => {
    it('BULK INSERT - deve criar múltiplos cronogramas', async () => {
      const cronogramas = [
        {
          usuario_id: currentUserId,
          titulo: `Cronograma Bulk 1 - ${Date.now()}`,
          descricao: 'Primeiro cronograma em lote'
        },
        {
          usuario_id: currentUserId,
          titulo: `Cronograma Bulk 2 - ${Date.now()}`,
          descricao: 'Segundo cronograma em lote'
        },
        {
          usuario_id: currentUserId,
          titulo: `Cronograma Bulk 3 - ${Date.now()}`,
          descricao: 'Terceiro cronograma em lote'
        }
      ];

      const { data, error } = await supabase
        .from('cronogramas')
        .insert(cronogramas)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(3);
      
      // Adicionar IDs para cleanup
      data!.forEach(c => testIds.push(c.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} cronogramas criados`);
    });
  });
});
