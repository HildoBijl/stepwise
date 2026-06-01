const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// a/(xz) + b/(yz) = (ay+bx)/(xyz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const metaData = {
	skill: 'addFractionsWithMultipleVariables',
	steps: [null, ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], 'addLikeFractionsWithVariables'],
	comparison: onlyOrderChanges,
}
addSetupFromSteps(metaData)

function generateState() {
	const variableSet = sample(availableVariableSets)
	return {
		...selectRandomVariables(variableSet, usedVariables),
		plus: randomBoolean(), // Is there a plus or a minus sign?
		a: randomInteger(2, 12),
		b: randomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { plus, x, y } = state

	// Set up the original expression.
	const leftExpression = asExpression(`a/(xz)`).substitute(variables)
	const rightExpression = asExpression(`b/(yz)`).substitute(variables)
	const expression = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const denominator = asExpression('xyz').substitute(variables).flatten(['sortProducts'])
	const leftAns = multiplyNumeratorAndDenominator(leftExpression, y).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const rightAns = multiplyNumeratorAndDenominator(rightExpression, x).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const ans = leftAns.numerator[plus ? 'add' : 'subtract'](rightAns.numerator).divide(denominator)

	return { ...state, variables, leftExpression, rightExpression, expression, denominator, leftAns, rightAns, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'denominator')
		case 2:
			return performComparison(exerciseData, ['leftAns', 'rightAns'])
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
