const { sample, getRandomInteger, getRandomBoolean, count } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../eduTools')

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// With a negative: ax(b-cx^n) = abx-acx^(n+1).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'n']

const metaData = {
	skill: 'expandBrackets',
	...stepsToSetup([undefined, 'simplifyNumberProduct', 'rewritePower']),
	comparison: {
		expanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		numbersMerged: (input, correct) => !hasSumWithinProduct(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState() {
	return {
		x: sample(variableSet),
		a: getRandomInteger(-8, -2),
		b: getRandomInteger(2, 8),
		c: getRandomInteger(2, 8),
		n: getRandomInteger(1, 3),
		xFirst: getRandomBoolean(), // Do we use b-cx^n or cx^n-b?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('ax').substitute(variables).removeTrivial()
	const sum = asExpression(state.xFirst ? 'b-c*x^n' : 'c*x^n-b').substitute(variables).removeTrivial()
	const expression = factor.multiply(sum).removeTrivial()
	const expanded = expression.flatten(['expandProductsOfSums', 'expandMinusSums'])
	const numbersMerged = expanded.flatten(['mergeProductNumbers', 'mergeProductMinuses', 'removeDoubleNegatives'])
	const ans = numbersMerged.flatten(['mergeProductFactors', 'mergeSumNumbers'])
	return { ...state, variables, factor, sum, expression, expanded, numbersMerged, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'expanded')
		case 2:
			return performComparison(exerciseData, 'numbersMerged')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
