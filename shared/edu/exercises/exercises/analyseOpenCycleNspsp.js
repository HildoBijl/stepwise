import { getStepExerciseProcessor } from '../util/stepExercise'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState as generateStateRaw, getCorrect as getCycleParameters } from './calculateOpenCycleNspsp'
import { getCorrect as getEnergyParameters } from './createOpenCycleEnergyOverviewNspsp'

export const data = {
	skill: 'analyseOpenCycle',
	setup: combinerAnd('calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithCOP', 'massFlowTrick'),
	steps: ['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']],

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

export function generateState() {
	return {
		...generateStateRaw(),
		mdot: getRandomFloatUnit({
			min: 1,
			max: 9,
			significantDigits: 2,
			unit: 'g/s',
		}),
	}
}
export function getCorrect(state) {
	const mdot = state.mdot.simplify()
	const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParameters(state)
	const { cv, cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = getEnergyParameters(state)

	const qin = q41
	const qout = q23.abs()
	const COP = qout.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const epsilon = COP.subtract(1)
	const Ph = qout.multiply(mdot).setUnit('W')
	return { Rs, k, cv, cp, mdot, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn, qin, qout, epsilon, COP, Ph }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], correct, input, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return checkParameter(['epsilon', 'COP'], correct, input, data.equalityOptions)
				case 2:
					return checkParameter(['Ph'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['epsilon', 'COP', 'Ph'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
