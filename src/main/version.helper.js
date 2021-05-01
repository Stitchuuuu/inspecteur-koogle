
/**
 * Helper for comparing / getting versions
 */
const axios = require('axios')

/**
 * Get the last release version for a repository
 * @param {*} pckg the package.json content (parsed)
 * @param {*} type the channel to use (default: stable)
 * @returns {Object} the last version with the comment
 */
async function getLastVersionFromRemote(pckg, type) {
	let releaseTypeAsked = type || ''
	const name = pckg.repository ? pckg.repository.split(':').slice(1).join(':') : ''
	if (!name) return null
	const reqInfo = pckg.repository.startsWith('github:') ? {
		method: 'GET',
		url: 'https://api.github.com/repos/Stitchuuuu/inspecteur-koogle/releases',
		headers: {
			Accept: 'application/vnd.github.v3+json',
		},
	} : null
	const releases = (await axios.request(reqInfo).then(res => res.data)).filter(r => {
		if (!r.tag_name) return false
		const v = parseRelease(r.tag_name)
		if (releaseTypeAsked === '' && v.channel) return false
		else if (releaseTypeAsked === 'beta' && !(!v.channel || v.channel === 'beta')) return false
		return true
	})
	if (releases.length) {
		return { version: releases[0].tag_name, comment: releases[0].body, url: releases[0].html_url }
	} else {
		return null
	}
}
/**
 * Compare to versions parsed (with major, minor, patch, channel & version attribute)
 * @param {*} v1 
 * @param {*} v2 
 * @returns 
 */
function cmpVersions(v1, v2) {
	if (v1 === null && v2 === null) return 0
	else if (v1 === null) return -1
	else if (v2 === null) return 1
	const orderChannels = {
		'': 0,
		'beta': -1,
		'alpha': -2,
	}
	const toCompare = ['major', 'minor', 'patch', 'channel', 'version']

	let res = 0
	for (const n of toCompare) {
		let val1 = v1[n]
		let val2 = v2[n]
		if (n === 'channel') {
			val1 = orderChannels[val1 || '']
			val2 = orderChannels[val2 || '']
		}
		if (val1 > val2) {
			res = 1
		} else if (val1 < val2) {
			res = -1
		}
		if (res !== 0) break
	}
	return res
}

/**
 * Test a version with another
 * @param {*} v1 the version
 * @param {*} cmp >, >=, <, <= or =
 * @param {*} v2 the version to compare with
 * @returns 
 */
function isVersion(v1, cmp, v2) {
	const res = cmpVersions(parseRelease(v1), parseRelease(v2))
	if (cmp === '>' && res === 1) return true
	else if (cmp === '<' && res === -1) return true
	else if (cmp === '>=' && res >= 0) return true
	else if (cmp === '<=' && res <= 0) return true
	else if (cmp === '=' && res === 0) return true

	return false
}

/**
 * Parse a normalized release string ({major}.{minor}.{patch}-{channel}.{version}, {major}.{minor}.{patch}) into a release object
 * @param {*} releaseName 
 * @returns 
 */
function parseRelease(releaseName) {
	if (typeof releaseName !== 'string') return releaseName
	const reg = /([0-9]+)\.([0-9]+)\.([0-9]+)(-([a-z]+)\.([0-9]+))?/i
	try {
		const [, major, minor, patch, , channel, version] = reg.exec(releaseName)
		return {
			major: parseInt(major),
			minor: parseInt(minor),
			patch: parseInt(patch),
			channel,
			version: version ? parseInt(version) : undefined,
		}	
	} catch (err) {
		return null
	}
}

module.exports = {
	parseRelease,
	getLastVersionFromRemote,
	isVersion,
}