const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')
const { combinerRepeat } = require('../../../skillTracking')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'applyProductRule',
	setup: combinerRepeat('lookUpElementaryDerivative', 2),
	steps: [['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	comparison: { default: equivalent },
}

function generateState() {
	const x = selectRandomly(variableSet)
	const [f, g1, g2] = getRandomElementaryFunctions(3, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { f, c, g1, g2 }
}

function getSolution(state) {
	const { f, c, g1, g2 } = state
	const x = f.getVariables()[0]
	const g = g1.add(g2.multiply(c, true)).elementaryClean()
	const h = f.substitute(x, g).elementaryClean()
	const fDerivative = f.getDerivative().cleanForDisplay()
	const gDerivative = g.getDerivative().cleanForDisplay()
	const derivative = fDerivative.substitute(x, g).multiply(gDerivative).elementaryClean()
	const derivativeSimplified = derivative.advancedClean({ expandPowersOfSums: false }).cleanForDisplay()
	return { ...state, x, g, h, fDerivative, gDerivative, derivative, derivativeSimplified }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(['fDerivative'], input, solution, data.comparison)
				case 2:
					return performComparison(['gDerivative'], input, solution, data.comparison)
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
