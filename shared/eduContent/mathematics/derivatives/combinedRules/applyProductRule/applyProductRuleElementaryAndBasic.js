const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'applyProductRule',
	...stepsToSetup([['lookUpElementaryDerivative', 'findBasicDerivative'], undefined]),
	compare: { Expression: expressionComparisons.equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [f, g1, g2] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { f, c, g1, g2 }
}

function getSolution(state) {
	const { f, c, g1, g2 } = state
	const x = f.getVariables()[0]
	const g = g1.add(g2.multiplyLeft(c)).removeTrivial()
	const h = f.multiply(g).removeTrivial()
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...state, x, g, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
