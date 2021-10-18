const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const { Expression } = require('../../../inputTypes/Expression')
const Sum = require('../../../inputTypes/Expression/Sum')
const Product = require('../../../inputTypes/Expression/Product')
const Fraction = require('../../../inputTypes/Expression/functions/Fraction')
const Integer = require('../../../inputTypes/Expression/Integer')
const Variable = require('../../../inputTypes/Expression/Variable')

const data = {
	skill: 'addRemoveFractionFactors',
	equalityOptions: {
		default: Expression.equalityLevels.equivalent,
	},
	availableVariablesLower: ['a', 'b', 'c', 'x', 'y', 't'].map(Variable.ensureVariable),
	availableVariablesUpper: ['P', 'R', 'I', 'U', 'L'].map(Variable.ensureVariable),
	usedVariables: ['P', 'x', 'y'].map(Variable.ensureVariable),
}

function generateState() {
	// aP*(x+y)/(x+y) or (x+y)/(aP*(x+y)).
	const state = {}
	state.a = getRandomInteger(2, 12)
	state.P = getRandomInteger(0, data.availableVariablesUpper.length - 1)
	state.x = getRandomInteger(0, data.availableVariablesLower.length - 1)
	state.y = getRandomInteger(0, data.availableVariablesLower.length - 1, [state.x])
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
	const expression = state.upper ? term : new Fraction(Integer.one, term)
	const ans = expression.multiplyNumDenBy(sum).simplify(Expression.simplifyOptions.removeUseless)
	return { ...state, variables, sum, term, product, expression, ans }
}

function checkInput(state, input) {
	const { upper, sum, ans } = getCorrect(state)
	const part = upper ? 'denominator' : 'numerator'
	return input.ans.isType(Fraction) && sum.equals(input.ans[part], Expression.equalityLevels.onlyOrderChanges) && ans.equals(input.ans)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	getVariables,
	getCorrect,
	checkInput,
}