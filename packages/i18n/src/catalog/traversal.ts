import { type Catalog, type CatalogEntry, type CatalogGroup, type CatalogUnit } from './types.ts'
import { type CatalogGroupPath } from './addressing.ts'

export type CatalogUnitVisitor = (unit: CatalogUnit, groupPath: CatalogGroupPath) => void

// Visit every unit in catalog order to call the given function. Provide it with the path of its containing groups.
export function visitCatalogUnits(catalog: Catalog, visitor: CatalogUnitVisitor): void {
	visitEntries(catalog.entries, [], visitor)
}

function visitEntries(entries: readonly CatalogEntry[], groupPath: CatalogGroupPath, visitor: CatalogUnitVisitor): void {
	entries.forEach(entry => {
		if (entry.type === 'unit') visitor(entry, groupPath)
		else visitEntries(entry.entries, [...groupPath, entry.id], visitor)
	})
}

// Return every unit in catalog order.
export function getCatalogUnits(catalog: Catalog): CatalogUnit[] {
	const units: CatalogUnit[] = []
	visitCatalogUnits(catalog, unit => units.push(unit))
	return units
}

// Find the unit with the given ID inside the exact nested group path.
export function findCatalogUnit(catalog: Catalog, groupPath: CatalogGroupPath, id: string): CatalogUnit | undefined {
	let entries = catalog.entries
	for (const groupId of groupPath) {
		const group = entries.find((entry): entry is CatalogGroup => entry.type === 'group' && entry.id === groupId)
		if (!group) return undefined
		entries = group.entries
	}
	return entries.find((entry): entry is CatalogUnit => entry.type === 'unit' && entry.id === id)
}
