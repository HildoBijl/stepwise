const { sample, getRandomInteger, getRandomBoolean, count } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../eduTools')

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// (bx+c)*ax^n = bx^(n+1) + cax^n.
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
		a: getRandomInteger(2, 8),
		b: getRandomInteger(2, 8),
		c: getRandomInteger(-8, 8, [0]),
		n: getRandomInteger(1, 3),
		xFirst: getRandomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x^n').substitute(variables).removeTrivial()
	const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substitute(variables).removeTrivial()
	const expression = sum.multiply(factor).removeTrivial()
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
