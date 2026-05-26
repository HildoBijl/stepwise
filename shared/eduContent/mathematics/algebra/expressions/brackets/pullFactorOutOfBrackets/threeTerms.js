const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax(bx^2 + cx + d) = abx^3 + acx^2 + adx.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'n']

const metaData = {
	skill: 'pullFactorOutOfBrackets',
	steps: [null, 'addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'],
	comparison: {
		startingForm: onlyOrderChanges,
		splitUp: (input, correct, { expression, factor }) => input.isProduct() && input.factors.length === 3 && factor.factors.every(subFactor => input.factors.some(inputFactor => onlyOrderChanges(inputFactor, subFactor))) && input.factors.some(inputFactor => inputFactor.isSum() && inputFactor.terms.length === expression.terms.length) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.cancel(), correct),
		check: (input, correct) => onlyOrderChanges(input.cancel(), correct),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const b = randomInteger(-8, 8, [-1, 0, 1])
	return {
		x: sample(variableSet),
		a: randomInteger(b < 0 ? 2 : -8, 8, [-1, 0, 1]), // Don't allow a and b to both be negative.
		b,
		c: randomInteger(-8, 8, [-1, 0, 1, -b, b]),
		d: randomInteger(-8, 8, [-1, 0, 1, -b, b]),
		descending: randomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x').substitute(variables).removeTrivial()
	const sum = asExpression(state.descending ? 'b*x^2+c*x+d' : 'd+c*x+b*x^2').substitute(variables).removeTrivial()
	const ans = factor.multiply(sum).combine()
	const expression = ans.combine(['expandProductsOfSums'])
	const startingForm = factor.multiply(expression.divide(factor)).flatten()
	const splitUp = factor.multiply(expression.divide(factor).removeTrivial(['splitFractions']))
	const check = expression
	return { ...state, variables, factor, sum, expression, startingForm, splitUp, ans, check }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'startingForm')
		case 2:
			return performComparison(exerciseData, 'splitUp')
		case 4:
			return performComparison(exerciseData, 'check')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
