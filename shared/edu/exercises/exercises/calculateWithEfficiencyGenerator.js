import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithEfficiency',
	equalityOptions: { significantDigitMargin: 1 },
}

export function generateState() {
	const P = getRandomFloatUnit({
		min: 2.5,
		max: 20,
		significantDigits: 2,
		unit: 'kW',
	})
	const eta = getRandomFloatUnit({
		min: 0.10,
		max: 0.30,
		significantDigits: 2,
		unit: '',
	})
	const Pin = P.divide(eta).roundToPrecision()

	return { P, Pin }
}

export function getCorrect({ P, Pin }) {
	return P.divide(Pin).setUnit('')
}

export function checkInput(state, input, step, substep) {
	return checkParameter('eta', getCorrect(state), input, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
