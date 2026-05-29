const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asExpression, Fraction, expressionChecks, expressionComparisons } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// ((a*(x+e)*(x+f))/(b*(x+g)*(x+h)))/((c*(x+f)*(x+h))/(d*(x+e)*(x+g))).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const metaData = {
	skill: 'simplifyFractionOfFractionsWithVariables',
	steps: ['multiplyDivideFractions', 'simplifyFractionWithVariables'],
	comparison: {
		singleFraction: (input, correct) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.combine(), input.elementaryClean()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = randomInteger(-12, 12, [-1, 0, 1])
	const b = randomInteger(-12, 12, [-1, 0, 1, a])
	const c = randomInteger(-12, 12, [-1, 0, 1, a, b])
	const d = randomInteger(-12, 12, [-1, 0, 1, a, b, c])
	const e = randomInteger(-4, 4)
	const f = randomInteger(-4, 4, [e])
	const g = randomInteger(-4, 4, [e, f])
	const h = randomInteger(-4, 4, [e, f, g])

	return {
		x: sample(variableSet),
		a, b, c, d, e, f, g, h,
		flip: randomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('((a*(x+e)*(x+f))/(b*(x+g)*(x+h)))').substitute(variables).removeTrivial()
	const fraction2 = asExpression('((c*(x+f)*(x+h))/(d*(x+e)*(x+g)))').substitute(variables).removeTrivial()
	const expression = fraction1.divide(fraction2)[state.flip ? 'invert' : 'self']().removeTrivial()

	// Apply cleaning.
	const singleFraction = expression.simplify({ mergeFractionProducts: true, flattenFractions: true })
	const inBetween = singleFraction.cancel({ mergeProductFactors: false })
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
