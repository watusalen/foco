import { MetaRepository } from '../../../src/repository/MetaRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Meta, NovaMeta } from '../../../src/model/Meta';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('MetaRepository', () => {
  let metaRepository: MetaRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let createdMetas: Meta[] = [];

  beforeAll(async () => {
    metaRepository = new MetaRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Meta Teste',
      email: `meta.test.${Date.now()}@exemplo.com`
    });
  });

  afterAll(async () => {
    // Limpar metas criadas durante os testes
    for (const meta of createdMetas) {
      try {
        await metaRepository.deleteById(meta.id);
      } catch (error) {
        console.warn(`Erro ao limpar meta ${meta.id}:`, error);
      }
    }

    // Limpar usuário de teste
    try {
      await usuarioRepository.deleteById(testUser.id);
    } catch (error) {
      console.warn(`Erro ao limpar usuário ${testUser.id}:`, error);
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar uma meta com dados válidos', async () => {
      const novaMeta: NovaMeta = {
        usuario_id: testUser.id,
        titulo: 'Estudar 40 horas por mês',
        descricao: 'Meta de estudo mensal para desenvolvimento web',
        valor_esperado: 40,
        data_limite: '2024-08-31'
      };

      const resultado = await metaRepository.create(novaMeta);
      createdMetas.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.titulo).toBe(novaMeta.titulo);
      expect(resultado.descricao).toBe(novaMeta.descricao);
      expect(resultado.valor_esperado).toBe(novaMeta.valor_esperado);
      expect(resultado.data_limite).toBe(novaMeta.data_limite);
      expect(resultado.atingida).toBe(false); // Default value
    });

    test('create() - deve criar meta apenas com campos obrigatórios', async () => {
      const novaMeta: NovaMeta = {
        usuario_id: testUser.id,
        titulo: 'Meta Simples'
      };

      const resultado = await metaRepository.create(novaMeta);
      createdMetas.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.titulo).toBe(novaMeta.titulo);
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.atingida).toBe(false);
    });

    test('findById() - deve buscar meta por ID válido', async () => {
      // Criar meta para teste
      const metaCriada = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Find By ID',
        descricao: 'Teste de busca por ID',
        valor_esperado: 25
      });
      createdMetas.push(metaCriada);

      // Buscar por ID
      const resultado = await metaRepository.findById(metaCriada.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(metaCriada.id);
      expect(resultado!.titulo).toBe('Meta Find By ID');
      expect(resultado!.usuario_id).toBe(testUser.id);
      expect(resultado!.valor_esperado).toBe(25);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await metaRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar metas', async () => {
      // Criar algumas metas para teste
      const meta1 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta FindAll 1',
        valor_esperado: 10
      });
      const meta2 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta FindAll 2',
        valor_esperado: 20
      });
      createdMetas.push(meta1, meta2);

      const resultado = await metaRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se as metas criadas estão na lista
      const ids = resultado.map(m => m.id);
      expect(ids).toContain(meta1.id);
      expect(ids).toContain(meta2.id);
    });

    test('updateById() - deve atualizar meta existente', async () => {
      // Criar meta para teste
      const metaCriada = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Titulo Original',
        valor_esperado: 15
      });
      createdMetas.push(metaCriada);

      // Atualizar título e marcar como atingida
      const novoTitulo = 'Titulo Atualizado';
      const resultado = await metaRepository.updateById(metaCriada.id, { 
        titulo: novoTitulo,
        atingida: true
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(metaCriada.id);
      expect(resultado!.titulo).toBe(novoTitulo);
      expect(resultado!.atingida).toBe(true);
      expect(resultado!.valor_esperado).toBe(15); // Não deve mudar
      expect(resultado!.usuario_id).toBe(testUser.id); // Não deve mudar
    });

    test('deleteById() - deve deletar meta existente', async () => {
      // Criar meta para teste
      const metaCriada = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Para Deletar',
        valor_esperado: 5
      });

      // Deletar meta
      const deletado = await metaRepository.deleteById(metaCriada.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await metaRepository.findById(metaCriada.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByUserId() - deve buscar metas de um usuário específico', async () => {
      // Contar metas existentes antes
      const metasAntes = await metaRepository.findByUserId(testUser.id);
      const countAntes = metasAntes.length;

      // Criar metas para o usuário de teste
      const meta1 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Usuario 1',
        valor_esperado: 30
      });
      const meta2 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Usuario 2',
        valor_esperado: 35
      });
      createdMetas.push(meta1, meta2);

      const resultado = await metaRepository.findByUserId(testUser.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(m => m.usuario_id === testUser.id)).toBe(true);
      
      // Verificar se as novas metas estão presentes
      const ids = resultado.map(m => m.id);
      expect(ids).toContain(meta1.id);
      expect(ids).toContain(meta2.id);
    });

    test('findAchieved() - deve buscar metas atingidas', async () => {
      // Criar metas e depois marcar como atingidas
      const meta1 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Atingida 1',
        valor_esperado: 10
      });
      const meta2 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Atingida 2',
        valor_esperado: 20
      });
      
      // Marcar como atingidas
      await metaRepository.updateById(meta1.id, { atingida: true });
      await metaRepository.updateById(meta2.id, { atingida: true });
      
      createdMetas.push(meta1, meta2);

      const resultado = await metaRepository.findAchieved();

      expect(resultado.length).toBeGreaterThanOrEqual(2);
      expect(resultado.every(m => m.atingida === true)).toBe(true);
      
      // Verificar se as metas criadas estão presentes
      const ids = resultado.map(m => m.id);
      expect(ids).toContain(meta1.id);
      expect(ids).toContain(meta2.id);
    });

    test('findNotAchieved() - deve buscar metas não atingidas', async () => {
      // Criar metas não atingidas
      const meta1 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Não Atingida 1',
        valor_esperado: 50
      });
      const meta2 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Não Atingida 2',
        valor_esperado: 60
      });
      createdMetas.push(meta1, meta2);

      const resultado = await metaRepository.findNotAchieved();

      expect(resultado.length).toBeGreaterThanOrEqual(2);
      expect(resultado.every(m => m.atingida === false)).toBe(true);
      
      // Verificar se as metas criadas estão presentes
      const ids = resultado.map(m => m.id);
      expect(ids).toContain(meta1.id);
      expect(ids).toContain(meta2.id);
    });

    test('findWhere() - deve buscar metas com filtros', async () => {
      const valorEspecifico = 77;
      
      // Criar metas com valor específico
      const meta1 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Filtro 1',
        valor_esperado: valorEspecifico
      });
      const meta2 = await metaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Meta Filtro 2',
        valor_esperado: valorEspecifico
      });
      createdMetas.push(meta1, meta2);

      const resultado = await metaRepository.findWhere({ valor_esperado: valorEspecifico });

      expect(resultado).toHaveLength(2);
      expect(resultado.every(m => m.valor_esperado === valorEspecifico)).toBe(true);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar meta com usuario_id inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(metaRepository.create({
        usuario_id: idUsuarioInexistente,
        titulo: 'Meta Inválida',
        valor_esperado: 10
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar meta inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await metaRepository.updateById(idInexistente, { 
        titulo: 'Novo Titulo' 
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar meta inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await metaRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByUserId() - deve retornar array vazio para usuário sem metas', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await metaRepository.findByUserId(idUsuarioInexistente);

      expect(resultado).toEqual([]);
    });
  });
});
