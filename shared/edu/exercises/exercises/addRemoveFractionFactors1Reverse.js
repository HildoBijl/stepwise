const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const { Expression } = require('../../../inputTypes/Expression')
const Product = require('../../../inputTypes/Expression/Product')
const Fraction = require('../../../inputTypes/Expression/functions/Fraction')
const Variable = require('../../../inputTypes/Expression/Variable')

const data = {
	skill: 'addRemoveFractionFactors',
	equalityOptions: {
		default: Expression.equalityLevels.onlyOrderChanges,
	},
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

function getExpression(state) {
	const { a, b } = getVariables(state)
	return new Fraction(a, b)
}

function getCorrect(state) {
	const variables = getVariables(state)
	const { x, y } = variables
	const expression = getExpression(state)
	const factor = new Product(x, y)
	const ans = expression.multiplyNumDenBy(factor)
	return { ...state, variables, expression, factor, ans }
}

function checkInput(state, input) {
	const { ans } = getCorrect(state)
	return ans.equals(input.ans, data.equalityOptions.default)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getVariables,
	getExpression,
	getCorrect,
	checkInput,
}