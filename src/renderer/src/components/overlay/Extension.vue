<template>
  <div class="extension" :class="classes" @mousedown="startDrag" @mousemove="move" @mouseup="stopDrag" :style="inlineStyle">
    H2
  </div>
</template>

<script>
export default {
	name: 'extension',
	data() {
		return {
			drag: false,
			dragStartPosition: {x: 0, y: 0}
		}
	},
	props: {
		name: String,
		position: {
			type: Object,
			required: false,
			default: () => { return { x: 0, y: 0 }}
		}
	},
	methods: {
		startDrag(e) {
			this.dragStartPosition.x = e.clientX - this.position.x
			this.dragStartPosition.y = e.clientY - this.position.y
			this.drag = true
		},
		move(event) {
			if (!this.drag) return false
			this.$emit('update:position', this.relativePosition(event))
		},
		stopDrag() {
			this.drag = false
			this.$electron.remote.app.hide()
		},
		relativePosition(e) {
			return { x: e.clientX - this.dragStartPosition.x, y: e.clientY - this.dragStartPosition.y }
		}
	},
	computed: {
		classes() {
			let obj = { draggable: true }
			obj['extension-' + this.name] = true
			return obj
		},
		inlineStyle() {
			return {
				top: this.position.y + 'px',
				left: this.position.x + 'px'
			}
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.extension.draggable {
    cursor: pointer;
}
</style>
