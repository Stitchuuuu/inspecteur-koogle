const { isVersion, getLastVersionFromRemote } = require('../src/main/version.helper')


async function main() {

	/*
	console.log(isVersion('1.0.1', '>', '1.0.0'))
	console.log(isVersion('1.0.0-beta.2', '>', '1.0.0-beta.1'))
	console.log(isVersion('1.0.1', '>', '1.0.0-beta.1'))

	console.log(await getLastVersionFromRemote({
		repository: 'github:Stitchuuuu/inspecteur-koogle'
	}, 'alpha'))
	*/

	const text = "Nouveautés :\r\n\r\n* **Correction du bug sur le bouton « Lancer sur Google ».** C'est quand même mieux que de cliquer 2 fois\r\n* **Changement du easter egg 42.** Peut être que des gens comprendrons mieux la référence comme ça ?\r\n* **Changement du nom de l’application et de l’icône.** Evitons la foudre de Google\r\n* **Amélioration du parsing de texte.** COUCOUW!\r\n* **Ajout d’un filtre permettant d’afficher les phrases et citations ignorées.** You know everything Jon Snow.\r\n* **Ajout du pourcentage global de « plagiat ».** Ça peut aider au lieu de compter les mots 1 par 1."
	let html = text
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/\*\*([^\*]+)\*\*/g, '<b>$1</b>')
	.replace(/~~([^~]+)~~/g, '<del></del>')
	.replace(/^\* (.+)/gm, '<li>$1</li>')
	.replace(/\r\n<li>/g, '<li>')
	.replace(/\r\n/g, '<br/>')
	.replace(/<li>/g, function(n, index, whole) {
		const ul = '<ul>'
		const li = '</li>'
		console.log(whole.substr(index - ul.length, ul.length))
		if (index < ul.length || (whole.substr(index - ul.length, ul.length) !== ul && whole.substr(index - li.length, li.length) !== li)) {
			return '<ul><li>'
		}
		return n
	})
	.replace(/<\/li>/g, function(n, index, whole) {
		const ul = '</ul>'
		const li = '<li>'
		console.log(n, whole.substr(index + n.length, li.length))
		if (whole.substr(index + n.length, ul.length) !== ul && whole.substr(index + n.length, li.length) !== li) {
			return '</li></ul>'
		}
		return n
	})
	console.log(html)
}
main()