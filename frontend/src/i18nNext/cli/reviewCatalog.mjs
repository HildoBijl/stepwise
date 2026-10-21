import { reviewAllCatalogUnits, reviewCatalogUnit } from '@step-wise/i18n/catalog'

import { defaultLanguage, languages } from '../../i18n/settings.ts'
import { readCatalog, writeCatalog } from './catalogFiles.mjs'

// Check the given arguments.
const [locale, catalogPath, ...selection] = process.argv.slice(2)
if (!locale || !catalogPath || selection.length === 0) failWithUsage()
if (!languages.includes(locale) || locale === defaultLanguage) throw new Error(`"${locale}" is not a supported target language.`)

// Load in the referred Catalog.
const catalog = await readCatalog(locale, catalogPath)

// Depending on the "all" flag, update all catalog units or only a specific one.
let reviewedCatalog
let description
if (selection.length === 1 && selection[0] === '--all') {
	reviewedCatalog = reviewAllCatalogUnits(catalog)
	description = `${locale}/${catalogPath}`
} else {
	if (selection.includes('--all')) failWithUsage()
	const id = selection.at(-1)
	const group = selection.slice(0, -1)
	reviewedCatalog = reviewCatalogUnit(catalog, group, id)
	description = `${locale}/${catalogPath}:${[...group, id].join('/')}`
}

// Write the changes to the file. Check if the file contents changed.
if (await writeCatalog(locale, catalogPath, reviewedCatalog)) console.log(`Marked ${description} as reviewed.`)
else console.log(`${description} was already current.`)

// Helper function to end the process, after showing a message on how the command should be used.
function failWithUsage() {
	console.error('Unexpected arguments received. Usage:\n  npm run i18n:review -- <locale> <path/catalog.xlf> [group ...] <unit>\n  npm run i18n:review -- <locale> <path/catalog.xlf> --all')
	process.exit(1)
}
