import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	setup: combinerAnd('calculateWithSpecificQuantities', 'massFlowTrick'),
	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const rho = getRandomFloatUnit({
		min: 0.35,
		max: 0.6,
		unit: 'kg/m^3',
		significantDigits: 2,
	})
	const mdot = getRandomFloatUnit({
		min: 20,
		max: 80,
		unit: 'kg/s',
		significantDigits: 2,
	})

	return { rho, mdot }
}

export function getCorrect({ rho, mdot }) {
	const v = rho.invert()
	const Vdot = mdot.multiply(v).setUnit('m^3/s')
	return { rho, mdot, v, Vdot }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter('Vdot', correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
