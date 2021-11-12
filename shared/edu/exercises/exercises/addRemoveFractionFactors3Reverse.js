const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { Variable, Integer, Sum, Product, Fraction, expressionChecks, simplifyOptions } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performCheck } = require('../util/check')

const data = {
	skill: 'addRemoveFractionFactors',
	check: (correct, input, { upper, sum }) => input.isType(Fraction) && expressionChecks.onlyOrderChanges(sum, input[upper ? 'denominator' : 'numerator']) && expressionChecks.equivalent(correct, input),
	availableVariablesLower: ['a', 'b', 'c', 'x', 'y', 't'].map(Variable.ensureVariable),
	availableVariablesUpper: ['P', 'R', 'I', 'U', 'L'].map(Variable.ensureVariable),
	usedVariables: ['P', 'x', 'y'],
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
	const ans = expression.multiplyNumDenBy(sum).simplify(simplifyOptions.removeUseless)
	return { ...state, variables, sum, term, product, expression, ans }
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