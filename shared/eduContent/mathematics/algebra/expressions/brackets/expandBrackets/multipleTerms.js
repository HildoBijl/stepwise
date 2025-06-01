const { selectRandomly, getRandomInteger, getRandomBoolean, count } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Product } = require('../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// ax(bx^2+cx+d) = abx^3+acx^2+adx.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'expandBrackets',
	steps: [null, 'simplifyNumberProduct', 'rewritePower'],
	comparison: {
		expanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		numbersMerged: (input, correct) => !hasSumWithinProduct(input) && !input.recursiveSome(term => term.isSubtype(Product) && count(term.terms, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState() {
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(2, 8),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [0]),
		d: getRandomInteger(-8, 8, [0]),
		descending: getRandomBoolean(), // Do we use bx^2+cx+d or d+cx+bx^2?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x').substituteVariables(variables)
	const sum = asExpression(state.descending ? 'b*x^2+c*x+d' : 'd+c*x+b*x^2').substituteVariables(variables).removeUseless()
	const expression = factor.multiply(sum)
	const expanded = expression.simplify({ expandProductsOfSums: true })
	const numbersMerged = expanded.simplify({ mergeProductNumbers: true })
	const ans = numbersMerged.simplify({ mergeProductFactors: true, mergeSumNumbers: true })
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
