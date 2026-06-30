const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*x^c)/(b*x^d*(x+f)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'f']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	...stepsToSetup(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
	comparison: {
		// Input is equivalent and cannot be simplified further.
		numericSimplified: (input, correct) => onlyOrderChanges(input.flatten().simplify(['mergeProductNumbers', 'mergeFractionNumbers']), input.flatten()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
	}
}

function generateState() {
	const b = getRandomInteger(2, 6)
	const a = b * getRandomInteger(2, 6)
	const d = getRandomInteger(1, 3)
	const c = d + getRandomInteger(1, 3)
	return {
		x: sample(variableSet),
		a, b, c, d,
		f: getRandomInteger(-6, 6, [0]),
		switch: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(a*x^c)/(b*x^d*(x+f))').substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()
	const numericPart = numericPartOriginal.combine()

	// Apply cleaning.
	const numericSimplified = expression.removeTrivial(['mergeProductNumbers', 'mergeFractionNumbers'])
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
