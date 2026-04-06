import type { Config } from 'jest';

// Jest 설정 파일
// Jest configuration file
const config: Config = {
  // 루트 디렉토리
  // Root directory
  rootDir: '.',

  // 커버리지 수집 대상
  // Coverage collection targets
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/dto/**',
    '!src/prisma/**',
  ],

  // 커버리지 출력 디렉토리
  // Coverage output directory
  coverageDirectory: './coverage',

  // 유닛 테스트 및 E2E 테스트 프로젝트 설정
  // Unit test and E2E test project configurations
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: 'test/unit/.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': [
          'ts-jest',
          { tsconfig: './tsconfig.json' },
        ],
      },
      // @/* → src/* 경로 매핑
      // @/* → src/* path mapping
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: 'test/e2e/.*\\.e2e-spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': [
          'ts-jest',
          { tsconfig: './tsconfig.json' },
        ],
      },
      // @/* → src/* 경로 매핑
      // @/* → src/* path mapping
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      // E2E 테스트는 시간이 오래 걸릴 수 있음
      // E2E tests may take longer
      testTimeout: 30000,
    },
  ],
};

export default config;
