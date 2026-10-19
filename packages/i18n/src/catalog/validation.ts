import { isValidLocale } from '../locale.ts'
import { type Message } from '../message/types.ts'
import { validateMessage } from '../message/validation.ts'
import { isMessageFingerprint } from '../message/signatures.ts'
import { validateMessageForLocale } from '../message/localeValidation.ts'
import { type Catalog } from './types.ts'

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

	// Iterate over the units and check them.
	const keys = new Set<string>()
	catalog.units.forEach((unit, index) => {
		// Check the unit's ID, path and (when put together) its key.
		const path = `$.units[${index}]`
		if (!unit.id) issues.push({ path: `${path}.id`, message: 'A unit ID is required.' })
		if (unit.groupPath?.some(group => !group)) issues.push({ path: `${path}.groupPath`, message: 'Group IDs must not be empty.' })
		const key = [...unit.groupPath ?? [], unit.id].join('/')
		if (keys.has(key)) issues.push({ path: `${path}.id`, message: `Duplicate catalog unit "${key}".` })
		keys.add(key)

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
	})

	// Report on any issues that arose.
	return issues
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
