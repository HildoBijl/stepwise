const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionChecks, simplifyOptions } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = expressionChecks

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	setup: combinerAnd(combinerRepeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
	steps: ['mergeSplitBasicFractions', ['addRemoveFractionFactors', 'addRemoveFractionFactors'], null],
	check: {
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
	const expression = asExpression(`(by${sign}ax)/(abxy)`).substituteVariables(variables).simplify({ removeUseless: true, mergeProductNumbers: true, sortProducts: true })
	const leftExpression = asExpression(`(by)/(abxy)`).substituteVariables(variables).simplify({ removeUseless: true, mergeProductNumbers: true, sortProducts: true })
	const rightExpression = asExpression(`(ax)/(abxy)`).substituteVariables(variables).simplify({ removeUseless: true, mergeProductNumbers: true, sortProducts: true })
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
		return performCheck('ans', solution, input, data.check)
	if (step === 1)
		return performCheck('split', solution, input, data.check)
	if (step === 2)
		return performCheck(['leftAns', 'rightAns'], solution, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}