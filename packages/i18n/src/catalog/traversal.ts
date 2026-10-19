import { type Catalog, type CatalogEntry, type CatalogUnit } from './types.ts'

export type CatalogUnitVisitor = (unit: CatalogUnit, groupPath: readonly string[]) => void

// Visit every unit in catalog order to call the given function. Provide it with the path of its containing groups.
export function visitCatalogUnits(catalog: Catalog, visitor: CatalogUnitVisitor): void {
	visitEntries(catalog.entries, [], visitor)
}

function visitEntries(entries: readonly CatalogEntry[], groupPath: readonly string[], visitor: CatalogUnitVisitor): void {
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
