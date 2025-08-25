const { selectRandomly, getRandomInteger, count } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks, Product } = require('../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasProductWithinPowerBase } = expressionChecks

// ax^b*(cx)^d = ac^d*x^(b+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'simplifyProductOfPowers',
	steps: ['rewritePower', 'simplifyNumberProduct', 'rewritePower'],
	comparison: {
		bracketsExpanded: (input, correct) => !hasProductWithinPowerBase(input) && equivalent(input, correct),
		numbersSimplified: (input, correct) => !hasProductWithinPowerBase(input) && !input.recursiveSome(term => term.isSubtype(Product) && count(term.terms, factor => factor.isNumeric()) > 1) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const c = getRandomInteger(example ? 2 : -6, 6, [-1, 0, 1])
	return {
		x: selectRandomly(variableSet),
		a: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		b: getRandomInteger(2, 6),
		c,
		d: getRandomInteger(2, Math.abs(c) >= 5 ? 3 : 4), // Don't make the power too large when the number is also large.
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('a*x^b*(c*x)^d').substituteVariables(variables)
	const bracketsExpanded = expression.simplify({ expandPowersOfProducts: true })
	const numbersSimplified = bracketsExpanded.simplify({ mergeProductNumbers: true, mergePowerNumbers: true })
	const powersMerged = numbersSimplified.simplify({ mergeProductFactors: true })
	const ans = powersMerged.regularClean()
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
