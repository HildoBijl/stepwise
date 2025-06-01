const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, expressionComparisons } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x^c)/(b*x^d*(x+e)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	steps: ['simplifyFraction', and('rewritePower', 'cancelFractionFactors')],
	comparison: {
		// Input is equivalent and cannot be simplified further.
		numericSimplified: (input, correct) => onlyOrderChanges(input.elementaryClean().simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true }), input.elementaryClean()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct),
	}
}
addSetupFromSteps(metaData)

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
	const expression = asExpression('(a*x^c)/(b*x^d*(x+e))').substituteVariables(variables).removeUseless()[state.switch ? 'invert' : 'self']()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substituteVariables(variables).removeUseless()[state.switch ? 'invert' : 'self']()
	const numericPart = numericPartOriginal.regularClean()

	// Apply cleaning.
	const numericSimplified = expression.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true })
	const ans = expression.regularClean()
	return { ...state, variables, expression, numericPartOriginal, numericPart, numericSimplified, ans }
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
