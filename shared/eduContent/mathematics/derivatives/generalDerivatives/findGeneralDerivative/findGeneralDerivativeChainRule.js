const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findGeneralDerivative',
	setup: 'applyChainRule',
	steps: [null, null, 'applyChainRule'],
	weight: 4,
	comparison: { method: {}, default: expressionComparisons.equivalent },
}

function generateState() {
	const x = selectRandomly(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g }
}

function getSolution(state) {
	const { c, fRaw, g } = state
	const method = 2
	const f = fRaw.multiply(c, true).basicClean()
	const x = f.getVariables()[0]
	const h = f.substitute(x, g).elementaryClean()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivativeRaw = fDerivative.substitute(x, g).multiply(gDerivative)
	const derivative = derivativeRaw.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...state, method, x, f, h, fDerivative, gDerivative, derivativeRaw, derivative }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'method')
		case 2:
			return performComparison(exerciseData, ['f', 'g'])
		default:
			return performComparison(exerciseData, 'derivative')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
