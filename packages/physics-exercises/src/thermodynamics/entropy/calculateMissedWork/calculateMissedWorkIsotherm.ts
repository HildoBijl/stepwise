import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { generateParameters, getSolution as getSolutionPrevious } from '../calculateEntropyChange/calculateEntropyChangeIsotherm'

export default buildStepExercise({
	metaData: {
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
			case 1: return compare('dS', data)
			default: return compare('Wm', data)
		}
	},
})
