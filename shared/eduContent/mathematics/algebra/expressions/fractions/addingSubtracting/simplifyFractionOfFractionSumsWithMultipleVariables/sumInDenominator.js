const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asExpression, expressionComparisons, expressionOperations } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (c/x)/(a/x^2 + b/(xy)) = (cxy)/(ay+bx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
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
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
		c: getRandomInteger(2, 12),
		plus: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const gcdValue = gcd(...constants.map(constant => state[constant]))
	const fraction1 = asExpression('a/x^2').substitute(variables)
	const fraction2 = asExpression('b/(xy)').substitute(variables)
	const numerator = asExpression('c/x').substitute(variables)
	const denominator = fraction1[state.plus ? 'add' : 'subtract'](fraction2)
	const expression = numerator.divide(denominator)
	const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, variables.y).mergeNumbers(['mergeProductFactors'])
	const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, variables.x).mergeNumbers(['mergeProductFactors'])
	const intermediateSplit = fraction1Intermediate[state.plus ? 'add' : 'subtract'](fraction2Intermediate)
	const intermediate = fraction1Intermediate.numerator[state.plus ? 'add' : 'subtract'](fraction2Intermediate.numerator).divide(fraction1Intermediate.denominator)
	const expressionWithIntermediate = numerator.divide(intermediate)
	const ans = asExpression(`(${variables.c / gcdValue}xy)/(${variables.a / gcdValue}y ${state.plus ? '+' : '-'} ${variables.b / gcdValue}x)`).substitute(variables).combine()
	return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'intermediate')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
