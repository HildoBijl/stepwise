const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'applyQuotientRule',
	...stepsToSetup([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
	compare: { Expression: expressionComparisons.equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, f1, f2, g }
}

function getSolution(state) {
	const { c, f1, f2, g } = state
	const x = g.getVariables()[0]
	const f = f1.add(f2.multiplyLeft(c)).removeTrivial()
	const h = f.divide(g).removeTrivial()
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).flatten()
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...state, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
}

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return compare('fDerivative', data)
				case 2:
					return compare('gDerivative', data)
			}
		default:
			return compare('derivative', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
