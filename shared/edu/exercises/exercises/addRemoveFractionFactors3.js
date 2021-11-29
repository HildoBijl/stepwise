const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { Sum, Product, Fraction, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

// aP*(x+y)/(x+y) or (x+y)/(aP*(x+y)).
const availableVariablesUpper = ['P', 'R', 'I', 'U', 'L']
const availableVariablesLower = ['a', 'b', 'c', 'x', 'y', 't']
const usedVariables = ['P', 'x', 'y']

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
}

function generateState() {
	return {
		a: getRandomInteger(2, 12),
		...selectRandomVariables(availableVariablesUpper, usedVariables.slice(0, 1)),
		...selectRandomVariables(availableVariablesLower, usedVariables.slice(1)),
		front: getRandomBoolean(),
		upper: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables)
	const { P, x, y } = variables
	const sum = new Sum(x, y)
	const term = new Product(state.a, P)
	const product = new Product(state.front ? [term, sum] : [sum, term])
	const expression = new Fraction(...(state.upper ? [product, sum] : [sum, product]))
	const ans = expression.regularClean()
	return { ...state, variables, sum, term, product, expression, ans }
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
