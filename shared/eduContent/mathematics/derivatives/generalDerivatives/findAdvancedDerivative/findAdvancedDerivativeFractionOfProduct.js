const { sample } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findAdvancedDerivative',
	...stepsToSetup([undefined, undefined, ['applyProductRule', 'lookUpElementaryDerivative'], undefined]),
	weight: 2,
	comparison: { method: {}, default: expressionComparisons.equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, false).map(func => func.substitute('x', x))
	return { f1, f2, g }
}

function getSolution(state) {
	const { f1, f2, g } = state
	const method = 1
	const f = f1.multiply(f2).flatten()
	const h = f.divide(g).flatten()
	const x = f.getVariables()[0]
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...state, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
