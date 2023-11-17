const { selectRandomly, getRandomInteger, applyMapping } = require('../../../util')
const { asExpression, asEquation, Integer, expressionComparisons } = require('../../../CAS')
const { getStepExerciseProcessor, filterVariables, performComparison, performListComparison } = require('../../../eduTools')

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
	const a = getRandomInteger(-6, 6, [0])
	const x1 = getRandomInteger(-12, 12)
	const x2 = getRandomInteger(-12, 12, [x1])
	const b = -a * (x1 + x2)
	const c = a * x1 * x2

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
	expressions.x1 = asExpression('(-b-sqrt(D))/(2a)').substituteVariables({ ...variables, D: expressions.D })
	expressions.x2 = asExpression('(-b+sqrt(D))/(2a)').substituteVariables({ ...variables, D: expressions.D })

	// Find values for the expressions and store those numbers.
	const numSolutions = 2
	const values = applyMapping(expressions, expression => expression.cleanForAnalysis())
	const equationInFactors = asEquation(`a(x-x_1)(x-x_2)=0`).substituteVariables({ ...variables, 'x_1': values.x1, 'x_2': values.x2 }).removeUseless()
	return { ...state, equation, expressions, ...values, numSolutions, equationInFactors }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return input.numSolutions === solution.numSolutions && performListComparison(['x1', 'x2'], input, solution, data.comparison)
	if (step === 1)
		return performComparison(['a', 'b', 'c'], input, solution, data.comparison)
	if (step === 2)
		return performComparison(['D'], input, solution, data.comparison)
	if (step === 3)
		return input.numSolutions === solution.numSolutions
	if (step === 4)
		return performListComparison(['x1', 'x2'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}