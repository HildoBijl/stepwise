const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx+d) = acx^2 + (ad+bc)x + bd
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'expandDoubleBrackets',
	...stepsToSetup(['expandBrackets', 'expandBrackets', 'mergeSimilarTerms']),
	comparison: {
		firstExpanded: (input, correct, { factor2 }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !equivalent(factor, factor2))) && equivalent(input, correct), // No sum within product, except for factor2. (And equivalent.)
		allExpanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState() {
	return {
		x: sample(variableSet),
		a: getRandomInteger(2, 6),
		b: getRandomInteger(2, 6),
		c: getRandomInteger(2, 6),
		d: getRandomInteger(2, 6),
		xFirst: getRandomBoolean(), // Do we use ax+b or b+ax?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor1 = asExpression(state.xFirst ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
	const factor2 = asExpression(state.xFirst ? 'c*x+d' : 'd+c*x').substitute(variables).removeTrivial()
	const expression = factor1.multiply(factor2).flatten()
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten(['mergeProductMinuses'])
	const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
	const ans = allExpanded.combine()
	const xFactors = allExpanded.terms.filter(term => term.isProduct() && term.factors.some(factor => variables.x.equalStructure(factor)))
	const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
	return { ...state, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors, xFactorsMerged }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'firstExpanded')
		case 2:
			return performComparison(exerciseData, 'allExpanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
