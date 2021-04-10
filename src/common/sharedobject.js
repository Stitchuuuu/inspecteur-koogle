const { EventEmitter } = require('events')
const { UnserializeJSON } = require('./utils')

/**
 * Watch changes on an object, with listeners in options
 * @param {*} objectOrFunction 
 * @param {*} options 
 * @param {*} originalObject 
 * @param {*} path 
 * @param {*} thisArg 
 */
function watchChangesOn(objectOrFunction, options, originalObject, path, thisArg) {
	const opts = { complexArrayWatch: true, privateFields: false, exclude: [], overwrite: {}, ...options }
	if (!originalObject) {
		originalObject = objectOrFunction
	}
	if (!path) {
		path = []
	}
	if (!thisArg) {
		thisArg = objectOrFunction
	}
	return new Proxy(objectOrFunction, {
		get: (target, prop) => {
			const val = target[prop]
			if (~opts.exclude.indexOf(prop)) {
				if (watchChangesOn.debug) console.log('> getprop:',prop, 'exclude')
				return objectOrFunction[prop]
			} else if (~Object.keys(opts.overwrite).indexOf(prop)) {
				if (watchChangesOn.debug) console.log('> getprop:',prop, 'overwrite')
				return opts.overwrite[prop]
			} else if (typeof val === 'object' && val) {
				if (watchChangesOn.debug) console.log('> getprop:',prop, 'object')
				return watchChangesOn(val, opts, originalObject, [ ...path, prop ], target)
			} else if (typeof val === 'function' && (objectOrFunction instanceof Map || objectOrFunction instanceof Date || opts.complexArrayWatch && Array.isArray(target))) {
				if (watchChangesOn.debug) console.log('> getprop:', prop, 'function')
				return watchChangesOn(val, opts, originalObject, [ ...path ], objectOrFunction)
			} else if (typeof val === 'function' && opts.privateFields) {
				if (watchChangesOn.debug) console.log('> getprop:', prop, 'function', 'privateFields')
				const originalFunc = objectOrFunction[prop]
				return new Proxy(originalFunc, {
					apply(target, t, args) {
						if (typeof opts.beforeApply === 'function') {
							opts.beforeApply.call(thisArg, { name: target.name, args })
						}			
						return target.apply(t, args)
					}
				})
			}
			return val
		},
		set: (target, prop, value) => {
			const before = target[prop]
			target[prop] = value
			if (typeof opts.update === 'function' && !opts.update.$disabled) {
				if (before !== value) {
					opts.update.call(originalObject, { name: prop, value: value, before, target: target, tree: [ ...path, prop ].join('.'), object: originalObject })
				}
			}
			return true
		},
		apply: (target, t, args) => {
			let edited = false
			if (Array.isArray(t)) {
				edited = true
				switch (target.name) {
					case 'push':
						break
					case 'shift':
						break
					case 'splice':
						break
					case 'unshift':
						break
					case 'pop':
						break
					case 'fill':
						break
					default:
						edited = false
						break
				}
			} else if (thisArg instanceof Map) {
				edited = true
				switch (target.name) {
					case 'set':
					case 'delete':
					case 'clear':
						break
					default:
						edited = false
						break
				}
			} else if (thisArg instanceof Date) {
				if (target.name.substr(0,3) === 'set' || target.name === 'parse') {
					edited = true
				}
			}
			if (typeof options.beforeApply === 'function') {
				options.beforeApply.call(thisArg, { name: target.name, args })
			}
			if (!edited) {
				return target.apply(thisArg, args)
			}
			if (Array.isArray(t)) {
				const before = t.slice()
				const newArgs = []
				let index = 0
				let added = []
				let deleted = []
				if (~['unshift', 'push', 'splice'].indexOf(target.name)) {
					for (const o of args) {
						if (target.name === 'splice' && index < 2) {
							newArgs.push(o)
							index++
							continue
						}
						added.push(o)
						if (typeof o === 'object') {
							newArgs.push(watchChangesOn(o, opts, originalObject, [ ...path, index + '' ], thisArg))
						} else {
							newArgs.push(o)
						}
						index++
					}
				} else {
					newArgs.push.apply(newArgs, args)
				}
				if (target.name === 'fill') {
					const start = args[1] || 0
					const length = args[2] || thisArg.length
					for (let i = start; i < length; i++) {
						added.push(thisArg[i])
					}
				}
				const val = target.apply(thisArg, newArgs)
				if (~['shift', 'pop', 'splice'].indexOf(target.name)) {
					if (Array.isArray(val)) {
						deleted = [... val]
					} else {
						deleted.push(val)
					}
				}
				if (typeof opts.update === 'function') {
					opts.update.call(originalObject, { name: '$values', value: t.slice(), before, target: target, tree: [ ...path ].join('.'), object: originalObject, added, deleted })
				}
				return val
			}
			let before, value, name

			if (thisArg instanceof Date) {
				before = new Date(thisArg)
				name = '$values'
			} else {
				if (target.name === 'set') {
					name = args[0] || undefined
					if (name) {
						before = thisArg.get(name)
						value = args[1] || undefined
					}
				} else if (target.name === 'delete') {
					name = args[0] || undefined
					before = thisArg.get(name)
					value = undefined
				} else {
					name = '$values'
					before = new thisArg.constructor(thisArg)
				}	
			}
			const val = target.apply(thisArg, args)
			if (name === '$values') {
				value = t
			}
			if (typeof opts.update === 'function') {
				opts.update.call(originalObject, { name, value, before, target, tree: [ ...path ].join('.'), object: originalObject })
			}
			return val
	}
	})
}
function GenerateRandomId() {
	return (new Date()).getTime().toString(36) + Math.ceil(Math.random() * 100000).toString(36)
}

