import { selectRandomEmpty } from 'util/feedbackMessages'

export function any() { }
export function nonEmpty(unit) {
	if (unit.isEmpty())
		return selectRandomEmpty()
}
