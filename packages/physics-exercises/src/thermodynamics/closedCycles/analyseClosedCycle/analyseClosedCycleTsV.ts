import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { generateState, getSolution as getCycleParameters } from '../calculateClosedCycle/calculateClosedCycleTsV'
import { getSolution as getEnergyParameters } from '../createClosedCycleEnergyOverview/createClosedCycleEnergyOverviewTsV'

export default buildStepExercise({
	metaData: {
		skill: 'analyseClosedCycle',
		...stepsToSetup(['calculateClosedCycle', 'createClosedCycleEnergyOverview', undefined, 'calculateWithCOP']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			eta: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},
	
	generateState,

	getSolution(state) {
		const cycleParameters = getCycleParameters(state)
		const energyParameters = getEnergyParameters(state)
		const { Q12, Q31, Wn } = energyParameters
		const Qin = Q31
		const Qout = Q12.abs()
		const epsilon = Qin.divide(Wn.abs()).setUnit('').setMinimumSignificantDigits(2)
		const COP = epsilon.add(1)
		return { ...energyParameters, ...cycleParameters, choice: 1, Qin, Qout, epsilon, COP }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
			case 2: return compare(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], data)
			case 3: return compare('choice', data)
			default: return compare(['choice', 'epsilon', 'COP'], data)
		}
	},
})
