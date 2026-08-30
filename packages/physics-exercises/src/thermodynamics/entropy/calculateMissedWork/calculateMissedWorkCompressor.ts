import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

import { generateParameters, getSolution as getSolutionPrevious } from '../calculateEntropyChange/calculateEntropyChangeWithProperties.ts'

export default buildStepExercise({
	metadata: {
		skill: 'calculateMissedWork',
		...createStepExerciseMetadata(['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', undefined, 'solveLinearEquation']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters,

	getSolution(parameters) {
		const solution = getSolutionPrevious(parameters)
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
			case 1: return compareInputs('T2', data)
			case 2: return compareInputs('dsIn', data)
			case 3: return compareInputs('q', data)
			case 4: return compareInputs('dsOut', data)
			case 5: return compareInputs('ds', data)
			default: return compareInputs('wm', data)
		}
	},
})
