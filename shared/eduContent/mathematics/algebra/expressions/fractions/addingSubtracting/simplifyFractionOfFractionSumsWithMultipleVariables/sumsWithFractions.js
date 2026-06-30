const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { asExpression, expressionComparisons, expressionChecks, expressionOperations } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks
const { multiplyNumeratorAndDenominator } = expressionOperations

// (a/w + b/x)/(c/y + d/z).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'simplifyFractionOfFractionSumsWithMultipleVariables',
	steps: ['addFractionsWithMultipleVariables', 'addFractionsWithMultipleVariables', 'simplifyFractionOfFractionsWithVariables'],
	comparison: (input, correct) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
		c: getRandomInteger(2, 12),
		d: getRandomInteger(2, 12),
		plus1: getRandomBoolean(),
		plus2: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)

	// Define the expression.
	const fraction1 = asExpression('a/w').substitute(variables)
	const fraction2 = asExpression('b/x').substitute(variables)
	const fraction3 = asExpression('c/y').substitute(variables)
	const fraction4 = asExpression('d/z').substitute(variables)
	const numerator = fraction1[state.plus1 ? 'add' : 'subtract'](fraction2)
	const denominator = fraction3[state.plus2 ? 'add' : 'subtract'](fraction4)
	const expression = numerator.divide(denominator)

	// Simplify the expression.
	const gcdValue = gcd(...constants.map(constant => state[constant]))
	const fraction1Intermediate = multiplyNumeratorAndDenominator(fraction1, variables.x).flatten(['sortProducts'])
	const fraction2Intermediate = multiplyNumeratorAndDenominator(fraction2, variables.w).flatten(['sortProducts'])
	const fraction3Intermediate = multiplyNumeratorAndDenominator(fraction3, variables.z).flatten(['sortProducts'])
	const fraction4Intermediate = multiplyNumeratorAndDenominator(fraction4, variables.y).flatten(['sortProducts'])
	const numeratorSplit = fraction1Intermediate[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate)
	const denominatorSplit = fraction3Intermediate[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate)
	const numeratorIntermediate = fraction1Intermediate.numerator[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate.numerator).divide(fraction1Intermediate.denominator)
	const denominatorIntermediate = fraction3Intermediate.numerator[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate.numerator).divide(fraction3Intermediate.denominator)

	const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
	const intermediateFlipped = intermediate.numerator.multiply(intermediate.denominator.invert())
	const intermediateMerged = intermediateFlipped.flatten(['mergeFractionProducts'])

	const ans = asExpression(`((${variables.a / gcdValue}x ${state.plus1 ? '+' : '-'} ${variables.b / gcdValue}w)yz)/(wx(${variables.c / gcdValue}z ${state.plus2 ? '+' : '-'} ${variables.d / gcdValue}y))`).substitute(variables).removeTrivial(['sortProducts'])

	return { ...state, variables, fraction1, fraction2, fraction3, fraction4, numerator, denominator, expression, gcdValue, fraction1Intermediate, fraction2Intermediate, fraction3Intermediate, fraction4Intermediate, numeratorSplit, denominatorSplit, numeratorIntermediate, denominatorIntermediate, intermediate, intermediateFlipped, intermediateMerged, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'numeratorIntermediate')
		case 2:
			return performComparison(exerciseData, 'denominatorIntermediate')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
