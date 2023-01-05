const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'findAdvancedDerivative',
	setup: combinerAnd('applyQuotientRule', 'findBasicDerivative'),
	steps: [null, null, ['applyQuotientRule', 'findBasicDerivative'], null],
	comparison: { default: equivalent },
}

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
	const fDerivative = f.getDerivative().cleanForDisplay()
	const gDerivative = g.getDerivative().cleanForDisplay()
	const derivative = fDerivative.substitute(x, g).multiply(gDerivative)
	const derivativeSimplified = derivative.advancedClean({ expandPowersOfSums: false }).cleanForDisplay()
	return { ...state, method, x, f, g, h, fDerivative, gDerivative, derivative, derivativeSimplified }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.method === solution.method
		case 2:
			return performComparison(['f', 'g'], input, solution, data.comparison)
		case 3:
			switch (substep) {
				case 1:
					return performComparison('fDerivative', input, solution, data.comparison)
				case 2:
					return performComparison('gDerivative', input, solution, data.comparison)
			}
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
