const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, Integer, Sqrt } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 1,
	steps: ['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', null, 'simplifyFraction'],
	comparison: {
		a: {},
		b: {},
		c: {},
		solutionFull: equivalent,
		D: {},
		numSolutions: {},
		ans1: onlyOrderChanges,
	}
}

function generateState(example) {
	// We want integer coefficients in the equation, but a possibly non-integer solution "numerator/denominator". So we set up the equation a*(x - numerator/denominator)^2 = 0, rewrite it to a*x^2 - 2*a*(numerator/denominator) + a*(numerator/denominator)^2 = 0, and check if this gives integer coefficients.
	let a, denominator, numerator
	while (a === undefined || (2 * a * numerator % denominator !== 0) || (a * numerator ** 2 % denominator ** 2 !== 0)) {
		a = getRandomInteger(-6, 6, [0])
		numerator = getRandomInteger(-12, 12)
		denominator = getRandomInteger(-6, 6, [0])
	}
	const b = -2 * a * numerator / denominator
	const c = a * (numerator / denominator) ** 2

	return {
		x: selectRandomly(variableSet),
		a: new Integer(a),
		b: new Integer(b),
		c: new Integer(c),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a*x^2 + b*x + c = 0').substituteVariables(variables).removeUseless()

	const solutionFull = asExpression('(-b±sqrt(b^2-4*a*c))/(2a)').substituteVariables(variables).removeUseless()
	const rootFull = solutionFull.find(term => term.isSubtype(Sqrt))
	const DFull = rootFull.argument
	const D = DFull.regularClean()
	const solutionHalfSimplified = asExpression('(-b±sqrt(D))/(2a)').substituteVariables({ ...variables, D }).removeUseless({ removeZeroRoot: false })
	const solution = solutionFull.regularClean()
	const solutionsSplit = solution.getSingular().map(s => s.removeUseless())
	const solutions = solutionsSplit.map(s => s.regularClean())
	const numSolutions = solutions.length
	const [ans1] = solutions
	const equationsSubstituted = equation.substituteVariables({ [variables.x]: ans1 })
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutions, numSolutions, equationsSubstituted, ans1 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['a', 'b', 'c'])
		case 2:
			return performComparison(exerciseData, 'solutionFull')
		case 3:
			return performComparison(exerciseData, 'D')
		case 4:
			return performComparison(exerciseData, 'numSolutions')
		case 5:
			return performComparison(exerciseData, 'ans1')
		default:
			return performComparison(exerciseData, ['numSolutions', 'ans1'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
