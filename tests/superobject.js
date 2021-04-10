const { SharedObject } = require('../vue3/src/common/sharedobject')
const { SerializeJSON, UnserializeJSON } = require('../vue3/main/utils')
function test(protocol, options) {
	if (!test.id) test.id = 1
	console.log(`====> Test #${test.id++}: ${protocol.name}`)
	let obj = watchChangesOn(protocol(true), { ...options, update: function(e) {
		console.log('update', e.name, e.tree, e.before, e.value, this, JSON.stringify(this))
	} })
	protocol(obj)
}

function testObjectWithArray(obj) {
	if (obj === true) {
		return {
			truc: 1,
			machin: [],
			truc: [],
		}
	}
	obj.truc = 2
	obj.machin.push({ token: 'truc' })
	obj.machin[0].token = 'hello'
	obj.truc[0] = 1
	obj.truc[1] = 2
	obj.newProp = 'truc'
	obj.machin.splice(0, 1)	
}
/**
 * @param {Map|boolean} obj 
 */
function testMap(obj) {
	if (obj === true) {
		return new Map()
	}
	/**
	 * @type {Map}
	 */
	const o = obj
	o.set('hello', 5)
}

function testCustomObject(obj) {
	if (obj === true) {
		return new (class CustomObject {
			#truc = 3
			constructor() {
				this.test = 1
			}
			setTest() {
				this.test = 2
				this.#truc = 4
			}
		})
	}
	obj.test = 3
	obj.setTest()
}

/**
test(testObjectWithArray)
test(testObjectWithArray, { complexArrayWatch: true })
test(testMap)
test(testCustomObject)
*/

/*
class Config extends SharedObject {
	#truc = 3
	$constructor(o) {
		if (o) return
		this.test = new Date()
		this.hello = [1, 3, 4]
	}
	hello() {
		this.#truc = 4
	}
}

let lastEvent = null
SharedObject.on('update', (e) => {
	console.log(e.name, e.tree, e.before, e.value, JSON.stringify(e.object))	
	lastEvent = e
})
const d = new Config()

d.test.setDate(10)

*/
const o = {
	token: {
		access_token: 'tdv6enxaa1xoi3lalap6e6rt0n8d0d',
		expires_in: 15589,
		refresh_token: 'tlibsthuwive1rdy7305stnu1xm61ktz3wrp9qchn5ewfg9hky',
		scope: [
			'chat:email',
			'chat:read',
		],
		token_type: 'bearer',
		expires_at: new Date()
	}
}
const d = new SharedObject(o)

console.log(SerializeJSON({ event: 'status', config: d }, function(key, val, original) {
	if (original instanceof SharedObject) {
		console.log('must track update', val.$sid)
	}
	return val
}))
console.log(UnserializeJSON(SerializeJSON(d), function(key, val) {
	if (typeof val === 'object' && val.$sid) {
		return SharedObject.fromJSON(val)
	} else {
		return val
	}
}))


console.log('==== UnserializeJSON')
UnserializeJSON(o, function(key, val) {
	console.log('>', key, val, this)
	if (typeof val === 'object' && val.$sid) {
		return SharedObject.fromJSON(val)
	} else {
		return val
	}
	return val
})
console.log('==== JSON.parse')
JSON.parse(JSON.stringify(o), function(key, val) {
	console.log('>', key, val, this)
	if (typeof val === 'object' && val.$sid) {
		return SharedObject.fromJSON(val)
	} else {
		return val
	}
})

