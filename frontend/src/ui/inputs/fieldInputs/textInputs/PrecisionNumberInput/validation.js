import { selectRandomNegative } from '../../../util'

export function any() { }
export function positive(precisionNumber) {
	if (precisionNumber.number < 0)
		return selectRandomNegative()
}
