import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

import { generateState as generateStateRaw, getSolution as getCycleParameters } from '../calculateOpenCycle/calculateOpenCycleNspsp'
import { getSolution as getEnergyParameters } from '../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewNspsp'

export default buildStepExercise({
	metaData: {
		skill: 'analyseOpenCycle',
		...stepsToSetup(['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			epsilon: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			COP: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		const mdoto = getRandomFloatUnit({ min: 1, max: 9, significantDigits: 2, unit: 'g/s' })
		return { ...generateStateRaw(), mdoto }
	},

	getSolution(state) {
		const cycleParameters = getCycleParameters(state)
		const energyParameters = getEnergyParameters(state)
		const { q23, q41, wn } = energyParameters
		const mdot = state.mdoto.simplify()
		const qin = q41
		const qout = q23.abs()
		const COP = qout.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
		const epsilon = COP.subtract(1)
		const Ph = qout.multiply(mdot).setUnit('W')
		return { ...energyParameters, ...cycleParameters, mdot, qin, qout, epsilon, COP, Ph }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], data)
			case 2: return compare(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], data)
			case 3:
				switch (substep) {
					case 1: return compare(['epsilon', 'COP'], data)
					case 2: return compare('Ph', data)
				}
			default: return compare(['epsilon', 'COP', 'Ph'], data)
		}
	},
})
