import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'applyQuotientRule',
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
		const h = f.divide(g).removeTrivial()
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).flatten()
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
