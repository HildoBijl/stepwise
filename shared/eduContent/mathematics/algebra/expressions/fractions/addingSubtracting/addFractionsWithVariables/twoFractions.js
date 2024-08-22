const { selectRandomly, getRandomInteger, getRandomBoolean, repeat, getRandomIndices } = require('../../../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasSumWithinProduct, hasSimilarTerms, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x+b)/(c*x+d) +/- (e*x+f)/(g*x+h).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const metaData = {
	skill: 'addFractionsWithVariables',
	steps: ['cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables'],
	comparison: {
		singleFraction: (input, correct) => input.elementaryClean().isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct),
		bracketsExpanded: (input, correct) => input.elementaryClean().isSubtype(Fraction) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && equivalent(input, correct),
		ans: (input, correct) => input.elementaryClean().isSubtype(Fraction) && !hasFractionWithinFraction(input) && !hasSumWithinProduct(input) && !hasSimilarTerms(input) && equivalent(input, correct),
	}
}

function generateState(example) {
	example = false // TEMP TODO REMOVE
	// Define parameters for the exercise.
	const parameters = repeat(8, index => getRandomInteger(index % 2 === 0 ? 2 : -8, 8, [-1, 0, 1])) // Ensure even-indexed numbers are positive.
	if (example) {
		parameters[0] = 1
		parameters[6] = 1
	}

	// Randomly set two of the parameters to 0. These are not the third parameter (c or g) and not the same one in both fractions.
	const deactivate = example ? [3, 0] : getRandomIndices(3, 2).map(index => [0, 1, 3][index])
	parameters[deactivate[0]] = 0
	parameters[deactivate[1] + 4] = 0

	// Set up the state.
	const [a, b, c, d, e, f, g, h] = parameters
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e, f, g, h,
		plus: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fractions = ['(a*x+b)/(c*x+d)', '(e*x+f)/(g*x+h)'].map(str => asExpression(str).substituteVariables(variables).removeUseless())
	const joinFractions = fractions => fractions[0][state.plus ? 'add' : 'subtract'](fractions[1]).removeUseless()
	const expression = joinFractions(fractions)

	// Apply the various cleaning steps.
	console.log(expression, expression.str)
	const fractionsWithSameDenominator = fractions.map((fraction, index) => fraction.multiplyNumDen(fractions[1 - index].denominator, index === 1))
	const sameDenominator = joinFractions(fractionsWithSameDenominator)
	const fractionsWithBracketsExpanded = fractionsWithSameDenominator.map(fraction => fraction.applyToNumerator(numerator => numerator.basicClean({ expandProductsOfSums: true, groupSumTerms: true })))
	const bracketsExpanded = joinFractions(fractionsWithBracketsExpanded)
	const ans = bracketsExpanded.basicClean({ mergeFractionSums: true, groupSumTerms: true, sortSums: true, sortProducts: true })
	const ansCleaned = ans.regularClean()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
