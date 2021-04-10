import { Worker } from 'worker_threads'
import { app } from 'electron'
import path from 'path'
import url from 'url'

export default function(script, data) {
	return new Promise((resolve, reject) => {
		const mainPath = path.resolve(app.getAppPath(), './main')
		const workerPath = url.pathToFileURL(path.resolve(mainPath, './worker/' + script + (script.endsWith('.js') ? '' : '.js')))
		const worker = new Worker(workerPath, {
			workerData: data,
		})
		worker.on('message', resolve)
		worker.on('error', reject)
		worker.on('exit', (code) => {
			if (code !== 0)
				reject(new Error(`Worker stopped with exit code ${code}`));
		})
	})
}