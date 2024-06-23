const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasPower } = expressionChecks

// (a*x^c)/(b*x^d*(x+e)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	steps: ['simplifyFraction', and('rewritePowers', 'cancelFractionFactors')],
	comparison: {
		numericSimplified: (input, correct) => onlyOrderChanges(input.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true }), input) && equivalent(input, correct),
		ans: (input, correct, { ansExpanded }) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, ansExpanded),
	}
}

function generateState() {
	const b = getRandomInteger(2, 6)
	const a = b * getRandomInteger(2, 6)
	const d = getRandomInteger(1, 3)
	const c = d + getRandomInteger(1, 3)
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		e: getRandomInteger(-6, 6, [0]),
		switch: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression(state.switch ? '(b*x^d*(x+e))/(a*x^c)' : '(a*x^c)/(b*x^d*(x+e))').substituteVariables(variables).removeUseless()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression(state.switch ? 'b/a' : 'a/b').substituteVariables(variables).removeUseless()
	const numericPart = numericPartOriginal.regularClean()

	// Apply cleaning.
	const numericSimplified = expression.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true })
	const ans = expression.regularClean()
	const ansExpanded = ans.advancedClean()
	return { ...state, variables, expression, numericPartOriginal, numericPart, numericSimplified, ans, ansExpanded }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'numericSimplified')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
