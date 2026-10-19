import { isValidLocale } from '../locale.ts'
import { type Message } from '../message/types.ts'
import { validateMessage } from '../message/validation.ts'
import { isMessageFingerprint } from '../message/signatures.ts'
import { validateMessageForLocale } from '../message/localeValidation.ts'
import { type Catalog, type CatalogEntry, type CatalogUnit } from './types.ts'

/*
 * Error types.
 */

export type CatalogValidationIssue = {
	path: string
	message: string
}

export class InvalidCatalogError extends Error {
	readonly issues: readonly CatalogValidationIssue[]

	constructor(issues: readonly CatalogValidationIssue[]) {
		super(`Invalid translation catalog:\n${issues.map(issue => `${issue.path}: ${issue.message}`).join('\n')}`)
		this.name = 'InvalidCatalogError'
		this.issues = issues
	}
}

/*
 * Structure validation: what should hold for all catalogs.
 */

// Assume that the catalog is valid and throw with all issues otherwise.
export function assertValidCatalog(catalog: Catalog): void {
	const issues = validateCatalog(catalog)
	if (issues.length > 0) throw new InvalidCatalogError(issues)
}

// Validate the catalog structure, its messages and locale-dependent plural rules.
export function validateCatalog(catalog: Catalog): CatalogValidationIssue[] {
	// Check that the locales exist and are valid. Remember whether they are.
	const issues: CatalogValidationIssue[] = []
	const sourceLocaleIsValid = validateLocale(catalog.sourceLocale, '$.sourceLocale', issues)
	const targetLocaleIsValid = catalog.targetLocale === undefined || validateLocale(catalog.targetLocale, '$.targetLocale', issues)

	// Recursively validate all groups and units.
	validateEntries(catalog.entries, '$.entries', catalog, sourceLocaleIsValid, targetLocaleIsValid, issues)

	// Report on any issues that arose.
	return issues
}

// Validate the entries at one catalog level, including their IDs and any nested entries.
function validateEntries(entries: readonly CatalogEntry[], path: string, catalog: Catalog, sourceLocaleIsValid: boolean, targetLocaleIsValid: boolean, issues: CatalogValidationIssue[]): void {
	const ids = new Set<string>()
	entries.forEach((entry, index) => {
		// Check that every entry has an ID that is unique among its siblings.
		const entryPath = `${path}[${index}]`
		if (!entry.id) issues.push({ path: `${entryPath}.id`, message: `${entry.type === 'group' ? 'Group' : 'Unit'} IDs must not be empty.` })
		if (ids.has(entry.id)) issues.push({ path: `${entryPath}.id`, message: `Duplicate catalog entry "${entry.id}".` })
		ids.add(entry.id)

		// Recurse into groups and validate individual units.
		if (entry.type === 'group') validateEntries(entry.entries, `${entryPath}.entries`, catalog, sourceLocaleIsValid, targetLocaleIsValid, issues)
		else validateUnit(entry, entryPath, catalog, sourceLocaleIsValid, targetLocaleIsValid, issues)
	})
}

// Validate the contents of one catalog unit.
function validateUnit(unit: CatalogUnit, path: string, catalog: Catalog, sourceLocaleIsValid: boolean, targetLocaleIsValid: boolean, issues: CatalogValidationIssue[]): void {
	// Check the message contents, both the structure and locale-related matters.
	addMessageIssues(unit.source, `${path}.source`, issues)
	if (sourceLocaleIsValid) addLocaleMessageIssues(unit.source, catalog.sourceLocale, `${path}.source`, issues)

	// Check the target contents, if a target exists.
	if (!unit.target) return
	if (!catalog.targetLocale) issues.push({ path: `${path}.target`, message: 'Source-only catalogs cannot contain targets.' })
	addMessageIssues(unit.target.message, `${path}.target.message`, issues)
	if (catalog.targetLocale && targetLocaleIsValid) addLocaleMessageIssues(unit.target.message, catalog.targetLocale, `${path}.target.message`, issues)

	// Check the target's fingerprints.
	if (!isMessageFingerprint(unit.target.reviewedSourceContentFingerprint)) issues.push({ path: `${path}.target.reviewedSourceContentFingerprint`, message: 'Fingerprints must contain 16 lowercase hexadecimal characters.' })
	if (!isMessageFingerprint(unit.target.reviewedSourceStructureFingerprint)) issues.push({ path: `${path}.target.reviewedSourceStructureFingerprint`, message: 'Fingerprints must contain 16 lowercase hexadecimal characters.' })
}

/*
 * Support functions.
 */

// Validate a locale setting and add an issue to the given list when not valid.
function validateLocale(locale: string, path: string, issues: CatalogValidationIssue[]): boolean {
	if (isValidLocale(locale)) return true
	issues.push({ path, message: `Invalid locale "${locale}".` })
	return false
}

// Validate a message and add all issues found to the given issues list.
function addMessageIssues(message: Message, path: string, issues: CatalogValidationIssue[]): void {
	issues.push(...validateMessage(message).map(issue => ({ ...issue, path: `${path}${issue.path.slice(1)}` })))
}

// Validate a message for the given locale and add all issues found to the given issues list.
function addLocaleMessageIssues(message: Message, locale: string, path: string, issues: CatalogValidationIssue[]): void {
	issues.push(...validateMessageForLocale(message, locale).map(issue => ({ ...issue, path: `${path}${issue.path.slice(1)}` })))
}
