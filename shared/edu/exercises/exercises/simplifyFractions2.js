const { gcd } = require('../../../util/numbers')
const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionChecks } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = expressionChecks

// (x/a + y/b)/(cz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	setup: combinerAnd('mergeSplitFractions', 'multiplyDivideFractions'),
	steps: ['mergeSplitFractions', 'multiplyDivideFractions'],
	check: {
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

function getCorrect(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('x/a').substituteVariables(variables)
	const fraction2 = asExpression('y/b').substituteVariables(variables)
	const numerator = fraction1[state.plus ? 'add' : 'subtract'](fraction2)
	const denominator = asExpression('cz').substituteVariables(variables)
	const expression = numerator.divideBy(denominator)
	const gcdValue = gcd(variables.a, variables.b)
	const fraction1Intermediate = fraction1.multiplyNumDenBy(variables.b / gcdValue).simplify({ mergeProductNumbers: true })
	const fraction2Intermediate = fraction2.multiplyNumDenBy(variables.a / gcdValue).simplify({ mergeProductNumbers: true })
	const intermediateSplit = fraction1Intermediate[state.plus ? 'add' : 'subtract'](fraction2Intermediate)
	const intermediate = fraction1Intermediate.numerator[state.plus ? 'add' : 'subtract'](fraction2Intermediate.numerator).divideBy(fraction1Intermediate.denominator)
	const expressionWithIntermediate = intermediate.divideBy(denominator)
	const simplifiedExpressionWithIntermediate = intermediate.numerator.divideBy(intermediate.denominator.multiplyBy(denominator))
	const ans = asExpression(`(${variables.b / gcdValue}x ${state.plus ? '+' : '-'} ${variables.a / gcdValue}y)/(${variables.a * variables.b * variables.c / gcdValue}z)`).substituteVariables(variables).simplify({ ...simplifyOptions.forAnalysis, sortSums: false })
	return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 2)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('intermediate', correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}