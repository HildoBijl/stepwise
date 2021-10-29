import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState, getCorrect as getCorrectPrevious } from './calculateEntropyChangeIsotherm'

export const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('calculateEntropyChange', 'solveLinearEquation'),
	steps: ['calculateEntropyChange', 'solveLinearEquation'],

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
	const Wm = correct.dS.multiply(correct.Tc).setUnit('J')
	return { ...correct, Wm }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('dS', correct, input, data.equalityOptions)
		default:
			return checkParameter('Wm', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
