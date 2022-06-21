const { gcd } = require('../../../util/maths')
const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionChecks } = require('../../../CAS')
const { combinerAnd } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionChecks

// (c/x)/(a/x^2 + b/(xy)) = (cxy)/(ay+bx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
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
	const gcdValue = gcd(...constants.map(constant => state[constant]))
	const fraction1 = asExpression('a/x^2').substituteVariables(variables)
	const fraction2 = asExpression('b/(xy)').substituteVariables(variables)
	const numerator = asExpression('c/x').substituteVariables(variables)
	const denominator = fraction1[state.plus ? 'add' : 'subtract'](fraction2)
	const expression = numerator.divideBy(denominator)
	const fraction1Intermediate = fraction1.multiplyNumDenBy(variables.y).basicClean()
	const fraction2Intermediate = fraction2.multiplyNumDenBy(variables.x).basicClean()
	const intermediateSplit = fraction1Intermediate[state.plus ? 'add' : 'subtract'](fraction2Intermediate)
	const intermediate = fraction1Intermediate.numerator[state.plus ? 'add' : 'subtract'](fraction2Intermediate.numerator).divideBy(fraction1Intermediate.denominator)
	const expressionWithIntermediate = numerator.divideBy(intermediate)
	const ans = asExpression(`(${variables.c / gcdValue}xy)/(${variables.a / gcdValue}y ${state.plus ? '+' : '-'} ${variables.b / gcdValue}x)`).substituteVariables(variables).simplify({ ...simplifyOptions.forAnalysis, sortSums: false })
	return { ...state, variables, gcdValue, fraction1, fraction2, numerator, denominator, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate, expressionWithIntermediate, ans }
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