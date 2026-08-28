import { readFile, readdir } from 'node:fs/promises'

const packageDirectories = (await readdir('packages', { withFileTypes: true }))
	.filter(entry => entry.isDirectory())
	.map(entry => entry.name)
	.sort()

const packageNames = await Promise.all(packageDirectories.map(async directory => {
	const manifest = JSON.parse(await readFile(`packages/${directory}/package.json`, 'utf8'))
	if (manifest.type !== 'module') throw new Error(`${manifest.name} is not declared as an ES module.`)
	if (!manifest.exports?.['.']?.import) throw new Error(`${manifest.name} has no public import entry point.`)
	return manifest.name
}))

await Promise.all(packageNames.map(packageName => import(packageName)))

console.log(`Imported ${packageNames.length} package entry points using native Node ESM.`)
