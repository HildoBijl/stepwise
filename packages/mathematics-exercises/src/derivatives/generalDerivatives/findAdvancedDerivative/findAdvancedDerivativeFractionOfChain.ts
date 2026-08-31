import { sample } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'findAdvancedDerivative',
		...createStepExerciseMetadata([undefined, undefined, ['applyChainRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 2,
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, false).map(func => func.substitute('x', x))
		return { f1, f2, g }
	},

	getSolution(parameters) {
		const { f1, f2, g } = parameters
		const method = 1
		const x = g.collectVariables()[0]
		const f = f1.substitute(x, f2).flatten()
		const h = f.divide(g).flatten()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { ...parameters, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return compareInputs(['f', 'g'], data)
			case 3:
				switch (substep) {
					case 1: return compareInputs('fDerivative', data)
					case 2: return compareInputs('gDerivative', data)
				}
			default: return compareInputs('derivative', data)
		}
	},
})
