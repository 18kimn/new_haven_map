module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    'html',
  ],
  'rules': {
    'semi': ['warn', 'never'],
    'quotes': ['warn', 'single', {'avoidEscape': true}],
    'require-jsdoc': 'off',
    'linebreak-style': 'off',
    'max-len': ['error', {'code': 90, 'ignoreComments': true, 'ignoreStrings': true}],
  },
  'ignorePatterns': ['dist/*', 'node_modules/*'],
}
