import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'applyChainRule',
		...createStepExerciseMetadata([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
		comparisons: { Expression: expressionComparisons.equivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f, g1, g2] = getRandomElementaryFunctions(3, false, false, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { f, c, g1, g2 }
	},

	getSolution(parameters) {
		const { f, c, g1, g2 } = parameters
		const x = f.getVariables()[0]
		const g = g1.add(g2.multiplyLeft(c)).removeTrivial()
		const h = f.substitute(x, g).removeTrivial()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative).flatten()
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...parameters, x, g, h, fDerivative, gDerivative, derivativeRaw, derivative }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('fDerivative', data)
					case 2: return compareInputs('gDerivative', data)
				}
			default: return compareInputs('derivative', data)
		}
	},
})
