import { getMessageContentFingerprint, getMessageStructureFingerprint } from '../message/signatures.ts'
import { type CatalogUnit, type CatalogUnitStatus } from './types.ts'

// Determine whether a target is missing or still matches the source against which it was reviewed.
export function getCatalogUnitStatus(unit: CatalogUnit): CatalogUnitStatus {
	if (!unit.target) return 'missing'
	const contentMatches = unit.target.reviewedSourceContentFingerprint === getMessageContentFingerprint(unit.source)
	const structureMatches = unit.target.reviewedSourceStructureFingerprint === getMessageStructureFingerprint(unit.source)
	if (contentMatches && structureMatches) return 'current'
	if (!structureMatches) return 'stale'
	return 'needs-review'
}
