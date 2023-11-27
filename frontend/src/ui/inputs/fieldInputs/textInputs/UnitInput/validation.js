import { selectRandomEmpty } from 'ui/eduTools'

export function any() { }
export function nonEmpty(unit) {
	if (unit.isEmpty())
		return selectRandomEmpty()
}
