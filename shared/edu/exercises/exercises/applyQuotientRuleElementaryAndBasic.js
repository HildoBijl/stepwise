const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'applyQuotientRule',
	steps: [['lookUpElementaryDerivative', 'findBasicDerivative'], null],
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

function generateState() {
	const x = selectRandomly(variableSet)
	const [f1, f2] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
	const [g] = getRandomElementaryFunctions(1, false, false).map(func => func.substitute('x', x))
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
	const derivative = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2)).elementaryClean()
	const derivativeSimplified = derivative.advancedCleanDisplay()
	return { ...state, x, f, h, fDerivative, gDerivative, derivative, derivativeSimplified }
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
