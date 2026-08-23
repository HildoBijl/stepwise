import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { generateParameters, getSolution as getCycleParameters } from '../calculateClosedCycle/calculateClosedCycleTsV'
import { getSolution as getEnergyParameters } from '../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewTsV'

export default buildStepExercise({
	metadata: {
		skill: 'analyseClosedCycle',
		...createStepExerciseMetadata(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithCOP']),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			eta: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},
	
	generateParameters,

	getSolution(parameters) {
		const cycleParameters = getCycleParameters(parameters)
		const energyParameters = getEnergyParameters(parameters)
		const { Q12, Q31, Wn } = energyParameters
		const Qin = Q31
		const Qout = Q12.abs()
		const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
		const COP = epsilon.add(1)
		return { ...energyParameters, ...cycleParameters, choice: 1, Qin, Qout, epsilon, COP }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
			case 2: return compareInputs(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], data)
			case 3: return compareInputs('choice', data)
			default: return compareInputs(['choice', 'epsilon', 'COP'], data)
		}
	},
})
