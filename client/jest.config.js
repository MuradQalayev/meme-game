module.export = {
    present:'vite-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions:['js','jsx'],
    setupFilesAfterEnv: ['<rootDir>setupTests.js'],
    testPathIgnorePatterns: ['/node_modules/','/dist/']
}