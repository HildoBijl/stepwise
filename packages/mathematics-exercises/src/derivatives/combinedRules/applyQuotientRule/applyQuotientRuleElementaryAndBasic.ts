import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'applyQuotientRule',
		...createStepExerciseMetadata([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, f1, f2, g }
	},

	getSolution(parameters) {
		const { c, f1, f2, g } = parameters
		const x = g.collectVariables()[0]
		const f = f1.add(f2.multiplyLeft(c)).removeTrivial()
		const h = f.divide(g).removeTrivial()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).flatten()
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { ...parameters, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
