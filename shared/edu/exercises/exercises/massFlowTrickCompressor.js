import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'massFlowTrick',
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const wt = getRandomFloatUnit({
		min: 200,
		max: 360,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 100,
		unit: 'g/s',
		significantDigits: 2,
	})
	const P = mdot.multiply(wt).setUnit('kW').roundToPrecision()

	return { mdot, P }
}

export function getCorrect({ mdot, P }) {
	mdot = mdot.simplify()
	P = P.simplify()
	const wt = P.divide(mdot).setUnit('J/kg')
	return { mdot, P, wt }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('wt', correct, input, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
