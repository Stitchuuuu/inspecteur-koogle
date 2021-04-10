<template>
  <div class="home" :class="{'loading': !loaded}">
		<div v-if="!loaded" class="loader">
			Loading...
		</div>
		<template v-else>
			
		</template>
  </div>
</template>

<script>
export default {
	name: 'Home',
	data: () => ({
		loaded: false,
	}),
	methods: {
	},
	mounted() {
	},
}
</script>

<style lang="scss">
body {
	background-color: #091044;
	color: #F6AC5E;
}
svg {
	fill: #F6AC5E;
}
.home {
	display: flex;
	align-items: flex-start;
	justify-content: flex-start;
	height: 100vh;
	overflow: hidden;
	&.loading {
		align-items: center;
		justify-content: center;
	}
	.menu {
		list-style: none;
		padding: 0;
		margin: 0;
		li {
			cursor: pointer;
			border-bottom: 1px solid #f6ac5e;
			padding: 1em;
			background-color: rgba(246, 172, 94, 0.7);
			color: #091044;
			transition: background-color 0.3s;
			&.selected {
				background-color: rgb(246, 172, 94);
			}
			&:hover {
				background-color: rgb(246, 172, 94);
			}
		}
	}
	.content {
		padding: 20px;
		text-align: left;
		overflow-y: auto;
		flex: 1;
		height: 100%;
		box-sizing: border-box;
	}
}
</style>