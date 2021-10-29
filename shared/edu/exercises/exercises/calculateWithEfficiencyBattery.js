import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithEfficiency',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	const E = getRandomFloatUnit({
		min: 15,
		max: 60,
		digits: 0,
		unit: 'kWh',
	}).setSignificantDigits(3)
	const eta = getRandomFloatUnit({
		min: 0.915,
		max: 0.995,
		significantDigits: 3,
		unit: '',
	})
	const Ein = E.divide(eta).roundToPrecision()

	return { E, Ein }
}

export function getCorrect({ E, Ein }) {
	return E.divide(Ein).setUnit('')
}

export function checkInput(state, input, step, substep) {
	return checkParameter('eta', getCorrect(state), input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
