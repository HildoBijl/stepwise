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
	check: (correct, input, { upper, sum }) => input.isType(Fraction) && expressionChecks.onlyOrderChanges(sum, input[upper ? 'denominator' : 'numerator']) && expressionChecks.equivalent(correct, input),
}

function generateState() {
	return {
		a: getRandomInteger(2, 12),
		...selectRandomVariables(availableVariablesUpper, usedVariables.slice(0, 1)),
		...selectRandomVariables(availableVariablesLower, usedVariables.slice(1)),
		upper: getRandomBoolean(),
	}
}

function getCorrect(state) {
	const { P, x, y } = variables = filterVariables(state, usedVariables)
	const sum = new Sum(x, y)
	const term = new Product(state.a, P)
	const product = new Product(state.front ? [term, sum] : [sum, term])
	const expression = state.upper ? term : new Fraction(1, term)
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
	getCorrect,
	checkInput,
}
