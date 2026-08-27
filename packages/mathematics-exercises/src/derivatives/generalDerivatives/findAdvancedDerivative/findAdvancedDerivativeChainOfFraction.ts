import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'findAdvancedDerivative',
		...createStepExerciseMetadata([undefined, undefined, ['applyQuotientRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 2,
		comparisons: { method: {}, Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [fRaw] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
		const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, fRaw, g1, g2 }
	},

	getSolution(parameters) {
		const { c, fRaw, g1, g2 } = parameters
		const method = 2
		const f = fRaw.multiplyLeft(c).cancel()
		const g = g1.divide(g2)
		const x = f.collectVariables()[0]
		const h = f.substitute(x, g).flatten()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { ...parameters, method, x, f, g, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
