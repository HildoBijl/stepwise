import { type Catalog } from '@step-wise/i18n'
import { parseXliff } from '@step-wise/i18n/xliff'

import { type Language, languages } from '../i18n/settings.ts'

const catalogImports = import.meta.glob<string>('../../locales/*/**/*.xlf', { query: '?raw', import: 'default' })

export async function loadCatalog(locale: string, path: string): Promise<Catalog> {
	if (!languages.includes(locale as Language)) throw new Error(`Unsupported language: ${locale}`)
	const catalogPath = `../../locales/${locale}/${path}.xlf`
	const importCatalog = catalogImports[catalogPath]
	if (!importCatalog) throw new Error(`Unknown XLIFF translation catalog: ${path}`)
	return parseXliff(await importCatalog())
}
