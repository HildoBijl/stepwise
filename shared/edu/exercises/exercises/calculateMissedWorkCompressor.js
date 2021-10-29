import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState, getCorrect as getCorrectPrevious } from './calculateEntropyChangeWithProperties'

export const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('poissonsLaw', combinerRepeat('calculateEntropyChange', 2), 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', null, 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

export function getCorrect(state) {
	const correct = getCorrectPrevious(state)
	let { T1, T2, ds: dsIn, c } = correct
	dsIn = dsIn.setDecimals(0)
	const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
	const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
	const ds = dsIn.add(dsOut)
	const wm = T1.multiply(ds).setUnit('J/kg')
	return { ...correct, q, dsIn, dsOut, ds, wm }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('dsIn', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('q', correct, input, data.equalityOptions)
		case 4:
			return checkParameter('dsOut', correct, input, data.equalityOptions)
		case 5:
			return checkParameter('ds', correct, input, data.equalityOptions)
		default:
			return checkParameter('wm', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
