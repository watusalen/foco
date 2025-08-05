/**
 * Testes CRUD específicos para tabela atividades
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela atividades', () => {
  const authService = new AuthService();
  let currentUserId: string;
  let cronogramaId: string;
  const testIds = {
    atividades: [] as string[],
    cronogramas: [] as string[]
  };

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD atividades...');
    const result = await authService.signIn(
      process.env.TEST_USER_EMAIL || 'exemplo@gmail.com',
      process.env.TEST_USER_PASSWORD || '123456'
    );
    
    if (!result?.user?.id) {
      throw new Error('Falha no login para testes');
    }
    
    currentUserId = result.user.id;
    console.log(`✅ Login realizado. User ID: ${currentUserId}`);

    // Criar cronograma para as atividades
    const { data: cronograma } = await supabase
      .from('cronogramas')
      .insert({
        usuario_id: currentUserId,
        titulo: `Cronograma para Atividades ${Date.now()}`,
        descricao: 'Cronograma para testar atividades'
      })
      .select()
      .single();
    
    cronogramaId = cronograma!.id;
    testIds.cronogramas.push(cronogramaId);
    console.log(`✅ Cronograma criado para testes: ID ${cronogramaId}`);
  }, 15000);

  afterAll(async () => {
    console.log('🧹 Limpando atividades de teste...');
    
    // Limpar atividades primeiro (foreign key)
    if (testIds.atividades.length > 0) {
      await supabase.from('atividades').delete().in('id', testIds.atividades);
      console.log(`✅ ${testIds.atividades.length} atividade(s) removida(s)`);
    }
    
    // Depois cronogramas
    if (testIds.cronogramas.length > 0) {
      await supabase.from('cronogramas').delete().in('id', testIds.cronogramas);
      console.log(`✅ ${testIds.cronogramas.length} cronograma(s) removido(s)`);
    }
    
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela atividades', async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura atividades verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos atividades:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    let atividadeId: string;

    it('INSERT - deve criar nova atividade', async () => {
      const novaAtividade = {
        cronograma_id: cronogramaId,
        titulo: `Atividade Teste ${Date.now()}`,
        descricao: 'Atividade para testes automatizados',
        data_inicio: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +7 dias
      };

      const { data, error } = await supabase
        .from('atividades')
        .insert(novaAtividade)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novaAtividade.titulo);
      expect(data.cronograma_id).toBe(cronogramaId);
      
      atividadeId = data.id;
      testIds.atividades.push(atividadeId);
      
      console.log(`✅ Atividade criada: ID ${atividadeId}`);
    });

    it('SELECT - deve buscar atividade criada', async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', atividadeId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(atividadeId);
      expect(data.cronograma_id).toBe(cronogramaId);
      
      console.log(`✅ Atividade encontrada: ${data.titulo}`);
    });

    it('UPDATE - deve atualizar atividade', async () => {
      const novoTitulo = `Atividade Atualizada ${Date.now()}`;
      const novaDescricao = 'Descrição atualizada via teste';
      
      const { data, error } = await supabase
        .from('atividades')
        .update({ 
          titulo: novoTitulo,
          descricao: novaDescricao
        })
        .eq('id', atividadeId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.titulo).toBe(novoTitulo);
      expect(data.descricao).toBe(novaDescricao);
      
      console.log(`✅ Atividade atualizada: ${data.titulo}`);
    });

    it('SELECT com filtros - deve buscar atividades do cronograma', async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('cronograma_id', cronogramaId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontradas ${data!.length} atividade(s) do cronograma`);
    });

    it('DELETE - deve excluir atividade', async () => {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', atividadeId);

      expect(error).toBeNull();

      // Verificar se foi realmente deletado
      const { data, error: selectError } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', atividadeId);

      expect(selectError).toBeNull();
      expect(data).toEqual([]);
      
      // Remover da lista de cleanup
      const index = testIds.atividades.indexOf(atividadeId);
      if (index > -1) {
        testIds.atividades.splice(index, 1);
      }
      
      console.log(`✅ Atividade deletada: ID ${atividadeId}`);
    });
  });

  describe('Operações com Relacionamentos', () => {
    it('JOIN - deve buscar atividades com dados do cronograma', async () => {
      // Criar atividade para o teste
      const { data: atividade } = await supabase
        .from('atividades')
        .insert({
          cronograma_id: cronogramaId,
          titulo: `Atividade JOIN ${Date.now()}`,
          descricao: 'Atividade para teste de JOIN',
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();
      
      testIds.atividades.push(atividade!.id);

      // Fazer o JOIN
      const { data, error } = await supabase
        .from('atividades')
        .select(`
          *,
          cronogramas (
            id,
            titulo,
            descricao
          )
        `)
        .eq('id', atividade!.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.cronogramas).toBeDefined();
      expect(data.cronogramas.id).toBe(cronogramaId);
      
      console.log(`✅ JOIN realizado: Atividade com dados do cronograma`);
    });

    it('BULK INSERT - deve criar múltiplas atividades', async () => {
      const atividades = [
        {
          cronograma_id: cronogramaId,
          titulo: `Atividade Bulk 1 - ${Date.now()}`,
          descricao: 'Primeira atividade em lote',
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          cronograma_id: cronogramaId,
          titulo: `Atividade Bulk 2 - ${Date.now()}`,
          descricao: 'Segunda atividade em lote',
          data_inicio: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      const { data, error } = await supabase
        .from('atividades')
        .insert(atividades)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(2);
      
      // Adicionar IDs para cleanup
      data!.forEach(a => testIds.atividades.push(a.id));
      
      console.log(`✅ Bulk insert realizado: ${data!.length} atividades criadas`);
    });
  });
});
