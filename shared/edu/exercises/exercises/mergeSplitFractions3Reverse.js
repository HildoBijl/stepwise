const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util')
const { asExpression, expressionComparisons } = require('../../../CAS')

const { selectRandomVariables, filterVariables } = require('../../../eduTools')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionComparisons

// a/(xz) + b/(yz) = (ay+bx)/(xyz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	steps: ['mergeSplitBasicFractions', ['addRemoveFractionFactors', 'addRemoveFractionFactors'], null],
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
	const { plus } = state

	// Set up the original expression.
	const sign = plus ? '+' : '-'
	const expression = asExpression(`(ay${sign}bx)/(xyz)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const leftExpression = asExpression(`(ay)/(xyz)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const rightExpression = asExpression(`(bx)/(xyz)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const split = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const leftAns = leftExpression.cleanForAnalysis()
	const rightAns = rightExpression.cleanForAnalysis()
	const ans = leftAns[plus ? 'add' : 'subtract'](rightAns)

	return { ...state, variables, expression, leftExpression, rightExpression, split, leftAns, rightAns, ans }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('ans', input, solution, data.comparison)
	if (step === 1)
		return performComparison('split', input, solution, data.comparison)
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