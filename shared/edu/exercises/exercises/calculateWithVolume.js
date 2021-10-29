import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomExponentialFloatUnit } from '../../../inputTypes/FloatUnit'
import { Unit } from '../../../inputTypes/Unit'
import { selectRandomly } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// Type 0: from (c/d/.)m^3 to liter.
// Type 1: from (c/d/.)m^3 to SI (so m^3: which it may already be in).
// Type 2: from liter to m^3.
// Type 3: from liter to SI (so m^3).

export const data = {
	skill: 'calculateWithVolume',
	equalityOptions: {
		relativeMargin: 0.001,
		significantDigitMargin: 0,
		unitCheck: Unit.equalityTypes.exact,
	},
}

export function generateState() {
	let V = getRandomExponentialFloatUnit({
		min: 1e-5,
		max: 1e2,
		significantDigits: getRandomInteger(2, 3),
		unit: 'm^3',
	})

	const type = getRandomInteger(0, 3)
	if (type < 2) {
		const prefix = selectRandomly(['', 'd', 'c'])
		V = V.setUnit(`${prefix}m^3`)
	} else {
		V = V.setUnit('l')
	}

	return { V, type }
}

export function getCorrect({ V, type }) {
	V = V.simplify()
	return (type === 0 ? V.setUnit('l') : V)
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
