const { selectRandomly, getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionChecks } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// (ax)/(bw) = (axyz)/(bzwy).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
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
	const expression = asExpression('(ax)/(bw)').substituteVariables(variables)
	const factor = asExpression('yz').substituteVariables(variables)
	const ans = expression.multiplyNumDenBy(factor)
	return { ...state, variables, expression, factor, ans }
}

function checkInput(state, input) {
	return performCheck('ans', input, getSolution(state), data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
