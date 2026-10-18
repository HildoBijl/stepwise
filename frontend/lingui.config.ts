import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-po'

const sourceDirectory = fileURLToPath(new URL('./src', import.meta.url))
const messageIdCollator = new Intl.Collator('en', { numeric: true })

export default defineConfig({
	sourceLocale: 'en',
	locales: ['en', 'nl', 'de'],
	fallbackLocales: { default: 'en' },
	catalogs: findTranslationCatalogs(sourceDirectory),
	orderBy: (first, second) => messageIdCollator.compare(first.messageId, second.messageId),
	format: formatter({ lineNumbers: false }),
	macro: {
		jsxPlaceholderAttribute: '_t',
		jsxPlaceholderDefaults: {
			a: 'link',
			em: 'emphasis',
			strong: 'strong',
		},
	},
})

function findTranslationCatalogs(directory: string) {
	const catalogs = new Map<string, { path: string, include: string[] }>()
	findSourceFiles(directory).forEach(file => {
		const source = readFileSync(file, 'utf8')
		const paths = source.matchAll(/<TranslationCatalog\s+path=["']([^"']+)["']/g)
		for (const [, path] of paths) {
			if (!path) continue
			const include = catalogSource(file)
			const existingCatalog = catalogs.get(path)
			if (existingCatalog && existingCatalog.include[0] !== include)
				throw new Error(`Translation catalog "${path}" is declared in multiple source locations.`)
			catalogs.set(path, { path: `<rootDir>/locales/{locale}/${path}`, include: [include] })
		}
	})
	return [...catalogs.values()]
}

function findSourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) return findSourceFiles(path)
		return ['.js', '.jsx', '.ts', '.tsx'].includes(extname(entry.name)) ? [path] : []
	})
}

function catalogSource(file: string): string {
	const fileName = basename(file, extname(file)).toLowerCase()
	const directory = dirname(file)
	return fileName === basename(directory).toLowerCase() ? directory : file
}
