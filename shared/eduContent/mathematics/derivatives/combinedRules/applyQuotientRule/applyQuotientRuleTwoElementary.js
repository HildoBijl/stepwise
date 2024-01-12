const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
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
	const x = selectRandomly(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	const f = fRaw.multiply(c, true).basicClean()
	return { f, g }
}

function getSolution(state) {
	const { f, g } = state
	const x = f.getVariables()[0]
	const h = f.divide(g).removeUseless()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).elementaryClean()
	const derivative = derivativeRaw.advancedCleanDisplay()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
