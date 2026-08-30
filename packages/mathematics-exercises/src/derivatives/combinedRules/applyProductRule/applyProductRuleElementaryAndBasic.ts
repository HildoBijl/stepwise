import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'applyProductRule',
		...createStepExerciseMetadata([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f, g1, g2] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { f, c, g1, g2 }
	},

	getSolution(parameters) {
		const { f, c, g1, g2 } = parameters
		const x = f.collectVariables()[0]
		const g = g1.add(g2.multiplyLeft(c)).removeTrivial()
		const h = f.multiply(g).removeTrivial()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
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
