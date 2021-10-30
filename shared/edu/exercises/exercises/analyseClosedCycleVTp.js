import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState, getCorrect as getCycleParameters } from './calculateClosedCycleVTp'
import { getCorrect as getEnergyParameters } from './createClosedCycleEnergyOverviewVTp'

export const data = {
	skill: 'analyseClosedCycle',
	setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithEfficiency'),
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithEfficiency'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		eta: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

export { generateState }

export function getCorrect(state) {
	const { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q31, W31, Wn } = getEnergyParameters(state)

	const Qin = Q12.add(Q23).setMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')
	return { Rs, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, Qin, eta }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	const { choice } = input
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], correct, input, data.equalityOptions)
		case 3:
			return choice === 0
		default:
			if (choice === 1)
				return false
			return checkParameter('eta', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
