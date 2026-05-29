const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, expressionComparisons } = require('../../../../../../../CAS')
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
		numericSimplified: (input, correct) => onlyOrderChanges(input.elementaryClean().simplify({ mergeProductNumbers: true, mergeFractionNumbers: true }), input.elementaryClean()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.elementaryClean()) && equivalent(input, correct),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const b = randomInteger(2, 6)
	const a = b * randomInteger(2, 6)
	const d = randomInteger(1, 3)
	const c = d + randomInteger(1, 3)
	return {
		x: sample(variableSet),
		a, b, c, d,
		e: randomInteger(-6, 6, [0]),
		switch: randomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(a*x^c)/(b*x^d*(x+e))').substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()
	const numericPart = numericPartOriginal.combine()

	// Apply cleaning.
	const numericSimplified = expression.simplify({ mergeProductNumbers: true, mergeFractionNumbers: true })
	const ans = expression.combine()
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
