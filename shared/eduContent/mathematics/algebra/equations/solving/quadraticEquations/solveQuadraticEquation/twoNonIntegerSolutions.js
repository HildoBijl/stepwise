const { sample, randomInteger } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison, performListComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 3,
	steps: ['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', null, and('simplifyFraction', 'simplifyRoot')],
	comparison: {
		a: {},
		b: {},
		c: {},
		solutionFull: equivalent,
		D: {},
		numSolutions: {},
		// For the answers, allow the user to either keep the fraction together (default, as "(2+3sqrt(5))/6") or not (extra, as "1/3+sqrt(5)/2").
		ans1: (input, correct) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
		ans2: (input, correct) => onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.combine(['splitFractions'], ['mergeFractionSums'])),
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	let a, b, c
	while (a === undefined || b ** 2 - 4 * a * c <= 0) {
		a = randomInteger(-6, 6, [0])
		b = randomInteger(-12, 12)
		c = randomInteger(-40, 40)
	}

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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
