const sentenceSplitter = /\s*[\n.:;?!]\s*/g

function getWords(s) {
	return s.split(/[\s,!;!?."“]/i).filter(w => w.trim() !== '')
}

function parseSentences(text) {
	const sentences = text.split(sentenceSplitter)
	const results = []
	const quotes = []
	while (sentences.length) {
		let s = sentences.shift()
		if (s.startsWith('-') || s.startsWith(',')) {
			s = s.substr(1).trim()
		}
		if (!s) continue

		const quoteMatch = /(.*)(“[^“”]+”)(.*)/i.exec(s)
		if (quoteMatch) {
			[, part1, quote, part2] = quoteMatch
			quotes.push(quote)
			sentences.unshift(part1)
			sentences.unshift(part2)
			continue
		}
		const words = getWords(s)
		if (words.length > 32 && s.indexOf(',')) {
			const parts = s.split(/,/g)
			let subsentence = ''
			for (const part of parts) {
				const currentWords = subsentence ? getWords(subsentence).length : 0
				const nbWordsPart = getWords(part).length
				if (!currentWords || nbWordsPart + currentWords < 32) {
					subsentence += (subsentence ? ',' : '') + part
				} else if (currentWords) {
					sentences.unshift(subsentence.trim())
					subsentence = part
				}
			}
			if (subsentence) {
				sentences.unshift(subsentence.trim())
			}
		} else if (words.length <= 5) {
			continue
		} else {
			results.push(s)
		}
	}
	return results
}

module.exports = {
  parseSentences,
}