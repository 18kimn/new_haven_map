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
    'no-trailing-spaces': ['off'],
    'semi': ['warn', 'never'],
    'object-curly-spacing': ['off', 'always'],
    'array-bracket-spacing': ['off', 'always'],
    'quotes': ['warn', 'single', {'avoidEscape': true}],
    'space-before-function-paren': ['off', {
      'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always',
    }],
    'space-infix-ops': ['warn', {'int32Hint': false}],
    'no-unused-vars': 'warn',
    'max-len': ['error', {'code': 90, 'ignoreComments': true, 
      'ignoreStrings': true}],
    'linebreak-style': 'off',
    'require-jsdoc': 'off',
  },
}
