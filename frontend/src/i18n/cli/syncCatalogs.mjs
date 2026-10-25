import { synchronizeCatalog } from '@step-wise/i18n/catalog'

import { defaultLanguage, languages } from '../settings.ts'

import { findCatalogPaths, readCatalog, writeCatalog } from './catalogFiles.mjs'

const targetLanguages = languages.filter(language => language !== defaultLanguage)
const catalogPaths = await findCatalogPaths(defaultLanguage)
let changedFiles = 0

// Iterate over all Catalog files in the default language's folder.
for (const path of catalogPaths) {
	const sourceCatalog = await readCatalog(defaultLanguage, path)

	// Apply each source file to all other languages.
	for (const targetLanguage of targetLanguages) {
		// Load in the existing target Catalog file, to potentially update it.
		let targetCatalog
		try {
			targetCatalog = await readCatalog(targetLanguage, path)
		} catch (error) {
			if (error?.code !== 'ENOENT') throw error
		}

		// Apply the changes to the given Catalog. (Or create a new one if it doesn't exist.)
		const synchronizedCatalog = synchronizeCatalog(sourceCatalog, targetLanguage, targetCatalog)

		// Write the update to the file. Track if it changed.
		if (await writeCatalog(targetLanguage, path, synchronizedCatalog)) {
			changedFiles++
			console.log(`Synchronized ${targetLanguage}/${path}`)
		}
	}
}

// Report on the changes.
console.log(changedFiles === 0 ? 'All translation Catalogs were already synchronized.' : `Synchronized ${changedFiles} translation Catalog${changedFiles === 1 ? '' : 's'}.`)
