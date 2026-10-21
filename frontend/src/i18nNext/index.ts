import { type Catalog, type Messages, setupI18n } from '@step-wise/i18n'
import { parseXliff } from '@step-wise/i18n/xliff'

import { type Language, defaultLanguage, languages } from '../i18n/settings.ts'

type CatalogModule = { messages: Messages }

const catalogImports = import.meta.glob<CatalogModule>('../../locales/*/**/*.po')
const xliffCatalogImports = import.meta.glob<string>('../../locales/*/**/*.xlf', { query: '?raw', import: 'default' })

export const linguiI18n = setupI18n({ locale: defaultLanguage, messages: { [defaultLanguage]: {} } })

export async function loadLinguiCatalog(locale: string, path: string): Promise<Messages> {
	if (!languages.includes(locale as Language)) throw new Error(`Unsupported language: ${locale}`)
	const catalogPath = `../../locales/${locale}/${path}.po`
	const fallbackCatalogPath = `../../locales/${defaultLanguage}/${path}.po`
	const importCatalog = catalogImports[catalogPath] ?? catalogImports[fallbackCatalogPath]
	if (!importCatalog) throw new Error(`Unknown translation catalog: ${path}`)
	return (await importCatalog()).messages
}

export async function loadXliffCatalog(locale: string, path: string): Promise<Catalog> {
	if (!languages.includes(locale as Language)) throw new Error(`Unsupported language: ${locale}`)
	const catalogPath = `../../locales/${locale}/${path}.xlf`
	const importCatalog = xliffCatalogImports[catalogPath]
	if (!importCatalog) throw new Error(`Unknown XLIFF translation catalog: ${path}`)
	return parseXliff(await importCatalog())
}

export function activateLinguiLanguage(language: string): void {
	if (!languages.includes(language as Language)) throw new Error(`Unsupported language: ${language}`)
	linguiI18n.activate(language)
}
