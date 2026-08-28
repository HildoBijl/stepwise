import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'applyProductRule',
		...createStepExerciseMetadata([['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], undefined]),
		weight: 2,
		comparisons: { Expression: expressionComparisons.areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false, true, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		const f = fRaw.multiplyLeft(c).cancel()
		return { f, g }
	},

	getSolution(parameters) {
		const { f, g } = parameters
		const x = f.collectVariables()[0]
		const h = f.multiply(g).removeTrivial()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { ...parameters, x, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
