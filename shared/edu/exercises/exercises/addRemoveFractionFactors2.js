const { getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// a*x^2/(b*x) = ax/b.
const availableVariables = ['a', 'b', 'c', 'x', 'y', 'P', 'R', 't', 'I', 'U', 'L']
const usedVariables = ['a', 'b', 'x']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
}

function generateState() {
	return {
		...selectRandomVariables(availableVariables, usedVariables),
		flipNumerator: getRandomBoolean(),
		flipDenominator: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables)
	const square = asExpression('x^2').substituteVariables(variables)
	const expression = asExpression(`(${state.flipNumerator ? 'x^2a' : 'ax^2'})/(${state.flipDenominator ? 'xb' : 'bx'})`).substituteVariables(variables)
	const ans = expression.regularClean()
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
