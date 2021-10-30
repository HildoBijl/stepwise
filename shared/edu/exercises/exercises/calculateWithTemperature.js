import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'

// Type 0: from K to °C.
// Type 1: from K to SI (so K: which it already is in).
// Type 2: from °C to K.
// Type 3: from °C to SI (so K).

export const data = {
	skill: 'calculateWithTemperature',
	equalityOptions: {
		absoluteMargin: 0.2,
		significantDigitMargin: 1,
		unitCheck: Unit.equalityTypes.sameUnits,
	},
}

export function generateState() {
	const type = getRandomInteger(0, 3)
	let T = getRandomFloatUnit({
		min: 0,
		max: 1000,
		decimals: getRandomInteger(0, 1),
		unit: 'K',
	})
	if (type >= 2)
		T = T.setUnit('dC')
	return { T, type }
}

export function getCorrect({ T, type }) {
	T = T.simplify()
	return (type === 0 ? T.setUnit('dC') : T)
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
