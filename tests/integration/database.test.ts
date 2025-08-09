/**
 * Testes de integração para operações CRUD do banco de dados
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AuthService, supabase } from '../../src/supabase';

describe('Database Integration Tests', () => {
  let testUserId: string;
  const authService = new AuthService();

  beforeAll(async () => {
    // Setup: fazer login antes dos testes
    console.log('🔐 Fazendo login para testes de integração...');
    
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPassword) {
      throw new Error('Credenciais de teste não configuradas no .env.test');
    }

    await authService.signIn(testEmail, testPassword);
    const user = await authService.getCurrentUser();
    
    if (!user) {
      throw new Error('Falha ao obter usuário para testes');
    }
    
    testUserId = user.id;
    console.log(`✅ Login realizado para usuário: ${user.email}`);
  });

  afterAll(async () => {
    // Cleanup: fazer logout após os testes (com tratamento de erro)
    try {
      await authService.signOut();
      console.log('🔓 Logout realizado');
    } catch (error) {
      // Ignora erro se já não estiver logado
      console.log('ℹ️ Logout: usuário já não estava logado');
    }
  });

  beforeEach(async () => {
    // Limpar dados de teste antes de cada teste
    await supabase.from('respostas').delete().eq('usuario_id', testUserId);
    await supabase.from('questoes').delete().ilike('enunciado', '%teste%');
    await supabase.from('quizzes').delete().ilike('titulo', '%teste%');
    await supabase.from('atividades').delete().ilike('titulo', '%teste%');
    await supabase.from('cronogramas').delete().ilike('titulo', '%teste%');
    await supabase.from('metas').delete().ilike('titulo', '%teste%');
    await supabase.from('progresso').delete().eq('usuario_id', testUserId);
  });

  describe('Operações CRUD', () => {
    it('deve inserir e buscar progresso do usuário', async () => {
      // Inserir progresso
      const { data: progressoData, error: progressoError } = await supabase
        .from('progresso')
        .insert({
          usuario_id: testUserId,
          data: '2025-08-05',
          horas_estudadas: 2
        })
        .select()
        .single();

      expect(progressoError).toBeNull();
      expect(progressoData).toBeDefined();
      expect(progressoData.horas_estudadas).toBe(2);
      expect(progressoData.usuario_id).toBe(testUserId);
    });

    it('deve criar quiz completo com questões e respostas', async () => {
      // 1. Criar quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          usuario_id: testUserId,
          titulo: 'Quiz de Teste Integração'
        })
        .select()
        .single();

      expect(quizError).toBeNull();
      expect(quiz).toBeDefined();

      // 2. Criar questão
      const { data: questao, error: questaoError } = await supabase
        .from('questoes')
        .insert({
          quiz_id: quiz.id,
          enunciado: 'Questão de teste integração?',
          alternativa_a: 'Opção A',
          alternativa_b: 'Opção B',
          alternativa_c: 'Opção C',
          alternativa_d: 'Opção D',
          correta: 'A'
        })
        .select()
        .single();

      expect(questaoError).toBeNull();
      expect(questao).toBeDefined();

      // 3. Criar resposta
      const { data: resposta, error: respostaError } = await supabase
        .from('respostas')
        .insert({
          questao_id: questao.id,
          usuario_id: testUserId,
          resposta_dada: 'A',
          correta: true
        })
        .select()
        .single();

      expect(respostaError).toBeNull();
      expect(resposta).toBeDefined();
      expect(resposta.correta).toBe(true);

      // 4. Buscar quiz completo com relacionamentos
      const { data: quizCompleto } = await supabase
        .from('quizzes')
        .select(`
          *,
          questoes (
            *,
            respostas (*)
          )
        `)
        .eq('id', quiz.id)
        .single();

      expect(quizCompleto).toBeDefined();
      expect(quizCompleto.questoes).toHaveLength(1);
      expect(quizCompleto.questoes[0].respostas).toHaveLength(1);
    });
  });
});
