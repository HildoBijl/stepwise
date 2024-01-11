const { selectRandomly, getRandomInteger, applyMapping } = require('../../../../../util')
const { asExpression, asEquation, Integer, Sqrt, expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, filterVariables, performComparison, performListComparison } = require('../../../../../eduTools')

// a*x^2 + b*x + c = 0.
const variableSet = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'applyQuadraticFormula',
	steps: [null, null, null, null],
	comparison: expressionComparisons.equalNumber,
}

function generateState() {
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
	const values = applyMapping(expressions, expression => expression.regularClean())
	const sqrtD = new Sqrt(values.D).regularClean()
	return { ...state, equation, expressions, ...values, sqrtD, numSolutions }
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
			return performListComparison(exerciseData, ['x1', 'x2'])
		default:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['x1', 'x2'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
