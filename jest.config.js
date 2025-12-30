module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/**/*.test.ts',
    '!backend/src/server.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/backend/src/__tests__/setup.ts']
};
