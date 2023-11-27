import { selectRandomMissingUnit } from 'ui/eduTools'

export function any() { }
export function nonEmptyUnit(floatUnit) {
	if (floatUnit.unit.isEmpty())
		return selectRandomMissingUnit()
}
