import { UsuarioRepository } from '../../../src/repository/UsuarioRepository';
import { Usuario, NovoUsuario } from '../../../src/model/Usuario';
import { supabase } from '../../../src/supabase/client';

describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository;
  let createdUsuarios: Usuario[] = [];

  beforeAll(async () => {
    usuarioRepository = new UsuarioRepository(supabase);
  });

  afterAll(async () => {
    // Limpar usuários criados durante os testes
    for (const usuario of createdUsuarios) {
      try {
        await usuarioRepository.deleteById(usuario.id);
      } catch (error) {
        console.warn(`Erro ao limpar usuário ${usuario.id}:`, error);
      }
    }
  });

  describe('Operações CRUD', () => {
    test('create() - deve criar um usuário com dados válidos', async () => {
      const novoUsuario: NovoUsuario = {
        nome: 'Usuario Teste',
        email: `teste.${Date.now()}@exemplo.com`
      };

      const resultado = await usuarioRepository.create(novoUsuario);
      createdUsuarios.push(resultado);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.nome).toBe(novoUsuario.nome);
      expect(resultado.email).toBe(novoUsuario.email);
    });

    test('findById() - deve buscar usuário por ID válido', async () => {
      // Criar usuário para teste
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuario FindById',
        email: `findbyid.${Date.now()}@exemplo.com`
      });
      createdUsuarios.push(usuarioCriado);

      // Buscar por ID
      const resultado = await usuarioRepository.findById(usuarioCriado.id);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(usuarioCriado.id);
      expect(resultado!.nome).toBe(usuarioCriado.nome);
      expect(resultado!.email).toBe(usuarioCriado.email);
    });

    test('findById() - deve retornar null para ID inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await usuarioRepository.findById(idInexistente);

      expect(resultado).toBeNull();
    });

    test('findAll() - deve listar usuários', async () => {
      // Criar alguns usuários para teste
      const usuario1 = await usuarioRepository.create({
        nome: 'Usuario FindAll 1',
        email: `findall1.${Date.now()}@exemplo.com`
      });
      const usuario2 = await usuarioRepository.create({
        nome: 'Usuario FindAll 2',
        email: `findall2.${Date.now()}@exemplo.com`
      });
      createdUsuarios.push(usuario1, usuario2);

      const resultado = await usuarioRepository.findAll();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se os usuários criados estão na lista
      const ids = resultado.map(u => u.id);
      expect(ids).toContain(usuario1.id);
      expect(ids).toContain(usuario2.id);
    });

    test('updateById() - deve atualizar usuário existente', async () => {
      // Criar usuário para teste
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuario Update Original',
        email: `update.${Date.now()}@exemplo.com`
      });
      createdUsuarios.push(usuarioCriado);

      // Atualizar nome
      const novoNome = 'Usuario Update Modificado';
      const resultado = await usuarioRepository.updateById(usuarioCriado.id, { 
        nome: novoNome
      });

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(usuarioCriado.id);
      expect(resultado!.nome).toBe(novoNome);
      expect(resultado!.email).toBe(usuarioCriado.email); // Não deve mudar
    });

    test('deleteById() - deve deletar usuário existente', async () => {
      // Criar usuário para teste
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuario Delete',
        email: `delete.${Date.now()}@exemplo.com`
      });

      // Deletar usuário
      const deletado = await usuarioRepository.deleteById(usuarioCriado.id);
      expect(deletado).toBe(true);

      // Verificar se foi deletado
      const resultado = await usuarioRepository.findById(usuarioCriado.id);
      expect(resultado).toBeNull();
    });
  });

  describe('Operações Específicas', () => {
    test('findByEmail() - deve buscar usuário por email', async () => {
      const emailUnico = `unique.${Date.now()}@exemplo.com`;
      
      // Criar usuário com email específico
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuario Email Teste',
        email: emailUnico
      });
      createdUsuarios.push(usuarioCriado);

      const resultado = await usuarioRepository.findByEmail(emailUnico);

      expect(resultado).toBeDefined();
      expect(resultado!.email).toBe(emailUnico);
      expect(resultado!.id).toBe(usuarioCriado.id);
    });

    test('findByEmail() - deve retornar null para email inexistente', async () => {
      const emailInexistente = `inexistente.${Date.now()}@exemplo.com`;
      
      const resultado = await usuarioRepository.findByEmail(emailInexistente);

      expect(resultado).toBeNull();
    });

    test('emailExists() - deve retornar true para email existente', async () => {
      const emailTeste = `exists.${Date.now()}@exemplo.com`;
      
      // Criar usuário
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuario Exists',
        email: emailTeste
      });
      createdUsuarios.push(usuarioCriado);

      const existe = await usuarioRepository.emailExists(emailTeste);

      expect(existe).toBe(true);
    });

    test('emailExists() - deve retornar false para email inexistente', async () => {
      const emailInexistente = `notexists.${Date.now()}@exemplo.com`;
      
      const existe = await usuarioRepository.emailExists(emailInexistente);

      expect(existe).toBe(false);
    });

    test('findWhere() - deve buscar usuários com filtros', async () => {
      const nomeEspecifico = `Filter Test ${Date.now()}`;
      
      // Criar usuário com nome específico para filtro
      const usuarioCriado = await usuarioRepository.create({
        nome: nomeEspecifico,
        email: `filter.${Date.now()}@exemplo.com`
      });
      createdUsuarios.push(usuarioCriado);

      const resultado = await usuarioRepository.findWhere({ nome: nomeEspecifico });

      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe(nomeEspecifico);
      expect(resultado[0].id).toBe(usuarioCriado.id);
    });
  });

  describe('Validações e Tratamento de Erros', () => {
    test('create() - deve falhar ao tentar criar usuário com email duplicado', async () => {
      const emailDuplicado = `duplicado.${Date.now()}@exemplo.com`;
      
      // Criar primeiro usuário
      const usuario1 = await usuarioRepository.create({
        nome: 'Usuario 1',
        email: emailDuplicado
      });
      createdUsuarios.push(usuario1);

      // Tentar criar segundo usuário com mesmo email
      await expect(usuarioRepository.create({
        nome: 'Usuario 2',
        email: emailDuplicado
      })).rejects.toThrow();
    });

    test('updateById() - deve retornar null ao tentar atualizar usuário inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await usuarioRepository.updateById(idInexistente, { 
        nome: 'Nome Atualizado'
      });

      expect(resultado).toBeNull();
    });

    test('deleteById() - deve executar sem erro ao tentar deletar usuário inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const resultado = await usuarioRepository.deleteById(idInexistente);

      expect(resultado).toBe(true); // Supabase sempre retorna true para delete
    });
  });
});
