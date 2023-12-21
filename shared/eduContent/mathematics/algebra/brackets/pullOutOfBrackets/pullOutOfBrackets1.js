const { selectRandomly, getRandomInteger, getRandomIndices } = require('../../../../../util')
const { asExpression, Sum, expressionComparisons, simplifyOptions } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// ax^2+bx+c = x*(ax+b+c/x).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'pullOutOfBrackets',
	steps: [null, 'mergeSplitFractions', null, 'expandBrackets'],
	comparison: {
		default: onlyOrderChanges,
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		a: getRandomInteger(-8, 8, [0]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		order: getRandomIndices(3, 3),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['ax^2', 'bx', 'c'].map(term => asExpression(term).substituteVariables(variables).removeUseless())
	const expression = new Sum(state.order.map(index => terms[index]))
	const fraction = expression.divide(variables.x)
	const setup = variables.x.multiply(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, crossOutFractionTerms: true })
	const ans = variables.x.multiply(fractionSimplified)
	return { ...state, variables, expression, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('setup', input, solution, data.comparison)
	if (step === 2)
		return performComparison('fractionSimplified', input, solution, data.comparison)
	if (step === 4)
		return performComparison('expression', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}