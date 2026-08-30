import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { generateParameters, getSolution as getSolutionPrevious } from '../calculateEntropyChange/calculateEntropyChangeIsotherm.ts'

export default buildStepExercise({
	metadata: {
		skill: 'calculateMissedWork',
		...createStepExerciseMetadata(['calculateEntropyChange', 'solveLinearEquation']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters,

	getSolution(parameters) {
		const solution = getSolutionPrevious(parameters)
		const Wm = solution.dS.multiply(solution.Tc).setUnit('J')
		return { ...solution, Wm }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('dS', data)
			default: return compareInputs('Wm', data)
		}
	},
})
