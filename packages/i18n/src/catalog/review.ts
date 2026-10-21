import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/signatures.ts'
import { assertCompatibleMessage } from '../message/compatibility.ts'

import { type Catalog, type CatalogEntry, type CatalogGroup, type CatalogTarget, type CatalogUnit } from './types.ts'
import { type CatalogGroupPath } from './addressing.ts'
import { assertTargetCatalog } from './validation.ts'

/*
 * Review all entries of a Catalog.
 */

// Record that every existing target in a Catalog has been reviewed against its current source snapshot. Units without a target remain missing.
export function reviewAllCatalogUnits(catalog: Catalog): Catalog {
	assertTargetCatalog(catalog)
	const entries = catalog.entries.map(reviewAllEntry)
	return entries.every((entry, index) => entry === catalog.entries[index]) ? catalog : { ...catalog, entries }
}

// Review an entry and everything within it.
function reviewAllEntry(entry: CatalogEntry): CatalogEntry {
	// For a unit, instantly review it.
	if (entry.type === 'unit') return entry.target ? reviewUnit(entry) : entry

	// For a group, review all its contents recursively.
	const entries = entry.entries.map(reviewAllEntry)
	return entries.every((child, index) => child === entry.entries[index]) ? entry : { ...entry, entries }
}

// Apply review to a single Catalog unit.
function reviewUnit(unit: CatalogUnit): CatalogUnit {
	if (!unit.target) throw new Error(`Translation unit "${unit.id}" has no target to review.`)
	assertCompatibleMessage(unit.source, unit.target.message)

	// Check what the target should be.
	const reviewedTarget: CatalogTarget = {
		...unit.target,
		reviewedSourceContentFingerprint: getMessageContentFingerprint(unit.source),
		reviewedSourceStructureFingerprint: getMessageStructureFingerprint(unit.source),
	}

	// If the target matches fingerprints, keep it. Otherwise rebuild the unit with the updated target.
	if (reviewedTarget.reviewedSourceContentFingerprint === unit.target.reviewedSourceContentFingerprint && reviewedTarget.reviewedSourceStructureFingerprint === unit.target.reviewedSourceStructureFingerprint) return unit
	return { ...unit, target: reviewedTarget }
}

/*
 * Review a single entry.
 */

// Record that one existing target has been reviewed against its current source snapshot.
export function reviewCatalogUnit(catalog: Catalog, groupPath: CatalogGroupPath, id: string): Catalog {
	assertTargetCatalog(catalog)
	const result = reviewUnitInEntries(catalog.entries, groupPath, id)
	return result.changed ? { ...catalog, entries: result.entries } : catalog
}

// In a list of entries, zoom in on the given group and unit, marking it as reviewed. Note whether a change was made.
function reviewUnitInEntries(entries: readonly CatalogEntry[], groupPath: CatalogGroupPath, id: string, traversedPath: CatalogGroupPath = []): { entries: readonly CatalogEntry[], changed: boolean } {
	// If we're in the right group, find the entry and update it.
	if (groupPath.length === 0) {
		// If the entry doesn't exist, throw an error.
		const index = entries.findIndex(entry => entry.type === 'unit' && entry.id === id)
		if (index === -1) throw new Error(`Could not find translation unit "${[...traversedPath, id].join('/')}".`)

		// Review the unit and update the list if needed.
		const reviewedUnit = reviewUnit(entries[index] as CatalogUnit)
		if (reviewedUnit === entries[index]) return { entries, changed: false }
		const updatedEntries = [...entries]
		updatedEntries[index] = reviewedUnit
		return { entries: updatedEntries, changed: true }
	}

	// Find the next group and recurse into it.
	const [groupId, ...remainingPath] = groupPath
	const index = entries.findIndex(entry => entry.type === 'group' && entry.id === groupId)
	if (index === -1) throw new Error(`Could not find translation group "${[...traversedPath, groupId].join('/')}".`)
	const group = entries[index] as CatalogGroup

	// Apply the review and check if anything changed.
	const result = reviewUnitInEntries(group.entries, remainingPath, id, [...traversedPath, groupId])
	if (!result.changed) return { entries, changed: false }
	const updatedEntries = [...entries]
	updatedEntries[index] = { ...group, entries: result.entries }
	return { entries: updatedEntries, changed: true }
}
