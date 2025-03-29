const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asEquation, Power, expressionComparisons, equationChecks, equationComparisons } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')
const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { hasVariableInDenominator, hasSumWithinProduct } = equationChecks
const { exactEqual } = expressionComparisons
const { equivalent } = equationComparisons

// ax+b=(cx(x+d))/(x^2+e)
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'bringEquationToStandardForm',
	steps: ['multiplyAllEquationTerms', 'expandDoubleBrackets', and('moveEquationTerm', 'mergeSimilarTerms'), 'multiplyAllEquationTerms'],
	comparison: {
		multiplied: (input, correct, solution) => (!hasVariableInDenominator(input, solution.variables.x) && equivalent(input, correct)),
		expanded: (input, correct, solution) => (!hasVariableInDenominator(input, solution.variables.x) && !hasSumWithinProduct(input) && equivalent(input, correct)),
		moved: { leftCheck: expressionComparisons.constantMultiple, rightCheck: expressionComparisons.exactEqual },
		ans: (input, correct, { normalize }) => (exactEqual(input.left, correct.left) || (!normalize && exactEqual(input.left, correct.left.applyMinus()))) && exactEqual(input.right, correct.right),
	}
}

function generateState(example) {
	// Set up general state parameters.
	const x = selectRandomly(variableSet)
	const normalize = example ? false : getRandomBoolean()
	const flip = example ? false : getRandomBoolean()

	// Set up parameters for the equation. Ensure that (on a non-normalize exercise) there is a factor to divide by.
	let parameters = getParameters(example)
	while (!normalize && Math.abs(gcd(...getCoefficients(parameters, flip))) === 1)
		parameters = getParameters(example)

	// All done. Return the state.
	const [a, b, c, d, e] = parameters
	return { a, b, c, d, e, x, flip, normalize }
}

function getParameters(example) {
	const a = getRandomInteger(-8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [-1, 0, 1, b / a])
	const e = getRandomInteger(-8, 8, [-1, 0, 1])
	return [a, b, c, d, e]
}

function getCoefficients([a, b, c, d, e], flip) {
	const p = a
	const q = b - c
	const r = a * e - c * d
	const s = b * e
	let coefficients = [p, q, r, s]
	if (flip)
		coefficients = coefficients.map(v => -v)
	return coefficients
}

function getSolution(state) {
	// Assemble the equation.
	const { a, b, c, d, e, flip, normalize } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('ax+b=(cx(x+d))/(x^2+e)').substituteVariables(variables).removeUseless()[flip ? 'switch' : 'self']()

	// Rewrite the equation in various ways.
	const multiplied = asEquation('(ax+b)(x^2+e) = cx(x+d)').substituteVariables(variables).removeUseless()[flip ? 'switch' : 'self']()
	const expanded = multiplied.basicClean({ expandProductsOfSums: true, expandPowersOfSums: true, mergeSumNumbers: false, groupSumTerms: false }).applyToEvery(term => (term.isSubtype(Power) ? term.regularClean() : term)).basicClean({ mergeSumNumbers: false, groupSumTerms: false }) // Expand brackets while not merging number terms. Then only merge number terms in powers (turning x^(1+1) into x^2 and 3^(1+1) into 3^2) and then finalize cleaning.
	const merged = expanded.regularClean({ sortSums: true })
	const moved = merged.subtract(merged.right).regularClean({ sortSums: true })

	// Find out how to adjust the equation in the end.
	const coefficients = getCoefficients([a, b, c, d, e], flip)
	let divisor = normalize ? coefficients[0] : gcd(...coefficients)
	if (Math.sign(divisor) !== Math.sign(coefficients[0]))
		divisor *= -1
	const ans = moved.divide(divisor).regularClean({ splitFractions: true, mergeFractionSums: false }).removeUseless({ pullConstantPartOutOfFraction: true, mergeFractionProducts: false })

	// Return all calculated parameters.
	return { ...state, variables, equation, multiplied, expanded, merged, moved, coefficients, divisor, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'multiplied')
		case 2:
			return performComparison(exerciseData, 'expanded')
		case 3:
			return performComparison(exerciseData, 'moved')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
