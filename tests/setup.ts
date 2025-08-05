/**
 * Setup global para testes Jest
 * Este arquivo roda antes de todos os testes
 */

// Configurações globais para testes
import { config } from 'dotenv';

// Carrega variáveis de ambiente específicas para teste
config({ path: '.env.test' });

// Timeout global para operações assíncronas
jest.setTimeout(10000);

// Mock do console para testes mais limpos (opcional)
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Desabilita logs durante testes (descomente se quiser)
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Configurações para testes de integração com Supabase
beforeAll(async () => {
  // Setup global antes de todos os testes
  console.log('🧪 Iniciando suite de testes...');
});

afterAll(async () => {
  // Cleanup global após todos os testes
  console.log('✅ Finalizando suite de testes...');
});

// Cleanup entre cada teste
beforeEach(() => {
  // Reset de estado entre testes se necessário
});

afterEach(() => {
  // Cleanup após cada teste
  jest.clearAllMocks();
});
