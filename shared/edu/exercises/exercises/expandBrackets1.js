const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionChecks } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const { equivalent, hasSumWithinProduct } = expressionChecks

// ax(y+b) = axy + abx.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

const data = {
	skill: 'expandBrackets',
	weight: 2,
	check: (correct, input) => !hasSumWithinProduct(input) && equivalent(correct, input),
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
	const expression = factor.multiplyBy(sum, state.before)
	const ans = expression.simplify(simplifyOptions.forAnalysis)
	return { ...state, variables, factor, sum, expression, ans }
}

function checkInput(state, input) {
	return performCheck('ans', getSolution(state), input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
