import FloatUnit, { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerAnd('massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const mdot = getRandomFloatUnit({
		min: 10,
		max: 50,
		decimals: 0,
		unit: 'kg/s',
	})
	const wt = getRandomFloatUnit({
		min: 600,
		max: 1200,
		unit: 'kJ/kg',
	})
	const P = mdot.multiply(wt).setUnit('MW').roundToPrecision()

	return { P, mdot }
}

export function getCorrect({ P, mdot }) {
	P = P.simplify()
	const wt = P.divide(mdot).setUnit('kJ/kg')
	const q = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { P, mdot, q, wt, dh }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('wt', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('q', correct, input, data.equalityOptions)
		default:
			return checkParameter('dh', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
