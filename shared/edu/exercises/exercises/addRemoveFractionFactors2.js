const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { Variable, Product, Fraction, Power, expressionChecks, simplifyOptions } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
	availableVariables: ['a', 'b', 'c', 'x', 'y', 'P', 'R', 't', 'I', 'U', 'L'].map(Variable.ensureVariable),
	usedVariables: ['a', 'b', 'x'],
}

function generateState() {
	// a*x^2/(b*x) = ax/b.
	const state = {}
	const usedIndices = []
	data.usedVariables.forEach(variable => {
		state[variable] = getRandomInteger(0, data.availableVariables.length - 1, usedIndices)
		usedIndices.push(state[variable])
	})
	state.flipNumerator = getRandomBoolean()
	state.flipDenominator = getRandomBoolean()
	return state
}

function getVariables(state) {
	const result = {}
	data.usedVariables.forEach(variable => {
		result[variable] = data.availableVariables[state[variable]]
	})
	return result
}

function getCorrect(state) {
	const variables = getVariables(state)
	const { a, b, x } = variables
	const square = new Power(x, 2)
	const expression = new Fraction(new Product(state.flipNumerator ? [square, a] : [a, square]), new Product(state.flipDenominator ? [x, b] : [b, x]))
	const ans = expression.simplify(simplifyOptions.basicClean)
	return { ...state, variables, square, expression, ans }
}

function checkInput(state, input) {
	return performCheck('ans', getCorrect(state), input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getVariables,
	getCorrect,
	checkInput,
}