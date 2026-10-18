import { type Messages, setupI18n } from '@step-wise/i18n'
import { type Language, defaultLanguage, languages } from '@step-wise/settings'

type CatalogModule = { messages: Messages }

const catalogImports = import.meta.glob<CatalogModule>('../../locales/*/**/*.po')

export const linguiI18n = setupI18n({ locale: defaultLanguage, messages: { [defaultLanguage]: {} } })

export async function loadLinguiCatalog(locale: string, path: string): Promise<Messages> {
	if (!languages.includes(locale as Language)) throw new Error(`Unsupported language: ${locale}`)
	const catalogPath = `../../locales/${locale}/${path}.po`
	const fallbackCatalogPath = `../../locales/${defaultLanguage}/${path}.po`
	const importCatalog = catalogImports[catalogPath] ?? catalogImports[fallbackCatalogPath]
	if (!importCatalog) throw new Error(`Unknown translation catalog: ${path}`)
	return (await importCatalog()).messages
}

export function activateLinguiLanguage(language: string): void {
	if (!languages.includes(language as Language)) throw new Error(`Unsupported language: ${language}`)
	linguiI18n.activate(language)
}
