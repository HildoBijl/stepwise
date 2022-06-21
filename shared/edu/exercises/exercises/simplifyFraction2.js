const { gcd } = require('../../../util/maths')
const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionComparisons, simplifyOptions } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionComparisons

// (x/a + y/b)/(cz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'simplifyFraction',
	setup: combinerAnd('mergeSplitFractions', 'multiplyDivideFractions'),
	steps: ['mergeSplitFractions', 'multiplyDivideFractions'],
	comparison: {
		default: onlyOrderChanges,
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
		c: getRandomInteger(2, 12),
		plus: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('x/a').substituteVariables(variables)
	const fraction2 = asExpression('y/b').substituteVariables(variables)
	const numerator = fraction1[state.plus ? 'add' : 'subtract'](fraction2)
	const denominator = asExpression('cz').substituteVariables(variables)
	const expression = numerator.divideBy(denominator)
	const gcdValue = gcd(state.a, state.b)
	const fraction1Intermediate = fraction1.multiplyNumDenBy(state.b / gcdValue).simplify({ mergeProductNumbers: true })
	const fraction2Intermediate = fraction2.multiplyNumDenBy(state.a / gcdValue).simplify({ mergeProductNumbers: true })
	const intermediateSplit = fraction1Intermediate[state.plus ? 'add' : 'subtract'](fraction2Intermediate)
	const intermediate = fraction1Intermediate.numerator[state.plus ? 'add' : 'subtract'](fraction2Intermediate.numerator).divideBy(fraction1Intermediate.denominator)
	const expressionWithIntermediate = intermediate.divideBy(denominator)
	const simplifiedExpressionWithIntermediate = intermediate.numerator.divideBy(intermediate.denominator.multiplyBy(denominator))
	const ans = asExpression(`(${state.b / gcdValue}x ${state.plus ? '+' : '-'} ${state.a / gcdValue}y)/(${state.a * state.b * state.c / gcdValue}z)`).substituteVariables(variables).simplify({ ...simplifyOptions.forAnalysis, sortSums: false })
	return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 2)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('intermediate', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}