const { sample, getRandomInteger, count } = require('@step-wise/utils')
const { asExpression, expressionComparisons, expressionChecks } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// (ax^b)^c = a^c*x^(bc).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'simplifyProductOfPowers',
	steps: ['rewritePower', 'simplifyNumberProduct', 'rewritePower'],
	comparison: {
		bracketsExpanded: (input, correct) => !hasProductWithinPowerBase(input) && equivalent(input, correct),
		numbersSimplified: (input, correct) => !hasProductWithinPowerBase(input) && !input.recursiveSome(term => term.isProduct() && count(term.terms, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1])
	return {
		x: sample(variableSet),
		a,
		b: getRandomInteger(2, 6),
		c: getRandomInteger(2, Math.abs(a) >= 6 ? 3 : 4), // Don't make the power too large when the number is also large.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(a*x^b)^c').substitute(variables).removeTrivial()
	const bracketsExpanded = expression.removeTrivial(['expandPowersOfProducts', 'mergePowerMinuses'])
	const numbersSimplified = bracketsExpanded.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
	const powersMerged = numbersSimplified.removeTrivial(['removePowersWithinPowers'])
	const ans = powersMerged.combine()
	return { ...state, variables, expression, bracketsExpanded, numbersSimplified, powersMerged, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bracketsExpanded')
		case 2:
			return performComparison(exerciseData, 'numbersSimplified')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
