import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metaData: {
		skill: 'applyQuotientRule',
		...stepsToSetup([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
		compare: { Expression: expressionComparisons.equivalent },
	},

	generateState() {
		const x = sample(variableSet)
		const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, [0])
		return { c, f1, f2, g }
	},

	getSolution(state) {
		const { c, f1, f2, g } = state
		const x = g.getVariables()[0]
		const f = f1.add(f2.multiplyLeft(c)).removeTrivial()
		const h = f.divide(g).removeTrivial()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).flatten()
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...state, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compare('fDerivative', data)
					case 2: return compare('gDerivative', data)
				}
			default: return compare('derivative', data)
		}
	},
})
