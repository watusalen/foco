/**
 * Testes CRUD específicos para tabela metas
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela metas', () => {
  const authService = new AuthService();
  let currentUserId: string;
  const testIds: string[] = [];

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD metas...');
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
    console.log('🧹 Limpando metas de teste...');
    
    if (testIds.length > 0) {
      await supabase.from('metas').delete().in('id', testIds);
      console.log(`✅ ${testIds.length} meta(s) removida(s)`);
    }
    
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela metas', async () => {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura metas verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos metas:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let metaId: string;

    it('INSERT - deve criar nova meta', async () => {
      const novaMeta = {
        usuario_id: currentUserId,
        titulo: `Meta Teste ${Date.now()}`,
        descricao: 'Meta para testes automatizados',
        data_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 dias
        atingida: false
      };

      const { data, error } = await supabase
        .from('metas')
        .insert(novaMeta)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novaMeta.titulo);
      expect(data.usuario_id).toBe(currentUserId);
      expect(data.atingida).toBe(false);
      
      metaId = data.id;
      testIds.push(metaId);
      
      console.log(`✅ Meta criada: ID ${metaId}`);
    });

    it('SELECT - deve buscar meta criada', async () => {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('id', metaId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(metaId);
      expect(data.usuario_id).toBe(currentUserId);
      
      console.log(`✅ Meta encontrada: ${data.titulo}`);
    });

    it('UPDATE - deve atualizar meta', async () => {
      const novoTitulo = `Meta Atualizada ${Date.now()}`;
      const novaDescricao = 'Descrição atualizada via teste';
      
      const { data, error } = await supabase
        .from('metas')
        .update({ 
          titulo: novoTitulo,
          descricao: novaDescricao
        })
        .eq('id', metaId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoTitulo);
      expect(data.descricao).toBe(novaDescricao);
      
      console.log(`✅ Meta atualizada: ${data.titulo}`);
    });

    it('UPDATE - deve marcar meta como concluída', async () => {
      const { data, error } = await supabase
        .from('metas')
        .update({ atingida: true })
        .eq('id', metaId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.atingida).toBe(true);
      
      console.log(`✅ Meta marcada como concluída: ${data.titulo}`);
    });

    it('SELECT com filtros - deve buscar metas do usuário', async () => {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('usuario_id', currentUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontradas ${data!.length} meta(s) do usuário`);
    });

    it('SELECT com filtros - deve buscar apenas metas pendentes', async () => {
      // Criar uma meta pendente
      const { data: metaPendente } = await supabase
        .from('metas')
        .insert({
          usuario_id: currentUserId,
          titulo: `Meta Pendente ${Date.now()}`,
          descricao: 'Meta pendente para teste',
          data_limite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          atingida: false
        })
        .select()
        .single();
      
      testIds.push(metaPendente!.id);

      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('usuario_id', currentUserId)
        .eq('atingida', false)
        .order('data_limite', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      // Verificar se todas são não concluídas
      data!.forEach(meta => {
        expect(meta.atingida).toBe(false);
      });
      
      console.log(`✅ Encontradas ${data!.length} meta(s) pendente(s)`);
    });

    it('DELETE - deve excluir meta', async () => {
      const { error } = await supabase
        .from('metas')
        .delete()
        .eq('id', metaId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('metas')
        .select('*')
        .eq('id', metaId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.indexOf(metaId);
      if (index > -1) {
        testIds.splice(index, 1);
      }
      
      console.log(`✅ Meta deletada: ID ${metaId}`);
    });
  });

  describe('Operações Avançadas', () => {
    it('BULK INSERT - deve criar múltiplas metas', async () => {
      const metas = [
        {
          usuario_id: currentUserId,
          titulo: `Meta Bulk 1 - ${Date.now()}`,
          descricao: 'Primeira meta em lote',
          data_limite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          atingida: false
        },
        {
          usuario_id: currentUserId,
          titulo: `Meta Bulk 2 - ${Date.now()}`,
          descricao: 'Segunda meta em lote',
          data_limite: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          atingida: false
        },
        {
          usuario_id: currentUserId,
          titulo: `Meta Bulk 3 - ${Date.now()}`,
          descricao: 'Terceira meta em lote - já concluída',
          data_limite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          atingida: true
        }
      ];

      const { data, error } = await supabase
        .from('metas')
        .insert(metas)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(3);
      
      // Verificar que uma está concluída e duas pendentes
      const atingidas = data!.filter(m => m.atingida === true);
      const pendentes = data!.filter(m => m.atingida === false);
      
      expect(atingidas.length).toBe(1);
      expect(pendentes.length).toBe(2);
      
      // Adicionar IDs para cleanup
      data!.forEach(m => testIds.push(m.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} metas criadas (${pendentes.length} pendentes, ${atingidas.length} concluída)`);
    });

    it('UPDATE BULK - deve atualizar múltiplas metas', async () => {
      // Buscar metas pendentes criadas no teste anterior
      const { data: metasPendentes } = await supabase
        .from('metas')
        .select('id')
        .eq('usuario_id', currentUserId)
        .eq('atingida', false)
        .in('id', testIds);

      if (metasPendentes && metasPendentes.length > 0) {
        const ids = metasPendentes.map(m => m.id);
        
        const { data, error } = await supabase
          .from('metas')
          .update({ atingida: true })
          .in('id', ids)
          .select();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.length).toBe(ids.length);
        
        // Verificar se todas foram marcadas como concluídas
        data!.forEach(meta => {
          expect(meta.atingida).toBe(true);
        });
        
        console.log(`✅ Update em lote realizado: ${data!.length} metas marcadas como concluídas`);
      }
    });
  });
});
