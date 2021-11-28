const { selectRandomly, getRandomInteger, getRandomIndices } = require('../../../util/random')
const { asExpression, Sum, expressionChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = expressionChecks

// ax^2+bx+c = x*(ax+b+c/x).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'pullOutOfBrackets',
	setup: combinerAnd('mergeSplitFractions', 'expandBrackets'),
	steps: [null, 'mergeSplitFractions', null, 'expandBrackets'],
	check: {
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
	const terms = ['ax^2', 'bx', 'c'].map(term => asExpression(term).substituteVariables(variables).removeUseless())
	const expression = new Sum(state.order.map(index => terms[index]))
	const fraction = expression.divideBy(variables.x)
	const setup = variables.x.multiplyBy(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true, pullMinusBeforeFraction: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, mergeFractionTerms: true })
	const ans = variables.x.multiplyBy(fractionSimplified)
	return { ...state, variables, expression, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performCheck('ans', solution, input, data.check)
	if (step === 1)
		return performCheck('setup', solution, input, data.check)
	if (step === 2)
		return performCheck('fractionSimplified', solution, input, data.check)
	if (step === 4)
		return performCheck('expression', solution, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}