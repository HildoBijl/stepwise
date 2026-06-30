const { sample, getRandomInteger, getRandomBoolean, repeat, randomIndices } = require('@step-wise/utils')
const { asExpression, expressionComparisons, expressionChecks, expressionOperations } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons
const { multiplyNumeratorAndDenominator } = expressionOperations

// (a*x+b)/(c*x+d) +/- (e*x+f)/(g*x+h).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const metaData = {
	skill: 'addFractionsWithVariables',
	...stepsToSetup(['cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables']),
	comparison: {
		sameDenominator: (input, correct) => input.isSum() && input.terms.length === 2 && input.terms.every(term => term.find(part => part.isFraction())) && equivalent(...input.terms.map(term => term.find(part => part.isFraction()).denominator)) && equivalent(input, correct),
		bracketsExpanded: (input, correct) => input.isSum() && input.terms.length === 2 && input.terms.every(term => term.find(part => part.isFraction())) && equivalent(...input.terms.map(term => term.find(part => part.isFraction()).denominator)) && input.terms.every(term => {
			const numerator = term.find(part => part.isFraction()).numerator
			return onlyOrderChanges(numerator.flatten(), numerator.cancel(['expandProductsOfSums', 'groupSumTerms']))
		}) && equivalent(input, correct),
		ans: (input, correct) => input.flatten().isFractionLike() && !hasFractionWithinFraction(input) && onlyOrderChanges(input.flatten().numerator, input.flatten().numerator.cancel(['expandProductsOfSums', 'mergeProductFactors', 'groupSumTerms'])) && equivalent(input, correct),
	}
}

function generateState(example) {
	example = false
	// Define parameters for the exercise.
	const parameters = repeat(8, index => getRandomInteger(index % 2 === 0 ? 2 : -8, 8, [-1, 0, 1])) // Ensure even-indexed numbers are positive.
	if (example) {
		parameters[0] = 1
		parameters[6] = 1
	}

	// Randomly set two of the parameters to 0. These are not the third parameter (c or g) and not the same one in both fractions.
	const deactivate = example ? [3, 0] : randomIndices(3, 2).map(index => [0, 1, 3][index])
	parameters[deactivate[0]] = 0
	parameters[deactivate[1] + 4] = 0

	// Set up the state.
	const [a, b, c, d, e, f, g, h] = parameters
	return {
		x: sample(variableSet),
		a, b, c, d, e, f, g, h,
		plus: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fractions = ['(a*x+b)/(c*x+d)', '(e*x+f)/(g*x+h)'].map(str => asExpression(str, { eAsConstant: false }).substitute(variables).removeTrivial())
	const joinFractions = fractions => fractions[0].add(state.plus ? fractions[1] : fractions[1].negate(false)).removeTrivial()
	const expression = joinFractions(fractions)

	// Apply the various cleaning steps.
	const fractionsWithSameDenominator = fractions.map((fraction, index) => multiplyNumeratorAndDenominator(fraction, fractions[1 - index].denominator, index === 1))
	const sameDenominator = joinFractions(fractionsWithSameDenominator)
	const fractionsWithBracketsExpanded = fractionsWithSameDenominator.map(fraction => fraction.mapNumerator(numerator => numerator.cancel(['expandProductsOfSums', 'mergeProductFactors', 'groupSumTerms'])))
	const bracketsExpanded = joinFractions(fractionsWithBracketsExpanded)
	const ans = bracketsExpanded.cancel(['mergeFractionSums', 'mergeFractionProducts', 'sortProducts']).mapNumerator(numerator => numerator.cancel(['expandProductsOfSums', 'groupSumTerms', 'sortSums']))
	const ansCleaned = ans.normalize([], ['applyPolynomialCancellation', 'expandProductsOfSums'])
	const isFurtherSimplificationPossible = !onlyOrderChanges(ans, ansCleaned)
	return { ...state, variables, fractions, expression, sameDenominator, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'sameDenominator')
		case 2:
			return performComparison(exerciseData, 'bracketsExpanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
