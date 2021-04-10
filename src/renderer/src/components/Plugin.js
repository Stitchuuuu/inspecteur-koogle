import { h } from 'vue'

function ApplyScopedCSS(css, prefix) {
	return css.replaceAll(/([a-z0-9>[\]():*+.~,#^$-\s"=']+){/ig, (res, rule) => {
    const singlerules = rule.split(',')
    const rules = []
    for (const r of singlerules) {
        rules.push(prefix + ' ' + r.trim())
    }
    return ' ' + rules.join(',') + ' {'
	})
}

export default {
  props: {
		component: Object,
		template: String,
		css: [String, Object],
	},
	data: () => ({
		plugin: null,
	}),
	setup(props) {
		const { component, template, css } = props
		const cmp = { ... component }
		if (template) {
			cmp.template = template
			delete cmp.render
		}
		const propsPlugin = { ...props }
		delete propsPlugin.component
		delete propsPlugin.template
		delete propsPlugin.css
		propsPlugin.ref = 'plugin'
		return () => {
			if (css) {
				const dataName = 'data-plugin-' + (Date.now().toString(36))
				const divProps = {
					style: { display: 'inline-block' }
				}
				divProps[dataName] = ''
				return h('div', divProps, [h('style', ApplyScopedCSS(css, 'div[' + dataName + ']')), h(cmp, propsPlugin)])
			} else {
				return h(cmp, propsPlugin)
			}
		}
	},
}