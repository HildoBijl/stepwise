const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { asExpression, simplifyOptions, expressionComparisons, expressionChecks } = require('../../../CAS')
const { combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (x+a)(y+b) = xy + ay + xb + ab.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	setup: combinerRepeat('expandBrackets', 2),
	steps: ['expandBrackets', 'expandBrackets'],
	comparison: {
		default: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
	},
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-6, 6, [0]),
		b: getRandomInteger(-6, 6, [0]),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(x+a)(y+b)').substituteVariables(variables)
	const term1 = expression.terms[0]
	const term2 = expression.terms[1]
	const expressionSubstituted = asExpression('z(y+b)').substituteVariables(variables)
	const intermediate = expressionSubstituted.simplify({ ...simplifyOptions.forAnalysis, sortProducts: false })
	const intermediateSubstituted = intermediate.substitute(variables.z, term1)
	const ans = intermediateSubstituted.cleanForAnalysis()
	return { ...state, variables, expression, term1, term2, expressionSubstituted, intermediate, intermediateSubstituted, ans }
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