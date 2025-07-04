const { selectRandomly, getRandomInteger, applyMapping } = require('../../../../../util')
const { asExpression, asEquation, Integer, expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison, performListComparison } = require('../../../../../eduTools')

// a*x^2 + b*x + c = 0.
const variableSet = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'applyQuadraticFormula',
	steps: [null, null, null, null],
	comparison: expressionComparisons.equalNumber,
}
addSetupFromSteps(metaData)

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
	const values = applyMapping(expressions, expression => expression.regularClean())
	const equationInFactors = asEquation(`a(x-x_1)(x-x_2)=0`).substituteVariables({ ...variables, 'x_1': values.x1, 'x_2': values.x2 }).removeUseless()
	return { ...state, equation, expressions, ...values, numSolutions, equationInFactors }
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
