const { selectRandomly, getRandomBoolean } = require('../../../util')
const { asExpression, expressionComparisons } = require('../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../../eduTools')

// (axyz)/(bzwy) = (ax)/(bw).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'addRemoveFractionFactors',
	comparison: expressionComparisons.onlyOrderChanges,
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	const aSets = [2, 4, 7, 8, 14, 16] // Only prime factors 2 and 7.
	const bSets = [3, 5, 9, 15] // Only prime factors 3 and 5.
	const switchAB = getRandomBoolean()
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: selectRandomly(switchAB ? bSets : aSets),
		b: selectRandomly(switchAB ? aSets : bSets),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(axyz)/(bzwy)').substituteVariables(variables)
	const ans = expression.regularClean()
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