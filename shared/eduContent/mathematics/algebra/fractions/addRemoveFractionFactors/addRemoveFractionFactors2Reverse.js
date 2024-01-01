const { selectRandomly, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asExpression, expressionComparisons } = require('../../../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

// (ayx)/z = (ayx^2)/(zx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const data = {
	skill: 'addRemoveFractionFactors',
	comparison: expressionComparisons.onlyOrderChanges,
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		flipNumerator: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const square = asExpression('x^2').substituteVariables(variables)
	const expression = asExpression(`(${state.flipNumerator ? 'axy' : 'ayx'})/z`).substituteVariables(variables)
	const ans = expression.multiplyNumDen(variables.x).removeUseless({ mergeSumNumbers: true, mergeProductTerms: true })
	return { ...state, variables, square, expression, ans }
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