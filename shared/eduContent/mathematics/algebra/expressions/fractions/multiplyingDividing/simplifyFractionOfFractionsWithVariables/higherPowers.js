const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, Fraction, expressionChecks, expressionComparisons } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

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
		singleFraction: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}

function generateState() {
	const a = getRandomInteger(-12, 12, [-1, 0, 1])
	const b = getRandomInteger(-12, 12, [-1, 0, 1, a])
	const c = getRandomInteger(-12, 12, [-1, 0, 1, a, b])
	const d = getRandomInteger(-12, 12, [-1, 0, 1, a, b, c])
	const e = getRandomInteger(-3, 3)
	const f = getRandomInteger(-3, 3, [e])
	const p = getRandomInteger(2, 4)
	const q = getRandomInteger(2, 4, [p])
	const r = p + getRandomInteger(1, 3)
	const s = q + getRandomInteger(1, 3)

	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e, f, p, q, r, s,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('((a*(x+e)^p)/(b*(x+f)^q))').substituteVariables(variables).removeUseless()
	const fraction2 = asExpression('((c*(x+e)^r)/(d*(x+f)^s))').substituteVariables(variables).removeUseless()
	const expression = fraction1.divide(fraction2)[state.flip ? 'invert' : 'self']().removeUseless()

	// Apply cleaning.
	const singleFraction = expression.simplify({ mergeFractionProducts: true, flattenFractions: true })
	const inBetween = singleFraction.basicClean()
	const ans = expression.regularClean()
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
