import { selectRandomNegative } from 'util/feedbackMessages'

export function any() { }
export function positive(number) {
	if (number < 0)
		return selectRandomNegative()
}
