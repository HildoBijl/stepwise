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
	weight: 2,
	comparison: { default: equivalent },
}

function generateState() {
	const x = selectRandomly(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	const f = fRaw.multiply(c, true).basicClean()
	return { f, g }
}

function getSolution(state) {
	const { f, g } = state
	const x = f.getVariables()[0]
	const h = f.multiply(g).elementaryClean()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivative = fDerivative.multiply(g).add(f.multiply(gDerivative))
	const derivativeSimplified = derivative.advancedCleanDisplay()
	return { ...state, x, h, fDerivative, gDerivative, derivative, derivativeSimplified }
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
