const { sample, randomInteger, count } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct, hasSumWithinPowerBase } = expressionChecks

// (ax^p+bx^q)^2
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'p', 'q']

const metaData = {
	skill: 'expandDoubleBrackets',
	steps: ['rewritePower', 'expandBrackets', 'expandBrackets', 'mergeSimilarTerms'],
	comparison: {
		multiplication: (input, correct) => !input.some(factor => factor.isPower() && factor.base.isSum()) && equivalent(input, correct),
		firstExpanded: (input, correct) => !input.some(term => term.isProduct() && count(term.factors, factor => factor.isSum()) > 1) && equivalent(input, correct), // No product with two (or more) sums. (And equivalent.)
		allExpanded: (input, correct) => !hasSumWithinProduct(input) && !hasSumWithinPowerBase(input, correct) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const p = randomInteger(0, 3)
	const q = randomInteger(0, 3, [p])
	return {
		x: sample(variableSet),
		a: randomInteger(-8, 8, [0]),
		b: randomInteger(-8, 8, [0]),
		p, q,
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x^p+b*x^q').substitute(variables).removeTrivial()
	const expression = factor.toPower(2)
	const multiplication = factor.multiply(factor).flatten()
	const firstExpanded = factor.terms[0].multiply(factor).add(factor.terms[1].multiply(factor)).flatten(['mergeProductMinuses'])
	const allExpanded = firstExpanded.mergeNumbers(['expandProductsOfSums', 'expandMinusSums', 'mergeProductFactors'])
	const jointFactor = asExpression('x^(p+q)').substitute(variables).normalize()
	const ans = allExpanded.combine()
	const xPowerToMerge = variables.x.toPower(state.p + state.q).mergeNumbers()
	const hasXPowerToMerge = term => term.equalStructure(xPowerToMerge) || (term.isProduct() && term.factors.some(factor => factor.equalStructure(xPowerToMerge))) || (term.isMinus() && hasXPowerToMerge(term.argument))
	const xFactors = allExpanded.terms.filter(term => hasXPowerToMerge(term))
	const xFactorsMerged = xFactors[0].add(xFactors[1]).normalize()
	return { ...state, variables, factor, expression, multiplication, firstExpanded, allExpanded, jointFactor, ans, xFactors, xFactorsMerged }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'multiplication')
		case 2:
			return performComparison(exerciseData, 'firstExpanded')
		case 3:
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
