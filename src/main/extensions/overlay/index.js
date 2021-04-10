import { Extension } from "@/extension";

export class Overlay extends Extension {

	static get extension() {
		return { name: 'overlay' }
	}

	constructor(o) {
		super(...arguments)
		if (this.$config.default) {
			delete this.$config.default
			this.$config.sources = [{
				id: Extension.generateId(),
				component: 'twitch-chat-messages',
				position: {
					x: 0,
					y: 0,
					width: 200,
					height: 200
				}
			}]
		}
		this.$ipc.handle('overlay:' + this.id, () => {
			return this.$config
		})
	}
}