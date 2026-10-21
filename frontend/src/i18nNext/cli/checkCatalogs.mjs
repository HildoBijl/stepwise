import { validateCatalogSynchronization } from '@step-wise/i18n/catalog'

import { defaultLanguage, languages } from '../../i18n/settings.ts'
import { findCatalogPaths, readCatalog } from './catalogFiles.mjs'

const targetLanguages = languages.filter(language => language !== defaultLanguage)
const catalogPaths = await findCatalogPaths(defaultLanguage)
const problems = []

// Iterate over all Catalog files in the default language's folder.
for (const path of catalogPaths) {
	// Load the source Catalog, and note any problem that may appear.
	let sourceCatalog
	try {
		sourceCatalog = await readCatalog(defaultLanguage, path)
	} catch (error) {
		problems.push(`${defaultLanguage}/${path}: ${getErrorMessage(error)}`)
		continue
	}

	// Iterate over all the other languages. Note any further problems.
	for (const targetLanguage of targetLanguages) {
		try {
			const targetCatalog = await readCatalog(targetLanguage, path)
			if (targetCatalog.targetLocale !== targetLanguage) problems.push(`${targetLanguage}/${path}$.targetLocale: Expected target locale "${targetLanguage}", but received "${targetCatalog.targetLocale ?? 'none'}".`)
			validateCatalogSynchronization(sourceCatalog, targetCatalog).forEach(issue => {
				problems.push(`${targetLanguage}/${path}${issue.path}: ${issue.message}`)
			})
		} catch (error) {
			problems.push(`${targetLanguage}/${path}: ${getErrorMessage(error)}`)
		}
	}
}

// On problems, report them.
if (problems.length > 0) {
	console.error(`Translation Catalog check failed with ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n${problems.map(problem => `- ${problem}`).join('\n')}`)
	process.exitCode = 1
} else {
	console.log(`Checked ${catalogPaths.length} source Catalog${catalogPaths.length === 1 ? '' : 's'} for ${targetLanguages.length} target languages: no discrepancies found.`)
}

// Helper to turn an error into a message.
function getErrorMessage(error) {
	if (error?.code === 'ENOENT') return 'The Catalog file is missing.'
	return error instanceof Error ? error.message : String(error)
}
