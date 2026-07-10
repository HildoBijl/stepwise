const { sample, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare, compareList } = require('@step-wise/exercise-grading')
const { filterVariables } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 2,
	...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined, 'simplifyFraction']),
	compare: {
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
			return compareList(['ans1', 'ans2'], data)
		default:
			return compare('numSolutions', data) && compareList(['ans1', 'ans2'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
