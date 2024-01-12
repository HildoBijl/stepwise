const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findAdvancedDerivative',
	steps: [null, null, ['applyQuotientRule', 'lookUpElementaryDerivative'], null],
	weight: 2,
	comparison: { method: {}, default: expressionComparisons.equivalent },
}
addSetupFromSteps(metaData)

function generateState() {
	const x = selectRandomly(variableSet)
	const [fRaw] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
	const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g1, g2 }
}

function getSolution(state) {
	const { c, fRaw, g1, g2 } = state
	const method = 2
	const f = fRaw.multiply(c, true).basicClean()
	const g = g1.divide(g2)
	const x = f.getVariables()[0]
	const h = f.substitute(x, g).elementaryClean()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
	const derivative = derivativeRaw.advancedCleanDisplay({ expandPowersOfSums: false })
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
