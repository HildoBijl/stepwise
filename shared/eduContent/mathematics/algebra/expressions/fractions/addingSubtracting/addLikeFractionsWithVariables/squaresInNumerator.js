const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, Fraction, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasSumWithinProduct, hasSimilarTerms, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x*(x+b))/(fx) +/- (c*x^2+d*x+e)/(fx).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

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
	const c = getRandomInteger(-3, 3, [0])
	const d = getRandomInteger(-8, 8, [0])
	const e = getRandomInteger(-8, 8, [-1, 0, 1])
	const f = getRandomInteger(-8, 8, [-1, 0, 1])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e, f,
		switch: getRandomBoolean(), // Switch the two numerators?
		plus: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fractions = ['(a*x*(x+b))/(fx)', '(c*x^2+d*x+e)/(f*x)'].map(str => asExpression(str).substituteVariables(variables).removeUseless())
	const expression = fractions[state.switch ? 1 : 0][state.plus ? 'add' : 'subtract'](fractions[state.switch ? 0 : 1]).removeUseless()

	// Apply the various cleaning steps.
	const singleFraction = fractions[state.switch ? 1 : 0].numerator[state.plus ? 'add' : 'subtract'](fractions[state.switch ? 0 : 1].numerator).divide(fractions[0].denominator).removeUseless()
	const bracketsExpanded = singleFraction.basicClean({ expandProductsOfSums: true })
	const ans = bracketsExpanded.basicClean({ groupSumTerms: true })
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
