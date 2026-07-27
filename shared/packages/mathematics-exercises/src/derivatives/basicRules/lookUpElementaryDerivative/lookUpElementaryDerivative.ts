import { sample } from '@step-wise/utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunction } from '../../tools'

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

export default buildSimpleExercise({
	metaData: {
		skill: 'lookUpElementaryDerivative',
		compare: { Expression: expressionComparisons.equivalent },
	},

	generateState() {
		const func = getRandomElementaryFunction(true)
		const x = sample(variableSet)
		return { x, f: sample(functionSet), func: func.substitute('x', x) }
	},

	getSolution(state) {
		return { ...state, derivative: state.func.getDerivative().combine() }
	},

	checkInput(data) {
		return compare('derivative', data)
	},
})
