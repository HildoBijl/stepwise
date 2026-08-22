import { sample } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunction } from '../../tools'

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

export default buildMonoExercise({
	metaData: {
		skill: 'lookUpElementaryDerivative',
		compare: { Expression: expressionComparisons.equivalent },
	},

	generateParameters() {
		const func = getRandomElementaryFunction(true)
		const x = sample(variableSet)
		return { x, f: sample(functionSet), func: func.substitute('x', x) }
	},

	getSolution(parameters) {
		return { ...parameters, derivative: parameters.func.getDerivative().combine() }
	},

	checkInput(data) {
		return compare('derivative', data)
	},
})
