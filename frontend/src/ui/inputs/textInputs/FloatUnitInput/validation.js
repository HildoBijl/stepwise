import { selectRandomMissingUnit } from 'util/feedbackMessages'

export function any() { }
export function nonEmptyUnit(floatUnit) {
	if (floatUnit.unit.isEmpty())
		return selectRandomMissingUnit()
}
