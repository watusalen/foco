import { AtividadeRepository } from '../../../src/repository/AtividadeRepository';
import { CronogramaRepository } from '../../../src/repository/CronogramaRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Atividade, NovaAtividade } from '../../../src/model/Atividade';
import { Usuario } from '../../../src/model/Usuario';
import { Cronograma } from '../../../src/model/Cronograma';
import { supabase } from '../../../src/supabase/client';

describe('AtividadeRepository', () => {
  let atividadeRepository: AtividadeRepository;
  let cronogramaRepository: CronogramaRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let testCronograma: Cronograma;
  let createdAtividades: Atividade[] = [];

  beforeAll(async () => {
    atividadeRepository = new AtividadeRepository(supabase);
    cronogramaRepository = new CronogramaRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Atividade Teste',
      email: `atividade.test.${Date.now()}@exemplo.com`
    });

    // Criar cronograma de teste
    testCronograma = await cronogramaRepository.create({
      usuario_id: testUser.id,
      titulo: 'Cronograma para Atividades',
      descricao: 'Cronograma de teste para atividades'
    });
  });

  afterAll(async () => {
    // Limpar atividades criadas durante os testes
    for (const atividade of createdAtividades) {
      try {
        await atividadeRepository.deleteById(atividade.id);
      } catch (error) {
        console.warn(`Erro ao limpar atividade ${atividade.id}:`, error);
      }
    }

    // Limpar cronograma e usuário de teste
    try {
      await cronogramaRepository.deleteById(testCronograma.id);
      await usuarioRepository.deleteById(testUser.id);
    } catch (error) {
      console.warn('Erro ao limpar dados de teste:', error);
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar uma atividade com dados válidos', async () => {
      const novaAtividade: NovaAtividade = {
        cronograma_id: testCronograma.id,
        titulo: 'Estudar TypeScript',
        descricao: 'Revisar conceitos básicos de TypeScript',
        data_inicio: '2024-08-01',
        data_fim: '2024-08-07',
        status: 'pendente'
      };

      const resultado = await atividadeRepository.create(novaAtividade);
      createdAtividades.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.cronograma_id).toBe(testCronograma.id);
      expect(resultado.titulo).toBe(novaAtividade.titulo);
      expect(resultado.descricao).toBe(novaAtividade.descricao);
      expect(resultado.data_inicio).toBe(novaAtividade.data_inicio);
      expect(resultado.data_fim).toBe(novaAtividade.data_fim);
      expect(resultado.status).toBe('pendente');
    });

    test('findById() - deve buscar atividade por ID válido', async () => {
      // Criar atividade para teste
      const atividadeCriada = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade Find By ID',
        descricao: 'Teste de busca por ID',
        data_inicio: '2024-08-05',
        status: 'pendente'
      });
      createdAtividades.push(atividadeCriada);

      // Buscar por ID
      const resultado = await atividadeRepository.findById(atividadeCriada.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(atividadeCriada.id);
      expect(resultado!.titulo).toBe('Atividade Find By ID');
      expect(resultado!.cronograma_id).toBe(testCronograma.id);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await atividadeRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar atividades', async () => {
      // Criar algumas atividades para teste
      const atividade1 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade FindAll 1',
        data_inicio: '2024-08-01',
        status: 'pendente'
      });
      const atividade2 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade FindAll 2',
        data_inicio: '2024-08-02',
        status: 'em_andamento'
      });
      createdAtividades.push(atividade1, atividade2);

      const resultado = await atividadeRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se as atividades criadas estão na lista
      const ids = resultado.map(a => a.id);
      expect(ids).toContain(atividade1.id);
      expect(ids).toContain(atividade2.id);
    });

    test('updateById() - deve atualizar atividade existente', async () => {
      // Criar atividade para teste
      const atividadeCriada = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Titulo Original',
        data_inicio: '2024-08-01',
        status: 'pendente'
      });
      createdAtividades.push(atividadeCriada);

      // Atualizar status e título
      const novoTitulo = 'Titulo Atualizado';
      const novoStatus = 'em_andamento';
      const resultado = await atividadeRepository.updateById(atividadeCriada.id, { 
        titulo: novoTitulo,
        status: novoStatus
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(atividadeCriada.id);
      expect(resultado!.titulo).toBe(novoTitulo);
      expect(resultado!.status).toBe(novoStatus);
      expect(resultado!.cronograma_id).toBe(testCronograma.id); // Não deve mudar
    });

    test('deleteById() - deve deletar atividade existente', async () => {
      // Criar atividade para teste
      const atividadeCriada = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Para Deletar',
        data_inicio: '2024-08-01',
        status: 'pendente'
      });

      // Deletar atividade
      const deletado = await atividadeRepository.deleteById(atividadeCriada.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await atividadeRepository.findById(atividadeCriada.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByCronogramaId() - deve buscar atividades de um cronograma específico', async () => {
      // Contar atividades existentes antes
      const atividadesAntes = await atividadeRepository.findByCronogramaId(testCronograma.id);
      const countAntes = atividadesAntes.length;

      // Criar atividades para o cronograma de teste
      const atividade1 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade Cronograma 1',
        data_inicio: '2024-08-01',
        status: 'pendente'
      });
      const atividade2 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade Cronograma 2',
        data_inicio: '2024-08-02',
        status: 'em_andamento'
      });
      createdAtividades.push(atividade1, atividade2);

      const resultado = await atividadeRepository.findByCronogramaId(testCronograma.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(a => a.cronograma_id === testCronograma.id)).toBe(true);
      
      // Verificar se as novas atividades estão presentes
      const ids = resultado.map(a => a.id);
      expect(ids).toContain(atividade1.id);
      expect(ids).toContain(atividade2.id);
    });

    test('findByStatus() - deve buscar atividades por status', async () => {
      // Criar atividades com status específico
      const atividade1 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade Concluída 1',
        data_inicio: '2024-08-01',
        status: 'concluida'
      });
      const atividade2 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: 'Atividade Concluída 2',
        data_inicio: '2024-08-02',
        status: 'concluida'
      });
      createdAtividades.push(atividade1, atividade2);

      const resultado = await atividadeRepository.findByStatus('concluida');

      expect(resultado.length).toBeGreaterThanOrEqual(2);
      expect(resultado.every(a => a.status === 'concluida')).toBe(true);
      
      // Verificar se as atividades criadas estão presentes
      const ids = resultado.map(a => a.id);
      expect(ids).toContain(atividade1.id);
      expect(ids).toContain(atividade2.id);
    });

    test('findWhere() - deve buscar atividades com filtros', async () => {
      const tituloEspecifico = `Titulo Filtro ${Date.now()}`;
      
      // Criar atividades com título específico
      const atividade1 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: tituloEspecifico,
        data_inicio: '2024-08-01',
        status: 'pendente'
      });
      const atividade2 = await atividadeRepository.create({
        cronograma_id: testCronograma.id,
        titulo: tituloEspecifico,
        data_inicio: '2024-08-02',
        status: 'pendente'
      });
      createdAtividades.push(atividade1, atividade2);

      const resultado = await atividadeRepository.findWhere({ titulo: tituloEspecifico });

      expect(resultado).toHaveLength(2);
      expect(resultado.every(a => a.titulo === tituloEspecifico)).toBe(true);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar atividade com cronograma_id inexistente', async () => {
      const idCronogramaInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(atividadeRepository.create({
        cronograma_id: idCronogramaInexistente,
        titulo: 'Atividade Inválida',
        data_inicio: '2024-08-01',
        status: 'pendente'
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar atividade inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await atividadeRepository.updateById(idInexistente, { 
        titulo: 'Novo Titulo' 
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar atividade inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await atividadeRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByCronogramaId() - deve retornar array vazio para cronograma sem atividades', async () => {
      const idCronogramaInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await atividadeRepository.findByCronogramaId(idCronogramaInexistente);

      expect(resultado).toEqual([]);
    });
  });
});
