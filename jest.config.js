/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^https://cdn\\.jsdelivr\\.net/npm/bessa_patterns\\.ts@.*':
      '<rootDir>/test/__mocks__/bessa_patterns.ts',
    '^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/olinda_utils\\.js@.*':
      '<rootDir>/test/__mocks__/olinda_utils.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 91,
      functions: 97,
      lines: 97,
      statements: 97,
    },
  },
};
