import { selectRandomNegative } from 'ui/eduTools'

export function any() { }
export function positive(number) {
	if (number < 0)
		return selectRandomNegative()
}
