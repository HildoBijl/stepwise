const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util')
const { asExpression, expressionComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionComparisons

// a/(xz) + b/(yz) = (ay+bx)/(xyz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	steps: [null, ['addRemoveFractionFactors', 'addRemoveFractionFactors'], 'mergeSplitBasicFractions'],
	comparison: {
		default: onlyOrderChanges,
	},
}
addSetupFromSteps(data)

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		plus: getRandomBoolean(), // Is there a plus or a minus sign?
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { plus, x, y } = state

	// Set up the original expression.
	const leftExpression = asExpression(`a/(xz)`).substituteVariables(variables)
	const rightExpression = asExpression(`b/(yz)`).substituteVariables(variables)
	const expression = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const denominator = asExpression('xyz').substituteVariables(variables).simplify({ sortProducts: true })
	const leftAns = leftExpression.multiplyNumDen(y).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const rightAns = rightExpression.multiplyNumDen(x).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const ans = leftAns.numerator[plus ? 'add' : 'subtract'](rightAns.numerator).divide(denominator)

	return { ...state, variables, leftExpression, rightExpression, expression, denominator, leftAns, rightAns, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('denominator', input, solution, data.comparison)
	if (step === 2)
		return performComparison(['leftAns', 'rightAns'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}