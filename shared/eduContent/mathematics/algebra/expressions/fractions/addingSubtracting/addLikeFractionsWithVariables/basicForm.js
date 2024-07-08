const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasSumWithinProduct, hasSimilarTerms, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+b))/(ex) +/- (c*x+d)/(ex).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'addLikeFractionsWithVariables',
	steps: [null, 'expandBrackets', 'mergeSimilarTerms'],
	comparison: {
		singleFraction: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
		bracketsExpanded: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && equivalent(input, correct),
	}
}

function generateState() {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [0])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [0])
	const e = getRandomInteger(2, 8)
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e,
		switch: getRandomBoolean(), // Switch the two numerators?
		plus: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fractions = ['(a*(x+b))/(ex)', '(c*x+d)/(e*x)']
	const expression = asExpression(`${fractions[state.switch ? 1 : 0]}${state.plus ? '+' : '-'}${fractions[state.switch ? 0 : 1]}`).substituteVariables(variables).removeUseless()

	// Apply the various cleaning steps.
	const singleFraction = expression.removeUseless({ mergeFractionSums: true, crossOutFractionFactors: true })
	const bracketsExpanded = singleFraction.removeUseless({ expandProductsOfSums: true, mergeProductNumbers: true })
	const ans = bracketsExpanded.removeUseless({ groupSumTerms: true, mergeSumNumbers: true })
	const ansCleaned = ans.regularClean()
	const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
	return { ...state, variables, expression, singleFraction, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'singleFraction')
		case 2:
			return performComparison(exerciseData, 'bracketsExpanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
