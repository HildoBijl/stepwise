import { sample } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const { areEquivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'findAdvancedDerivative',
		...createStepExerciseMetadata([undefined, undefined, ['applyChainRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 3,
		comparisons: { method: {}, Expression: areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
		const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		return { f, g1, g2 }
	},

	getSolution: {
		dependentFields: ['f', 'g'],

		getStaticSolution(parameters) {
			const { f, g1, g2 } = parameters
			const method = 0
			const x = f.collectVariables()[0]
			const g = g1.substitute(x, g2).flatten()
			const h = f.multiply(g).flatten()
			return { ...parameters, method, x, f, g, h }
		},

		// The input dependency is whether or not f and g are switched.
		getInputDependency(input, solution) {
			const f = input.f as typeof solution.f
			const g = input.g as typeof solution.g
			return !!(f && g && solution.f && solution.g && areEquivalent(f, solution.g) && areEquivalent(g, solution.f))
		},

		getDynamicSolution(inputDependency, solution) {
			if (!solution.f || !solution.g) throw new Error('Expected the product-rule solution to contain functions f and g.')
			const switched = inputDependency as boolean
			const f = switched ? solution.g : solution.f
			const g = switched ? solution.f : solution.g
			const solutionAdjusted = { ...solution, f, g }
			const fDerivative = f.differentiate().combine()
			const gDerivative = g.differentiate().combine()
			const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
			const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
			return { ...solutionAdjusted, switched, fDerivative, gDerivative, derivativeRaw, derivative }
		},
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
