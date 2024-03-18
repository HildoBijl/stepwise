const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'applyQuotientRule',
	steps: [['lookUpElementaryDerivative', 'findBasicDerivative'], null],
	comparison: expressionComparisons.equivalent,
}
addSetupFromSteps(metaData)

function generateState() {
	const x = selectRandomly(variableSet)
	const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, true, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, f1, f2, g }
}

function getSolution(state) {
	const { c, f1, f2, g } = state
	const x = g.getVariables()[0]
	const f = f1.add(f2.multiply(c, true)).removeUseless()
	const h = f.divide(g).removeUseless()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).elementaryClean()
	const derivative = derivativeRaw.advancedCleanDisplay()
	return { ...state, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
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
