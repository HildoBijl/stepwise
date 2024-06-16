const { selectRandomly, getRandomInteger, getRandomBoolean, count } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Product } = require('../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// ax(bx+c) = abx + ac.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'expandBrackets',
	steps: [null, 'simplifyNumberProducts', 'rewritePowers'],
	comparison: {
		expanded: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct),
		numbersMerged: (input, correct) => !hasSumWithinProduct(input) && !input.recursiveSome(term => term.isSubtype(Product) && count(term.terms, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState() {
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(2, 8),
		b: getRandomInteger(2, 8),
		c: getRandomInteger(2, 8),
		xFirst: getRandomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	// Extract state variables.
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x').substituteVariables(variables)
	const sum = asExpression(state.xFirst ? 'b*x+c' : 'c+b*x').substituteVariables(variables)
	const expression = factor.multiply(sum)
	const expanded = expression.simplify({ expandProductsOfSums: true })
	const numbersMerged = expanded.simplify({ mergeProductNumbers: true })
	const ans = numbersMerged.simplify({ mergeProductFactors: true, mergeSumNumbers: true })
	return { ...state, variables, factor, sum, expression, expanded, numbersMerged, ans }
}

function checkInput(exerciseData, step) {
	console.log(exerciseData, step)
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
