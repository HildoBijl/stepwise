const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Sum, Product } = require('../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// (ax+b)(cx+d) = acx^2 + (ad+bc)x + bd
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

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
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(2, 6),
		b: getRandomInteger(2, 6),
		c: getRandomInteger(2, 6),
		d: getRandomInteger(2, 6),
		xFirst: getRandomBoolean(), // Do we use ax+b or b+ax?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor1 = asExpression(state.xFirst ? 'a*x+b' : 'b+a*x').substituteVariables(variables)
	const factor2 = asExpression(state.xFirst ? 'c*x+d' : 'd+c*x').substituteVariables(variables)
	const expression = factor1.multiply(factor2)
	const firstExpanded = factor1.terms[0].multiply(factor2).add(factor1.terms[1].multiply(factor2))
	const allExpanded = firstExpanded.simplify({ expandProductsOfSums: true, mergeProductNumbers: true, mergeSumNumbers: true, mergePowerNumbers: true, mergeProductFactors: true })
	const ans = allExpanded.simplify({ groupSumTerms: true, mergeSumNumbers: true })
	const xFactors = allExpanded.terms.filter(term => term.isSubtype(Product) && term.factors.some(factor => variables.x.equals(factor)))
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
