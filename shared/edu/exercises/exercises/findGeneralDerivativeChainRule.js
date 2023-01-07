const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'findGeneralDerivative',
	setup: 'applyChainRule',
	steps: [null, null, 'applyChainRule'],
	weight: 4,
	comparison: { default: equivalent },
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
	const derivative = fDerivative.substitute(x, g).multiply(gDerivative)
	const derivativeSimplified = derivative.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...state, method, x, f, h, fDerivative, gDerivative, derivative, derivativeSimplified }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.method === solution.method
		case 2:
			return performComparison(['f', 'g'], input, solution, data.comparison)
		default:
			return performComparison('derivative', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
