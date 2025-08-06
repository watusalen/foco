import { CronogramaRepository } from '../../../src/repository/CronogramaRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Cronograma, NovoCronograma } from '../../../src/model/Cronograma';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('CronogramaRepository', () => {
  let cronogramaRepository: CronogramaRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let createdCronogramas: Cronograma[] = [];

  beforeAll(async () => {
    cronogramaRepository = new CronogramaRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Cronograma Teste',
      email: `cronograma.test.${Date.now()}@exemplo.com`
    });
  });

  afterAll(async () => {
    // Limpar cronogramas criados durante os testes
    for (const cronograma of createdCronogramas) {
      try {
        await cronogramaRepository.deleteById(cronograma.id);
      } catch (error) {
        console.warn(`Erro ao limpar cronograma ${cronograma.id}:`, error);
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
    test('create() - deve criar um cronograma com dados válidos', async () => {
      const novoCronograma: NovoCronograma = {
        usuario_id: testUser.id,
        titulo: 'Cronograma de Estudos 2024',
        descricao: 'Plano de estudos para desenvolvimento web'
      };

      const resultado = await cronogramaRepository.create(novoCronograma);
      createdCronogramas.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.titulo).toBe(novoCronograma.titulo);
      expect(resultado.descricao).toBe(novoCronograma.descricao);
      expect(resultado.criado_em).toBeDefined();
      expect(new Date(resultado.criado_em)).toBeInstanceOf(Date);
    });

    test('findById() - deve buscar cronograma por ID válido', async () => {
      // Criar cronograma para teste
      const cronogramaCriado = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Cronograma Find By ID',
        descricao: 'Teste de busca por ID'
      });
      createdCronogramas.push(cronogramaCriado);

      // Buscar por ID
      const resultado = await cronogramaRepository.findById(cronogramaCriado.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(cronogramaCriado.id);
      expect(resultado!.titulo).toBe('Cronograma Find By ID');
      expect(resultado!.usuario_id).toBe(testUser.id);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await cronogramaRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar cronogramas', async () => {
      // Criar alguns cronogramas para teste
      const cronograma1 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Cronograma FindAll 1',
        descricao: 'Primeiro cronograma'
      });
      const cronograma2 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Cronograma FindAll 2',
        descricao: 'Segundo cronograma'
      });
      createdCronogramas.push(cronograma1, cronograma2);

      const resultado = await cronogramaRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se os cronogramas criados estão na lista
      const ids = resultado.map(c => c.id);
      expect(ids).toContain(cronograma1.id);
      expect(ids).toContain(cronograma2.id);
    });

    test('updateById() - deve atualizar cronograma existente', async () => {
      // Criar cronograma para teste
      const cronogramaCriado = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Titulo Original',
        descricao: 'Descrição original'
      });
      createdCronogramas.push(cronogramaCriado);

      // Atualizar título e descrição
      const novoTitulo = 'Titulo Atualizado';
      const novaDescricao = 'Descrição atualizada';
      const resultado = await cronogramaRepository.updateById(cronogramaCriado.id, { 
        titulo: novoTitulo,
        descricao: novaDescricao
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(cronogramaCriado.id);
      expect(resultado!.titulo).toBe(novoTitulo);
      expect(resultado!.descricao).toBe(novaDescricao);
      expect(resultado!.usuario_id).toBe(testUser.id); // Não deve mudar
    });

    test('deleteById() - deve deletar cronograma existente', async () => {
      // Criar cronograma para teste
      const cronogramaCriado = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Para Deletar',
        descricao: 'Este cronograma será deletado'
      });

      // Deletar cronograma
      const deletado = await cronogramaRepository.deleteById(cronogramaCriado.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await cronogramaRepository.findById(cronogramaCriado.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByUserId() - deve buscar cronogramas de um usuário específico', async () => {
      // Contar cronogramas existentes antes
      const cronogramasAntes = await cronogramaRepository.findByUserId(testUser.id);
      const countAntes = cronogramasAntes.length;

      // Criar cronogramas para o usuário de teste
      const cronograma1 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Cronograma Usuario 1',
        descricao: 'Primeiro do usuário'
      });
      const cronograma2 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: 'Cronograma Usuario 2',
        descricao: 'Segundo do usuário'
      });
      createdCronogramas.push(cronograma1, cronograma2);

      const resultado = await cronogramaRepository.findByUserId(testUser.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(c => c.usuario_id === testUser.id)).toBe(true);
      
      // Verificar se os novos cronogramas estão presentes
      const ids = resultado.map(c => c.id);
      expect(ids).toContain(cronograma1.id);
      expect(ids).toContain(cronograma2.id);
    });

    test('findWhere() - deve buscar cronogramas com filtros', async () => {
      const tituloEspecifico = `Titulo Filtro ${Date.now()}`;
      
      // Criar cronogramas com título específico
      const cronograma1 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: tituloEspecifico,
        descricao: 'Primeiro com filtro'
      });
      const cronograma2 = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: tituloEspecifico,
        descricao: 'Segundo com filtro'
      });
      createdCronogramas.push(cronograma1, cronograma2);

      const resultado = await cronogramaRepository.findWhere({ titulo: tituloEspecifico });

      expect(resultado).toHaveLength(2);
      expect(resultado.every(c => c.titulo === tituloEspecifico)).toBe(true);
    });

    test('findOneWhere() - deve buscar um cronograma com filtro', async () => {
      const tituloUnico = `Titulo Unico ${Date.now()}`;
      
      const cronogramaCriado = await cronogramaRepository.create({
        usuario_id: testUser.id,
        titulo: tituloUnico,
        descricao: 'Cronograma único'
      });
      createdCronogramas.push(cronogramaCriado);

      const resultado = await cronogramaRepository.findOneWhere({ titulo: tituloUnico });

      expect(resultado).toBeDefined();
      expect(resultado!.titulo).toBe(tituloUnico);
      expect(resultado!.id).toBe(cronogramaCriado.id);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar cronograma com usuario_id inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(cronogramaRepository.create({
        usuario_id: idUsuarioInexistente,
        titulo: 'Cronograma Inválido',
        descricao: 'Com usuário inexistente'
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar cronograma inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await cronogramaRepository.updateById(idInexistente, { 
        titulo: 'Novo Titulo' 
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar cronograma inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await cronogramaRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByUserId() - deve retornar array vazio para usuário sem cronogramas', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await cronogramaRepository.findByUserId(idUsuarioInexistente);

      expect(resultado).toEqual([]);
    });
  });
});
