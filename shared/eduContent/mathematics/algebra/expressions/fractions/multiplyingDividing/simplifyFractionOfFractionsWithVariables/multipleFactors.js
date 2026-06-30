const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, expressionChecks, expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// ((a*(x+p)*(x+q))/(b*(x+r)*(x+s)))/((c*(x+q)*(x+s))/(d*(x+p)*(x+r))).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's']

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
	const p = getRandomInteger(-4, 4)
	const q = getRandomInteger(-4, 4, [p])
	const r = getRandomInteger(-4, 4, [p, q])
	const s = getRandomInteger(-4, 4, [p, q, r])

	return {
		x: sample(variableSet),
		a, b, c, d, p, q, r, s,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('((a(x+p)(x+q))/(b(x+r)(x+s)))').substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
	const fraction2 = asExpression('((c(x+q)(x+s))/(d(x+p)(x+r)))').substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
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
