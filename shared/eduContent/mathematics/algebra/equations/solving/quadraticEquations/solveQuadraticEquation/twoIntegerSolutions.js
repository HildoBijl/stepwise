const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison, performListComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 2,
	...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, 'simplifyFraction']),
	comparison: {
		a: {},
		b: {},
		c: {},
		solutionFull: equivalent,
		D: {},
		numSolutions: {},
		ans1: onlyOrderChanges,
		ans2: onlyOrderChanges,
	}
}

function generateState(example) {
	const a = getRandomInteger(example ? 2 : -6, 6, [0])
	const x1 = getRandomInteger(example ? -8 : -12, example ? 8 : 12)
	const x2 = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [x1])
	const b = -a * (x1 + x2)
	const c = a * x1 * x2

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
	const equationsSubstituted = solutions.map(s => equation.substitute({ [variables.x]: s }))
	const [ans1, ans2] = solutions
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationsSubstituted, ans1, ans2 }
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
			return performListComparison(exerciseData, ['ans1', 'ans2'])
		default:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['ans1', 'ans2'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
