const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionComparisons } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { onlyOrderChanges } = expressionComparisons

// ay/x + bz/y = (ay^2 + bxz)/(xy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	setup: combinerAnd(combinerRepeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
	steps: ['mergeSplitBasicFractions', ['addRemoveFractionFactors', 'addRemoveFractionFactors'], null],
	comparison: {
		default: onlyOrderChanges,
	},
}

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
	const expression = asExpression(`(ay^2${sign}bxz)/(xy)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const leftExpression = asExpression(`(ay^2)/(xy)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
	const rightExpression = asExpression(`(bxz)/(xy)`).substituteVariables(variables).removeUseless({ mergeProductNumbers: true, sortProducts: true })
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