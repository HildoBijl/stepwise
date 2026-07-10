const { sample, getRandomInteger, getRandomBoolean, count } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { filterVariables } = require('../../../../../../eduTools')

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// ax(bx+c) = abx^2 + acx.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'expandBrackets',
	...stepsToSetup([undefined, 'simplifyNumberProduct', 'rewritePower']),
	compare: {
		expanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		numbersMerged: (input, correct) => !hasSumWithinProduct(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState() {
	return {
		x: sample(variableSet),
		a: getRandomInteger(2, 6),
		b: getRandomInteger(2, 6),
		c: getRandomInteger(2, 6),
		xFirst: getRandomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x').substitute(variables).removeTrivial()
	const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
	const expression = factor.multiply(sum).removeTrivial()
	const expanded = expression.flatten(['expandProductsOfSums', 'expandMinusSums'])
	const numbersMerged = expanded.flatten(['mergeProductNumbers', 'mergeProductMinuses', 'removeDoubleNegatives'])
	const ans = numbersMerged.flatten(['mergeProductFactors', 'mergeSumNumbers'])
	return { ...state, variables, factor, sum, expression, expanded, numbersMerged, ans }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('expanded', data)
		case 2:
			return compare('numbersMerged', data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
