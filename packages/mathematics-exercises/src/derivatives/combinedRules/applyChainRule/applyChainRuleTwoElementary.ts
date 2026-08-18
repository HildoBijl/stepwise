import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metaData: {
		skill: 'applyChainRule',
		...stepsToSetup([['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], undefined]),
		weight: 2,
		compare: { Expression: expressionComparisons.equivalent },
	},

	generateState() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, [0])
		const f = fRaw.multiplyLeft(c).cancel()
		return { f, g }
	},

	getSolution(state) {
		const { f, g } = state
		const x = f.getVariables()[0]
		const h = f.substitute(x, g).removeTrivial()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative).flatten()
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...state, x, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
