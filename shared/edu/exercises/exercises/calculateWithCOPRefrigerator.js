import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { getRandom } from '../../../util/random'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithCOP',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	const Ee = getRandomFloatUnit({
		min: 3,
		max: 8,
		significantDigits: 2,
		unit: 'MJ',
	})
	const epsilon = getRandom(2,4)
	const Eout = Ee.multiply(epsilon + 1).roundToPrecision()

	return { Ee, Eout }
}

export function getCorrect({ Ee, Eout }) {
	return Eout.subtract(Ee).divide(Ee).setUnit('').setSignificantDigits(2)
}

export function checkInput(state, input, step, substep) {
	return checkParameter('epsilon', getCorrect(state), input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
