const { getRandomInteger } = require('../../../util/random')
const { Variable, Product, Fraction, expressionChecks } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const data = {
	skill: 'addRemoveFractionFactors',
	check: expressionChecks.onlyOrderChanges,
	availableVariables: ['a', 'b', 'c', 'x', 'y', 'P', 'R', 't', 'I', 'U', 'L'].map(Variable.ensureVariable),
	usedVariables: ['a', 'b', 'x', 'y'],
}

function generateState() {
	// (axy)/(ybx) = a/b.
	const state = {}
	const usedIndices = []
	data.usedVariables.forEach(variable => {
		state[variable] = getRandomInteger(0, data.availableVariables.length - 1, usedIndices)
		usedIndices.push(state[variable])
	})
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
	const { a, b, x, y } = variables
	const expression = new Fraction(a, b)
	const factor = new Product(x, y)
	const ans = expression.multiplyNumDenBy(factor)
	return { ...state, variables, expression, factor, ans }
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