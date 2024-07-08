const { selectRandomly, getRandomInteger, getRandomIndices } = require('../../../../../util')
const { asExpression, Sum, expressionComparisons, simplifyOptions } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// axy^2 + bxy + cx^2y = xy(ay + b + cx).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'pullOutOfBrackets',
	steps: [null, 'mergeSplitFractions', null, 'expandBrackets'],
	comparison: onlyOrderChanges,
}
addSetupFromSteps(metaData)

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
	const terms = ['axy^2', 'bxy', 'cx^2y'].map(term => asExpression(term).substituteVariables(variables).removeUseless())
	const factor = asExpression('xy').substituteVariables(variables).simplify({ sortProducts: true })
	const expression = new Sum(state.order.map(index => terms[index])).simplify({ sortProducts: true })
	const fraction = expression.divide(factor)
	const setup = factor.multiply(fraction)
	const fractionSplit = fraction.simplify({ splitFractions: true })
	const fractionSimplified = fractionSplit.simplify({ ...simplifyOptions.basicClean, crossOutFractionFactors: true })
	const ans = factor.multiply(fractionSimplified)
	return { ...state, variables, expression, factor, fraction, setup, fractionSplit, fractionSimplified, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'setup')
		case 2:
			return performComparison(exerciseData, 'fractionSimplified')
		case 4:
			return performComparison(exerciseData, 'expression')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
