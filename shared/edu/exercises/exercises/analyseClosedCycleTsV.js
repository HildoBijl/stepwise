import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState, getCorrect as getCycleParameters } from './calculateClosedCycleTsV'
import { getCorrect as getEnergyParameters } from './createClosedCycleEnergyOverviewTsV'

export const data = {
	skill: 'analyseClosedCycle',
	setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithCOP'),
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithCOP'],

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

export function getCorrect(state) {
	const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	const { cv, cp, Q12, W12, Q23, W23, Q31, W31, Wn } = getEnergyParameters(state)

	const Qin = Q31
	const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { Rs, k, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, Qin, epsilon, COP }
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
			return choice === 1
		default:
			if (choice === 0)
				return false
			return checkParameter(['epsilon', 'COP'], correct, input, data.equalityOptions)
	}
}

export default {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCycleParameters,
	getCorrect,
}
