const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, expressionChecks } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { selectRandomVariables, filterVariables } = require('../util/CASsupport')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

const { onlyOrderChanges } = expressionChecks

// a/(xz) + b/(yz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const data = {
	skill: 'mergeSplitFractions',
	setup: combinerAnd(combinerRepeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
	steps: [null, ['addRemoveFractionFactors', 'addRemoveFractionFactors'], 'mergeSplitBasicFractions'],
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

function getCorrect(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { plus, x, y } = state

	// Set up the original expression.
	const leftExpression = asExpression(`a/(xz)`).substituteVariables(variables)
	const rightExpression = asExpression(`b/(yz)`).substituteVariables(variables)
	const expression = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const denominator = asExpression('xyz').substituteVariables(variables).simplify({ sortProducts: true })
	const leftAns = leftExpression.multiplyNumDenBy(y).simplify({ removeUseless: true, mergeProductNumbers: true, sortProducts: true })
	const rightAns = rightExpression.multiplyNumDenBy(x).simplify({ removeUseless: true, mergeProductNumbers: true, sortProducts: true })
	const ans = leftAns.numerator[plus ? 'add' : 'subtract'](rightAns.numerator).divideBy(denominator)

	return { ...state, variables, leftExpression, rightExpression, expression, denominator, leftAns, rightAns, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 3)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('denominator', correct, input, data.check)
	if (step === 2)
		return performCheck(['leftAns', 'rightAns'], correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getCorrect,
	checkInput,
}