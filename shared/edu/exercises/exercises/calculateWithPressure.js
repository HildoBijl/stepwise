import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomExponentialFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// Type 0: from Pa to bar.
// Type 1: from Pa to SI (so Pa: which it already is in).
// Type 2: from bar to Pa.
// Type 3: from bar to SI (so Pa).

export const data = {
	skill: 'calculateWithPressure',
	equalityOptions: {
		relativeMargin: 0.001,
		significantDigitMargin: 0,
		unitCheck: Unit.equalityTypes.sameUnits,
	},
}

export function generateState() {
	const type = getRandomInteger(0, 3)
	let p = getRandomExponentialFloatUnit({
		min: 1e3,
		max: 2e7,
		significantDigits: getRandomInteger(2, 3),
		unit: 'Pa',
	})
	if (type >= 2)
		p = p.setUnit('bar')
	return { p, type }
}

export function getCorrect({ p, type }) {
	p = p.simplify()
	return (type === 0 ? p.setUnit('bar') : p)
}

export function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
