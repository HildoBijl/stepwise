const { selectRandomly, getRandomInteger, getRandomIndices } = require('../../../util/random')
const { asExpression, Sum, expressionComparisons, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionComparisons

// axy^2 + bxy + cx^2y = xy(ay + b + cx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'pullOutOfBrackets',
	setup: combinerAnd('mergeSplitFractions', 'expandBrackets'),
	steps: [null, 'mergeSplitFractions', null, 'expandBrackets'],
	comparison: {
		default: onlyOrderChanges,
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-8, 8, [0]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		order: getRandomIndices(3, 3),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['axy^2', 'bxy', 'cx^2y'].map(term => asExpression(term).substituteVariables(variables).removeUseless())
	const factor = asExpression('xy').substituteVariables(variables).simplify({ sortProducts: true })
	const expression = new Sum(state.order.map(index => terms[index])).simplify({ sortProducts: true })
	const fraction = expression.divide(factor)
	const setup = factor.multiply(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, crossOutFractionTerms: true })
	const ans = factor.multiply(fractionSimplified)
	return { ...state, variables, expression, factor, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('setup', input, solution, data.comparison)
	if (step === 2)
		return performComparison('fractionSimplified', input, solution, data.comparison)
	if (step === 4)
		return performComparison('expression', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}