const sentenceSplitter = /\s*[\n.:;?!]\s*/g

function getWords(s) {
	return s.split(/[\s,!;!?."“]/i).filter(w => w.trim() !== '')
}

function parseSentences(text) {
	let results = []
	const reg = /([“«]([^«“”»]+)[”»])/igm
	let quoteMatch = reg.exec(text)
	let index = 0
	while (quoteMatch) {
		const [match, ,quote] = quoteMatch
		if (index - quoteMatch.index !== 0) {
			const previous = text.substring(index, quoteMatch.index)
			results = [...results, ...parseSentences(previous)]
		}
		results.push({ type: 'quote', words: getWords(quote).length, text: quote })
		index = quoteMatch.index + match.length
		quoteMatch = reg.exec(text)
	}
	const sentences = text.split(sentenceSplitter)
	while (sentences.length) {
		let s = sentences.shift()
		const listMatches = /^\s*[-●•.]\s*(.*)/gsm.exec(s)
		s = listMatches && listMatches[1] || s
		if (!s) continue
		const words = getWords(s)
		if (words.length > 32 && ~s.indexOf(',')) {
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
			results.push({ type: 'short', words: words.length, text: s })
			continue
		} else {
			results.push({ type: 'sentence', words: words.length, text: s })
		}
	}
	return results
}

module.exports = {
  parseSentences,
}