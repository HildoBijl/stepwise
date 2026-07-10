const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { selectRandomVariables, filterVariables } = require('../../../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons

// a/(xz) + b/(yz) = (ay+bx)/(xyz).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b']

const metaData = {
	skill: 'addFractionsWithMultipleVariables',
	...stepsToSetup(['addLikeFractionsWithVariables', ['simplifyFractionWithVariables', 'simplifyFractionWithVariables'], undefined]),
	compare: { Expression: onlyOrderChanges },
}

function generateState() {
	const variableSet = sample(availableVariableSets)
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('split', data)
		case 2:
			return compare(['leftAns', 'rightAns'], data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
