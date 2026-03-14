const { sample, randomInteger, randomBoolean } = require('@step-wise/utils')
const { asExpression, Fraction, expressionChecks, expressionComparisons } = require('../../../../../../../CAS')
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
		singleFraction: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}
addSetupFromSteps(metaData)

function generateState() {
	const factor = randomInteger(2, 6)
	const a = factor * randomInteger(2, 6)
	const b = factor * randomInteger(2, 6, [a / factor])
	const c = randomInteger(-4, 4)
	const d = randomInteger(-4, 4, [c])
	const p = randomInteger(2, 4)
	const q = p + randomInteger(1, 3)
	const r = randomInteger(2, 4)

	return {
		x: sample(variableSet),
		a, b, c, d, p, q, r,
		flip: randomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('(a*(x+c)^p)/(b*(x+c)^q/(x+d)^r)').substituteVariables(variables)[state.flip ? 'invert' : 'self']().removeUseless()

	// Apply cleaning.
	const singleFraction = expression.simplify({ mergeFractionProducts: true, flattenFractions: true })
	const ans = expression.regularClean()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
