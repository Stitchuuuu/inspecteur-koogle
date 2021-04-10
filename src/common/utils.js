
function SerializeJSON(value, callback, key, parent) {
	if (!callback) callback = (key, val) => val
	if (!parent) {
		parent = value
	}
	let o = value
	if (typeof o === 'object' && o && typeof o.toJSON === 'function') {
		o = o.toJSON()
	}
	o = callback.call(parent, key, o, value)
	if (typeof o === 'string' || typeof o === 'number' || o === null || typeof o === 'boolean') return o
	if (typeof o !== 'object') return undefined

	const val = Array.isArray(o) ? [] : {}
	for (const name in o) {
		const v = SerializeJSON(o[name], callback, name, parent)

		if (v !== undefined && !Array.isArray(val)) {
			val[name] = v
		} else if (Array.isArray(val)) {
			val[name] = v === undefined ? null : v
		}
	}
	return val
}

function UnserializeJSON(o, callback, key, parent) {
	if (!parent) parent = o
	if (!callback) callback = (key, val) => val
	if (typeof o !== 'object' || o === null) return callback.call(parent, key, o)

	const val = Array.isArray(o) ? [] : {}
	const keys = Array.isArray(o) ? o.keys() : Object.keys(o)
	for (const key of keys) {
		val[key] = UnserializeJSON(o[key], callback, key, o)
	}
	return callback.call(o, key, val)
}
module.exports = {
	SerializeJSON,
	UnserializeJSON,
}