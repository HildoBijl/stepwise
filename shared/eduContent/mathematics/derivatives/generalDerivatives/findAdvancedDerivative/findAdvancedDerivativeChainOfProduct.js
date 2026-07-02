const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findAdvancedDerivative',
	...stepsToSetup([undefined, undefined, ['applyProductRule', 'lookUpElementaryDerivative'], undefined]),
	weight: 3,
	comparison: { method: {}, default: expressionComparisons.equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [fRaw] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
	const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g1, g2 }
}

function getSolution(state) {
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
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'method')
		case 2:
			return performComparison(exerciseData, ['f', 'g'])
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'fDerivative')
				case 2:
					return performComparison(exerciseData, 'gDerivative')
			}
		default:
			return performComparison(exerciseData, 'derivative')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
