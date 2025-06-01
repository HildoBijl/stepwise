const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Sum, Product } = require('../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax^p+bx^q)(cx^r+dx^s) = ...
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

const metaData = {
	skill: 'expandDoubleBrackets',
	steps: ['expandBrackets', 'expandBrackets', 'mergeSimilarTerms'],
	comparison: {
		firstExpanded: (input, correct, { factor2 }) => !input.recursiveSome(term => term.isSubtype(Product) && term.recursiveSome(factor => factor.isSubtype(Sum) && !equivalent(factor, factor2))) && equivalent(input, correct), // No sum within product, except for factor2. (And equivalent.)
		allExpanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const p = getRandomInteger(1, 4)
	const q = getRandomInteger(0, 3, [p])
	const s = getRandomInteger(0, 3, [q])
	const r = p + s - q // Ensure q + r = p + s.
	if (r < 0 || r > 4)
		return generateState() // Invalid state.
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(-8, 8, [0]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		d: getRandomInteger(-8, 8, [0]),
		p, q, r, s,
		switch: getRandomBoolean(),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor1 = asExpression(state.switch ? 'a*x^p+b*x^q' : 'b*x^q+a*x^p').substituteVariables(variables).removeUseless()
	const factor2 = asExpression(state.switch ? 'c*x^r+d*x^s' : 'd*x^s+c*x^r').substituteVariables(variables).removeUseless()
	const expression = factor1.multiply(factor2)
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2))
	const allExpanded = firstExpanded.simplify({ expandProductsOfSums: true, mergeProductNumbers: true, mergeSumNumbers: true, mergePowerNumbers: true, mergeProductFactors: true })
	const ans = allExpanded.simplify({ groupSumTerms: true, mergeSumNumbers: true })
	const xFactors = allExpanded.terms.filter(term => term.recursiveSome(factor => variables.x.toPower(state.q + state.r).equals(factor)))
	const xFactorsMerged = xFactors[0].add(xFactors[1]).cleanForAnalysis()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
