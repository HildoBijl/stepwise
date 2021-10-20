const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const { Expression } = require('../../../inputTypes/Expression')
const Product = require('../../../inputTypes/Expression/Product')
const Fraction = require('../../../inputTypes/Expression/functions/Fraction')
const Power = require('../../../inputTypes/Expression/functions/Power')
const Variable = require('../../../inputTypes/Expression/Variable')

const data = {
	skill: 'addRemoveFractionFactors',
	equalityOptions: {
		default: Expression.equalityLevels.onlyOrderChanges,
	},
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
	const expression = new Fraction(new Product(state.flipNumerator ? [x, a] : [a, x]), b)
	const ans = new Fraction(new Product(state.flipNumerator ? [square, a] : [a, square]), new Product(state.flipNumerator ? [x, b] : [b, x]))
	return { ...state, variables, square, expression, ans }
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
	getCorrect,
	checkInput,
}