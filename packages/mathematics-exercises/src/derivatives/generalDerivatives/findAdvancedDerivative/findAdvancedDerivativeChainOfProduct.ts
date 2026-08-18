import { sample, randomInteger } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const variableSet = ['x', 'y', 't']

export default buildStepExercise({
	metaData: {
		skill: 'findAdvancedDerivative',
		...stepsToSetup([undefined, undefined, ['applyProductRule', 'lookUpElementaryDerivative'], undefined]),
		weight: 3,
		compare: { method: {}, Expression: expressionComparisons.equivalent },
	},

	generateState() {
		const x = sample(variableSet)
		const [fRaw] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
		const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, fRaw, g1, g2 }
	},

	getSolution(state) {
		const { c, fRaw, g1, g2 } = state
		const method = 2
		const f = fRaw.multiplyLeft(c).cancel()
		const g = g1.multiply(g2)
		const x = f.getVariables()[0]
		const h = f.substitute(x, g).flatten()
		const fDerivative = f.getDerivative().combine()
		const gDerivative = g.getDerivative().combine()
		const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
		const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
		return { ...state, method, x, f, g, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
