import { selectRandomNegative } from 'util/feedbackMessages'

export function any() { }
export function positive(float) {
	if (float.number < 0)
		return selectRandomNegative()
}
