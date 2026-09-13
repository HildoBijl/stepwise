import { sample } from '@step-wise/js-utils'
import { type Expression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const { areEquivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metadata: {
		skill: 'findAdvancedDerivative',
		...createStepExerciseMetadata([undefined, undefined, ['applyChainRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 3,
		comparisons: { Expression: areEquivalent },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [f] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
		const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		return { f, g1, g2 }
	},

	getStaticSolution(parameters) {
		const { f, g1, g2 } = parameters
		const method = 0
		const x = f.collectVariables()[0]
		const g = g1.substitute(x, g2).flatten()
		const h = f.multiply(g).flatten()
		return { ...parameters, method, x, f, g, h }
	},

	// The input dependency is whether or not f and g are switched.
	updateInputDependency({ previousInputDependency, staticSolution, input }): boolean | undefined {
		if (input.f === undefined && input.g === undefined) return previousInputDependency
		if (!staticSolution.f || !staticSolution.g) throw new Error('Expected the product-rule static solution to contain functions f and g.')
		const inputF = input.f as Expression | undefined
		const inputG = input.g as Expression | undefined
		return !!(inputF && inputG && areEquivalent(inputF, staticSolution.g) && areEquivalent(inputG, staticSolution.f))
	},

	getSolution(_, inputDependency, staticSolution) {
		if (!staticSolution.f || !staticSolution.g) throw new Error('Expected the product-rule solution to contain functions f and g.')
		const switched = inputDependency ?? false
		const f = switched ? staticSolution.g : staticSolution.f
		const g = switched ? staticSolution.f : staticSolution.g
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { switched, f, g, fDerivative, gDerivative, derivativeRaw, derivative }
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
