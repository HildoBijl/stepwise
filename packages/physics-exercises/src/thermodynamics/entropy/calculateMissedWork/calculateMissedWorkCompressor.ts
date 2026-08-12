import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { generateState, getSolution as getSolutionPrevious } from '../calculateEntropyChange/calculateEntropyChangeWithProperties'

export default buildStepExercise({
	metaData: {
		skill: 'calculateMissedWork',
		...stepsToSetup(['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', undefined, 'solveLinearEquation']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateState,

	getSolution(state) {
		const solution = getSolutionPrevious(state)
		const { T1, T2, c } = solution
		const dsIn = solution.ds.setDecimals(0)
		const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
		const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
		const ds = dsIn.add(dsOut)
		const wm = T1.multiply(ds).setUnit('J/kg')
		return { ...solution, q, dsIn, dsOut, ds, wm }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('T2', data)
			case 2: return compare('dsIn', data)
			case 3: return compare('q', data)
			case 4: return compare('dsOut', data)
			case 5: return compare('ds', data)
			default: return compare('wm', data)
		}
	},
})
