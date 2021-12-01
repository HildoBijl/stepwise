const { gcd } = require('../../../util/numbers')
const { selectRandomly, getRandomInteger, getRandomIndices } = require('../../../util/random')
const { asExpression, Sum, expressionChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = expressionChecks

// abxy^2 + acxyz + adxz^2 = ax(by^2 + cyz + dz^2).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'pullOutOfBrackets',
	setup: combinerAnd('mergeSplitFractions', 'expandBrackets'),
	steps: [null, null, 'mergeSplitFractions', null, 'expandBrackets'],
	check: {
		default: onlyOrderChanges,
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: selectRandomly([2, 3, 5, 7]),
		b: getRandomInteger(-6, 6, [0]),
		c: getRandomInteger(-6, 6, [0]),
		d: getRandomInteger(1, 6, [0]), // Prevent all variables from being negative, which would lead to a negative factor being pulled out of brackets. That is hard to check.
		order: getRandomIndices(3, 3),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['abxy^2', 'acxyz', 'adxz^2'].map(term => asExpression(term).substituteVariables(variables).simplify({ ...simplifyOptions.removeUseless, mergeProductNumbers: true, sortProducts: true }))
	const expression = new Sum(state.order.map(index => terms[index]))
	const gcdValue = state.a * gcd(state.b, state.c, state.d)
	const factor = asExpression(`${gcdValue}x`).substituteVariables(variables)
	const fraction = expression.divideBy(factor)
	const setup = factor.multiplyBy(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, mergeFractionTerms: true })
	const ans = factor.multiplyBy(fractionSimplified)
	return { ...state, variables, expression, gcdValue, factor, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 4)
		return performCheck('ans', input, solution, data.check)
	if (step === 1)
		return performCheck('factor', input, solution, data.check)
	if (step === 2)
		return performCheck('setup', input, solution, data.check)
	if (step === 3)
		return performCheck('fractionSimplified', input, solution, data.check)
	if (step === 5)
		return performCheck('expression', input, solution, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}