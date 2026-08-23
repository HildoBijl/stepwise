import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

import { generateParameters as generateParametersRaw, getSolution as getCycleParameters } from '../calculateOpenCycle/calculateOpenCycleNspsp'
import { getSolution as getEnergyParameters } from '../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewNspsp'

export default buildStepExercise({
	metadata: {
		skill: 'analyseOpenCycle',
		...createStepExerciseMetadata(['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithCOP', 'massFlowTrick']]),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			epsilon: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			COP: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const mdoto = getRandomFloatUnit({ min: 1, max: 9, significantDigits: 2, unit: 'g/s' })
		return { ...generateParametersRaw(), mdoto }
	},

	getSolution(parameters) {
		const cycleParameters = getCycleParameters(parameters)
		const energyParameters = getEnergyParameters(parameters)
		const { q23, q41, wn } = energyParameters
		const mdot = parameters.mdoto.simplify()
		const qin = q41
		const qout = q23.abs()
		const COP = qout.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
		const epsilon = COP.subtract(1)
		const Ph = qout.multiply(mdot).setUnit('W')
		return { ...energyParameters, ...cycleParameters, mdot, qin, qout, epsilon, COP, Ph }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], data)
			case 2: return compareInputs(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], data)
			case 3:
				switch (substep) {
					case 1: return compareInputs(['epsilon', 'COP'], data)
					case 2: return compareInputs('Ph', data)
				}
			default: return compareInputs(['epsilon', 'COP', 'Ph'], data)
		}
	},
})
