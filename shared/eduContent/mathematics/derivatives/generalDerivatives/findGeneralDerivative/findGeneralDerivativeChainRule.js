const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findGeneralDerivative',
	...stepsToSetup([undefined, undefined, 'applyChainRule']),
	weight: 4,
	compare: { method: {}, Expression: expressionComparisons.equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g }
}

function getSolution(state) {
	const { c, fRaw, g } = state
	const method = 2
	const f = fRaw.multiplyLeft(c).cancel()
	const x = f.getVariables()[0]
	const h = f.substitute(x, g).flatten()
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...state, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('method', data)
		case 2:
			return compare(['f', 'g'], data)
		default:
			return compare('derivative', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
