const { selectRandomly } = require('../../util')
const { expressionComparisons } = require('../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'findAdvancedDerivative',
	steps: [null, null, ['applyProductRule', 'lookUpElementaryDerivative'], null],
	weight: 2,
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

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
	const derivative = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
	const derivativeSimplified = derivative.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...state, method, x, f, h, fDerivative, gDerivative, derivative, derivativeSimplified }
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
