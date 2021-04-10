const path = require('path')
const fs = require('fs')
const tar = require('tar')

const MAKER_APP_CONFIG_NAME = 'inspecteur_google'

let package

function copyDirContents(dirFrom, dirTo) {
	const entries = fs.readdirSync(dirFrom)
	for (const entry of entries) {
		const from = path.join(dirFrom, entry)
		const to = path.join(dirTo, entry)
		const stats = fs.statSync(from)
		if (stats.isDirectory()) {
			if (!fs.existsSync(to)) {
				fs.mkdirSync(to)
			}
			copyDirContents(from, to)
		} else {
			fs.copyFileSync(from, to)
		}
	}
}

module.exports = {
	packagerConfig: {
		'ignore': [
			"^/src",
			"^/tests",
			"^/renderer2",
			".*.todo",
			"^/\\..*",
			"log.txt"
		],
		"icon": "assets/RoundedAppIcon.icns"
	},
	makers: [
		{
			"name": "@electron-forge/maker-squirrel",
			"config": {
				"name": MAKER_APP_CONFIG_NAME
			}
		},
		{
			"name": "@electron-forge/maker-zip",
			"platforms": [
				"darwin",
				"linux"
			]
		},
		{
			"name": "@electron-forge/maker-deb",
			"config": {}
		},
		{
			"name": "@electron-forge/maker-rpm",
			"config": {}
		}
	],
  hooks: {
		readPackageJson(forgeConfig, pckg) {
			package = pckg
		},
    packageAfterCopy: async (forgeConfig, appPath, electronVersion, platform, arch) => {
			// Removing not needed attributes of package.json
			const packageJSON = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')))
			const toKeep = ['name', 'version', 'licence', 'author', 'main', 'dependencies']
			const obj = {}
			for (const n of toKeep) {
				if (packageJSON[n] !== undefined) {
					obj[n] = packageJSON[n]
				}
			}
			obj['platform'] = `${platform}.${arch}`

			fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(obj, null, 2))

			// Remove empty packages
			const listPackages = fs.readdirSync(path.join(appPath, 'node_modules'))
			for (const name of listPackages) {
				const files = fs.readdirSync(path.join(appPath, 'node_modules', name))
				if (!files.length) {
					fs.rmdirSync(path.join(appPath, 'node_modules', name))
				}
			}
			// Create update package
			console.log('Creating update...')
			const updateFolder = path.join(__dirname, 'out', 'updates', `${package.name}-${package.version}`, `${platform}-${arch}`)
			if (fs.existsSync(updateFolder)) {
				fs.rmdirSync(updateFolder, { recursive: true })
			}
			fs.mkdirSync(updateFolder, { recursive: true })

			copyDirContents(appPath, updateFolder)
			await tar.create({
				gzip: true,
				file: path.join(__dirname, 'out', 'updates', `${package.name}-${package.version}-${platform}-${arch}.tgz`),
				cwd: updateFolder,
			}, ['.'])
			console.log('Creating update... ok')
    }
  }
}