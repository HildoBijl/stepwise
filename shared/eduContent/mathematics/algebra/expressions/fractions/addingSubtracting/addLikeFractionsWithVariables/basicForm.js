const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionComparisons, expressionChecks } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasSumWithinProduct, hasSimilarTerms, isFractionLike, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+b))/(e*x+f) +/- (c*x+d)/(e*x+f).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

const metaData = {
	skill: 'addLikeFractionsWithVariables',
	steps: [null, 'expandBrackets', 'mergeSimilarTerms'],
	comparison: {
		singleFraction: (input, correct) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
		bracketsExpanded: (input, correct) => input.flatten().isFraction() && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: (input, correct) => isFractionLike(input) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && equivalent(input, correct),
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [0])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [0])
	const e = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1])
	const f = example ? 0 : getRandomInteger(-8, 8, [0])
	return {
		x: sample(variableSet),
		a, b, c, d, e, f,
		switch: getRandomBoolean(), // Switch the two numerators?
		plus: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fractions = ['(a*(x+b))/(ex+f)', '(c*x+d)/(e*x+f)'].map(str => asExpression(str, { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses']))
	const expression = fractions[state.switch ? 1 : 0][state.plus ? 'add' : 'subtract'](fractions[state.switch ? 0 : 1]).removeTrivial([], ['mergeFractionMinuses'])

	// Apply the various cleaning steps.
	const singleFraction = fractions[state.switch ? 1 : 0].numerator[state.plus ? 'add' : 'subtract'](fractions[state.switch ? 0 : 1].numerator).divide(fractions[0].denominator).removeTrivial()
	const bracketsExpanded = singleFraction.removeTrivial(['expandProductsOfSums', 'mergeProductNumbers'])
	const ans = bracketsExpanded.cancel(['groupSumTerms'])
	const ansCleaned = ans.combine()
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
