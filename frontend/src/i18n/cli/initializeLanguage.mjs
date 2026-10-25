import { synchronizeCatalog } from '@step-wise/i18n/catalog'
import { isValidLocale } from '@step-wise/i18n/locale'

import { defaultLanguage, languages } from '../settings.ts'

import { findCatalogPaths, readCatalog, writeCatalog } from './catalogFiles.mjs'

// Validate and canonicalize the requested locale.
const [localeInput, ...unexpectedArguments] = process.argv.slice(2)
if (!localeInput || unexpectedArguments.length > 0) failWithUsage()
if (!isValidLocale(localeInput)) throw new Error(`"${localeInput}" is not a valid locale.`)
const locale = Intl.getCanonicalLocales(localeInput)[0]
if (locale === defaultLanguage) throw new Error(`"${locale}" is the source locale.`)
if (languages.includes(locale)) throw new Error(`"${locale}" is already a configured language.`)

// Refuse to overwrite even an unconfigured locale that already has Catalog files.
const existingCatalogPaths = await findCatalogPaths(locale)
if (existingCatalogPaths.length > 0) throw new Error(`Cannot initialize "${locale}": ${existingCatalogPaths.length} Catalog file${existingCatalogPaths.length === 1 ? '' : 's'} already exist.`)

// Read and validate every source Catalog before writing any target files.
const catalogPaths = await findCatalogPaths(defaultLanguage)
if (catalogPaths.length === 0) throw new Error(`No source Catalogs were found for "${defaultLanguage}".`)
const sourceCatalogs = await Promise.all(catalogPaths.map(async path => ({ path, catalog: await readCatalog(defaultLanguage, path) })))

// Initialize every target Catalog from its source, without adding translations.
for (const { path, catalog } of sourceCatalogs) {
	await writeCatalog(locale, path, synchronizeCatalog(catalog, locale))
	console.log(`Created ${locale}/${path}`)
}

// Report on the outcome of the process.
console.log(`Initialized ${sourceCatalogs.length} Catalog${sourceCatalogs.length === 1 ? '' : 's'} for "${locale}".`)
console.log(`Next: add "${locale}" to frontend/src/i18n/settings.ts, translate and review its targets, then run npm run i18n:check.`)

// End the process after showing how the command should be used.
function failWithUsage() {
	console.error('Unexpected arguments received. Usage:\n  npm run i18n:init -- <locale>')
	process.exit(1)
}
