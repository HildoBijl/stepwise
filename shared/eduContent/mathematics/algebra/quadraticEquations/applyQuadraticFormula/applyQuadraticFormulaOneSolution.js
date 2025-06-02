const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { asExpression, asEquation, Integer, expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../eduTools')

// a*x^2 + b*x + c = 0.
const variableSet = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'applyQuadraticFormula',
	steps: [null, null, null, null],
	comparison: expressionComparisons.equalNumber,
}

function generateState() {
	// We want integer coefficients in the equation, but a possibly non-integer solution. So we set up the equation a*(x - solution/denominator)^2 = 0, rewrite it to a*x^2 - 2*a*(solution/denominator) + a*(solution/denominator)^2 = 0, and check if this gives integer coefficients.
	let a, denominator, solution
	while (a === undefined || (2 * a * solution % denominator !== 0) || (a * solution ** 2 % denominator ** 2 !== 0)) {
		a = getRandomInteger(-6, 6, [0])
		solution = getRandomInteger(-12, 12)
		denominator = getRandomInteger(-6, 6, [0])
	}
	const b = -2 * a * solution / denominator
	const c = a * (solution / denominator) ** 2

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
	const expressions = {}
	expressions.D = asExpression('b^2 - 4ac').substituteVariables(variables)
	expressions.x1 = asExpression('(-b)/(2a)').substituteVariables(variables)

	// Find values for the expressions and store those numbers.
	const numSolutions = 1
	const D = Integer.zero // Guaranteed by the set-up of the state.
	const x1 = expressions.x1.regularClean()
	const equationInFactors = asEquation(`a(x-x_1)^2=0`).substituteVariables({ ...variables, 'x_1': x1 }).removeUseless()
	return { ...state, equation, expressions, numSolutions, D, x1, equationInFactors }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['a', 'b', 'c'])
		case 2:
			return performComparison(exerciseData, ['D'])
		case 3:
			return performComparison(exerciseData, 'numSolutions')
		case 4:
			return performComparison(exerciseData, 'x1')
		default:
			return performComparison(exerciseData, ['numSolutions', 'x1'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
