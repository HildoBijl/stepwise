const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const { Expression } = require('../../../inputTypes/Expression')
const Sum = require('../../../inputTypes/Expression/Sum')
const Product = require('../../../inputTypes/Expression/Product')
const Fraction = require('../../../inputTypes/Expression/functions/Fraction')
const Variable = require('../../../inputTypes/Expression/Variable')

const data = {
	skill: 'addRemoveFractionFactors',
	equalityOptions: {
		default: Expression.equalityLevels.onlyOrderChanges,
	},
	availableVariablesLower: ['a', 'b', 'c', 'x', 'y', 't'].map(Variable.ensureVariable),
	availableVariablesUpper: ['P', 'R', 'I', 'U', 'L'].map(Variable.ensureVariable),
	usedVariables: ['P', 'x', 'y'],
}

function generateState() {
	// P*(x+y)/(x+y) or (x+y)/(P*(x+y)).
	const state = {}
	state.a = getRandomInteger(2, 12)
	state.P = getRandomInteger(0, data.availableVariablesUpper.length - 1)
	state.x = getRandomInteger(0, data.availableVariablesLower.length - 1)
	state.y = getRandomInteger(0, data.availableVariablesLower.length - 1, [state.x])
	state.front = getRandomBoolean()
	state.upper = getRandomBoolean()
	return state
}

function getVariables(state) {
	return {
		P: data.availableVariablesUpper[state.P],
		x: data.availableVariablesLower[state.x],
		y: data.availableVariablesLower[state.y],
	}
}

function getCorrect(state) {
	const variables = getVariables(state)
	const { P, x, y } = variables
	const sum = new Sum(x, y)
	const term = new Product(state.a, P)
	const product = new Product(state.front ? [term, sum] : [sum, term])
	const expression = new Fraction(...(state.upper ? [product, sum] : [sum, product]))
	const ans = expression.simplify(Expression.simplifyOptions.basicClean)
	return { ...state, variables, sum, term, product, expression, ans }
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