import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { getRandom } from '../../../util/random'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithCOP',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	const Pe = getRandomFloatUnit({
		min: 8,
		max: 15,
		significantDigits: 2,
		unit: 'kW',
	})
	const COP = getRandom(3,5)
	const Pin = Pe.multiply(COP - 1).roundToPrecision()

	return { Pe, Pin }
}

export function getCorrect({ Pe, Pin }) {
	return Pin.add(Pe).divide(Pe).setUnit('').setSignificantDigits(2)
}

export function checkInput(state, input, step, substep) {
	return checkParameter('COP', getCorrect(state), input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
