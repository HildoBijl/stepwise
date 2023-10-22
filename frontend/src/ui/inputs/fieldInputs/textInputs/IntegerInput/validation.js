import { selectRandomNegative } from 'ui/edu/exercises/feedbackMessages'

export function any() { }
export function positive(number) {
	if (number < 0)
		return selectRandomNegative()
}
