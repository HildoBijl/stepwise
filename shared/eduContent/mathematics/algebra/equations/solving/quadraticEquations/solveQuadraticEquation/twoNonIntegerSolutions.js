const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, Integer, Sqrt } = require('../../../../../../../CAS')
const { and } = require('../../../../../../../skillTracking')

const { getStepExerciseProcessor, filterVariables, performComparison, performListComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 3,
	steps: ['substituteANumber', 'substituteANumber', null, null, and('simplifyFraction', 'simplifyRoot')],
	// steps: ['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', null, 'simplifyFraction'], // ToDo: implement calculateSumOfProducts skill.
	comparison: {
		a: {},
		b: {},
		c: {},
		solutionFull: equivalent,
		D: {},
		numSolutions: {}
	}
}

function generateState(example) {
	let a, b, c
	while (a === undefined || b ** 2 - 4 * a * c <= 0) {
		a = getRandomInteger(-6, 6, [0])
		b = getRandomInteger(-12, 12)
		c = getRandomInteger(-40, 40)
	}

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
	const equationSubstituted = solutions.map(s => equation.substituteVariables({ [variables.x]: s }))
	const [ans1, ans2] = solutions
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, solutionHalfSimplified, solution, solutionsSplit, solutions, numSolutions, equationSubstituted, ans1, ans2 }
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
