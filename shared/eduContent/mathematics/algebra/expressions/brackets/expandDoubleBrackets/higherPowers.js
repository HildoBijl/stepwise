const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
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
		firstExpanded: (input, correct, { factor2 }) => !input.some(term => term.isProduct() && term.some(factor => factor.isSum() && !equivalent(factor, factor2))) && equivalent(input, correct), // No sum within product, except for factor2. (And equivalent.)
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
		x: sample(variableSet),
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
	const factor1 = asExpression(state.switch ? 'a*x^p+b*x^q' : 'b*x^q+a*x^p').substitute(variables).removeTrivial()
	const factor2 = asExpression(state.switch ? 'c*x^r+d*x^s' : 'd*x^s+c*x^r').substitute(variables).removeTrivial()
	const expression = factor1.multiply(factor2).flatten()
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2)).flatten(['mergeProductMinuses'])
	const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
	const jointFactor = asExpression('x^(q+r)').substitute(variables).normalize()
	const ans = allExpanded.combine()
	const xFactors = allExpanded.terms.filter(term => term.some(factor => variables.x.toPower(state.q + state.r).equalStructure(factor)))
	const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
	return { ...state, variables, factor1, factor2, expression, firstExpanded, allExpanded, jointFactor, ans, xFactors, xFactorsMerged }
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
