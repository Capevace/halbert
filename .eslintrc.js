module.exports = {
  parserOptions: {
    ecmaVersion: 7,
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  env: {
    browser: true,
    node: true
  },
  rules: {
    indent: ['warn', 2],
    'comma-dangle': ['error'],
    'eol-last': 'error',
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'prefer-template': 'error',
    'prefer-const': 'error',
    'no-console': 'off',
    'no-const-assign': 'error',
    'no-trailing-spaces': 'error'
  },
  globals: {
    MODULES_PATH: true,
    SESSION_ID: true,
    CONFIG_PATH: true,
    DEBUG_MODE: true,
    HALBERT_CONFIG: true
  }
};
