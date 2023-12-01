const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../util')
const { asExpression, expressionComparisons, expressionChecks } = require('../../CAS')

const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../eduTools')

const { equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// ax(y+b) = axy + abx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

const data = {
	skill: 'expandBrackets',
	weight: 2,
	comparison: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-6, 6, [0]),
		b: getRandomInteger(-6, 6, [0]),
		before: getRandomBoolean(), // Is the sum (the brackets) before or after the factor?
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('ax').substituteVariables(variables).removeUseless()
	const sum = asExpression('y+b').substituteVariables(variables)
	const expression = factor.multiply(sum, state.before)
	const ans = expression.cleanForAnalysis()
	return { ...state, variables, factor, sum, expression, ans }
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
