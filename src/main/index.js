const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const util = require('util')

if (app && !app.isPackaged) {
	require('source-map-support').install()
}


// Logging
const log = console.log
console.log = function(...args) {
	if (!app || !app.isPackaged) {
		log.apply(console, args)
	}
	if (logfile) {
		const outputArgs = []
		for (const arg of args) {
			let val = arg
			if (arg === null) {
				val = 'null'
			} else if (arg === undefined) {
				val = 'undefined'
			} else if (typeof arg === 'object') {
				val = util.inspect(arg, false, 2, true)
			}
			outputArgs.push(val)
		}
		fs.writeFileSync(logfile, (new Date()).toISOString() + ' | ' + outputArgs.join(' ') + '\n')
	}
}

let logfile = null
if ((app && app.isPackaged) || process.env.NODE_ENV === 'production') {
	logfile = fs.openSync(path.join(app.getAppPath(), 'log.txt'), 'a')
}

require('./main')

// Main.init()
