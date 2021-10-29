import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithSpecificQuantities',
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const rho = getRandomFloatUnit({
		min: 0.4,
		max: 1.2,
		unit: 'kg/m^3',
		significantDigits: 2,
	})

	return { rho }
}

export function getCorrect({ rho }) {
	const v = rho.invert()
	return { rho, v }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('v', correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
