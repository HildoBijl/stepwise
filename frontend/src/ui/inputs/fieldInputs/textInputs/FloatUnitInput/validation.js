import { selectRandomMissingUnit } from '../../../util'

export function any() { }
export function nonEmptyUnit(floatUnit) {
	if (floatUnit.unit.isEmpty())
		return selectRandomMissingUnit()
}
