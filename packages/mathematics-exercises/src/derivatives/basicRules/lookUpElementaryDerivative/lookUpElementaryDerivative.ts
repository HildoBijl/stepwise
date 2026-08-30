import { sample } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildMonoExercise } from '#exerciseBuilding'

import { getRandomElementaryFunction } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

export default buildMonoExercise({
	metadata: {
		skill: 'lookUpElementaryDerivative',
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const func = getRandomElementaryFunction(true)
		const x = sample(variableSet)
		return { x, f: sample(functionSet), func: func.substitute('x', x) }
	},

	getSolution(parameters) {
		return { ...parameters, derivative: parameters.func.differentiate().combine() }
	},

	checkInput(data) {
		return compareInputs('derivative', data)
	},
})
