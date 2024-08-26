const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../util')
const { asExpression, expressionComparisons, Product, Sum } = require('../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^n(bx + c) = abx + ac.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'n']

const metaData = {
	skill: 'pullFactorOutOfBrackets',
	steps: [null, 'addLikeFractionsWithVariables', 'simplifyFractionWithVariables', 'expandBrackets'],
	comparison: {
		startingForm: (input, correct) => onlyOrderChanges(input, correct),
		splitUp: (input, correct, { expression, factor }) => input.isSubtype(Product) && input.factors.length === 3 && factor.factors.every(subFactor => input.factors.some(inputFactor => onlyOrderChanges(inputFactor, subFactor))) && input.factors.some(inputFactor => inputFactor.isSubtype(Sum) && inputFactor.terms.length === expression.terms.length) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.basicClean(), correct),
		check: (input, correct) => onlyOrderChanges(input.basicClean(), correct),
	}
}

function generateState(example) {
	const b = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1])
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(example || b < 0 ? 2 : -8, 8, [-1, 0, 1]), // Don't allow a and b to both be negative.
		b,
		c: getRandomInteger(-8, 8, [-1, 0, 1, -b, b]),
		n: example ? 1 : getRandomInteger(2, 4),
		descending: example ? true : getRandomBoolean(), // Do we use bx+c or c+bx?
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const factor = asExpression('a*x^n').substituteVariables(variables).removeUseless()
	const sum = asExpression(state.descending ? 'b*x+c' : 'c+b*x').substituteVariables(variables)
	const ans = factor.multiply(sum)
	const expression = ans.basicClean({ expandProductsOfSums: true })
	const startingForm = factor.multiply(expression.divide(factor))
	const splitUp = factor.multiply(expression.divide(factor).basicClean({ splitFractions: true }))
	const check = expression
	return { ...state, variables, factor, sum, expression, startingForm, splitUp, ans, check }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'startingForm')
		case 2:
			return performComparison(exerciseData, 'splitUp')
		case 4:
			return performComparison(exerciseData, 'check')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
