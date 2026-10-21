import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'

import { parseXliff, serializeXliff } from '@step-wise/i18n/xliff'

export const catalogRoot = resolve(import.meta.dirname, '../../../locales')

/*
 * Obtaining file names.
 */

// Find every XLIFF Catalog below a locale folder, returning portable relative paths.
export async function findCatalogPaths(locale) {
	const localeRoot = join(catalogRoot, locale)
	return (await findXliffFiles(localeRoot)).map(file => relative(localeRoot, file).split(sep).join('/')).sort()
}

// Obtain all the XLIFF files in the given directory, also within subfolders. Return as a single list of all pathed filenames.
async function findXliffFiles(directory) {
	// Load in the contents of the directory.
	let entries
	try {
		entries = await readdir(directory, { withFileTypes: true })
	} catch (error) {
		if (error?.code === 'ENOENT') return []
		throw error
	}

	// Add files to the list, and recursively dive into folders to add those too.
	const files = await Promise.all(entries.map(entry => {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) return findXliffFiles(path)
		return entry.isFile() && entry.name.endsWith('.xlf') ? [path] : []
	}))
	return files.flat()
}

// Based on a locale and generalized path, obtain the file server's Catalog's file path.
function getCatalogFile(locale, path) {
	return join(catalogRoot, locale, ...path.split('/'))
}

/*
 * Reading files.
 */

// Get the contents of a Catalog file as a Catalog object.
export async function readCatalog(locale, path) {
	return parseXliff(await readFile(getCatalogFile(locale, path), 'utf8'))
}

/*
 * Writing files.
 */

// Write a Catalog object into a given file. Return a boolean: whether the file was updated due to differences found.
export async function writeCatalog(locale, path, catalog) {
	// Load in the current contents of the file.
	const file = getCatalogFile(locale, path)
	let currentContents
	try {
		currentContents = await readFile(file, 'utf8')
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error
	}

	// Compare the Catalog's contents with the file's contents. On a match, don't write.
	const contents = serializeXliff(catalog)
	if (currentContents === contents) return false

	// Make sure the folder and file exist and write the contents to it.
	await mkdir(dirname(file), { recursive: true })
	await writeFile(file, contents, 'utf8')
	return true
}
