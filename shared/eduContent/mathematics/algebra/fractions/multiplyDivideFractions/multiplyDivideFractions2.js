const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../CAS')

const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks

// (x/a)/((y+c)/b) = (bx)/(a(y+c)).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'multiplyDivideFractions',
	comparison: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
		c: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(x/a)/((y+c)/b)').substituteVariables(variables)
	const ans = expression.simplify({ flattenFractions: true })
	return { ...state, variables, expression, ans }
}

function checkInput(state, input) {
	return performComparison('ans', input, getSolution(state), data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}