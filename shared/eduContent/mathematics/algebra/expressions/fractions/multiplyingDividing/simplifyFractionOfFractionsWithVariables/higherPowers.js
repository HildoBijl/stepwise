const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// ((a*(x+e)^p)/(b*(x+f)^q))/((c*(x+e)^r)/(d*(x+f)^s)).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'p', 'q', 'r', 's']

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
	const a = getRandomInteger(-12, 12, [-1, 0, 1])
	const b = getRandomInteger(-12, 12, [-1, 0, 1, a])
	const c = getRandomInteger(-12, 12, [-1, 0, 1, a, b])
	const d = getRandomInteger(-12, 12, [-1, 0, 1, a, b, c])
	const e = getRandomInteger(-4, 4)
	const f = getRandomInteger(-4, 4, [e])
	const p = getRandomInteger(2, 4)
	const q = getRandomInteger(2, 4, [p])
	const r = p + getRandomInteger(1, 3)
	const s = q + getRandomInteger(1, 3)

	return {
		x: sample(variableSet),
		a, b, c, d, e, f, p, q, r, s,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('((a*(x+e)^p)/(b*(x+f)^q))', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
	const fraction2 = asExpression('((c*(x+e)^r)/(d*(x+f)^s))', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
	const expression = fraction1.divide(fraction2)[state.flip ? 'invert' : 'self']().removeTrivial([], ['mergeFractionMinuses'])

	// Apply cleaning.
	const singleFraction = expression.simplify(['mergeFractionProducts', 'flattenFractions'])
	const inBetween = singleFraction.cancel()
	const ans = expression.combine()
	return { ...state, variables, fraction1, fraction2, expression, singleFraction, inBetween, ans }
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
