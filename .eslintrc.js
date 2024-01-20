module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  plugins: ['import'],
  rules: {
    'import/no-unused-modules': [
      'error',
      {
        unusedExports: true,
        missingExports: true
      }
    ],
    'comma-dangle': ['error', 'never'],
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/export': 'error'
  }
}
