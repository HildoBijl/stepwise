const { asExpression, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// a/b = (axy)/(ybx).
const availableVariables = ['a', 'b', 'c', 'x', 'y', 'P', 'R', 't', 'I', 'U', 'L']
const usedVariables = ['a', 'b', 'x', 'y']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
}

function generateState() {
	return selectRandomVariables(availableVariables, usedVariables)
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables)
	const expression = asExpression('a/b').substituteVariables(variables)
	const factor = asExpression('xy').substituteVariables(variables)
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
