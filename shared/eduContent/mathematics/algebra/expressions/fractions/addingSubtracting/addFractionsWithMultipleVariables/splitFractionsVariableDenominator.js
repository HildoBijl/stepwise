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
	steps: ['addLikeFractionsWithVariables', ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], null],
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
	const { plus } = state

	// Set up the original expression.
	const sign = plus ? '+' : '-'
	const expression = asExpression(`(ay${sign}bx)/(xyz)`).substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const leftExpression = asExpression(`(ay)/(xyz)`).substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const rightExpression = asExpression(`(bx)/(xyz)`).substitute(variables).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const split = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const leftAns = leftExpression.normalize()
	const rightAns = rightExpression.normalize()
	const ans = leftAns[plus ? 'add' : 'subtract'](rightAns)

	return { ...state, variables, expression, leftExpression, rightExpression, split, leftAns, rightAns, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'split')
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
