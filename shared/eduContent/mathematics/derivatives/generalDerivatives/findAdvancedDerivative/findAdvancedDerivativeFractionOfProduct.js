const { selectRandomly } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findAdvancedDerivative',
	steps: [null, null, ['applyProductRule', 'lookUpElementaryDerivative'], null],
	weight: 2,
	comparison: { method: {}, default: expressionComparisons.equivalent },
}
addSetupFromSteps(metaData)

function generateState() {
	const x = selectRandomly(variableSet)
	const [f1, f2, g] = getRandomElementaryFunctions(3, false, false, false).map(func => func.substitute('x', x))
	return { f1, f2, g }
}

function getSolution(state) {
	const { f1, f2, g } = state
	const method = 1
	const f = f1.multiply(f2).elementaryClean()
	const h = f.divide(g).elementaryClean()
	const x = f.getVariables()[0]
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
	const derivative = derivativeRaw.advancedCleanDisplay({ expandPowersOfSums: false })
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
