import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions, getElementaryFunctionFromTerm } from '../../tools'

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

export default buildStepExercise({
	metadata: {
		skill: 'findBasicDerivative',
		...createStepExerciseMetadata([[undefined, undefined], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], undefined]),
		comparisons: { Expression: expressionComparisons.equivalent },
	},

	generateParameters() {
		const [f1, f2] = getRandomElementaryFunctions(2, false)
		const x = sample(variableSet)
		const c1 = randomInteger(-12, 12, { exclude: [0] })
		const c2 = randomInteger(-12, 12, { exclude: [0] })
		const func = f1.multiplyLeft(c1).add(f2.multiplyLeft(c2)).substitute('x', x).cancel(['mergeFractionProducts']) // Do not turn 10 * 10^x into 10^(x+1).
		return { x, f: sample(functionSet), func }
	},

	getSolution(parameters) {
		const { func } = parameters
		if (!func.isSum()) throw new Error('Expected a sum containing two elementary-function terms.')
		const { constant: c1, func: f1 } = getElementaryFunctionFromTerm(func.terms[0])
		const { constant: c2, func: f2 } = getElementaryFunctionFromTerm(func.terms[1])
		const f1Derivative = f1.getDerivative().combine().sort()
		const f2Derivative = f2.getDerivative().combine().sort()
		const derivative = c1.multiply(f1Derivative).add(c2.multiply(f2Derivative)).combine()
		return { ...parameters, c1, c2, f1, f2, f1Derivative, f2Derivative, derivative }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('f1', data)
					case 2: return compareInputs('f2', data)
				}
			case 2:
				switch (substep) {
					case 1: return compareInputs('f1Derivative', data)
					case 2: return compareInputs('f2Derivative', data)
				}
			default: return compareInputs('derivative', data)
		}
	},
})
