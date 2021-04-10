const sentenceSplitter = /\s*[\n.:;?!]\s*/g

function getWords(s) {
	return s.split(/[\s,!;!?."“]/i).filter(w => w.trim() !== '')
}

function parseSentences(text) {
	const quotes = []
	const texts = [text]
	const textsWithoutQuotes = []
	let quoteMatch = /^(.*)([“«]([^«“”»]+)[”»])(.*)$/igs.exec(texts.pop())
	while (quoteMatch) {
		let [, part1, ,quote, part2] = quoteMatch
		quotes.push(quote)
		if (part1) {
			texts.push(part1)
		}
		if (part2) {
			texts.push(part2)
		}
		while (texts.length) {
			const t = texts.pop()
			quoteMatch = /(.*)?(“([^“”]+)”)(.*)?/gs.exec(t)
			if (!quoteMatch) {
				textsWithoutQuotes.push(t.trim())
			} else {
				break
			}
		}
	}
	const sentences = []
	for (const t of textsWithoutQuotes) {
		const list = t.split(sentenceSplitter)
		for (const s of list) {
			sentences.push(s)
		}
	}

	const results = []
	while (sentences.length) {
		let s = sentences.shift()
		const listMatches = /^\s*[-●.]\s*(.*)/gsm.exec(s)
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
			continue
		} else {
			results.push(s)
		}
	}
	return { 
		sentences: results,
		quotes,
	}
}

module.exports = {
  parseSentences,
}