module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // Ruta donde estarán los tests
  moduleFileExtensions: ['ts', 'js'],
  rootDir: './', // Carpeta raíz del proyecto
  coverageDirectory: './coverage', // Generar reporte de cobertura
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!jest.config.js',
  ],
};
