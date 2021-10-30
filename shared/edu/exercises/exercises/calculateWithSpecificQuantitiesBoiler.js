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
	const q = getRandomFloatUnit({
		min: 150,
		max: 250,
		unit: 'kJ/kg',
	})
	const Q = getRandomFloatUnit({
		min: 100,
		max: 200,
		decimals: -1,
		unit: 'MJ',
	}).setDecimals(0)
	const m = Q.divide(q).setUnit('kg').setDecimals(-1).roundToPrecision().setDecimals(0)

	return { Q, m }
}

export function getCorrect({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('J/kg')
	return { Q, m, q }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('q', correct, input, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
