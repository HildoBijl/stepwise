import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'findGeneralDerivative',
		...createStepExerciseMetadata([undefined, undefined, 'applyChainRule']),
		weight: 4,
		compare: { method: {}, Expression: expressionComparisons.equivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, fRaw, g }
	},

	getSolution(parameters) {
		const { c, fRaw, g } = parameters
		const method = 2
		const f = fRaw.multiplyLeft(c).cancel()
		const x = f.getVariables()[0]
		const h = f.substitute(x, g).flatten()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...parameters, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return compareInputs(['f', 'g'], data)
			default: return compareInputs('derivative', data)
		}
	},
})
