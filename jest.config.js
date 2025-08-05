import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('jest').Config} */
export default {
  // Preset para TypeScript
  preset: 'ts-jest/presets/default-esm',
  
  // Suporte a ES modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretório raiz dos testes
  rootDir: '.',
  
  // Padrões para encontrar arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}'
  ],
  
  // Extensões de arquivo que o Jest reconhece
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformações de arquivo
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
      },
    }],
  },
  
  // Caminhos de módulos (para resolver imports absolutos)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@model/(.*)$': '<rootDir>/src/model/$1',
  },
  
  // Arquivos de setup que rodam antes dos testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Cobertura de código
  collectCoverage: false, // Ativamos manualmente quando precisar
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts', // Arquivos de índice geralmente só fazem exports
  ],
  
  // Variáveis de ambiente para testes
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // Timeout para testes (útil para testes de integração com Supabase)
  testTimeout: 10000,
  
  // Mostrar resultados detalhados
  verbose: true,
  
  // Limpar mocks automaticamente entre testes
  clearMocks: true,
  restoreMocks: true,
};
