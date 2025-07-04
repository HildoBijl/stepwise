const { selectRandomly, getRandomInteger } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons, Integer, Sqrt } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x^2+b*x+c=0
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'solveQuadraticEquation',
	weight: 1,
	steps: ['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', null],
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
addSetupFromSteps(metaData)

function generateState(example) {
	let a, b, c
	while (a === undefined || b ** 2 - 4 * a * c >= 0) {
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
	const numSolutions = 0
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, numSolutions }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['a', 'b', 'c'])
		case 2:
			return performComparison(exerciseData, 'solutionFull')
		case 3:
			return performComparison(exerciseData, 'D')
		default:
			return performComparison(exerciseData, 'numSolutions')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
