const { gcd } = require('../../../util/numbers')
const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Fraction, expressionChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { hasFractionWithinFraction, equivalent } = expressionChecks

// (a/w + b/x)/(c/y + d/z).
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

const data = {
	setup: combinerAnd(combinerRepeat('mergeSplitFractions', 2), 'multiplyDivideFractions'),
	steps: ['mergeSplitFractions', 'mergeSplitFractions', 'multiplyDivideFractions'],
	check: {
		default: (correct, input) => input.isType(Fraction) && !hasFractionWithinFraction(input) && equivalent(correct, input),
	},
}

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

function getCorrect(state) {
	const variables = filterVariables(state, usedVariables, constants)

	// Define the expression.
	const fraction1 = asExpression('a/w').substituteVariables(variables)
	const fraction2 = asExpression('b/x').substituteVariables(variables)
	const fraction3 = asExpression('c/y').substituteVariables(variables)
	const fraction4 = asExpression('d/z').substituteVariables(variables)
	const numerator = fraction1[state.plus1 ? 'add' : 'subtract'](fraction2)
	const denominator = fraction3[state.plus2 ? 'add' : 'subtract'](fraction4)
	const expression = numerator.divideBy(denominator)

	// Simplify the expression.
	const gcdValue = gcd(...constants.map(constant => state[constant]))
	const fraction1Intermediate = fraction1.multiplyNumDenBy(variables.x).simplify({ sortProducts: true })
	const fraction2Intermediate = fraction2.multiplyNumDenBy(variables.w).simplify({ sortProducts: true })
	const fraction3Intermediate = fraction3.multiplyNumDenBy(variables.z).simplify({ sortProducts: true })
	const fraction4Intermediate = fraction4.multiplyNumDenBy(variables.y).simplify({ sortProducts: true })
	const numeratorSplit = fraction1Intermediate[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate)
	const denominatorSplit = fraction3Intermediate[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate)
	const numeratorIntermediate = fraction1Intermediate.numerator[state.plus1 ? 'add' : 'subtract'](fraction2Intermediate.numerator).divideBy(fraction1Intermediate.denominator)
	const denominatorIntermediate = fraction3Intermediate.numerator[state.plus2 ? 'add' : 'subtract'](fraction4Intermediate.numerator).divideBy(fraction3Intermediate.denominator)

	const intermediate = numeratorIntermediate.divideBy(denominatorIntermediate)
	const intermediateFlipped = intermediate.numerator.multiplyBy(intermediate.denominator.invert())
	const intermediateMerged = intermediateFlipped.simplify({ mergeFractionProducts: true })

	const ans = asExpression(`((${variables.a / gcdValue}x ${state.plus1 ? '+' : '-'} ${variables.b / gcdValue}w)yz)/(wx(${variables.c / gcdValue}z ${state.plus2 ? '+' : '-'} ${variables.d / gcdValue}y))`).substituteVariables(variables).simplify({ ...simplifyOptions.removeUseless, sortProducts: true })

	return { ...state, variables, fraction1, fraction2, fraction3, fraction4, numerator, denominator, expression, gcdValue, fraction1Intermediate, fraction2Intermediate, fraction3Intermediate, fraction4Intermediate, numeratorSplit, denominatorSplit, numeratorIntermediate, denominatorIntermediate, intermediate, intermediateFlipped, intermediateMerged, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 3)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('numeratorIntermediate', correct, input, data.check)
	if (step === 2)
		return performCheck('denominatorIntermediate', correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}