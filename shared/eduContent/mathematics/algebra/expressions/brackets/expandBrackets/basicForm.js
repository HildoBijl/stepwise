const { sample, getRandomInteger, getRandomBoolean, count } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { hasSumWithinProduct } = expressionChecks
const { onlyOrderChanges, equivalent } = expressionComparisons

// ax(bx+c) = abx^2 + acx.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'expandBrackets',
	steps: [null, 'simplifyNumberProduct', 'rewritePower'],
	comparison: {
		expanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		numbersMerged: (input, correct) => !hasSumWithinProduct(input) && !input.recursiveSome(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
