const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Sum, Product } = require('../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx^2+dx+e) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'expandDoubleBrackets',
	steps: ['expandBrackets', 'expandBrackets', 'mergeSimilarTerms'],
	comparison: {
		firstExpanded: (input, correct, { factor2 }) => !input.recursiveSome(term => term.isSubtype(Product) && term.recursiveSome(factor => factor.isSubtype(Sum) && !equivalent(factor, factor2))) && equivalent(input, correct), // No sum within product, except for factor2. (And equivalent.)
		allExpanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState() {
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(-8, 8, [0]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		d: getRandomInteger(-8, 8, [0]),
		e: getRandomInteger(-8, 8, [0]),
		switch: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const factor1 = asExpression(state.switch ? 'a*x+b' : 'b+a*x').substituteVariables(variables).removeUseless()
	const factor2 = asExpression(state.switch ? 'c*x^2+d*x+e' : 'e+d*x+c*x^2').substituteVariables(variables).removeUseless()
	const expression = factor1.multiply(factor2)
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2))
	const allExpanded = firstExpanded.simplify({ expandProductsOfSums: true, mergeProductNumbers: true, mergeSumNumbers: true, mergePowerNumbers: true, mergeProductFactors: true })
	const ans = allExpanded.simplify({ groupSumTerms: true, mergeSumNumbers: true })
	const xFactors1 = allExpanded.terms.filter(term => variables.x.equals(term) || (term.isSubtype(Product) && term.factors.some(factor => variables.x.equals(factor))))
	const xFactors2 = allExpanded.terms.filter(term => term.recursiveSome(factor => variables.x.toPower(2).equals(factor)))
	const xFactors1Merged = xFactors1[0].add(xFactors1[1]).cleanForAnalysis()
	const xFactors2Merged = xFactors2[0].add(xFactors2[1]).cleanForAnalysis()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
