const { gcd, selectRandomly, getRandomInteger, getRandomIndices } = require('../../../../../util')
const { asExpression, Sum, expressionComparisons, simplifyOptions } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// abxy^2 + acxyz + adxz^2 = ax(by^2 + cyz + dz^2).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'pullOutOfBrackets',
	steps: [null, null, 'mergeSplitFractions', null, 'expandBrackets'],
	comparison: onlyOrderChanges,
}
addSetupFromSteps(metaData)

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
	const fraction = expression.divide(factor)
	const setup = factor.multiply(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, crossOutFractionTerms: true })
	const ans = factor.multiply(fractionSimplified)
	return { ...state, variables, expression, gcdValue, factor, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'factor')
		case 2:
			return performComparison(exerciseData, 'setup')
		case 3:
			return performComparison(exerciseData, 'fractionSimplified')
		case 5:
			return performComparison(exerciseData, 'expression')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
