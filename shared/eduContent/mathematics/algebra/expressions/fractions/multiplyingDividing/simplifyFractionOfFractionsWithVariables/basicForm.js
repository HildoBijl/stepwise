const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p)/(b*(x+c)^q/(x+d)^r).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r']

const metaData = {
	skill: 'simplifyFractionOfFractionsWithVariables',
	steps: ['multiplyDivideFractions', 'simplifyFractionWithVariables'],
	comparison: {
		singleFraction: (input, correct) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const factor = getRandomInteger(2, 6)
	const a = factor * getRandomInteger(2, 6)
	const b = factor * getRandomInteger(2, 6, [a / factor])
	const c = getRandomInteger(-4, 4)
	const d = getRandomInteger(-4, 4, [c])
	const p = getRandomInteger(2, 4)
	const q = p + getRandomInteger(1, 3)
	const r = getRandomInteger(2, 4)

	return {
		x: sample(variableSet),
		a, b, c, d, p, q, r,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(a(x+c)^p)/(b(x+c)^q/(x+d)^r)').substitute(variables)[state.flip ? 'invert' : 'self']().removeTrivial()

	// Apply cleaning.
	const singleFraction = expression.flatten(['mergeFractionProducts', 'flattenFractions'])
	const ans = expression.combine()
	return { ...state, variables, expression, singleFraction, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'singleFraction')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
