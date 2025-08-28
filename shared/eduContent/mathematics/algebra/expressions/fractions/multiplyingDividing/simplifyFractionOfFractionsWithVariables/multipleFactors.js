const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
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
		singleFraction: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const a = getRandomInteger(-12, 12, [-1, 0, 1])
	const b = getRandomInteger(-12, 12, [-1, 0, 1, a])
	const c = getRandomInteger(-12, 12, [-1, 0, 1, a, b])
	const d = getRandomInteger(-12, 12, [-1, 0, 1, a, b, c])
	const e = getRandomInteger(-5, 5)
	const f = getRandomInteger(-5, 5, [e])
	const g = getRandomInteger(-5, 5, [e, f])
	const h = getRandomInteger(-5, 5, [e, f, g])

	return {
		x: selectRandomly(variableSet),
		a, b, c, d, e, f, g, h,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const fraction1 = asExpression('((a*(x+e)*(x+f))/(b*(x+g)*(x+h)))').substituteVariables(variables).removeUseless()
	const fraction2 = asExpression('((c*(x+f)*(x+h))/(d*(x+e)*(x+g)))').substituteVariables(variables).removeUseless()
	const expression = fraction1.divide(fraction2)[state.flip ? 'invert' : 'self']().removeUseless()

	// Apply cleaning.
	const singleFraction = expression.simplify({ mergeFractionProducts: true, flattenFractions: true })
	const inBetween = singleFraction.basicClean({ mergeProductFactors: false })
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
