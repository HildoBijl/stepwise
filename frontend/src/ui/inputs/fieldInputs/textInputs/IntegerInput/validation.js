import { selectRandomNegative } from '../../../util'

export function any() { }
export function positive(number) {
	if (number < 0)
		return selectRandomNegative()
}
