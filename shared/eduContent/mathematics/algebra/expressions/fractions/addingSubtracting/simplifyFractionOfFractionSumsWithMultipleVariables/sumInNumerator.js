const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asExpression, expressionComparisons, expressionOperations } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (x/a + y/b)/(cz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
	steps: ['addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables'],
	comparison: onlyOrderChanges,
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: randomInteger(2, 12),
		b: randomInteger(2, 12),
		c: randomInteger(2, 12),
		plus: randomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('x/a').substitute(variables)
	const fraction2 = asExpression('y/b').substitute(variables)
	const numerator = fraction1[state.plus ? 'add' : 'subtract'](fraction2)
	const denominator = asExpression('cz').substitute(variables)
	const expression = numerator.divide(denominator)
	const gcdValue = gcd(state.a, state.b)
	const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, state.b / gcdValue).flatten(['mergeProductNumbers'])
	const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, state.a / gcdValue).flatten(['mergeProductNumbers'])
	const intermediateSplit = fraction1Intermediate[state.plus ? 'add' : 'subtract'](fraction2Intermediate)
	const intermediate = fraction1Intermediate.numerator[state.plus ? 'add' : 'subtract'](fraction2Intermediate.numerator).divide(fraction1Intermediate.denominator)
	const expressionWithIntermediate = intermediate.divide(denominator)
	const simplifiedExpressionWithIntermediate = intermediate.numerator.divide(intermediate.denominator.multiply(denominator)).flatten()
	const ans = asExpression(`(${state.b / gcdValue}x ${state.plus ? '+' : '-'} ${state.a / gcdValue}y)/(${state.a * state.b * state.c / gcdValue}z)`).substitute(variables).combine()
	return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'intermediate')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
