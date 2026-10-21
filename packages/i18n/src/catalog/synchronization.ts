import { getMessageContentSignature, getMessageStructureSignature } from '../message/signatures.ts'
import { validateMessageCompatibility } from '../message/compatibility.ts'
import { type Catalog, type CatalogEntry, type CatalogGroup, type CatalogUnit } from './types.ts'
import { getCatalogUnitStatus } from './status.ts'
import { assertSourceCatalog, assertTargetCatalog } from './validation.ts'

/*
 * Applying synchronization.
 */

// Bring a target Catalog's source snapshots and hierarchy in line with a source Catalog. Existing targets and entries absent from the source are deliberately retained.
export function synchronizeCatalog(sourceCatalog: Catalog, targetLocale: string, targetCatalog?: Catalog): Catalog {
	assertCatalogPair(sourceCatalog, targetLocale, targetCatalog)
	return {
		sourceLocale: sourceCatalog.sourceLocale,
		targetLocale,
		entries: synchronizeEntries(sourceCatalog.entries, targetCatalog?.entries ?? [], '$.entries'),
	}
}

// Match the entries of a target to those of its source.
function synchronizeEntries(sourceEntries: readonly CatalogEntry[], targetEntries: readonly CatalogEntry[], path: string): CatalogEntry[] {
	// Iterate over the source's entries to ensure they're all in the target.
	const synchronizedEntries = sourceEntries.map(sourceEntry => {
		// If the target doesn't have the respective entry yet, create it.
		const targetEntry = targetEntries.find(entry => entry.id === sourceEntry.id)
		if (!targetEntry) return sourceEntry.type === 'group' ? { ...sourceEntry, entries: synchronizeEntries(sourceEntry.entries, [], `${path}.${sourceEntry.id}`) } : sourceEntry

		// On a group, recursively enter it.
		if (targetEntry.type !== sourceEntry.type) throw new Error(`${path}.${sourceEntry.id}: A source ${sourceEntry.type} conflicts with a target ${targetEntry.type}.`)
		if (sourceEntry.type === 'group') return { ...targetEntry, entries: synchronizeEntries(sourceEntry.entries, (targetEntry as CatalogGroup).entries, `${path}.${sourceEntry.id}`) }

		// On a unit, apply the source.
		return { ...targetEntry, source: sourceEntry.source }
	})

	// Add in unmachted entries too, to not delete anything.
	const sourceIds = new Set(sourceEntries.map(entry => entry.id))
	return [...synchronizedEntries, ...targetEntries.filter(entry => !sourceIds.has(entry.id))]
}

// Check that the two catalogs have matching locales that the target can be matched to the source.
function assertCatalogPair(sourceCatalog: Catalog, targetLocale: string, targetCatalog?: Catalog): void {
	assertSourceCatalog(sourceCatalog)
	if (!targetCatalog) return
	assertTargetCatalog(targetCatalog)
	if (targetCatalog.sourceLocale !== sourceCatalog.sourceLocale) throw new Error(`Target Catalog source locale "${targetCatalog.sourceLocale}" does not match "${sourceCatalog.sourceLocale}".`)
	if (targetCatalog.targetLocale !== targetLocale) throw new Error(`Expected target locale "${targetLocale}", but received "${targetCatalog.targetLocale}".`)
}

/*
 * Validation of synchronization.
 */

export type CatalogSynchronizationIssue = {
	path: string
	message: string
}

// Report whether a target Catalog has all current source snapshots and reviewed translations. Entries absent from the source are deliberately ignored.
export function validateCatalogSynchronization(sourceCatalog: Catalog, targetCatalog: Catalog): CatalogSynchronizationIssue[] {
	const issues: CatalogSynchronizationIssue[] = []

	// Check the locale settings.
	if (sourceCatalog.targetLocale) issues.push({ path: '$.targetLocale', message: 'The source Catalog must not have a target locale.' })
	if (!targetCatalog.targetLocale) issues.push({ path: '$.targetLocale', message: 'The target Catalog must have a target locale.' })
	if (targetCatalog.sourceLocale !== sourceCatalog.sourceLocale) issues.push({ path: '$.sourceLocale', message: `Expected source locale "${sourceCatalog.sourceLocale}", but received "${targetCatalog.sourceLocale}".` })

	// Check the entries.
	validateSynchronizedEntries(sourceCatalog.entries, targetCatalog.entries, '$.entries', issues)
	return issues
}

// Compare the entries of the source and the target to find potential issues.
function validateSynchronizedEntries(sourceEntries: readonly CatalogEntry[], targetEntries: readonly CatalogEntry[], path: string, issues: CatalogSynchronizationIssue[]): void {
	sourceEntries.forEach(sourceEntry => {
		const entryPath = `${path}.${sourceEntry.id}`

		// Note when the target is missing the entry.
		const targetEntry = targetEntries.find(entry => entry.id === sourceEntry.id)
		if (!targetEntry) {
			issues.push({ path: entryPath, message: `Missing translated ${sourceEntry.type}.` })
			return
		}

		// Note when there is a structural issue. (Very rare.)
		if (targetEntry.type !== sourceEntry.type) {
			issues.push({ path: entryPath, message: `Expected a ${sourceEntry.type}, but found a ${targetEntry.type}.` })
			return
		}

		// Recurse into groups.
		if (sourceEntry.type === 'group') {
			validateSynchronizedEntries(sourceEntry.entries, (targetEntry as CatalogGroup).entries, `${entryPath}.entries`, issues)
			return
		}

		// Check the unit.
		validateSynchronizedUnit(sourceEntry, targetEntry as CatalogUnit, entryPath, issues)
	})
}

// Check if a source unit matches its target unit.
function validateSynchronizedUnit(sourceUnit: CatalogUnit, targetUnit: CatalogUnit, path: string, issues: CatalogSynchronizationIssue[]): void {
	// Check if there are recent changes in the source, that have not been applied to the source tag yet: the signatures mismatch.
	const contentMatches = getMessageContentSignature(sourceUnit.source) === getMessageContentSignature(targetUnit.source)
	const structureMatches = getMessageStructureSignature(sourceUnit.source) === getMessageStructureSignature(targetUnit.source)
	if (!contentMatches || !structureMatches) {
		issues.push({ path: `${path}.source`, message: 'The target Catalog contains an outdated source snapshot.' })
	}

	// Check whether the translation is semantically compatible with the latest source.
	if (targetUnit.target) issues.push(...validateMessageCompatibility(sourceUnit.source, targetUnit.target.message).map(issue => ({ ...issue, path: `${path}.target.message${issue.path.slice(1)}` })))

	// If the source has been updated, but the target has not been adjusted accordingly. This is shown by the status.
	const status = getCatalogUnitStatus(targetUnit)
	if (status !== 'current') issues.push({ path: `${path}.target`, message: `Translation status is ${status}.` })
}
