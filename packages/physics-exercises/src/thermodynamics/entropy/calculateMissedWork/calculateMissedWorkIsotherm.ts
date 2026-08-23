import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { generateParameters, getSolution as getSolutionPrevious } from '../calculateEntropyChange/calculateEntropyChangeIsotherm'

export default buildStepExercise({
	metadata: {
		skill: 'calculateMissedWork',
		...createStepExerciseMetadata(['calculateEntropyChange', 'solveLinearEquation']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
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
