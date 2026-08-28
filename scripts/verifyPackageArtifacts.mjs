import { execFileSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'

const npmCli = process.env.npm_execpath
if (!npmCli) throw new Error('npm_execpath is unavailable; run this verification through npm.')
const packageDirectories = (await readdir('packages', { withFileTypes: true }))
	.filter(entry => entry.isDirectory())
	.map(entry => entry.name)
	.sort()

for (const directory of packageDirectories) {
	const manifest = JSON.parse(await readFile(`packages/${directory}/package.json`, 'utf8'))
	const output = execFileSync(process.execPath, [npmCli, 'pack', '--dry-run', '--json', `--workspace=${manifest.name}`], {
		encoding: 'utf8',
	})
	const [artifact] = JSON.parse(output)
	if (!artifact) throw new Error(`npm did not describe an artifact for ${manifest.name}.`)

	const paths = artifact.files.map(file => file.path)
	for (const requiredPath of ['package.json', 'README.md', 'dist/index.js', 'dist/index.d.ts']) {
		if (!paths.includes(requiredPath)) throw new Error(`${manifest.name} is missing ${requiredPath}.`)
	}
	const unexpectedPaths = paths.filter(path => path !== 'package.json' && path !== 'README.md' && !path.startsWith('dist/'))
	if (unexpectedPaths.length > 0) {
		throw new Error(`${manifest.name} contains unexpected files: ${unexpectedPaths.join(', ')}.`)
	}
}

console.log(`Validated ${packageDirectories.length} npm package artifacts.`)
