const path = require('path')
const config = {
	mode: process.env.NODE_ENV === 'production' ? 'production': 'development',
	devtool: process.env.NODE_ENV === 'production' ? 'hidden-source-map' : 'source-map',
	target: 'electron11.2-main',
	entry: path.resolve(__dirname, './index.js'),
	output: {
		path: path.resolve(__dirname, '../../main'),
		filename: 'index.js',
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
				}
			}
		]
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname),
			'@common': path.resolve(__dirname, '../common'),
		},
	},
	externals: {
		bufferutil: 'bufferutil',
		'utf-8-validate': 'utf-8-validate',
	}
}
module.exports = config