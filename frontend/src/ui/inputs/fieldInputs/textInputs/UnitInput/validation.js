import { selectRandomEmpty } from 'ui/edu/exercises/feedbackMessages'

export function any() { }
export function nonEmpty(unit) {
	if (unit.isEmpty())
		return selectRandomEmpty()
}
