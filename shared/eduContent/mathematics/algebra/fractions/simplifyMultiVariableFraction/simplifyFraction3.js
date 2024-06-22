const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks

// (a+x/y)/(z^b/x+c).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'simplifyMultiVariableFraction',
	steps: ['mergeSplitFractions', 'mergeSplitFractions', 'multiplyDivideFractions'],
	comparison: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 4),
		c: getRandomInteger(2, 12),
		plus1: getRandomBoolean(),
		plus2: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)

	// Define numerator.
	const term1 = asExpression('a').substituteVariables(variables)
	const fraction1 = asExpression('x/y').substituteVariables(variables)
	const numerator = term1[state.plus1 ? 'add' : 'subtract'](fraction1)

	// Define denominator.
	const fraction2 = asExpression('z^b/x').substituteVariables(variables)
	const term2 = asExpression('c').substituteVariables(variables)
	const denominator = fraction2[state.plus2 ? 'add' : 'subtract'](term2)

	// Define the expression.
	const expression = numerator.divide(denominator)

	// Simplify numerator.
	const term1Intermediate = term1.multiplyNumDen(fraction1.denominator)
	const numeratorSplit = term1Intermediate[state.plus1 ? 'add' : 'subtract'](fraction1)
	const numeratorIntermediate = term1Intermediate.numerator[state.plus1 ? 'add' : 'subtract'](fraction1.numerator).divide(fraction1.denominator)

	// Simplify denominator.
	const term2Intermediate = term2.multiplyNumDen(fraction2.denominator)
	const denominatorSplit = fraction2[state.plus2 ? 'add' : 'subtract'](term2Intermediate)
	const denominatorIntermediate = fraction2.numerator[state.plus2 ? 'add' : 'subtract'](term2Intermediate.numerator).divide(fraction2.denominator)

	// Simplify the expression.
	const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
	const ans = intermediate.basicClean()
	return { ...state, variables, term1, fraction1, numerator, fraction2, term2, denominator, expression, term1Intermediate, numeratorSplit, numeratorIntermediate, term2Intermediate, denominatorSplit, denominatorIntermediate, intermediate, ans }
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
