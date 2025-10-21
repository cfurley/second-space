module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'node'],
};
