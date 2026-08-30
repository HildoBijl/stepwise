import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getRandomElementaryFunctions, getElementaryFunctionFromTerm } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

export default buildStepExercise({
	metadata: {
		skill: 'findBasicDerivative',
		...createStepExerciseMetadata([[undefined, undefined], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], undefined]),
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const [f1, f2] = getRandomElementaryFunctions(2, false)
			const x = sample(variableSet)
			const c1 = randomInteger(-12, 12, { exclude: [0] })
			const c2 = randomInteger(-12, 12, { exclude: [0] })
			const func = f1.multiplyLeft(c1).add(f2.multiplyLeft(c2)).substitute('x', x).cancel(['combineProductFractions']) // Do not turn 10 * 10^x into 10^(x+1).
			if (func.isSum() && func.terms.length === 2) return { x, f: sample(functionSet), func }
		}
		throw new Error('Failed to generate a derivative containing two distinct terms after 100 attempts.')
	},

	getSolution(parameters) {
		const { func } = parameters
		if (!func.isSum()) throw new Error('Expected a sum containing two elementary-function terms.')
		const { constant: c1, func: f1 } = getElementaryFunctionFromTerm(func.terms[0])
		const { constant: c2, func: f2 } = getElementaryFunctionFromTerm(func.terms[1])
		const f1Derivative = f1.differentiate().combine().sort()
		const f2Derivative = f2.differentiate().combine().sort()
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
