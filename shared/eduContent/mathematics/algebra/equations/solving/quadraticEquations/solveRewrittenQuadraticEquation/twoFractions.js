const { selectRandomly, getRandomInteger, getRandomBoolean, gcd } = require('../../../../../../../util')
const { asExpression, asEquation, Product, Power, Sqrt, expressionComparisons } = require('../../../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison, performListComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, constantMultiple, exactEqual } = expressionComparisons

// a/(x+b) + c = d/(x+e).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e']

const metaData = {
	skill: 'solveRewrittenQuadraticEquation',
	steps: ['bringEquationToStandardForm', 'solveQuadraticEquation'],
	comparison: {
		standardForm: {
			leftCheck: (input, correct) => { // Set up an extra check for constant multiples, since the constantMultiple in the CAS isn't fully functional yet.
				if (constantMultiple(input, correct))
					return true
				const getFactor = value => {
					const powerTerm = value.find(term => term.isSubtype(Product) && term.factors.some(factor => factor.isSubtype(Power)))
					return (powerTerm && powerTerm.find(factor => factor.isNumeric())?.number) || 1
				}
				const adjustmentFactor = getFactor(input) / getFactor(correct)
				return constantMultiple(input, correct.multiply(adjustmentFactor).regularClean())
			}, rightCheck: exactEqual
		},
		// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
		ans1: (input, correct) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.regularClean({ mergeFractionSums: false, splitFractions: true })),
		ans2: (input, correct) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.regularClean({ mergeFractionSums: false, splitFractions: true })),
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	// Set up general state parameters.
	const x = selectRandomly(variableSet)
	const zeroSolutions = selectRandomly([true, false, false, false, false]) // Only have zero solutions in a small part of the cases.
	const flip = example ? false : getRandomBoolean()

	// Set up parameters for the equation. Ensure that the number of solutions (zero or non-zero) matches the desired setting.
	let parameters = getParameters(example)
	const hasZeroSolutions = (parameters) => {
		const [p, q, r] = getCoefficients(parameters, flip)
		return (q ** 2 - 4 * p * r < 0)
	}
	while (zeroSolutions !== hasZeroSolutions(parameters))
		parameters = getParameters(example)

	// All done. Return the state.
	const [a, b, c, d, e] = parameters
	return { a, b, c, d, e, x, flip }
}

function getParameters(example) {
	const a = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1])
	const b = getRandomInteger(-8, 8, [-1, 0, 1])
	const c = getRandomInteger(-8, 8, [-1, 0, 1])
	const d = getRandomInteger(-8, 8, [-1, 0, 1])
	const e = getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1, b])
	return [a, b, c, d, e]
}

function getCoefficients([a, b, c, d, e], flip) {
	const p = c
	const q = a + c * (b + e) - d
	const r = (c * b * e + a * e - d * b)
	let coefficients = [p, q, r]
	if (flip)
		coefficients = coefficients.map(v => -v)
	return coefficients
}

function getSolution(state) {
	// Assemble the equation.
	const { a, b, c, d, e, flip, normalize } = state
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a/(x+b) + c = d/(x+e)').substituteVariables(variables).removeUseless()[flip ? 'switch' : 'self']()

	// Bring the equation into standard form.
	const multiplied = asEquation('a*(x+e) + c*(x+b)*(x+e) = d*(x+b)').substituteVariables(variables).removeUseless()[flip ? 'switch' : 'self']()
	const expanded = multiplied.basicClean({ expandProductsOfSums: true, expandPowersOfSums: true, mergeSumNumbers: false, groupSumTerms: false }).applyToEvery(term => (term.isSubtype(Power) ? term.regularClean() : term)).basicClean({ mergeSumNumbers: false, groupSumTerms: false }) // Expand brackets while not merging number terms. Then only merge number terms in powers (turning x^(1+1) into x^2 and 3^(1+1) into 3^2) and then finalize cleaning.
	const merged = expanded.regularClean({ sortSums: true })
	const moved = merged.subtract(merged.right).regularClean({ sortSums: true })

	// Find out how to adjust the equation in the end.
	const coefficients = getCoefficients([a, b, c, d, e], flip)
	let divisor = gcd(...coefficients)
	if (Math.sign(divisor) !== Math.sign(coefficients[0]))
		divisor *= -1
	const standardForm = moved.divide(divisor).regularClean({ splitFractions: true, mergeFractionSums: false }).removeUseless({ pullConstantPartOutOfFraction: true, mergeFractionProducts: false })

	// Solve the equation in standard form.
	const [p, q, r] = coefficients.map(coeff => coeff / divisor)
	const solutionFull = asExpression('(-q±sqrt(q^2-4*p*r))/(2p)').substituteVariables({ p, q, r }).removeUseless()
	const rootFull = solutionFull.find(term => term.isSubtype(Sqrt))
	const DFull = rootFull.argument
	const D = DFull.regularClean()
	const solutionHalfSimplified = asExpression('(-q±sqrt(D))/(2p)').substituteVariables({ p, q, r, D }).removeUseless({ removeZeroRoot: false, mergeProductNumbers: true })
	const solution = solutionFull.regularClean()
	const solutionsSplit = solution.getSingular().map(s => s.removeUseless())
	const solutions = solutionsSplit.map(s => s.regularClean())
	const numSolutions = D.number < 0 ? 0 : solutions.length
	const equationsSubstituted = solutions.map(s => equation.substituteVariables({ [variables.x]: s }))
	const [ans1, ans2] = solutions

	// Return all calculated parameters.
	return { ...state, variables, equation, multiplied, expanded, merged, moved, coefficients, divisor, standardForm, p, q, r, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
}

function checkInput(exerciseData, step) {
	const { solution } = exerciseData
	const { numSolutions } = solution

	switch (step) {
		case 1:
			return performComparison(exerciseData, 'standardForm')
		default:
			return performComparison(exerciseData, 'numSolutions') && (numSolutions !== 1 || performComparison(exerciseData, 'ans1')) && (numSolutions !== 2 || performListComparison(exerciseData, ['ans1', 'ans2']))
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
