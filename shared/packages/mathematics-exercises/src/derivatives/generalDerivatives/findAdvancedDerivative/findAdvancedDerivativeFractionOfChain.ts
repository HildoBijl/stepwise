import { sample } from '@step-wise/utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metaData: {
		skill: 'findAdvancedDerivative',
		...stepsToSetup([undefined, undefined, ['applyChainRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 2,
		compare: { method: {}, Expression: expressionComparisons.equivalent },
	},

	generateState() {
		const x = sample(variableSet)
		const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, false).map(func => func.substitute('x', x))
		return { f1, f2, g }
	},

	getSolution(state) {
		const { f1, f2, g } = state
		const method = 1
		const x = g.getVariables()[0]
		const f = f1.substitute(x, f2).flatten()
		const h = f.divide(g).flatten()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...state, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
