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
	const q = getRandomFloatUnit({
		min: 150,
		max: 250,
		unit: 'kJ/kg',
		decimals: -1,
	}).setDecimals(0)
	const mdot = getRandomFloatUnit({
		min: 0.2,
		max: 1,
		unit: 'kg/s',
		significantDigits: 2,
	})
	const Qdot = mdot.multiply(q).setUnit('kW').roundToPrecision()

	return { q, Qdot }
}

export function getCorrect({ q, Qdot }) {
	q = q.simplify()
	Qdot = Qdot.simplify()
	const mdot = Qdot.divide(q).setUnit('kg/s')
	return { mdot, q, Qdot }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('mdot', correct, input, data.equalityOptions)
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)
