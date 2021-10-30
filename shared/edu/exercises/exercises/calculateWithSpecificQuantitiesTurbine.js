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
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const m = getRandomFloatUnit({
		min: 2,
		max: 10,
		unit: 'Mg',
		significantDigits: 2,
	})

	return { wt, m }
}

export function getCorrect({ wt, m }) {
	wt = wt.simplify()
	m = m.simplify()
	const Wt = wt.multiply(m).setUnit('J')
	return { wt, m, Wt }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('Wt', correct, input, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
