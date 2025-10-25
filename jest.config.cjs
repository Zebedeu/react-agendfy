/** @type {import('jest').Config} */
module.exports = {
  // Define o ambiente de teste para simular o DOM
  testEnvironment: 'jest-environment-jsdom',

  // Usa o babel-jest para transformar arquivos JavaScript, JSX, TypeScript ou TSX
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Mapeamento para importação de arquivos estáticos (ex.: CSS)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$', // ignora arquivos de definição de tipo
  ],
  // Arquivo de configuração para testes (ex.: extensão dos matchers do Testing Library)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Padrões para localizar arquivos de teste
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
};
