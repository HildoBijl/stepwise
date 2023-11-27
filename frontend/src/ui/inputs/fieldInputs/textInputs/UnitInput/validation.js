import { selectRandomEmpty } from '../../../util'

export function any() { }
export function nonEmpty(unit) {
	if (unit.isEmpty())
		return selectRandomEmpty()
}
