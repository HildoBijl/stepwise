import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { generateParameters, getSolution as getCycleParameters } from '../calculateClosedCycle/calculateClosedCycleVTp'
import { getSolution as getEnergyParameters } from '../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewVTp'

export default buildStepExercise({
	metadata: {
		skill: 'analyseClosedCycle',
		...createStepExerciseMetadata(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithEfficiency']),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			eta: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},
	
	generateParameters,

	getSolution(parameters) {
		const cycleParameters = getCycleParameters(parameters)
		const energyParameters = getEnergyParameters(parameters)
		const { Q12, Q23, Wn } = energyParameters
		const Qin = Q12.add(Q23).setMinimumSignificantDigits(2)
		const eta = Wn.divide(Qin).setUnit('')
		return { ...energyParameters, ...cycleParameters, choice: 0, Qin, eta }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
			case 2: return compareInputs(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], data)
			case 3: return compareInputs('choice', data)
			default: return compareInputs(['choice', 'eta'], data)
		}
	},
})
