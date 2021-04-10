<template>
	<router-view/>
</template>
<script>
export default {
	created() {
		if (location.hash) {
			let url = '/'
			url += location.hash.substr(1)
			this.$router.push(url)
		}
		this.$server.send('main:register-events')
	}
}
</script>

<style lang="scss">
#app, button, input[type=button], input[type=submit] {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
#app {
	text-align: center;
}

body {
	margin: 0;
	padding: 0;
}
</style>
