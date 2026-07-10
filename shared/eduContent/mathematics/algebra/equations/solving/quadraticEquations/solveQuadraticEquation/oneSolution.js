const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
const { filterVariables } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 1,
	...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, 'simplifyFraction']),
	compare: {
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
	while (a === undefined || (2 * a * numerator % denominator !== 0) || (a * numerator ** 2 % denominator ** 2 !== 0) || (numerator === 0)) {
		a = getRandomInteger(-6, 6, [0])
		numerator = getRandomInteger(-12, 12)
		denominator = getRandomInteger(-6, 6, [0])
	}
	const b = -2 * a * numerator / denominator
	const c = a * (numerator / denominator) ** 2

	return {
		x: sample(variableSet),
		a: asExpression(a),
		b: asExpression(b),
		c: asExpression(c),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const equation = asEquation('a*x^2 + b*x + c = 0').substitute(variables).removeTrivial()

	const solutionFull = asExpression('(-b±sqrt(b^2-4*a*c))/(2a)').substitute(variables).removeTrivial()
	const rootFull = solutionFull.find(term => term.isSqrt())
	const DFull = rootFull.radicand
	const D = DFull.combine()
	const solutionHalfSimplified = asExpression('(-b±sqrt(D))/(2a)').substitute({ ...variables, D }).removeTrivial([], ['reduceRootsWithZeroRadicand'])
	const solution = solutionFull.combine()
	const solutionsSplit = solution.getSingular().map(s => s.removeTrivial())
	const solutions = solutionsSplit.map(s => s.combine())
	const numSolutions = solutions.length
	const [ans1] = solutions
	const equationsSubstituted = equation.substitute({ [variables.x]: ans1 })
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutions, numSolutions, equationsSubstituted, ans1 }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare(['a', 'b', 'c'], data)
		case 2:
			return compare('solutionFull', data)
		case 3:
			return compare('D', data)
		case 4:
			return compare('numSolutions', data)
		case 5:
			return compare('ans1', data)
		default:
			return compare(['numSolutions', 'ans1'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
