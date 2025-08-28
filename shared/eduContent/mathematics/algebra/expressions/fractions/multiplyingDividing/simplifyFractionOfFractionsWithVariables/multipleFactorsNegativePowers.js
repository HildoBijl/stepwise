const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, Fraction, expressionChecks, expressionComparisons } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasNegativeExponent, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+e)^s*(x+c)^t).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'p', 'q', 'r', 's', 't']

const metaData = {
	skill: 'simplifyFractionOfFractionsWithVariables',
	steps: ['rewriteNegativePower', 'multiplyDivideFractions', 'simplifyFractionWithVariables'],
	comparison: {
		withoutNegativeExponents: (input, correct) => !hasNegativeExponent(input) && equivalent(input, correct),
		singleFraction: (input, correct) => input.isSubtype(Fraction) && !hasFractionWithinFraction(input) && equivalent(input, correct), // A fraction without further subfractions.
		ans: (input, correct) => onlyOrderChanges(input.regularClean(), input.elementaryClean()) && equivalent(input, correct), // No further basic simplifications possible.
	}
}
addSetupFromSteps(metaData)

function generateState() {
	// Generate multiplication coefficients.
	const a = getRandomInteger(-12, 12, [-1, 0, 1])
	const b = getRandomInteger(-12, 12, [-1, 0, 1, a])

	// Generate factor constants.
	const c = getRandomInteger(-4, 4)
	const d = getRandomInteger(-4, 4, [c])
	const e = getRandomInteger(-4, 4, [c, d])
	
	// If there is no zero addition (no pure x term) then restart generation.
	if (c !== 0 && d !== 0 && e !== 0)
		return generateState()

	// Generate exponents.
	const p = getRandomInteger(-4, 4, [0])
	const q = getRandomInteger(-4, 4, [0])
	const r = getRandomInteger(-4, 4, [0, q])
	const s = getRandomInteger(-4, 4, [0])
	const t = getRandomInteger(-4, 4, [0, p])

	// On equal signs for all exponents, restart generation.
	if (Math.sign(p) === Math.sign(q) && Math.sign(p) === Math.sign(r) && Math.sign(p) === Math.sign(s) && Math.sign(t))
		return generateState()
	// On unequal signs for both factor pairs, restart generation.
	if (Math.sign(q) !== Math.sign(r) && Math.sign(p) !== Math.sign(t))
		return generateState()

	// Assemble the state.
	return {
		x: selectRandomly(variableSet),
		a, b,
		c, d, e,
		p, q, r, s, t,
		flip: getRandomBoolean(), // Flip the numerator and the denominator?
	}
}

function getSolution(state) {
	// Set up the expression.
	const variables = filterVariables(state, usedVariables, constants)
	const part1 = asExpression('a*(x+c)^p*(x+d)^q').substituteVariables(variables).removeUseless()
	const part2 = asExpression('b*(x+d)^r*(x+e)^s*(x+c)^t').substituteVariables(variables).removeUseless()
	const expression = (state.flip ? part2.divide(part1) : part1.divide(part2)).removeUseless()

	// Apply cleaning.
	const part1WithoutNegativeExponents = part1.removeUseless({ removeNegativePowers: true })
	const part2WithoutNegativeExponents = part2.removeUseless({ removeNegativePowers: true })
	const withoutNegativeExponents = expression.removeUseless({ removeNegativePowers: true })
	const singleFraction = withoutNegativeExponents.simplify({ mergeFractionProducts: true, flattenFractions: true })
	const inBetween = singleFraction.basicClean({ mergeProductFactors: false })
	const ans = expression.regularClean()
	return { ...state, variables, part1, part2, part1WithoutNegativeExponents, part2WithoutNegativeExponents, expression, withoutNegativeExponents, singleFraction, inBetween, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'withoutNegativeExponents')
		case 2:
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
