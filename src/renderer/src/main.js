import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App)
	.use({ install: (app) => {
		app.config.globalProperties.$electron = window.require('electron')
		app.config.globalProperties.$ipc = window.require('electron').ipcRenderer
		app.config.globalProperties.$log = (...args) => {
			window.require('electron').ipcRenderer.send('main:log', args)
		}

		app.mixin({
			created() {
				this.$server = new (function(vm) {
					this._sharedObjectTracked = {}
					this.on = (eventName, callback) => {
						// console.debug(`IPC | Listening ${eventName}`)
						return vm.$ipc.on(eventName, (e, ...args) => {
							callback.apply(this, [...args, e])
						})
					}
					this.send = (...args) => {
						// console.debug(`IPC | Sending ${args[0]}`)
						return vm.$ipc.send.apply(vm.$ipc, args)
					}
					this.invoke = (...args) => {
						// console.debug(`IPC | Invoking ${args[0]}`)
						return vm.$ipc.invoke.apply(vm.$ipc, args).then(data => {
							return data
						})
					}
				})(this)
			}
		})
	}})
	.use(store).use(router).mount('#app')
