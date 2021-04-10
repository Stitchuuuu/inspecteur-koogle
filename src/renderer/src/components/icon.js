import { h } from 'vue'
const Icon = (props, context) => {
	// Defaults
	const data = context
	if (!data.attrs) data.attrs = {}
	if (!data.attrs.width) data.attrs.width = data.attrs.size || '15'
	if (!data.attrs.height) data.attrs.height = data.attrs.size || '15'
	delete data.attrs.size
	if ((!data.staticStyle || !data.staticStyle.fill) && (!data.style || !data.style.fill)) {
		if (!data.staticStyle) data.staticStyle = {}
	}

	// Warnings
	if (process.env.NODE_ENV === 'development') {
		if (!data.attrs || !data.attrs.src) console.error('Missing "src" attribute on icon component')
	}

	let src = data.attrs.src
	src = src.default || src
	delete data.attrs.src

	return h(src, props)
}

export default Icon