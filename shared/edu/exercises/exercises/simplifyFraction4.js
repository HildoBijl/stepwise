const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { gcd } = require('../../../util/maths')
const { asExpression, Fraction, expressionComparisons, expressionChecks, simplifyOptions } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { equivalent } = expressionComparisons
const { hasFractionWithinFraction } = expressionChecks

// (a/w + b/x)/(c/y + d/z).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	skill: 'simplifyFraction',
	steps: ['mergeSplitFractions', 'mergeSplitFractions', 'multiplyDivideFractions'],
	comparison: {
		default: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
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
	const fraction1 = asExpression('a/w').substituteVariables(variables)
	const fraction2 = asExpression('b/x').substituteVariables(variables)
	const fraction3 = asExpression('c/y').substituteVariables(variables)
	const fraction4 = asExpression('d/z').substituteVariables(variables)
	const numerator = fraction1[state.plus1 ? 'add' : 'subtract'](fraction2)
	const denominator = fraction3[state.plus2 ? 'add' : 'subtract'](fraction4)
	const expression = numerator.divide(denominator)

	// Simplify the expression.
	const gcdValue = gcd(...constants.map(constant => state[constant]))
	const fraction1Intermediate = fraction1.multiplyNumDen(variables.x).simplify({ sortProducts: true })
	const fraction2Intermediate = fraction2.multiplyNumDen(variables.w).simplify({ sortProducts: true })
	const fraction3Intermediate = fraction3.multiplyNumDen(variables.z).simplify({ sortProducts: true })
	const fraction4Intermediate = fraction4.multiplyNumDen(variables.y).simplify({ sortProducts: true })
	const numeratorSplit = fraction1Intermediate[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate)
	const denominatorSplit = fraction3Intermediate[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate)
	const numeratorIntermediate = fraction1Intermediate.numerator[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate.numerator).divide(fraction1Intermediate.denominator)
	const denominatorIntermediate = fraction3Intermediate.numerator[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate.numerator).divide(fraction3Intermediate.denominator)

	const intermediate = numeratorIntermediate.divide(denominatorIntermediate)
	const intermediateFlipped = intermediate.numerator.multiply(intermediate.denominator.invert())
	const intermediateMerged = intermediateFlipped.simplify({ mergeFractionProducts: true })

	const ans = asExpression(`((${variables.a / gcdValue}x ${state.plus1 ? '+' : '-'} ${variables.b / gcdValue}w)yz)/(wx(${variables.c / gcdValue}z ${state.plus2 ? '+' : '-'} ${variables.d / gcdValue}y))`).substituteVariables(variables).simplify({ ...simplifyOptions.removeUseless, sortProducts: true })

	return { ...state, variables, fraction1, fraction2, fraction3, fraction4, numerator, denominator, expression, gcdValue, fraction1Intermediate, fraction2Intermediate, fraction3Intermediate, fraction4Intermediate, numeratorSplit, denominatorSplit, numeratorIntermediate, denominatorIntermediate, intermediate, intermediateFlipped, intermediateMerged, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('numeratorIntermediate', input, solution, data.comparison)
	if (step === 2)
		return performComparison('denominatorIntermediate', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}