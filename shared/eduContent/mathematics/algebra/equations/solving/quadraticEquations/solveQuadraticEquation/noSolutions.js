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
	...stepsToSetup(['substituteANumber', 'substituteANumber', 'calculateSumOfProducts', undefined]),
	compare: {
		a: {},
		b: {},
		c: {},
		solutionFull: equivalent,
		D: {},
		numSolutions: {},
	}
}

function generateState(example) {
	let a, b, c
	while (a === undefined || b ** 2 - 4 * a * c >= 0) {
		a = getRandomInteger(-6, 6, [0])
		b = getRandomInteger(-12, 12)
		c = getRandomInteger(-40, 40)
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
	const numSolutions = 0
	return { ...state, variables, equation, solutionFull, rootFull, DFull, D, numSolutions }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare(['a', 'b', 'c'], data)
		case 2:
			return compare('solutionFull', data)
		case 3:
			return compare('D', data)
		default:
			return compare('numSolutions', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
