import type { CatalogAddress, CatalogFolderPath, CatalogUnitAddress } from '../../catalog/index.ts'

import type { CatalogAddressInput, CatalogUnitAddressInput, TranslationFolderPathInput, TranslationGroupPathInput, TranslationScope } from './types.ts'

/*
 * Scope extensions.
 */

// Given an existing parent scope and a given folder path, set up a new scope.
export function resolveFolderScope(parent: TranslationScope, path: TranslationFolderPathInput, extend: boolean): TranslationScope {
	if (parent.catalog) throw new Error('A TranslationFolder cannot be used inside a TranslationCatalog.')
	const folder = normalizePath(path, 'folder path segment')
	return {
		folder: extend ? [...parent.folder, ...folder] : folder,
		group: [],
	}
}

// Given an existing parent scope and a catalog file name, set up a new scope.
export function resolveCatalogScope(parent: TranslationScope, name: string, folder?: CatalogFolderPath): TranslationScope {
	assertPathSegment(name, 'catalog name')
	if (folder) assertFolderPath(folder)
	return {
		folder: folder ? [...folder] : parent.folder,
		catalog: name,
		group: [],
	}
}

// Given an existing parent scope and a group path, set up a new scope.
export function resolveGroupScope(parent: TranslationScope, path: TranslationGroupPathInput, extend: boolean): TranslationScope {
	if (!parent.catalog) throw new Error('A TranslationGroup must be used inside a TranslationCatalog.')
	const group = normalizePath(path, 'group path segment')
	return {
		...parent,
		group: extend ? [...parent.group, ...group] : group,
	}
}

/*
 * Address determination.
 */

// Given an existing scope and potential explicit overrides, resolve the address of a Catalog.
export function resolveCatalogAddress(scope: TranslationScope, input: CatalogAddressInput = {}): CatalogAddress {
	const { folder, catalog } = input
	if (folder !== undefined && catalog === undefined) throw new Error('An explicit catalog folder must be accompanied by a catalog name.')
	if (folder !== undefined) assertFolderPath(folder)
	if (catalog !== undefined) assertPathSegment(catalog, 'catalog name')

	const resolvedCatalog = catalog ?? scope.catalog
	if (!resolvedCatalog) throw new Error('A catalog must be selected through a TranslationCatalog or an explicit catalog name.')
	return {
		folder: folder ?? scope.folder,
		catalog: resolvedCatalog,
	}
}

// Given an existing scope and potential explicit overrides, resolve the address of a Catalog unit.
export function resolveCatalogUnitAddress(scope: TranslationScope, input: CatalogUnitAddressInput): CatalogUnitAddress {
	// Check the input for validity.
	const { catalog, group, id } = input
	assertPathSegment(id, 'catalog unit ID')
	if (catalog !== undefined && group === undefined) throw new Error('A Catalog unit with an explicit catalog must also provide a group.')
	group?.forEach(groupId => assertPathSegment(groupId, 'group ID'))

	// Use the scoped catalog address to fill in the gaps for the input catalog address.
	return {
		...resolveCatalogAddress(scope, input),
		group: group ?? scope.group,
		id,
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
function assertFolderPath(path: CatalogFolderPath): void {
	path.forEach(segment => assertPathSegment(segment, 'folder path segment'))
}

// Normalize a single path segment or path array to an array and verify every segment.
function normalizePath(path: string | readonly string[], description: string): string[] {
	const segments = typeof path === 'string' ? [path] : [...path]
	segments.forEach(segment => assertPathSegment(segment, description))
	return segments
}

// Verify a folder path segment: an acceptable string.
function assertPathSegment(segment: string, description: string): void {
	if (typeof segment !== 'string' || segment.length === 0) throw new Error(`Invalid translation ${description}: expected a non-empty string.`)
	if (segment.includes('/')) throw new Error(`Invalid translation ${description} "${segment}": path segments cannot contain "/".`)
}
