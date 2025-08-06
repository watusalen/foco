import { ProgressoRepository } from '../../../src/repository/ProgressoRepository';
import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Progresso, NovoProgresso } from '../../../src/model/Progresso';
import { Usuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('ProgressoRepository', () => {
  let progressoRepository: ProgressoRepository;
  let usuarioRepository: UsuarioRepository;
  let testUser: Usuario;
  let createdProgressos: Progresso[] = [];

  beforeAll(async () => {
    progressoRepository = new ProgressoRepository(supabase);
    usuarioRepository = new UsuarioRepository(supabase);

    // Criar usuário de teste
    testUser = await usuarioRepository.create({
      nome: 'Usuario Progresso Teste',
      email: `progresso.test.${Date.now()}@exemplo.com`
    });
  });

  afterAll(async () => {
    // Limpar progressos criados durante os testes
    for (const progresso of createdProgressos) {
      try {
        await progressoRepository.deleteById(progresso.id);
      } catch (error) {
        console.warn(`Erro ao limpar progresso ${progresso.id}:`, error);
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
    test('create() - deve criar um progresso com dados válidos', async () => {
      const novoProgresso: NovoProgresso = {
        usuario_id: testUser.id,
        data: '2024-08-05',
        horas_estudadas: 4
      };

      const resultado = await progressoRepository.create(novoProgresso);
      createdProgressos.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.usuario_id).toBe(testUser.id);
      expect(resultado.data).toBe(novoProgresso.data);
      expect(resultado.horas_estudadas).toBe(novoProgresso.horas_estudadas);
    });

    test('findById() - deve buscar progresso por ID válido', async () => {
      // Criar progresso para teste
      const progressoCriado = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-06',
        horas_estudadas: 2
      });
      createdProgressos.push(progressoCriado);

      // Buscar por ID
      const resultado = await progressoRepository.findById(progressoCriado.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(progressoCriado.id);
      expect(resultado!.data).toBe('2024-08-06');
      expect(resultado!.horas_estudadas).toBe(2);
      expect(resultado!.usuario_id).toBe(testUser.id);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await progressoRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar progressos', async () => {
      // Criar alguns progressos para teste
      const progresso1 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-07',
        horas_estudadas: 2
      });
      const progresso2 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-08',
        horas_estudadas: 4
      });
      createdProgressos.push(progresso1, progresso2);

      const resultado = await progressoRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se os progressos criados estão na lista
      const ids = resultado.map(p => p.id);
      expect(ids).toContain(progresso1.id);
      expect(ids).toContain(progresso2.id);
    });

    test('updateById() - deve atualizar progresso existente', async () => {
      // Criar progresso para teste
      const progressoCriado = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-09',
        horas_estudadas: 3
      });
      createdProgressos.push(progressoCriado);

      // Atualizar horas estudadas
      const novasHoras = 5;
      const resultado = await progressoRepository.updateById(progressoCriado.id, { 
        horas_estudadas: novasHoras
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(progressoCriado.id);
      expect(resultado!.horas_estudadas).toBe(novasHoras);
      expect(resultado!.data).toBe('2024-08-09'); // Não deve mudar
      expect(resultado!.usuario_id).toBe(testUser.id); // Não deve mudar
    });

    test('deleteById() - deve deletar progresso existente', async () => {
      // Criar progresso para teste
      const progressoCriado = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-10',
        horas_estudadas: 1
      });

      // Deletar progresso
      const deletado = await progressoRepository.deleteById(progressoCriado.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await progressoRepository.findById(progressoCriado.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByUserId() - deve buscar progressos de um usuário específico', async () => {
      // Contar progressos existentes antes
      const progressosAntes = await progressoRepository.findByUserId(testUser.id);
      const countAntes = progressosAntes.length;

      // Criar progressos para o usuário de teste
      const progresso1 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-11',
        horas_estudadas: 2
      });
      const progresso2 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-12',
        horas_estudadas: 3
      });
      createdProgressos.push(progresso1, progresso2);

      const resultado = await progressoRepository.findByUserId(testUser.id);

      expect(resultado.length).toBe(countAntes + 2);
      expect(resultado.every(p => p.usuario_id === testUser.id)).toBe(true);
      
      // Verificar se os novos progressos estão presentes
      const ids = resultado.map(p => p.id);
      expect(ids).toContain(progresso1.id);
      expect(ids).toContain(progresso2.id);
    });

    test('findByUserAndDateRange() - deve buscar progressos em um período', async () => {
      // Criar progressos em datas específicas
      const progresso1 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-15',
        horas_estudadas: 3
      });
      const progresso2 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-16',
        horas_estudadas: 4
      });
      const progresso3 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-20', // Fora do range
        horas_estudadas: 1
      });
      createdProgressos.push(progresso1, progresso2, progresso3);

      const resultado = await progressoRepository.findByUserAndDateRange(testUser.id, '2024-08-15', '2024-08-16');

      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se apenas os progressos do período estão presentes
      const ids = resultado.map(p => p.id);
      expect(ids).toContain(progresso1.id);
      expect(ids).toContain(progresso2.id);
      expect(ids).not.toContain(progresso3.id); // Este deve estar fora do range
    });

    test('findByUserAndDate() - deve buscar progresso específico por usuário e data', async () => {
      const dataEspecifica = '2024-08-25';
      
      // Criar progresso para data específica
      const progressoCriado = await progressoRepository.create({
        usuario_id: testUser.id,
        data: dataEspecifica,
        horas_estudadas: 5
      });
      createdProgressos.push(progressoCriado);

      const resultado = await progressoRepository.findByUserAndDate(testUser.id, dataEspecifica);

      expect(resultado).toBeDefined();
      expect(resultado.length).toBe(1);
      expect(resultado[0].data).toBe(dataEspecifica);
      expect(resultado[0].usuario_id).toBe(testUser.id);
      expect(resultado[0].horas_estudadas).toBe(5);
    });

    test('findByUserAndDate() - deve retornar array vazio para combinação inexistente', async () => {
      const dataInexistente = '2024-12-31';
      
      const resultado = await progressoRepository.findByUserAndDate(testUser.id, dataInexistente);

      expect(resultado).toEqual([]);
    });

    test('findWhere() - deve buscar progressos com filtros', async () => {
      const horasEspecificas = 6;
      
      // Criar progressos com horas específicas
      const progresso1 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-26',
        horas_estudadas: horasEspecificas
      });
      const progresso2 = await progressoRepository.create({
        usuario_id: testUser.id,
        data: '2024-08-27',
        horas_estudadas: horasEspecificas
      });
      createdProgressos.push(progresso1, progresso2);

      const resultado = await progressoRepository.findWhere({ horas_estudadas: horasEspecificas });

      expect(resultado).toHaveLength(2);
      expect(resultado.every(p => p.horas_estudadas === horasEspecificas)).toBe(true);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar progresso com usuario_id inexistente', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      await expect(progressoRepository.create({
        usuario_id: idUsuarioInexistente,
        data: '2024-08-30',
        horas_estudadas: 2
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar progresso inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await progressoRepository.updateById(idInexistente, { 
        horas_estudadas: 5 
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar progresso inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await progressoRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });

    test('findByUserId() - deve retornar array vazio para usuário sem progressos', async () => {
      const idUsuarioInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await progressoRepository.findByUserId(idUsuarioInexistente);

      expect(resultado).toEqual([]);
    });
  });
});
