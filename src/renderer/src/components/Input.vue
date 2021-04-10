<template>
	<div class="ui-input" :class="{'fullwidth': fullwidth}">
		<label v-if="label">{{ label }}</label>
		<textarea v-if="type === 'textarea'" 
			v-bind="textareaAttrs"
			:rows="textareaRows"
			:value="transformedValue"
			ref="textarea"
			@input="onInput"/>
		<input v-else-if="~['text', 'number', 'email', 'password'].indexOf(type)" v-bind="$attrs" @input="onInput"/>
	</div>
</template>

<script>
export default {
	inheritAttrs: false,
  name: 'ui-input',
	emits: ['update:modelValue'],
  props: {
		label: String,
    type: {
			type: String,
			default: 'text',
		},
		fullwidth: {
			type: Boolean,
			default: true
		},
		modelValue: {},
		rows: {
			type: [String, Number],
			default: 'auto'
		},
		ret: {
			type: String,
			default: 'string',
		}
  },
	computed: {
		textareaAttrs() {
			const attrs = { ...this.$attrs }
			delete attrs.type
			delete attrs.rows
			delete attrs.value
			return attrs
		},
		transformedValue() {
			const val = this.modelValue
			if (this.ret === 'array' && this.type === 'textarea' && Array.isArray(val)) {
				return val.join('\n')
			} else {
				return val
			}
		},
		textareaRows() {
			if (this.rows === 'auto') {
				return this.transformedValue.split('\n').length
			}
			return this.rows
		},
	},
	methods: {
		calcTextareaRows() {
		},
		onInput(ev) {
			if (this.ret === 'array' && this.type === 'textarea') {
				return this.$emit('update:modelValue', ev.target.value.split('\n'))
			}
			return this.$emit('update:modelValue', ev.target.value)
		}
	},
	mounted() {

	},
}
</script>

<style lang="scss">
.ui-input {
	&.fullwidth {
		> textarea, > input, > label, > div {
			display: block;
			width: 100%;
		}
	}
	> textarea, > input, > label, > div {
		font-size: 1.5rem;
		background-color: black;
		padding: 10px;
		box-sizing: border-box;
		color: #f6ac5e;
		border-radius: 4px;
		outline: 0;
	}
	> label {
		background-color: initial;
		font-weight: bold;
		padding: 5px;
		font-size: 1.25rem;
	}
}
</style>