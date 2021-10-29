import { getStepExerciseProcessor } from '../util/stepExercise'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { generateState as generateStateRaw, getCorrect as getCycleParameters } from './calculateOpenCycleTsp'
import { getCorrect as getEnergyParameters } from './createOpenCycleEnergyOverviewTsp'

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
			max: 10,
			significantDigits: 2,
			unit: 'g/s',
		}),
	}
}
export function getCorrect(state) {
	const mdot = state.mdot.simplify()
	const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3 } = getCycleParameters(state)
	const { cv, cp, q12, wt12, q23, wt23, q31, wt31, qn, wn } = getEnergyParameters(state)

	const qin = q31
	const epsilon = qin.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	const Pc = qin.multiply(mdot).setUnit('W')
	return { Rs, k, cv, cp, mdot, p1, v1, T1, p2, v2, T2, p3, v3, T3, q12, wt12, q23, wt23, q31, wt31, qn, wn, qin, epsilon, COP, Pc }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], correct, input, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return checkParameter(['epsilon', 'COP'], correct, input, data.equalityOptions)
				case 2:
					return checkParameter(['Pc'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['epsilon', 'COP', 'Pc'], correct, input, data.equalityOptions)
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
