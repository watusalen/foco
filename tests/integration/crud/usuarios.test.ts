/**
 * Testes CRUD específicos para tabela usuarios
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela usuarios', () => {
  const authService = new AuthService();
  let currentUserId: string;

  beforeAll(async () => {
    console.log('🔐 Fazendo login para testes CRUD usuarios...');
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
    try {
      await authService.signOut();
    } catch (error) {
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  describe('Verificação de Schema', () => {
    it('deve verificar estrutura da tabela usuarios', async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Estrutura usuarios verificada');
      
      if (data && data.length > 0) {
        console.log('📋 Campos usuarios:', Object.keys(data[0]));
      }
    });
  });

  describe('Operações CRUD', () => {
    it('SELECT - deve buscar usuário atual', async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', currentUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(currentUserId);
      
      console.log(`✅ Usuário encontrado: ${data.email || 'N/A'}`);
    });

    it('UPDATE - deve atualizar nome do usuário', async () => {
      const nomeOriginal = (await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', currentUserId)
        .single()).data?.nome;

      const novoNome = `TestUser_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('usuarios')
        .update({ nome: novoNome })
        .eq('id', currentUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.nome).toBe(novoNome);
      
      console.log(`✅ Usuário atualizado: ${data.nome}`);

      // Restaurar nome original se existia
      if (nomeOriginal) {
        await supabase
          .from('usuarios')
          .update({ nome: nomeOriginal })
          .eq('id', currentUserId);
      }
    });

    it('SELECT com filtros - deve buscar usuários com filtros específicos', async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nome, criado_em')
        .not('email', 'is', null)
        .order('criado_em', { ascending: false })
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      console.log(`✅ Encontrados ${data!.length} usuário(s) com filtros`);
    });
  });
});
