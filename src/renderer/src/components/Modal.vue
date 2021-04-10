<template>
  <div class="ui-modal">
		<slot/>
	</div>
</template>

<script>
export default {
  name: 'ui-modal',
  props: {
    type: {
			type: String,
			default: 'button',
		},
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.ui-modal {
  margin: 0;
	padding: 1rem 2rem;
	border: 0px;
	outline: 0;
	user-select: none;
	-webkit-user-select: none;
	cursor: pointer;
	text-align: center;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background-color: rgb(246, 172, 94);
	font-size: 2rem;
	color: black;
	&.fullwidth {
		display: block;
	}
	&:hover, &:active {
		background-color: rgba(246, 172, 94, 0.8);
	}
	svg {
		width: 2rem;
		height: 2rem;
		margin-right: 10px;
	}
	&.unclickable {
		cursor: default;
		pointer-events: none;
	}
}
</style>
