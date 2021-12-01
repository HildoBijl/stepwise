const { selectRandomly, getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { asExpression, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// (ayx^2)/(zx) = (ayx)/z.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		flipNumerator: getRandomBoolean(),
		flipDenominator: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const square = asExpression('x^2').substituteVariables(variables)
	const expression = asExpression(`(${state.flipNumerator ? 'ax^2y' : 'ayx^2'})/(${state.flipDenominator ? 'zx' : 'xz'})`).substituteVariables(variables)
	const ans = expression.simplify({ ...simplifyOptions.basicClean, mergeFractionTerms: true })
	return { ...state, variables, square, expression, ans }
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
