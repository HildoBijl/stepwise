import { type TranslationFolderPath, type TranslationScope } from './types.ts'

/*
 * Scope extensions.
 */

// Given an existing parent scope and a given folder path, set up a new scope.
export function resolveFolderScope(parent: TranslationScope, path: TranslationFolderPath, extend: boolean): TranslationScope {
	if (parent.catalog) throw new Error('A TranslationFolder cannot be used inside a TranslationCatalog.')
	assertFolderPath(path)
	return {
		folder: extend ? [...parent.folder, ...path] : [...path],
		section: [],
	}
}

// Given an existing parent scope and a catalog file name, set up a new scope.
export function resolveCatalogScope(parent: TranslationScope, name: string, folder?: TranslationFolderPath): TranslationScope {
	assertPathSegment(name, 'catalog name')
	if (folder) assertFolderPath(folder)
	return {
		folder: folder ? [...folder] : parent.folder,
		catalog: name,
		section: [],
	}
}

// Given an existing parent scope and a section ID, set up a new scope.
export function resolveSectionScope(parent: TranslationScope, id: string, extend: boolean): TranslationScope {
	if (!parent.catalog) throw new Error('A TranslationSection must be used inside a TranslationCatalog.')
	assertPathSegment(id, 'section ID')
	return {
		...parent,
		section: extend ? [...parent.section, id] : [id],
	}
}

/*
 * Processing functions.
 */

// Given a translation scope, build the path for the catalog file.
export function getCatalogPath(scope: TranslationScope): string {
	if (!scope.catalog) throw new Error('Cannot determine a catalog path without an active TranslationCatalog.')
	return [...scope.folder, scope.catalog].join('/')
}

/*
 * Input assertion functions.
 */

// Verify a folder path: an array of acceptable strings.
function assertFolderPath(path: TranslationFolderPath): void {
	path.forEach(segment => assertPathSegment(segment, 'folder path segment'))
}

// Verify a folder path segment: an acceptable string.
function assertPathSegment(segment: string, description: string): void {
	if (typeof segment !== 'string' || segment.length === 0) throw new Error(`Invalid translation ${description}: expected a non-empty string.`)
	if (segment.includes('/')) throw new Error(`Invalid translation ${description} "${segment}": path segments cannot contain "/".`)
}
