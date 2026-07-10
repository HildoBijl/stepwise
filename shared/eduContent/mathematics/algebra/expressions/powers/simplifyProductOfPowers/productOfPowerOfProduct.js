const { sample, getRandomInteger, count } = require('@step-wise/utils')
const { asExpression, expressionComparisons, expressionChecks } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { filterVariables } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// ax^b*(cx)^d = ac^d*x^(b+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'simplifyProductOfPowers',
	...stepsToSetup(['rewritePower', 'simplifyNumberProduct', 'rewritePower']),
	compare: {
		bracketsExpanded: (input, correct) => !hasProductWithinPowerBase(input) && equivalent(input, correct),
		numbersSimplified: (input, correct) => !hasProductWithinPowerBase(input) && !input.some(term => term.isProduct() && count(term.factors, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}

function generateState(example) {
	const c = getRandomInteger(example ? 2 : -6, 6, [-1, 0, 1])
	return {
		x: sample(variableSet),
		a: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		b: getRandomInteger(2, 6),
		c,
		d: getRandomInteger(2, Math.abs(c) >= 5 ? 3 : 4), // Don't make the power too large when the number is also large.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('a*x^b*(c*x)^d').substitute(variables).removeTrivial()
	const bracketsExpanded = expression.removeTrivial(['expandPowersOfProducts', 'mergePowerMinuses'])
	const numbersSimplified = bracketsExpanded.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
	const powersMerged = numbersSimplified.removeTrivial(['mergeProductFactors'])
	const ans = powersMerged.combine()
	return { ...state, variables, expression, bracketsExpanded, numbersSimplified, powersMerged, ans }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('bracketsExpanded', data)
		case 2:
			return compare('numbersSimplified', data)
		default:
			return compare('ans', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
