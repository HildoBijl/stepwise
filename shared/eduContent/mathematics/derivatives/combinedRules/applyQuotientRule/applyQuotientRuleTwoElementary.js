const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'applyQuotientRule',
	steps: [['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	weight: 2,
	comparison: expressionComparisons.equivalent,
}
addSetupFromSteps(metaData)

function generateState() {
	const x = sample(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false, true, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	const f = fRaw.multiplyLeft(c).cancel()
	return { f, g }
}

function getSolution(state) {
	const { f, g } = state
	const x = f.getVariables()[0]
	const h = f.divide(g).removeTrivial()
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).flatten()
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...state, x, h, fDerivative, gDerivative, derivativeRaw, derivative }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
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
