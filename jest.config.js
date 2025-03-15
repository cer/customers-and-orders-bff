module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
      },
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/e2e/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.puppeteer-setup.js'],
    },
  ],
}; 