const path = require('path')
const glob = require("glob")
const workers = { }
for (const worker of glob.sync(path.resolve(__dirname, './worker/*.js'))) {
	const filename = worker.split('/').pop().split('.js').shift()
	workers[`worker/${filename}`] = worker
}
const config = {
	mode: process.env.NODE_ENV === 'production' ? 'production': 'development',
	devtool: process.env.NODE_ENV === 'production' ? 'hidden-source-map' : 'source-map',
	target: 'electron11.2-main',
	entry: {
		index: path.resolve(__dirname, './index.js'),
		...workers
	},
	output: {
		path: path.resolve(__dirname, '../../main'),
		filename: '[name].js',
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