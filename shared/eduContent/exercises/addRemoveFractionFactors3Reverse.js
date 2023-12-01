const { selectRandomly, getRandomBoolean, getRandomInteger } = require('../../util')
const { Sum, Product, Fraction, expressionComparisons } = require('../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, filterVariables, performComparison } = require('../../eduTools')

// az(x+y)/(x+y) or (x+y)/(az(x+y)).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const data = {
	skill: 'addRemoveFractionFactors',
	comparison: (input, correct, { upper, sum }) => input.isSubtype(Fraction) && expressionComparisons.onlyOrderChanges(sum, input[upper ? 'denominator' : 'numerator']) && expressionComparisons.equivalent(input, correct),
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		upper: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const { a, x, y, z } = variables
	const sum = new Sum(x, y)
	const term = new Product(a, z)
	const product = new Product(state.front ? [term, sum] : [sum, term])
	const expression = state.upper ? term : new Fraction(1, term)
	const ans = expression.multiplyNumDen(sum).removeUseless()
	return { ...state, variables, sum, term, product, expression, ans }
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
