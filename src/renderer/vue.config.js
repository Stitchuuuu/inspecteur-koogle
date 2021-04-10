const path = require('path')

module.exports = {
	runtimeCompiler: true,
	publicPath: process.env.NODE_ENV === 'production'
	? ''
	: '/',
	chainWebpack: config => {
		const svgRule = config.module.rule('svg')

		svgRule.uses.clear()

		svgRule
			.use('vue-loader')
			.loader('vue-loader-v16')
			.end()
			.use('vue-svg-loader')
			.loader('vue-svg-loader')
			.tap(options => {
				return { ...options, svgo: { plugins: [{ removeViewBox: false }] } }
			})

		config.module
		.rule('vue')
		.use('vue-loader')
			.tap(options => {
				options.transformAssetUrls = {
					tags: {
						icon: 'src',
						plugin: 'component',
					}
				}
				return options
			})
	},
	configureWebpack: {
		resolve: {
			alias: {
				"@common": path.resolve(__dirname, '../common'),
				"@": path.resolve(__dirname, './src'),
				"@main": path.resolve(__dirname, '../main')
			}
		},
	}
}