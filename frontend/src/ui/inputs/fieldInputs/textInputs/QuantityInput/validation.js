import { selectRandomMissingUnit } from '../../../util'

export function any() { }
export function nonEmptyUnit(quantity) {
	if (quantity.unit.isEmpty())
		return selectRandomMissingUnit()
}
