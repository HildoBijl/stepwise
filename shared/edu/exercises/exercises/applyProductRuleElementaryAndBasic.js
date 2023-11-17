const { selectRandomly, getRandomInteger } = require('../../../util')
const { expressionComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'applyProductRule',
	steps: [['lookUpElementaryDerivative', 'findBasicDerivative'], null],
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

function generateState() {
	const x = selectRandomly(variableSet)
	const [f, g1, g2] = getRandomElementaryFunctions(3, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { f, c, g1, g2 }
}

function getSolution(state) {
	const { f, c, g1, g2 } = state
	const x = f.getVariables()[0]
	const g = g1.add(g2.multiply(c, true)).removeUseless()
	const h = f.multiply(g).removeUseless()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivative = fDerivative.multiply(g).add(f.multiply(gDerivative))
	const derivativeSimplified = derivative.advancedCleanDisplay()
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
