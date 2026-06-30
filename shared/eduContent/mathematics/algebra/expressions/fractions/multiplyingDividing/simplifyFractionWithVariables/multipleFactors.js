const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { and } = require('@step-wise/skill-setup')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'p', 'q']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	steps: ['simplifyFraction', and('rewritePower', 'cancelFractionFactors')],
	comparison: {
		// Input is equivalent and cannot be simplified further.
		numericSimplified: (input, correct) => onlyOrderChanges(input.flatten().flatten(['mergeProductNumbers', 'mergeFractionNumbers']), input.flatten()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const factor = getRandomInteger(2, 8)
	const a = factor * getRandomInteger(-8, 8, [-1, 0, 1])
	const b = factor * getRandomInteger(-8, 8, [-1, 0, 1, a / factor, -a / factor])
	const c = getRandomInteger(-4, 4)
	const d = getRandomInteger(-4, 4, [c])
	const e = getRandomInteger(-4, 4, [c, d])
	const p = getRandomInteger(2, 4)
	const q = getRandomInteger(2, 4)
	return {
		x: sample(variableSet),
		a, b, c, d, e,
		p, q,
		switch: getRandomBoolean(), // Put the highest power at the front or the back?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	let expression = asExpression('(a*(x+c)^p*(x+e)*(x+d))/(b*(x+d)^p*(x+c))', { eAsConstant: false }).substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()
	const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
	const factor2 = asExpression('x+d').substitute(variables).removeTrivial()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()[state.switch ? 'invert' : 'self']()
	const numericPart = numericPartOriginal.combine()
	const factor = gcd(state.a, state.b) * (state.a < 0 && state.b < 0 ? -1 : 1)

	// Apply cleaning.
	const numericSimplified = expression.removeTrivial(['mergeProductNumbers', 'mergeFractionNumbers'])
	const ans = expression.combine()
	return { ...state, variables, expression, factor1, factor2, numericPartOriginal, numericPart, factor, numericSimplified, ans }
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
