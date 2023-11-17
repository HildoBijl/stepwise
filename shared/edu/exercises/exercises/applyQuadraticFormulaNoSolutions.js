const { selectRandomly, getRandomInteger } = require('../../../util')
const { asExpression, asEquation, Integer, Sqrt, expressionComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../eduTools')

// a*x^2 + b*x + c = 0.
const variableSet = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const data = {
	skill: 'applyQuadraticFormula',
	steps: [null, null, null, null],
	comparison: {
		default: expressionComparisons.equalNumber,
	},
}

function generateState() {
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
	// Extract state variables.
	const variables = filterVariables(state, ['x'], constants)
	const equation = asEquation('ax^2+bx+c=0').substituteVariables(variables).removeUseless()

	// Set up expressions.
	const expressionD = asExpression('b^2 - 4ac').substituteVariables(variables)

	// Find values for the expressions and store those numbers.
	const D = expressionD.regularClean()
	const sqrtD = new Sqrt(D).regularClean()
	const numSolutions = 0
	return { ...state, equation, expressionD, D, sqrtD, numSolutions }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return input.numSolutions === solution.numSolutions
	if (step === 1)
		return performComparison(['a', 'b', 'c'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['D'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}