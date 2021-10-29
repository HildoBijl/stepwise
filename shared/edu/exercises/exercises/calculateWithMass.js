import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomExponentialFloatUnit } from '../../../inputTypes/FloatUnit'
import { Unit } from '../../../inputTypes/Unit'
import { selectRandomly } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

export const data = {
	skill: 'calculateWithMass',
	equalityOptions: {
		relativeMargin: 0.001,
		significantDigitMargin: 0,
		unitCheck: Unit.equalityTypes.exact,
	},
}

export function generateState() {
	const type = getRandomInteger(0, 2)
	const prefix = selectRandomly(['mu', 'm', '', 'M'])

	let m = getRandomExponentialFloatUnit({
		min: 1e-1,
		max: 1e3,
		significantDigits: getRandomInteger(2, 3),
		unit: `${prefix}g`,
	})

	if (type === 2)
		m = m.setUnit('kg')

	return { m, type, prefix }
}

export function getCorrect({ m, type, prefix }) {
	return (type === 2 ? m.setUnit(`${prefix}g`) : m.setUnit('kg'))
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
