const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx^2+dx+e) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'f']

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
		a: getRandomInteger(-8, 8, [0]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		d: getRandomInteger(-8, 8, [0]),
		f: getRandomInteger(-8, 8, [0]),
		switch: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor1 = asExpression(state.switch ? 'a*x+b' : 'b+a*x').substitute(variables).removeTrivial()
	const factor2 = asExpression(state.switch ? 'c*x^2+d*x+f' : 'f+d*x+c*x^2').substitute(variables).removeTrivial()
	const expression = factor1.multiply(factor2).flatten()
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten()
	const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
	const ans = allExpanded.combine()
	const xFactors1 = allExpanded.terms.filter(term => variables.x.equalStructure(term) || term.some(exp => exp.isProduct() && exp.factors.some(factor => variables.x.equalStructure(factor))))
	const xFactors2 = allExpanded.terms.filter(term => term.some(factor => variables.x.toPower(2).equalStructure(factor)))
	const xFactors1Merged = xFactors1[0].add(xFactors1[1]).normalize()
	const xFactors2Merged = xFactors2[0].add(xFactors2[1]).normalize()
	return { ...state, variables, factor1, factor2, expression, firstExpanded, allExpanded, ans, xFactors1, xFactors2, xFactors1Merged, xFactors2Merged }
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
