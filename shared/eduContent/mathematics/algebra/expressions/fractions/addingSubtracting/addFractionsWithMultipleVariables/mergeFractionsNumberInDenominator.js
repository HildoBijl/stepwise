const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { lcm } = require('@step-wise/math-tools')
const { asExpression, expressionComparisons, expressionOperations } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// 1/(ax) + 1/(by) = (by + ax)/(abxy).
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
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
		plus: getRandomBoolean(), // Is there a plus or a minus sign?
		a: getRandomInteger(2, 12),
		b: getRandomInteger(2, 12),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const { plus, a, b, x, y } = state

	// Set up the original expression.
	const leftExpression = asExpression(`1/(ax)`).substitute(variables)
	const rightExpression = asExpression(`1/(by)`).substitute(variables)
	const expression = leftExpression[plus ? 'add' : 'subtract'](rightExpression)

	// Set up the solution.
	const lcmValue = lcm(a, b)
	const denominator = asExpression(`${lcmValue}xy`).substitute(variables).flatten(['sortProducts'])
	const leftAns = multiplyNumeratorAndDenominator(multiplyNumeratorAndDenominator(leftExpression, lcmValue / a), y).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const rightAns = multiplyNumeratorAndDenominator(multiplyNumeratorAndDenominator(rightExpression, lcmValue / b), x).removeTrivial(['mergeProductNumbers', 'sortProducts'])
	const ans = leftAns.numerator[plus ? 'add' : 'subtract'](rightAns.numerator).divide(denominator)

	return { ...state, variables, leftExpression, rightExpression, expression, lcmValue, denominator, leftAns, rightAns, ans }
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
