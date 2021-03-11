module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  rules: { 'class-methods-use-this': 'warn', 'max-classes-per-file': ['error', 1] },
};
