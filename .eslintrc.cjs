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
  'rules': {
    'indent': ['warn', 2, { 'SwitchCase': 1 }],
    'semi': ['warn', 'never'],
    'quotes': ['warn', 'single', {'avoidEscape': true}],
    'space-infix-ops': ['warn', {'int32Hint': false}],
    'no-unused-vars': 'warn',
    'max-len': ['error', {'code': 90, 'ignoreComments': true, 
      'ignoreStrings': true}],
    'linebreak-style': 'off',
    'require-jsdoc': 'off',
  },
}
