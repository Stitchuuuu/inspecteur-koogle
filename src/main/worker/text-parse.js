import { parseSentences } from '../sentence.helper.js'
import { parentPort, workerData } from 'worker_threads'

if (!parentPort && process.argv.length) {
	if (process.stdin.isTTY) {
		console.log('Please pipe data to this worker to analyse a text.')
		process.exit()
	}
	let text = ''
	process.stdin.on('data', (d) => {
		text += d.toString()
	})
	process.stdin.on('close', () => {
		console.log('no more data')
		const sentences = parseSentences(text)
		console.log(sentences)
	})
} else {
	const results = parseSentences(workerData.text)
	parentPort.postMessage(results)
}
