module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'plugin:react/recommended',
    'google',
    'plugin:jsx-a11y/recommended',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    'react-hooks',
    'jsx-a11y',
    'html',
  ],
  'rules': {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'semi': ['warn', 'never'],
    'quotes': ['warn', 'single', {'avoidEscape': true}],
    'react/prop-types': 'off',
    'require-jsdoc': 'off',
    'linebreak-style': 'off',
    'max-len': ['error', {'code': 90, 'ignoreComments': true, 'ignoreStrings': true}],
  },
  'ignorePatterns': ['dist/*', 'node_modules/*'],
}
