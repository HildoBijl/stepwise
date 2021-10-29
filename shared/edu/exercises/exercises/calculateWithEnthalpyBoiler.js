import { FloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState } from './calculateWithSpecificQuantitiesBoiler'

export const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerAnd('calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function getCorrect({ Q, m }) {
	Q = Q.simplify()
	q = Q.divide(m).setUnit('kJ/kg')
	wt = new FloatUnit('0 kJ/kg')
	const dh = q.subtract(wt)
	return { Q, m, q, wt, dh }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('q', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('wt', correct, input, data.equalityOptions)
		default:
			return checkParameter('dh', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
