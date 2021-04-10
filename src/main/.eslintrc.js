module.exports = {
  root: true,
  env: {
    node: true,
		browser: true,
		commonjs: true,
		es6: true
	},
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
	parser: '@babel/eslint-parser',
  parserOptions: {
		ecmaVersion: 2018,
  },
	
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'indent': ['error', 'tab']
  },
}
