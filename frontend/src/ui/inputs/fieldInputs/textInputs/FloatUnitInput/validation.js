import { selectRandomMissingUnit } from 'ui/edu/exercises/feedbackMessages'

export function any() { }
export function nonEmptyUnit(floatUnit) {
	if (floatUnit.unit.isEmpty())
		return selectRandomMissingUnit()
}
