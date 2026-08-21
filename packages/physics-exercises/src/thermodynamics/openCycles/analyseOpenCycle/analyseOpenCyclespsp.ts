import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

import { generateParameters as generateParametersRaw, getSolution as getCycleParameters } from '../calculateOpenCycle/calculateOpenCyclespsp'
import { getSolution as getEnergyParameters } from '../createOpenCycleEnergyOverview/createOpenCycleEnergyOverviewspsp'

export default buildStepExercise({
	metaData: {
		skill: 'analyseOpenCycle',
		...stepsToSetup(['calculateOpenCycle', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			eta: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const Po = getRandomFloatUnit({ min: 10, max: 30, decimals: 0, unit: 'MW' })
		return { ...generateParametersRaw(), Po }
	},

	getSolution(parameters) {
		const cycleParameters = getCycleParameters(parameters)
		const energyParameters = getEnergyParameters(parameters)
		const { q23, wn } = energyParameters
		const P = parameters.Po.simplify()
		const qin = q23
		const eta = wn.divide(qin).setUnit('').setMinimumSignificantDigits(2)
		const mdot = P.divide(wn).setUnit('kg/s')
		return { ...energyParameters, ...cycleParameters, P, qin, eta, mdot }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], data)
			case 2: return compare(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], data)
			case 3:
				switch (substep) {
					case 1: return compare('eta', data)
					case 2: return compare('mdot', data)
				}
			default: return compare(['eta', 'mdot'], data)
		}
	},
})
