import { sample } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metaData: {
		skill: 'findAdvancedDerivative',
		...stepsToSetup([undefined, undefined, ['applyChainRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 3,
		compare: { method: {}, Expression: equivalent },
	},

	generateState() {
		const x = sample(variableSet)
		const [f] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
		const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		return { f, g1, g2 }
	},

	getSolution: {
		dependentFields: ['f', 'g'],

		getStaticSolution(state) {
			const { f, g1, g2 } = state
			const method = 0
			const x = f.getVariables()[0]
			const g = g1.substitute(x, g2).flatten()
			const h = f.multiply(g).flatten()
			return { ...state, method, x, f, g, h }
		},

		// The input dependency is whether or not f and g are switched.
		getInputDependency(input, solution) {
			const f = input.f as typeof solution.f
			const g = input.g as typeof solution.g
			return !!(f && g && solution.f && solution.g && equivalent(f, solution.g) && equivalent(g, solution.f))
		},

		getDynamicSolution(inputDependency, solution) {
			if (!solution.f || !solution.g) throw new Error('Expected the product-rule solution to contain functions f and g.')
			const switched = inputDependency as boolean
			const f = switched ? solution.g : solution.f
			const g = switched ? solution.f : solution.g
			const solutionAdjusted = { ...solution, f, g }
			const fDerivative = f.getDerivative().combine()
			const gDerivative = g.getDerivative().combine()
			const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
			const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
			return { ...solutionAdjusted, switched, fDerivative, gDerivative, derivativeRaw, derivative }
		},
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare(['f', 'g'], data)
			case 3:
				switch (substep) {
					case 1: return compare('fDerivative', data)
					case 2: return compare('gDerivative', data)
				}
			default: return compare('derivative', data)
		}
	},
})
