const { asExpression, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// (axy)/(ybx) = a/b.
const availableVariables = ['a', 'b', 'c', 'x', 'y', 'P', 'R', 't', 'I', 'U', 'L']
const usedVariables = ['a', 'b', 'x', 'y']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
}

function generateState() {
	return selectRandomVariables(availableVariables, usedVariables)
}

function getCorrect(state) {
	const variables = filterVariables(state, usedVariables)
	const expression = asExpression('(axy)/(ybx)').substituteVariables(variables)
	const ans = expression.regularClean()
	return { ...state, variables, expression, ans }
}

function checkInput(state, input) {
	return performCheck('ans', getCorrect(state), input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}