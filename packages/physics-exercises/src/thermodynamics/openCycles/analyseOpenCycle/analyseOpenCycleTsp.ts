import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

import { generateParameters as generateParametersRaw, getSolution as getCycleParameters } from '../calculateOpenCycle/calculateOpenCycleTsp'
import { getSolution as getEnergyParameters } from '../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewTsp'

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
		const mdoto = getRandomFloatUnit({ min: 1, max: 10, significantDigits: 2, unit: 'g/s' })
		return { ...generateParametersRaw(), mdoto }
	},

	getSolution(parameters) {
		const cycleParameters = getCycleParameters(parameters)
		const energyParameters = getEnergyParameters(parameters)
		const { q31, wn } = energyParameters
		const mdot = parameters.mdoto.simplify()
		const qin = q31
		const epsilon = qin.divide(wn.abs()).setUnit('').setMinimumSignificantDigits(2)
		const COP = epsilon.add(1)
		const Pc = qin.multiply(mdot).setUnit('W')
		return { ...energyParameters, ...cycleParameters, mdot, qin, epsilon, COP, Pc }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'], data)
			case 2: return compareInputs(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], data)
			case 3:
				switch (substep) {
					case 1: return compareInputs(['epsilon', 'COP'], data)
					case 2: return compareInputs('Pc', data)
				}
			default: return compareInputs(['epsilon', 'COP', 'Pc'], data)
		}
	},
})