function dataReplacer(o, f, key, parent) {
	let d = f.call(parent || o, key, o)
	if (typeof d === 'object' && d === o && d) {
		d = Array.isArray(d) ? [ ...d ] : { ...d }
		for (const name in d) {
			d[name] = dataReplacer(d[name], f, name, o)
		}
	}
	if (typeof d === 'object' && d !== null) return Array.isArray(d) ? [ ...d ] : { ...d }
	else return d
}

/**
 * A shared object
 * Has an event 'update' & can recieve an 'update' event with $receive
 */
class SharedObject extends EventEmitter {
	static #listeners = {}
	#class = 'SharedObject'
	#childSharedObjects = new Map()

	constructor(o) {
		super()
		if (Array.isArray(o)) {
			throw new Error('Creating a SharedObject from an Array is not possible.')
		}
		this.$sid = null
		if (typeof o === 'object' && o) {
			for (const name in o) {
				this[name] = o[name]
			}
		}
		if (!this.$sid) {
			this.$sid = GenerateRandomId()
		}
		if (this.$constructor) {
			this.$constructor.apply(this, [ ... arguments ])
		}
		this.#class = this.constructor.name

		this.on('update', this._onUpdate)
		if (o !== false) {
			return this.share(true)	
		}
	}
	share(data) {
		if (typeof data === 'object' && data) {
			for (const name in data) {
				this[name] = data[name]
			}
		}
		const onUpdate = (e) => (this.emit('update', e))
		const original = this
		return watchChangesOn(this, { 
			update: onUpdate,
			privateFields: false,
			exclude: ['_events', '_eventsCount', '_maxListeners'],
			overwrite: {
				$receive: (e, proxy) => {
					onUpdate.$disabled = true
					const res = this.$receive.call(proxy || original, e)
					onUpdate.$disabled = false
					return res
				},
				$$data: original,
			}
		})
	}
	static on(event, listener) {
		if (!this.#listeners[event]) this.#listeners[event] = []
		this.#listeners[event].push(listener)
	}
	static emit(event) {
		const listeners = this.#listeners[event]
		if (!listeners) return
		const args = [ ...arguments ]
		args.shift()
		for (const l of listeners) {
			l.apply(null, args)
		}
	}
	_addSharedObjectChild(o) {
		if (!this.#childSharedObjects.has(o)) {
			const listener = (e) => { this._onChildUpdate.call(this, e) }
			this.#childSharedObjects.set(o.id, {
				listener,
				totalReferencesInObject: 1,
			})
			o.on('update', listener)
		} else {
			this.#childSharedObjects.get(o.id).totalReferencesInObject++
		}
	}
	_removeSharedObjectChild(o) {
		const c = this.#childSharedObjects.get(o.id)
		if (!c) {
			console.error('Removed a Child Shared Object not referenced.')
		} else {
			c.totalReferencesInObject--
			if (!c.totalReferencesInObject) {
				o.removeListener('update', c.listener)
				this.#childSharedObjects.delete(o.id)
			}
		}
	}
	_onUpdate(e) {
		SharedObject.emit('update', e)
		if (e.added) {
			for (const o of e.added) {
				if (o instanceof SharedObject) {
					this._addSharedObjectChild(o)
				}
			}
		}
		if (e.deleted) {
			for (const o of e.deleted) {
				if (o instanceof SharedObject) {
					this._removeSharedObjectChild(o)
				}
			}
		}
		if (e.before instanceof SharedObject) {
			this._removeSharedObjectChild(e.before)
		}
		if (e.value instanceof SharedObject && e.value !== e.before) {
			this._addSharedObjectChild(e.value)
		}
		this.emit('update:field:' + e.tree, e.value, e.before, false)
	}
	_onChildUpdate(e) {
		const event = { ...e, object: this }
		this.emit('update', event)
	}
	/**
	 * Receive a Shared Object event and do the changes on the object
	 * @param {*} e 
	 */
	$receive(e) {
		const tree = e.tree.split('.')
		let o = this
		while (tree.length > 1) {
			o = o[tree.shift()]
		}
		o[tree.shift()] = e.value
		// console.log('SharedObject | Updated ' + this.$sid)
		this.emit('update:extern', { ...e, object: this })
		this.emit('update:field:' + e.tree, e.value, e.before, true)
	}
	toJSON() {
		const data = dataReplacer(this, function(key, value) {
			if (typeof value === 'function' || typeof value === 'symbol' || (key && key[0] === '_')) return undefined
			if (value instanceof Date) {
				const timezone = Math.abs(value.getTimezoneOffset())
				const hours = (Math.floor(timezone / 60)).toString().padStart(2, '0')
				const minutes = timezone%60 === 0 ? '00' : (timezone % 60).toString().padStart(2, '0')
				const timezoneStr = (value.getTimezoneOffset() < 0 ? '+' : '-') + hours + ':' + minutes

				const val = value.toISOString().replace('Z', timezoneStr)
				return { $class: 'Date', value: val }
			} else {
				return value
			}
		})
		if (this.constructor.name !== 'SharedObject' && this.constructor.name !== 'Object') {
			data['$class'] = this.constructor.name
		}
		return data
	}
	static fromJSON(data, classes, reactive) {
		if (!classes) {
			if (this.JSON_CLASSES && typeof this.JSON_CLASSES[Symbol.iterator] === 'function') {
				classes = [ ...this.JSON_CLASSES, this ]
			} else {
				classes = []
			}
		}
		const o = UnserializeJSON(data, function(key, value) {
			let val
			if (typeof value === 'object' && value && (value.$class || value.$sid)) {
				let cl = null
				const d = { ...value }
				if (value.$class === 'Date') {
					return new Date(value.value)
				} else if (value.$class) {
					// console.log(`SharedObject | fromJSON, searching class ${value.$class} in`, classes)
					cl = classes.find(c => c.name === data.$class)
					// console.log(`SharedObject | fromJSON, searching class ${value.$class}, found`, cl)
					delete d.$class
				}
				if (!cl) {
					cl = SharedObject
				}
				val = new cl(d)
			} else {
				val = value
			}
			if (reactive && typeof(val) === 'object' && val) {
				val = reactive(val)
			}
			return val
		})
		return o
		/*
		if (!rec && typeof data === 'string') {
			data = JSON.parse(data)
		}
		if (!~classes.indexOf(this)) classes.push(this)
		if (data === null || data === undefined || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || typeof data === 'bigint' || data instanceof RegExp) {
			return data
		} else if (data.$class || data.$sid) {
			let cl = SharedObject
			if (data.$class === 'Date') {
				return new Date(data.value)
			} else if (data.$class) {
				cl = classes.find(c => c.name === data.$class)
				if (!cl) {
					cl = SharedObject
				}
				delete data.$class
			}
			const d = {}
			for (const name in data) {
				if (typeof data[name] === 'symbol' || typeof data[name] === 'function') continue
				d[name] = this.fromJSON(data[name], classes, true)
			}
			return new cl(d)
		} else if (typeof data === 'object') {
			let d = new data.constructor()
			for (const name in data) {
				if (typeof data[name] === 'symbol' || typeof data[name] === 'function') continue
				d[name] = this.fromJSON(data[name], classes, true)
			}
			return d
		}
		*/
	}

}
module.exports = {
	SharedObject,
	watchChangesOn
}