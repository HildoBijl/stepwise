const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { gcd } = require('@step-wise/math-tools')
const { and } = require('@step-wise/skill-setup')
const { asExpression, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

const metaData = {
	skill: 'simplifyFractionWithVariables',
	...stepsToSetup(['simplifyFraction', and('rewritePower', 'cancelFractionFactors')]),
	comparison: {
		// Input is equivalent and cannot be simplified further.
		numericSimplified: (input, correct) => onlyOrderChanges(input.flatten().flatten(['mergeProductNumbers', 'mergeFractionNumbers']), input.flatten()) && equivalent(input, correct),
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
	}
}

function generateState() {
	const factor = getRandomInteger(2, 8)
	const a = factor * getRandomInteger(-8, 8, [-1, 0, 1])
	const b = factor * getRandomInteger(-8, 8, [-1, 0, 1, a / factor, -a / factor])
	const c = getRandomInteger(-4, 4)
	const d = getRandomInteger(-4, 4, [c])
	const p = getRandomInteger(2, 4)
	const r = getRandomInteger(2, 4)
	const q = r + getRandomInteger(1, 3)
	const s = p + getRandomInteger(1, 3)
	return {
		x: sample(variableSet),
		a, b, c, d,
		p, q, r, s,
		switch: getRandomBoolean(), // Put the highest power at the front or the back?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression(state.switch ? '(a*(x+d)^q*(x+c)^p)/(b*(x+c)^s*(x+d)^r)' : '(a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+c)^s)').substitute(variables).removeTrivial()
	const factor1 = asExpression('x+c').substitute(variables).removeTrivial()
	const factor2 = asExpression('x+d').substitute(variables).removeTrivial()

	// Set up the numeric parts for display purposes.
	const numericPartOriginal = asExpression('a/b').substitute(variables).removeTrivial()
	const numericPart = numericPartOriginal.combine()
	const factor = gcd(state.a, state.b) * (state.a < 0 && state.b < 0 ? -1 : 1)

	// Apply cleaning.
	const numericSimplified = expression.flatten(['mergeProductNumbers', 'mergeFractionNumbers'])
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
