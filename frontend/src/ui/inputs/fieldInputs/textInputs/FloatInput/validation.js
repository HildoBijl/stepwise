import { selectRandomNegative } from '../../../util'

export function any() { }
export function positive(float) {
	if (float.number < 0)
		return selectRandomNegative()
}
